import datetime
import json
import os  #
import time

import pika
import requests

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
QUEUE_NAME = "weather_data"
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "user")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASS", "password123")

API_URL = "https://api.open-meteo.com/v1/forecast?latitude=-22.9064&longitude=-43.1822&hourly=temperature_2m&current=temperature_2m,relative_humidity_2m,wind_speed_10m"


def getData():
    try:
        response = requests.get(API_URL)

        if response.status_code == 200:
            data = response.json()

            current = data["current"]

            weather_info = {
                "temperature": current["temperature_2m"],
                "humidity": current["relative_humidity_2m"],
                "wind_speed": current["wind_speed_10m"],
                "timestamp": str(datetime.datetime.now()),
            }

            return weather_info

        else:
            print(f"Erro na API: {response.status_code}")
            return None

    except Exception as erro:
        print(f"Ocorreu um erro de conexão: {erro}")
        return None


def sendToQueue(data):
    try:

        credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=RABBITMQ_HOST, credentials=credentials)
        )
        channel = connection.channel()

        channel.queue_declare(queue=QUEUE_NAME, durable=True)
        message_body = json.dumps(data)

        channel.basic_publish(exchange="", routing_key=QUEUE_NAME, body=message_body)

        print(f"Dados enviados para o RabbitMQ: {data['temperature']}°C")
        connection.close()

    except Exception as e:
        print(f"Erro ao enviar para fila: {e}")


if __name__ == "__main__":
    print("🚀 Iniciando Coletor...")

    while True:
        dados = getData()
        if dados:
            sendToQueue(dados)

        print("⏳ Aguardando 10 segundos...")
        time.sleep(10)
