import os
from dotenv import load_dotenv

load_dotenv()

# Configurações RabbitMQ
RABBITMQ_URL = os.getenv('RABBITMQ_URL', 'amqp://admin:admin123@localhost:5672/')
QUEUE_NAME = 'weather_data'

# Configurações de Localização
LOCATION_LAT = float(os.getenv('LOCATION_LAT', '-23.5505'))
LOCATION_LON = float(os.getenv('LOCATION_LON', '-46.6333'))
LOCATION_NAME = os.getenv('LOCATION_NAME', 'São Paulo')

# Configurações de Coleta
COLLECT_INTERVAL = int(os.getenv('COLLECT_INTERVAL', '3600'))

# Configurações da API
OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast'

# Configurações de Conexão
HEARTBEAT_INTERVAL = 30
BLOCKED_CONNECTION_TIMEOUT = 300
SOCKET_TIMEOUT = 10
CONNECTION_ATTEMPTS = 3
RETRY_DELAY = 2
HEARTBEAT_CHECK_INTERVAL = 15