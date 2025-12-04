import requests
import json
from datetime import datetime
import os
from dotenv import load_dotenv
import pika

load_dotenv()
CITY = os.getenv("CITY")
LATITUDE = float(os.getenv("LATITUDE"))
LONGITUDE = float(os.getenv("LONGITUDE"))

def get_weather():
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={LATITUDE}&longitude={LONGITUDE}&"
        f"hourly=temperature_2m,relativehumidity_2m,precipitation_probability,windspeed_10m&"
        f"current_weather=true&timezone=America/Sao_Paulo"
    )
    response = requests.get(url)
    data = response.json()
    current = data["current_weather"]

    weather_json = {
        "city": CITY,
        "datetime": datetime.now().isoformat(),
        "temperature": current["temperature"],
        "wind_speed": current["windspeed"],
        "condition_code": current["weathercode"],
        "humidity": data["hourly"]["relativehumidity_2m"][0],
        "precipitation_probability": data["hourly"]["precipitation_probability"][0]
    }

    return weather_json

def send_to_queue(message):
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()
    channel.queue_declare(queue='weather_queue', durable=True)
    channel.basic_publish(
        exchange='',
        routing_key='weather_queue',
        body=json.dumps(message),
        properties=pika.BasicProperties(delivery_mode=2)
    )
    connection.close()
    print("Mensagem enviada para a fila!")

if __name__ == "__main__":
    weather_data = get_weather()
    print(json.dumps(weather_data, indent=4, ensure_ascii=False))
    send_to_queue(weather_data)