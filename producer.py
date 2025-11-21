from time import time
import requests
import pika
import json
import logging
import time
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class Producer:
    def __init__(self):
        self.base_url = "https://api.open-meteo.com/v1/forecast?latitude=-15.79&longitude=-47.88&current=temperature_2m,relative_humidity_2m,wind_speed_10m"
        self.connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
        self.channel = self.connection.channel()
        self.channel.queue_declare(queue='weather_data')
        logging.info("✅ Producer conectado ao RabbitMQ")

    def get_data(self):
        url = self.base_url
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    
    def publish_weather_data(self, data):
        self.channel.basic_publish(exchange='', routing_key='weather_data', body=json.dumps(data))
        logging.info(f"📤 Dados enviados para fila: Temp={data['current']['temperature_2m']}°C, Umidade={data['current']['relative_humidity_2m']}%")

if __name__ == "__main__":
    producer = Producer()
    logging.info("🚀 Producer iniciado - enviando dados a cada 60 segundos...")
    while True:
        try:
            weather_data = producer.get_data()
            producer.publish_weather_data(weather_data)
        except Exception as e:
            logging.error(f"❌ Erro: {e}")
        time.sleep(60)  # 60 segundos - API Gemini é gratuita, não precisa de atualizações muito frequentes
