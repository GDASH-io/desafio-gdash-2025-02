import json
import time
import os
import requests
import pika
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
CITY = os.getenv("WEATHER_CITY", "Itajai,BR")
RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
INTERVAL = int(os.getenv("COLLECT_INTERVAL_SECONDS", 300))  # 5 minutos padrão

def get_weather():
    url = (
        f"https://api.openweathermap.org/data/2.5/weather?q={CITY}"
        f"&appid={OPENWEATHER_API_KEY}&units=metric"
    )
    print("🌍 Buscando clima em:", CITY)

    response = requests.get(url)
    data = response.json()
    
    # 🐛 DEBUG: Veja o que vem da API
    print("DEBUG wind data:", data.get("wind"))
    
    # ✅ CONVERSÃO: m/s → km/h (multiplica por 3.6)
    wind_speed_ms = data.get("wind", {}).get("speed", 0)
    wind_speed_kmh = wind_speed_ms * 3.6
    
    weather = {
        "timestamp": datetime.utcnow().isoformat(),
        "city": CITY,
        "temperature": data["main"]["temp"],
        "humidity": data["main"]["humidity"],
        "wind_speed": round(wind_speed_kmh, 2),  # ✅ Agora em km/h
        "condition": data["weather"][0]["main"],
        "rain_probability": data.get("rain", {}).get("1h", 0.0),
    }

    print("🌤️ Clima coletado:", weather)
    return weather


def publish_to_rabbitmq(message):
    params = pika.URLParameters(RABBITMQ_URL)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()

    channel.queue_declare(queue="weather.logs", durable=True)

    channel.basic_publish(
        exchange="",
        routing_key="weather.logs",
        body=json.dumps(message),
        properties=pika.BasicProperties(
            delivery_mode=2  # mensagem persistente
        )
    )

    print("📤 Enviado para RabbitMQ:", message)

    connection.close()

def main():
    print("🚀 Coletor Python iniciado!")

    while True:
        try:
            weather_data = get_weather()
            publish_to_rabbitmq(weather_data)
        except Exception as e:
            print("❌ Erro no coletor:", e)

        print(f"⏳ Aguardando {INTERVAL} segundos...\n")
        time.sleep(INTERVAL)

if __name__ == "__main__":
    main()
