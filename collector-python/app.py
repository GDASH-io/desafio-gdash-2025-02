import os
import json
import time
import sys
import requests
import pika

RABBIT_URL = os.getenv("RABBITMQ_URL")
if RABBIT_URL is None:
    print("Erro: a variável de ambiente RABBITMQ_URL não está definida")
    sys.exit(1)

MAX_RETRIES = int(os.getenv("RABBIT_RETRIES", "10"))
RETRY_DELAY = float(os.getenv("RABBIT_RETRY_DELAY", "5"))  

WEATHER_API_URL = os.getenv("WEATHER_API_URL", "https://api.open-meteo.com/v1/forecast")
LAT = os.getenv("LATITUDE", "-20.5386")
LON = os.getenv("LONGITUDE", "-47.4005")
INTERVAL = int(os.getenv("INTERVAL_SECONDS", "3600"))

WEATHER_CODES = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Freezing drizzle",
    57: "Freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Freezing rain",
    71: "Light snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    80: "Rain showers",
    81: "Rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with hail"
}

def get_condition(code):
    return WEATHER_CODES.get(code, "Unknown")

def connect_to_rabbit():
    params = pika.URLParameters(RABBIT_URL)

    for i in range(1, MAX_RETRIES + 1):
        try:
            connection = pika.BlockingConnection(params)
            channel = connection.channel()
            channel.queue_declare(queue="weather_queue", durable=True)
            print(f"Conectado ao RabbitMQ (tentativa {i}).")
            return connection, channel
        except pika.exceptions.AMQPConnectionError as e:
            print(f"Tentativa {i} de conexão falhou: {e}. Tentando novamente em {RETRY_DELAY}s...")
            time.sleep(RETRY_DELAY)
    
    print("Erro: não foi possível conectar ao RabbitMQ após várias tentativas.")
    sys.exit(1)

def fetch_weather():
    params = {
        "latitude": LAT,
        "longitude": LON,
        "current_weather": True,
        "hourly": "temperature_2m,relativehumidity_2m,windspeed_10m"
    }

    response = requests.get(WEATHER_API_URL, params=params)
    response.raise_for_status()
    data = response.json()


    from datetime import datetime

    weather = {
        "timestamp": datetime.utcnow().isoformat(),
        "temperature": data["current_weather"]["temperature"],
        "windspeed": data["current_weather"]["windspeed"],
        "humidity": data["hourly"]["relativehumidity_2m"][0],
        "latitude": LAT,
        "longitude": LON,
        "condition": get_condition(data["current_weather"]["weathercode"])  
    }

    return weather

def main():
    print("Coletor Python iniciado.")
    time.sleep(60)
    connection, channel = connect_to_rabbit()

    while True:
        try:
            print("Buscando dados climáticos...")
            weather_data = fetch_weather()

            message = json.dumps(weather_data)
            channel.basic_publish(
                exchange="",
                routing_key="weather_queue",
                body=message,
                properties=pika.BasicProperties(delivery_mode=2),
            )

            print(f"Enviado para fila: {message}")
        except requests.RequestException as api_err:
            print("Erro ao buscar dados climáticos:", api_err)
        except pika.exceptions.AMQPChannelError as ch_err:
            print("Erro no canal do RabbitMQ:", ch_err)
            try:
                connection.close()
            except Exception:
                pass
            connection, channel = connect_to_rabbit()
        except pika.exceptions.AMQPConnectionError as conn_err:
            print("Erro de conexão com RabbitMQ:", conn_err)
            connection, channel = connect_to_rabbit()
        except Exception as e:
            print("Erro inesperado no coletor:", e)

        time.sleep(INTERVAL)

if __name__ == "__main__":
    main()
