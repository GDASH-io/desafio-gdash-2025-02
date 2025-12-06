import os
from dotenv import load_dotenv

load_dotenv()

RABBITMQ_URL = os.getenv('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672/')
QUEUE_NAME = os.getenv('QUEUE_NAME', 'weather_data')
LATITUDE = float(os.getenv('LATITUDE', '52.52'))
LONGITUDE = float(os.getenv('LONGITUDE', '13.41'))
COLLECTION_INTERVAL = int(os.getenv('COLLECTION_INTERVAL', '3600'))
OPEN_METEO_URL = os.getenv('OPEN_METEO_URL', 'https://api.open-meteo.com/v1/forecast')

