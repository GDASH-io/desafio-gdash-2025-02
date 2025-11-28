import time
import json
import os
import logging
import requests
import schedule
import pika
import sys

RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'rabbitmq')
RABBITMQ_QUEUE = os.getenv('RABBITMQ_QUEUE', 'weather_data')

LATITUDE = os.getenv('LATITUDE', '-23.5113')  
LONGITUDE = os.getenv('LONGITUDE', '-46.8768')

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
params = {
    "latitude": LATITUDE,
    "longitude": LONGITUDE,
    "current": ["temperature_2m","relative_humidity_2m","precipitation","weather_code","cloud_cover","wind_speed_10m","shortwave_radiation"],
    "timezone": "America/Sao_Paulo",
}

def fetch_weather_data():
    """Consulta a API Open-Meteo e retorna um dicionário estruturado."""
    try:
        logger.info("Buscando dados meteorológicos...")
        response = requests.get(OPEN_METEO_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        # Extração e Normalização
        current = data.get('current', {})
        
        payload = {
            "location": {
                "lat": float(LATITUDE),
                "lon": float(LONGITUDE)
            },
            "timestamp": current.get('time'),
            "temperature": current.get('temperature_2m'),
            "humidity": current.get('relative_humidity_2m'),
            "radiation": current.get('shortwave_radiation'), # Crítico para insights de energia solar [2]
            "cloud_cover": current.get('cloud_cover'),
            "precipitation": current.get('precipitation'),
            "wind_speed": current.get('wind_speed_10m'),
            "weather_code": current.get('weather_code')
        }
        return payload
    except Exception as e:
        logger.error(f"Erro ao buscar dados: {e}")
        return None
    


def get_rabbitmq_connection():
    """
    Tenta conectar ao RabbitMQ com backoff exponencial.
    Essencial para Docker Compose, onde o RabbitMQ pode demorar a iniciar.
    """
    retries = 0
    while True:
        try:
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(host=RABBITMQ_HOST, heartbeat=600)
            )
            return connection
        except pika.exceptions.AMQPConnectionError:
            wait_time = min(2 * retries, 10)
            retries += 1
            logger.warning(f"RabbitMQ indisponível (falhas: {retries}). Tentando novamente em {wait_time} segundos...")
            time.sleep(wait_time)


def publish_message():
    data = fetch_weather_data()
    if not data:
        return

    connection = None
    try:
        connection = get_rabbitmq_connection()
        channel = connection.channel()
        
        # Declara a fila como durável para garantir persistência dos dados
        channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)
        
        message_body = json.dumps(data)
        
        channel.basic_publish(
            exchange='',
            routing_key=RABBITMQ_QUEUE,
            body=message_body,
            properties=pika.BasicProperties(
                delivery_mode=2,  # Mensagem persistente (salva em disco)
                content_type='application/json'
            )
        )
        logger.info(f"Dados enviados para fila '{RABBITMQ_QUEUE}': {data['temperature']}°C")
        
    except Exception as e:
        logger.error(f"Erro na publicação: {e}")
    finally:
        if connection and not connection.is_closed:
            connection.close()

# teste rápido
publish_message()

schedule.every(15).minutes.do(publish_message)
# schedule.every(30).seconds.do(publish_message)

if __name__ == "__main__":
    logger.info("Serviço de Coleta Meteorológica Iniciado")
    while True:
        schedule.run_pending()
        time.sleep(1)