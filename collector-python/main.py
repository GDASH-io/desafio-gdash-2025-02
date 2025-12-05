import time
import os
import json
import requests
import pika
from dotenv import load_dotenv

# Carrega variáveis de ambiente do arquivo .env
load_dotenv()

API_URL = os.getenv("WEATHER_API_URL")
LAT = os.getenv("LAT")
LON = os.getenv("LON")
TIMEZONE = os.getenv("TIMEZONE", "auto")

RABBITMQ_URL = os.getenv("RABBITMQ_URL")
RABBITMQ_QUEUE = os.getenv("RABBITMQ_QUEUE", "weather_logs")


def collect_weather():
    """
    Busca os dados atuais de clima na Open-Meteo
    e retorna um dicionário simplificado.
    """
    params = {
        "latitude": LAT,
        "longitude": LON,
        "current": ["temperature_2m", "relative_humidity_2m", "wind_speed_10m"],
        "timezone": TIMEZONE,
    }

    print("Chamando API de clima...")
    response = requests.get(API_URL, params=params)
    response.raise_for_status()

    data = response.json()
    current = data["current"]

    weather_data = {
        "temperature": current["temperature_2m"],
        "humidity": current["relative_humidity_2m"],
        "windSpeed": current["wind_speed_10m"],
        "condition": "N/A",
        "city": f"{LAT},{LON}",
        "timestamp": current["time"],
    }

    return weather_data


def send_to_rabbitmq(payload: dict):
    """
    Envia o dicionário de clima como JSON para a fila do RabbitMQ.
    """
    print("Conectando ao RabbitMQ...")
    params = pika.URLParameters(RABBITMQ_URL)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    # Garante que a fila existe
    channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)

    body = json.dumps(payload)
    channel.basic_publish(
        exchange="",
        routing_key=RABBITMQ_QUEUE,
        body=body,
        properties=pika.BasicProperties(
            delivery_mode=2  # persiste mensagem em disco
        ),
    )

    print(f"Mensagem enviada para a fila '{RABBITMQ_QUEUE}': {body}")

    connection.close()


def collect_weather_and_send():
    """
    Coleta o clima e envia para a fila.
    """
    weather = collect_weather()
    print("Dados de clima coletados:", weather)
    send_to_rabbitmq(weather)


if __name__ == "__main__":
    print("Coletor de clima iniciado (Python → RabbitMQ)...")

    # por enquanto, vamos coletar a cada 60 segundos
    while True:
        try:
            collect_weather_and_send()
        except Exception as e:
            print("Erro no coletor:", e)

        time.sleep(60)
