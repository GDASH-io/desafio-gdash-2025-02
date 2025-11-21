import requests
import pika
import json
from config import Config

def fetch_weather():
    params = {
        "latitude": Config.LATITUDE,
        "longitude": Config.LONGITUDE,
        "hourly": "temperature_2m,relativehumidity_2m",
    }

    response = requests.get(Config.WEATHER_API_URL, params=params)
    response.raise_for_status()
    data = response.json()

    return {
        "latitude": Config.LATITUDE,
        "longitude": Config.LONGITUDE,
        "temperature": data["hourly"]["temperature_2m"][0],
        "humidity": data["hourly"]["relativehumidity_2m"][0],
    }

def send_to_rabbitmq(data):
    credentials = pika.PlainCredentials(Config.RABBITMQ_USER, Config.RABBITMQ_PASS)
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            host=Config.RABBITMQ_HOST,
            port=Config.RABBITMQ_PORT,
            credentials=credentials
        )
    )

    channel = connection.channel()
    channel.queue_declare(queue=Config.RABBITMQ_QUEUE)
    channel.basic_publish(exchange="", routing_key=Config.RABBITMQ_QUEUE, body=json.dumps(data))

    print("📨 Enviado para RabbitMQ:", data)
    connection.close()
