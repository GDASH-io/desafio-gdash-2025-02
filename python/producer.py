import os, time, json
from datetime import datetime
import requests
import pika

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
LOCATION = os.getenv("LOCATION", "São Paulo")
INTERVAL = int(os.getenv("INTERVAL", "3600"))

def fetch_weather():
    # Using Open-Meteo (no API key required). Coordinates for São Paulo by default.
    lat = os.getenv("LAT", "-23.55052")
    lon = os.getenv("LON", "-46.633308")
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true&hourly=relativehumidity_2m,precipitation_probability"
    r = requests.get(url, timeout=10)
    r.raise_for_status()
    data = r.json()
    cw = data.get("current_weather", {})
    # normalize a payload
    payload = {
        "location": LOCATION,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "temperature": cw.get("temperature"),
        "wind_speed": cw.get("windspeed"),
        "wind_direction": cw.get("winddirection"),
        "weather_code": cw.get("weathercode"),
        "raw": data
    }
    return payload

def publish(payload):
    params = pika.URLParameters(RABBITMQ_URL)
    conn = pika.BlockingConnection(params)
    ch = conn.channel()
    ch.queue_declare(queue='weather_logs', durable=True)
    ch.basic_publish(
        exchange='',
        routing_key='weather_logs',
        body=json.dumps(payload),
        properties=pika.BasicProperties(
            delivery_mode=2, # persistent
        )
    )
    conn.close()

if __name__ == '__main__':
    while True:
        try:
            payload = fetch_weather()
            print("Fetched:", payload)
            publish(payload)
            print("Published to RabbitMQ")
        except Exception as e:
            print("Error:", e)
        time.sleep(INTERVAL)
