import requests
import json
import pika
import time
import os
from dotenv import load_dotenv

load_dotenv()

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
QUEUE_NAME = os.getenv("RABBITMQ_QUEUE", "weather_logs")
LATITUDE = os.getenv("LATITUDE", "-23.55")   # São Paulo default
LONGITUDE = os.getenv("LONGITUDE", "-46.63")

def fetch_weather():
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={LATITUDE}&longitude={LONGITUDE}&current_weather=true"
    )
    
    res = requests.get(url)
    data = res.json()

    weather = data["current_weather"]

    return {
        "timestamp": weather["time"] + "Z",
        "location": "São Paulo, BR",
        "temperature": weather["temperature"],
        "humidity": data.get("hourly", {}).get("relativehumidity_2m", [None])[0],
        "windSpeed": weather["windspeed"],
        "weatherCondition": "Unknown",
        "rainProbability": data.get("hourly", {}).get("precipitation_probability", [0])[0],
        "source": "open-meteo",
    }

def publish_message(message):
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=RABBITMQ_HOST)
    )
    channel = connection.channel()
    channel.queue_declare(queue=QUEUE_NAME, durable=True)

    channel.basic_publish(
        exchange="",
        routing_key=QUEUE_NAME,
        body=json.dumps(message),
        properties=pika.BasicProperties(delivery_mode=2),
    )

    print("📨 Sent to queue:", message)
    connection.close()


if __name__ == "__main__":
    print("🌦️ Weather collector started...")

    while True:
        try:
            weather = fetch_weather()
            publish_message(weather)
        except Exception as e:
            print("❌ Error:", e)

        time.sleep(60 * 5)  # coleta a cada 5 minutos
