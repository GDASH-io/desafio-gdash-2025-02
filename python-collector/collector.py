import os
import time
import json
import requests
import pika

# RabbitMQ connection details
RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', '5672'))
RABBITMQ_USER = os.getenv('RABBITMQ_USER', 'guest')
RABBITMQ_PASS = os.getenv('RABBITMQ_PASS', 'guest')
QUEUE_NAME = 'weather_data'

# Open-Meteo API details
OPEN_METEO_API_URL = os.getenv('OPEN_METEO_API_URL', 'https://api.open-meteo.com/v1/forecast')
LATITUDE = os.getenv('LATITUDE', '-23.5505') # São Paulo latitude
LONGITUDE = os.getenv('LONGITUDE', '-46.6333') # São Paulo longitude

# Collection interval in seconds (e.g., 3600 for 1 hour)
COLLECTION_INTERVAL = int(os.getenv('COLLECTION_INTERVAL', '3600'))

def get_weather_data():
    try:
        params = {
            'latitude': LATITUDE,
            'longitude': LONGITUDE,
            'current_weather': 'true',
            'hourly': 'temperature_2m,relativehumidity_2m,windspeed_10m,weathercode,precipitation_probability',
            'timezone': 'America/Sao_Paulo'
        }
        response = requests.get(OPEN_METEO_API_URL, params=params)
        response.raise_for_status() # Raise an exception for HTTP errors
        data = response.json()
        return data
    except requests.exceptions.RequestException as e:
        print(f"Error fetching weather data: {e}")
        return None

def normalize_weather_data(data):
    if not data or 'current_weather' not in data:
        return None

    current_weather = data['current_weather']
    normalized_data = {
        'timestamp': current_weather['time'],
        'latitude': data['latitude'],
        'longitude': data['longitude'],
        'temperature': current_weather['temperature'],
        'windspeed': current_weather['windspeed'],
        'weathercode': current_weather['weathercode'],
        'is_day': current_weather['is_day']
    }

    # Try to get humidity and precipitation from hourly data, if available
    if 'hourly' in data and data['hourly']['time']:
        # Find the index for the current time in hourly data
        current_time_str = current_weather['time']
        try:
            current_time_index = data['hourly']['time'].index(current_time_str)
            if 'relativehumidity_2m' in data['hourly']:
                normalized_data['humidity'] = data['hourly']['relativehumidity_2m'][current_time_index]
            if 'precipitation_probability' in data['hourly']:
                normalized_data['precipitation_probability'] = data['hourly']['precipitation_probability'][current_time_index]
        except ValueError:
            print("Current time not found in hourly data, some fields might be missing.")

    return normalized_data

def publish_to_rabbitmq(message):
    try:
        credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials))
        channel = connection.channel()

        channel.queue_declare(queue=QUEUE_NAME, durable=True)
        channel.basic_publish(
            exchange='',
            routing_key=QUEUE_NAME,
            body=json.dumps(message),
            properties=pika.BasicProperties(
                delivery_mode=pika.spec.PERSISTENT_DELIVERY_MODE
            )
        )
        print(f" [x] Sent {message}")
        connection.close()
    except pika.exceptions.AMQPConnectionError as e:
        print(f"Error connecting to RabbitMQ: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    print("Starting weather data collector...")
    while True:
        weather_data = get_weather_data()
        if weather_data:
            normalized_data = normalize_weather_data(weather_data)
            if normalized_data:
                publish_to_rabbitmq(normalized_data)
        time.sleep(COLLECTION_INTERVAL)
