import json
import pika
import requests
import time
from datetime import datetime

RABBITMQ_HOST = "localhost"
QUEUE_NAME = "weather_queue"

WEATHER_API = "https://api.open-meteo.com/v1/forecast"
PARAMS = {
    "latitude": -22.92,
    "longitude": -43.17,
    "current_weather": True
}

def get_weather():
    response = requests.get(WEATHER_API, params=PARAMS)
    data = response.json()

    current = data["current_weather"]

    return {
        "timestamp": datetime.utcnow().isoformat(),
        "temperature": current["temperature"],
        "wind_speed": current["windspeed"],
        "wind_direction": current["winddirection"],
        "weather_code": current["weathercode"]
    }

def send_to_queue(body):
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=RABBITMQ_HOST)
    )
    channel = connection.channel()
    channel.queue_declare(queue=QUEUE_NAME, durable=True)

    channel.basic_publish(
        exchange="",
        routing_key=QUEUE_NAME,
        body=json.dumps(body)
    )

    print("✓ Sent:", body)
    connection.close()

def main():
    while True:
        weather = get_weather()
        send_to_queue(weather)
        time.sleep(2)  # 1 min

if __name__ == "__main__":
    main()
