import json
import os
import time
from datetime import datetime

import pika
import requests
import schedule
from dotenv import load_dotenv

load_dotenv()

# Configuration
RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672")
RABBITMQ_QUEUE = os.getenv("RABBITMQ_QUEUE", "weather_data")
WEATHER_LATITUDE = float(os.getenv("WEATHER_LATITUDE", "-23.5505"))
WEATHER_LONGITUDE = float(os.getenv("WEATHER_LONGITUDE", "-46.6333"))
WEATHER_LOCATION = os.getenv("WEATHER_LOCATION", "São Paulo")
COLLECTION_INTERVAL_MINUTES = int(os.getenv("COLLECTION_INTERVAL_MINUTES", "60"))


def get_weather_condition(weather_code: int) -> str:
    """Convert WMO weather code to human readable condition"""
    conditions = {
        0: "clear",
        1: "mainly_clear",
        2: "partly_cloudy",
        3: "overcast",
        45: "fog",
        48: "fog",
        51: "light_drizzle",
        53: "moderate_drizzle",
        55: "dense_drizzle",
        61: "light_rain",
        63: "moderate_rain",
        65: "heavy_rain",
        71: "light_snow",
        73: "moderate_snow",
        75: "heavy_snow",
        80: "light_showers",
        81: "moderate_showers",
        82: "heavy_showers",
        95: "thunderstorm",
        96: "thunderstorm_hail",
        99: "thunderstorm_hail",
    }
    return conditions.get(weather_code, "unknown")


def fetch_weather_data():
    """Fetch weather data from Open-Meteo API"""
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": WEATHER_LATITUDE,
        "longitude": WEATHER_LONGITUDE,
        "current": [
            "temperature_2m",
            "relative_humidity_2m",
            "weather_code",
            "wind_speed_10m",
            "precipitation_probability",
        ],
        "timezone": "America/Sao_Paulo",
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        current = data.get("current", {})

        weather_data = {
            "temperature": current.get("temperature_2m", 0),
            "humidity": current.get("relative_humidity_2m", 0),
            "windSpeed": current.get("wind_speed_10m", 0),
            "condition": get_weather_condition(current.get("weather_code", 0)),
            "rainProbability": current.get("precipitation_probability", 0) or 0,
            "location": WEATHER_LOCATION,
            "latitude": WEATHER_LATITUDE,
            "longitude": WEATHER_LONGITUDE,
            "collectedAt": datetime.utcnow().isoformat() + "Z",
        }

        print(f"[{datetime.now()}] Weather data collected: {weather_data}")
        return weather_data

    except requests.RequestException as e:
        print(f"[{datetime.now()}] Error fetching weather data: {e}")
        return None


def send_to_queue(data: dict):
    """Send weather data to RabbitMQ queue"""
    try:
        params = pika.URLParameters(RABBITMQ_URL)
        connection = pika.BlockingConnection(params)
        channel = connection.channel()

        channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)

        message = json.dumps(data)
        channel.basic_publish(
            exchange="",
            routing_key=RABBITMQ_QUEUE,
            body=message,
            properties=pika.BasicProperties(
                delivery_mode=2,  # make message persistent
                content_type="application/json",
            ),
        )

        print(f"[{datetime.now()}] Message sent to queue: {RABBITMQ_QUEUE}")
        connection.close()
        return True

    except Exception as e:
        print(f"[{datetime.now()}] Error sending to queue: {e}")
        return False


def collect_and_send():
    """Main job: collect weather data and send to queue"""
    print(f"\n[{datetime.now()}] Starting weather collection...")

    data = fetch_weather_data()
    if data:
        success = send_to_queue(data)
        if success:
            print(f"[{datetime.now()}] Collection completed successfully!")
        else:
            print(f"[{datetime.now()}] Collection completed but failed to send to queue")
    else:
        print(f"[{datetime.now()}] Collection failed: no data received")


def main():
    print("=" * 50)
    print("GDASH Weather Collector")
    print("=" * 50)
    print(f"Location: {WEATHER_LOCATION}")
    print(f"Coordinates: {WEATHER_LATITUDE}, {WEATHER_LONGITUDE}")
    print(f"Collection interval: {COLLECTION_INTERVAL_MINUTES} minutes")
    print(f"RabbitMQ Queue: {RABBITMQ_QUEUE}")
    print("=" * 50)

    # Run immediately on start
    collect_and_send()

    # Schedule periodic collection
    schedule.every(COLLECTION_INTERVAL_MINUTES).minutes.do(collect_and_send)

    print(f"\n[{datetime.now()}] Scheduler started. Waiting for next collection...")

    while True:
        schedule.run_pending()
        time.sleep(1)


if __name__ == "__main__":
    main()
