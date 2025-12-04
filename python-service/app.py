import time
import os
import json
import logging
import requests
import pika
from dotenv import load_dotenv

load_dotenv()

QUEUE_NAME = os.getenv("QUEUE_NAME", "weather_queue")
RABBIT_URL = os.getenv("RABBIT_URL", "amqp://guest:guest@localhost:5672/")
CITY = os.getenv("CITY", "São Paulo")
LAT = float(os.getenv("LAT", -7.06))
LON = float(os.getenv("LON", -34.88))

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

logging.basicConfig(level=logging.INFO)

def coletar_clima(lat, lon):
    try:
        params = {
            "latitude": lat,
            "longitude": lon,
            "current_weather": True
        }
        response = requests.get(OPEN_METEO_URL, params=params)
        response.raise_for_status()
        data = response.json()

        weather = data.get("current_weather", {})
        logging.info(f"[Python] Dados coletados: {weather}")
        return {
            "temperature": weather.get("temperature"),
            "windspeed": weather.get("windspeed"),
            "humidity": weather.get("humidity", 50), 
            "time": weather.get("time"),
            "lat": lat,
            "lon": lon,
            "city": CITY
        }
    except Exception as e:
        logging.error(f"Erro ao coletar dados de clima: {e}")
        return None

def send_to_queue(queue, message):
    try:
        connection = pika.BlockingConnection(pika.URLParameters(RABBIT_URL))
        channel = connection.channel()
        channel.queue_declare(queue=queue, durable=True)
        channel.basic_publish(
            exchange="",
            routing_key=queue,
            body=json.dumps(message),
            properties=pika.BasicProperties(delivery_mode=2)
        )
        logging.info(f"[Python] Enviado para fila {queue}: {message}")
        connection.close()
    except Exception as e:
        logging.error(f"Erro ao enviar para fila: {e}")

def main():
    logging.info("Iniciando serviço Python com dados reais de clima...")
    while True:
        clima = coletar_clima(LAT, LON)
        if clima:
            send_to_queue(QUEUE_NAME, clima)
        time.sleep(5)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logging.info("Programa interrompido pelo usuário.")
