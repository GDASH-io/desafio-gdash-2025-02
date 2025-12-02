import os

class Config:
    # Open-Meteo API
    WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast"
    LATITUDE = os.getenv("LATITUDE", "-23.65221")
    LONGITUDE = os.getenv("LONGITUDE", "-46.45428")
    
    # RabbitMQ
    RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
    RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", "5672"))
    RABBITMQ_USER = os.getenv("RABBITMQ_USER", "admin")
    RABBITMQ_PASS = os.getenv("RABBITMQ_PASS", "admin")
    RABBITMQ_QUEUE = os.getenv("RABBITMQ_QUEUE", "weather.data")
    RABBITMQ_VHOST = os.getenv("RABBITMQ_VHOST", "/")
    
    # Schedule
    COLLECTION_INTERVAL_MINUTES = int(os.getenv("COLLECTION_INTERVAL_MINUTES", "60"))
    
    # Logs
    LOG_PATH = "/logs/producer.log"
