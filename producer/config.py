import os

LATITUDE = float(os.getenv("LATITUDE", "-23.55"))     # São Paulo
LONGITUDE = float(os.getenv("LONGITUDE", "-46.63"))
INTERVAL = int(os.getenv("INTERVAL", "3600"))         # segundos

BROKER_HOST = os.getenv("BROKER_HOST", "rabbitmq")
BROKER_QUEUE = os.getenv("BROKER_QUEUE", "weather")
TIMEZONE = os.getenv("TIMEZONE", "auto")              # 'auto' ou 'America/Sao_Paulo'
