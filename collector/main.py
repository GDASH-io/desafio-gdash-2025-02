import os
import time
import json
import logging
import requests
import pika
import schedule
from dataclasses import dataclass, asdict
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Environment Variables
RABBITMQ_USER = os.getenv('RABBITMQ_USER', 'guest')
RABBITMQ_PASSWORD = os.getenv('RABBITMQ_PASSWORD', 'guest')
RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'rabbitmq')
RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', 5672))
LATITUDE = os.getenv('LATITUDE', '-23.5505')
LONGITUDE = os.getenv('LONGITUDE', '-46.6333')
CITY_NAME = os.getenv('CITY_NAME', 'Sao Paulo')

@dataclass
class WeatherData:
    city: str
    temperature: float
    humidity: int
    windSpeed: float
    condition: str
    timestamp: str

def get_weather_condition(code: int) -> str:
    """Maps WMO Weather interpretation codes to string conditions."""
    if code == 0: return "Clear sky"
    if code in [1, 2, 3]: return "Mainly clear, partly cloudy, and overcast"
    if code in [45, 48]: return "Fog and depositing rime fog"
    if code in [51, 53, 55]: return "Drizzle: Light, moderate, and dense intensity"
    if code in [56, 57]: return "Freezing Drizzle: Light and dense intensity"
    if code in [61, 63, 65]: return "Rain: Slight, moderate and heavy intensity"
    if code in [66, 67]: return "Freezing Rain: Light and heavy intensity"
    if code in [71, 73, 75]: return "Snow fall: Slight, moderate, and heavy intensity"
    if code == 77: return "Snow grains"
    if code in [80, 81, 82]: return "Rain showers: Slight, moderate, and violent"
    if code in [85, 86]: return "Snow showers slight and heavy"
    if code == 95: return "Thunderstorm: Slight or moderate"
    if code in [96, 99]: return "Thunderstorm with slight and heavy hail"
    return "Unknown"

from typing import Optional

def get_config():
    """Fetches configuration from backend or falls back to env vars."""
    backend_url = os.getenv('BACKEND_URL', 'http://backend:3000')
    try:
        response = requests.get(f"{backend_url}/config", timeout=5)
        if response.status_code == 200:
            config = response.json()
            return {
                'city': config.get('city', CITY_NAME),
                'latitude': config.get('latitude', LATITUDE),
                'longitude': config.get('longitude', LONGITUDE)
            }
    except Exception as e:
        logger.warning(f"Failed to fetch config from backend: {e}")
    
    return {
        'city': CITY_NAME,
        'latitude': LATITUDE,
        'longitude': LONGITUDE
    }

def fetch_weather_data() -> Optional[WeatherData]:
    """Fetches weather data from Open-Meteo API."""
    config = get_config()
    lat = config['latitude']
    lon = config['longitude']
    city = config['city']

    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true&hourly=relativehumidity_2m,windspeed_10m"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        current_weather = data.get('current_weather', {})
        
        # Get humidity (approximation using current hour)
        hourly = data.get('hourly', {})
        current_time_iso = current_weather.get('time')
        humidity = 50 # Default fallback
        if current_time_iso and 'time' in hourly and 'relativehumidity_2m' in hourly:
            try:
                index = hourly['time'].index(current_time_iso)
                humidity = hourly['relativehumidity_2m'][index]
            except ValueError:
                pass

        weather = WeatherData(
            city=city,
            temperature=current_weather.get('temperature', 0.0),
            humidity=humidity,
            windSpeed=current_weather.get('windspeed', 0.0),
            condition=get_weather_condition(current_weather.get('weathercode', 0)),
            timestamp=datetime.now().isoformat()
        )
        return weather
    except requests.RequestException as e:
        logger.error(f"Error fetching weather data: {e}")
        return None

def publish_to_rabbitmq(data: WeatherData):
    """Publishes weather data to RabbitMQ with retry logic."""
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
    parameters = pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials)
    
    max_retries = 5
    retry_delay = 5

    for attempt in range(max_retries):
        try:
            connection = pika.BlockingConnection(parameters)
            channel = connection.channel()
            channel.queue_declare(queue='weather_data', durable=True)
            
            message = json.dumps(asdict(data))
            channel.basic_publish(
                exchange='',
                routing_key='weather_data',
                body=message,
                properties=pika.BasicProperties(
                    delivery_mode=2,  # make message persistent
                ))
            
            logger.info(f" [x] Sent data for {data.city}")
            connection.close()
            return
        except pika.exceptions.AMQPConnectionError as e:
            logger.warning(f"Connection failed, retrying in {retry_delay}s... (Attempt {attempt + 1}/{max_retries})")
            time.sleep(retry_delay)
            retry_delay *= 2 # Exponential backoff
        except Exception as e:
            logger.error(f"Unexpected error publishing to RabbitMQ: {e}")
            return

    logger.error("Failed to connect to RabbitMQ after multiple attempts.")

def job():
    logger.info("Starting data collection job...")
    weather_data = fetch_weather_data()
    if weather_data:
        publish_to_rabbitmq(weather_data)
    else:
        logger.warning("No weather data collected.")

import threading

def listen_for_updates():
    """Listens for configuration updates from RabbitMQ."""
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
    parameters = pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials)
    
    while True:
        try:
            connection = pika.BlockingConnection(parameters)
            channel = connection.channel()
            channel.queue_declare(queue='config_updates', durable=True)
            
            def callback(ch, method, properties, body):
                logger.info("Received config update trigger. Fetching new data immediately...")
                job()
                ch.basic_ack(delivery_tag=method.delivery_tag)

            channel.basic_consume(queue='config_updates', on_message_callback=callback)
            logger.info("Listening for config updates...")
            channel.start_consuming()
        except Exception as e:
            logger.error(f"Error in update listener: {e}")
            time.sleep(5)

if __name__ == "__main__":
    # Start update listener in a separate thread
    update_thread = threading.Thread(target=listen_for_updates, daemon=True)
    update_thread.start()

    # Run once on startup
    job()
    
    # Schedule every minute
    schedule.every(1).minutes.do(job)
    
    logger.info("Collector service started. Running schedule...")
    while True:
        schedule.run_pending()
        time.sleep(1)
