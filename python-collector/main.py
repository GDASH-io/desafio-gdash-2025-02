import pika
import requests
import json
import time
import os
from dotenv import load_dotenv

load_dotenv()

RABBITMQ_HOST = os.getenv('RABBITMQ_HOST')
QUEUE_NAME = os.getenv('QUEUE_NAME')
API_URL = f"{os.getenv('API_BASE_URL')}?latitude={os.getenv('LATITUDE')}&longitude={os.getenv('LONGITUDE')}&current={os.getenv('CURRENT_WEATHER_FIELDS')}"
FETCH_INTERVAL_SECONDS = int(os.getenv('FETCH_INTERVAL_SECONDS'))

def send_to_queue(data):
    # Conecxão o Rabbit
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
    channel = connection.channel()
    
    #verifica a fila se existe
    channel.queue_declare(queue=QUEUE_NAME)
    
    message = json.dumps(data)
    
    channel.basic_publish(exchange='',
                          routing_key=QUEUE_NAME,
                          body=message)
    print(f" Enviado para a fila: {message}")
    connection.close()

def fetch_weather_data():
    try:
        response = requests.get(API_URL)
        response.raise_for_status()
        data = response.json()
        
        weather_info = {
            "latitude": data['latitude'],
            "longitude": data['longitude'],
            "temperature": data['current']['temperature_2m'],
            "wind_speed": data['current']['wind_speed_10m'],
            "time": data['current']['time']
        }
        
        send_to_queue(weather_info)
        
    except requests.exceptions.RequestException as e:
        print(f"Erro ao buscar dado do clima {e}")

if __name__ == '__main__':
    while True:
        fetch_weather_data()
        # time.sleep(10)
        time.sleep(FETCH_INTERVAL_SECONDS)