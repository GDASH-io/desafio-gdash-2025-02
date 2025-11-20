import os
from dotenv import load_dotenv

load_dotenv()

LATITUDE = os.getenv('LATITUDE', '-5.795')
LONGITUDE = os.getenv('LONGITUDE', '-35.209')
CITY_NAME = os.getenv('CITY_NAME', 'Natal')

RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', '5672'))
RABBITMQ_USER = os.getenv('RABBITMQ_USER', 'guest')
RABBITMQ_PASS = os.getenv('RABBITMQ_PASS', 'guest')
RABBITMQ_QUEUE = os.getenv('RABBITMQ_QUEUE', 'weather_data')

COLLECTION_INTERVAL = int(os.getenv('COLLECTION_INTERVAL', '60')) 

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"