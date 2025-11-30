import os
from dotenv import load_dotenv

# Carrega o arquivo .env da raiz
load_dotenv()

class Config:
    # Dados Geográficos
    LATITUDE = os.getenv('LATITUDE', '-16.4341')
    LONGITUDE = os.getenv('LONGITUDE', '-43.5154')
    
    # URL da API Open-Meteo (Não precisa de chave)
    API_URL = "https://api.open-meteo.com/v1/forecast"
    
    # RabbitMQ
    RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
    RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', 5672))
    RABBITMQ_USER = os.getenv('RABBITMQ_DEFAULT_USER', 'admin')
    RABBITMQ_PASS = os.getenv('RABBITMQ_DEFAULT_PASS', 'admin')
    QUEUE_NAME = os.getenv('QUEUE_NAME', 'weather_data')
    
    # Intervalo de coleta em segundos
    COLLECT_INTERVAL = int(os.getenv('COLLECT_INTERVAL', 10))