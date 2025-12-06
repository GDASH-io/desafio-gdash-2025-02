import os
from dotenv import load_dotenv

load_dotenv()


class RabbitMQConfig:
    HOST = os.getenv('RABBITMQ_HOST', 'localhost')
    PORT = int(os.getenv('RABBITMQ_PORT', 5672))
    USER = os.getenv('RABBITMQ_USER', 'guest')
    PASS = os.getenv('RABBITMQ_PASS', 'guest')
    QUEUE = os.getenv('RABBITMQ_QUEUE', 'weather_data')


class WeatherAPIConfig:
    BASE_URL = "https://api.open-meteo.com/v1/forecast"
    LATITUDE = float(os.getenv('LATITUDE', '-23.5505'))
    LONGITUDE = float(os.getenv('LONGITUDE', '-46.6333'))
    CITY_NAME = os.getenv('CITY_NAME', 'São Paulo')
    TIMEZONE = 'America/Sao_Paulo'
    FORECAST_DAYS = 1
    TIMEOUT = 10


class CollectorConfig:
    COLLECTION_INTERVAL = int(os.getenv('COLLECTION_INTERVAL', 3600))  # 1 hora (3600 segundos)
    MAX_RETRIES = 5
    RETRY_DELAY = 5

