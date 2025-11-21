import requests
import pika
import json
import logging
import time
import os
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class Producer:
    def __init__(self):
        self.base_url = "https://api.open-meteo.com/v1/forecast"
        self.latitude = os.getenv('WEATHER_LATITUDE', '-15.79')
        self.longitude = os.getenv('WEATHER_LONGITUDE', '-47.88')
        self.interval = int(os.getenv('WEATHER_INTERVAL', '60'))
        
        # RabbitMQ connection
        rabbitmq_host = os.getenv('RABBITMQ_HOST', 'localhost')
        rabbitmq_user = os.getenv('RABBITMQ_USER', 'guest')
        rabbitmq_password = os.getenv('RABBITMQ_PASSWORD', 'guest')
        
        credentials = pika.PlainCredentials(rabbitmq_user, rabbitmq_password)
        self.connection = pika.BlockingConnection(
            pika.ConnectionParameters(rabbitmq_host, credentials=credentials)
        )
        self.channel = self.connection.channel()
        self.channel.queue_declare(queue='weather_data', durable=True)
        logging.info("✅ Producer conectado ao RabbitMQ")

    def get_data(self):
        params = {
            'latitude': self.latitude,
            'longitude': self.longitude,
            'current': 'temperature_2m,relative_humidity_2m,wind_speed_10m'
        }
        response = requests.get(self.base_url, params=params)
        response.raise_for_status()
        return response.json()
    
    def publish_weather_data(self, data):
        self.channel.basic_publish(
            exchange='',
            routing_key='weather_data',
            body=json.dumps(data),
            properties=pika.BasicProperties(delivery_mode=2)  # Make message persistent
        )
        temp = data['current']['temperature_2m']
        humidity = data['current']['relative_humidity_2m']
        wind = data['current']['wind_speed_10m']
        logging.info(f"📤 Dados enviados para fila: Temp={temp}°C, Umidade={humidity}%, Vento={wind}km/h")

if __name__ == "__main__":
    producer = Producer()
    logging.info(f"🚀 Producer iniciado - enviando dados a cada {producer.interval} segundos...")
    while True:
        try:
            weather_data = producer.get_data()
            producer.publish_weather_data(weather_data)
        except Exception as e:
            logging.error(f"❌ Erro ao enviar dados: {e}")
        time.sleep(producer.interval)
