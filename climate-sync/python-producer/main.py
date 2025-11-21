import time
from config import Config
from weather import fetch_weather, send_to_rabbitmq
import logging

logging.basicConfig(
   filename="/logs/weather.log",  # <-- apontando para o volume
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

def fetch_and_send_weather():
    data = fetch_weather()
    send_to_rabbitmq(data)
    logging.info(f"Weather data sent: {data}")
    print(f"📨 Weather data sent: {data}")  # opcional, para ver no stdout

def start_scheduler():
    # coleta inicial imediata
    fetch_and_send_weather()

    # loop de coleta periódica
    while True:
        time.sleep(Config.COLLECTION_INTERVAL_MINUTES * 60)
        fetch_and_send_weather()

if __name__ == "__main__":
    print(f"⏳ Weather collector started. Interval: {Config.COLLECTION_INTERVAL_MINUTES} min")
    start_scheduler()
