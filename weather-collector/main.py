import os
import time
import json
import requests
import pika
import schedule
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("WeatherCollector")

# Configuration
RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
RABBITMQ_USER = os.getenv('RABBITMQ_USER', 'guest')
RABBITMQ_PASS = os.getenv('RABBITMQ_PASS', 'guest')
QUEUE_NAME = 'weather_data'
LATITUDE = os.getenv('LATITUDE', '-23.5505')
LONGITUDE = os.getenv('LONGITUDE', '-46.6333')
FETCH_INTERVAL_MINUTES = int(os.getenv('FETCH_INTERVAL_MINUTES', '60'))

def get_rabbitmq_connection():
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
    parameters = pika.ConnectionParameters(host=RABBITMQ_HOST, credentials=credentials)
    
    while True:
        try:
            connection = pika.BlockingConnection(parameters)
            logger.info("Connected to RabbitMQ")
            return connection
        except pika.exceptions.AMQPConnectionError as e:
            logger.error(f"Failed to connect to RabbitMQ: {e}. Retrying in 5 seconds...")
            time.sleep(5)

def fetch_weather_data():
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": LATITUDE,
        "longitude": LONGITUDE,
        "current": ["temperature_2m", "relative_humidity_2m", "is_day", "precipitation", "rain", "weather_code", "wind_speed_10m"],
        "timezone": "auto"
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Extract relevant current data
        current = data.get('current', {})
        
        payload = {
            "latitude": data.get('latitude'),
            "longitude": data.get('longitude'),
            "timezone": data.get('timezone'),
            "timestamp": current.get('time'), # ISO 8601
            "temperature": current.get('temperature_2m'),
            "humidity": current.get('relative_humidity_2m'),
            "is_day": current.get('is_day'),
            "precipitation": current.get('precipitation'),
            "rain": current.get('rain'),
            "weather_code": current.get('weather_code'),
            "wind_speed": current.get('wind_speed_10m'),
            "source": "Open-Meteo"
        }
        
        logger.info(f"Fetched weather data: {payload}")
        return payload
        
    except requests.RequestException as e:
        logger.error(f"Error fetching weather data: {e}")
        return None

def publish_to_queue(channel, data):
    try:
        channel.basic_publish(
            exchange='',
            routing_key=QUEUE_NAME,
            body=json.dumps(data),
            properties=pika.BasicProperties(
                delivery_mode=2,  # make message persistent
                content_type='application/json'
            )
        )
        logger.info("Published data to queue")
    except Exception as e:
        logger.error(f"Failed to publish to queue: {e}")

def job():
    logger.info("Starting scheduled job...")
    data = fetch_weather_data()
    if data:
        try:
            connection = get_rabbitmq_connection()
            channel = connection.channel()
            channel.queue_declare(queue=QUEUE_NAME, durable=True)
            publish_to_queue(channel, data)
            connection.close()
        except Exception as e:
            logger.error(f"Error in RabbitMQ operation during job: {e}")

def main():
    logger.info("Starting Weather Collector Service")
    logger.info(f"Configuration: Lat={LATITUDE}, Lon={LONGITUDE}, Interval={FETCH_INTERVAL_MINUTES}m")
    
    # Run once immediately on startup
    job()
    
    schedule.every(FETCH_INTERVAL_MINUTES).minutes.do(job)
    
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == "__main__":
    main()
