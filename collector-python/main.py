import os
import time
import json
import logging
import requests
import pika
from datetime import datetime
from dotenv import load_dotenv

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Carregar variáveis de ambiente
load_dotenv()

# Configurações
WEATHER_API_PROVIDER = os.getenv('WEATHER_API_PROVIDER', 'open-meteo')
WEATHER_API_KEY = os.getenv('WEATHER_API_KEY', '')
CITY_NAME = os.getenv('CITY_NAME', 'Maceió, BR')
LATITUDE = float(os.getenv('LATITUDE', '-9.5713'))
LONGITUDE = float(os.getenv('LONGITUDE', '-36.7820'))
RABBITMQ_URL = os.getenv('RABBITMQ_URL', 'amqp://admin:admin123@localhost:5672/')
RABBITMQ_QUEUE = os.getenv('RABBITMQ_QUEUE', 'weather.readings')
PULL_INTERVAL_SECONDS = int(os.getenv('PULL_INTERVAL_SECONDS', '3600'))


def fetch_open_meteo_data(lat: float, lon: float) -> dict:
    """Busca dados do Open-Meteo"""
    url = 'https://api.open-meteo.com/v1/forecast'
    params = {
        'latitude': lat,
        'longitude': lon,
        'current': 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
        'hourly': 'precipitation_probability',
        'timezone': 'America/Maceio',
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        current = data.get('current', {})
        hourly = data.get('hourly', {})
        
        # Pegar probabilidade de chuva da próxima hora
        rain_prob = 0.0
        if hourly.get('precipitation_probability'):
            rain_prob = hourly['precipitation_probability'][0] / 100.0
        
        # Mapear weather_code para condição
        weather_code = current.get('weather_code', 0)
        condition_map = {
            0: 'clear',
            1: 'mostly_clear',
            2: 'partly_cloudy',
            3: 'overcast',
            45: 'foggy',
            48: 'foggy',
            51: 'drizzle',
            53: 'drizzle',
            55: 'drizzle',
            61: 'rain',
            63: 'rain',
            65: 'rain',
            71: 'snow',
            73: 'snow',
            75: 'snow',
            80: 'rain',
            81: 'rain',
            82: 'rain',
            85: 'snow',
            86: 'snow',
            95: 'thunderstorm',
            96: 'thunderstorm',
            99: 'thunderstorm',
        }
        condition = condition_map.get(weather_code, 'unknown')
        
        return {
            'city': CITY_NAME.split(',')[0],
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'temperatureC': current.get('temperature_2m', 0),
            'humidity': current.get('relative_humidity_2m', 0) / 100.0,
            'windSpeedKmh': current.get('wind_speed_10m', 0) * 3.6,  # Converter m/s para km/h
            'condition': condition,
            'rainProbability': rain_prob,
            'raw': data,
        }
    except Exception as e:
        logger.error(f'Erro ao buscar dados do Open-Meteo: {e}')
        raise


def fetch_openweather_data(lat: float, lon: float, api_key: str) -> dict:
    """Busca dados do OpenWeather"""
    url = 'https://api.openweathermap.org/data/2.5/weather'
    params = {
        'lat': lat,
        'lon': lon,
        'appid': api_key,
        'units': 'metric',
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        main = data.get('main', {})
        weather = data.get('weather', [{}])[0]
        wind = data.get('wind', {})
        
        return {
            'city': data.get('name', CITY_NAME.split(',')[0]),
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'temperatureC': main.get('temp', 0),
            'humidity': main.get('humidity', 0) / 100.0,
            'windSpeedKmh': wind.get('speed', 0) * 3.6,  # Converter m/s para km/h
            'condition': weather.get('main', 'unknown').lower(),
            'rainProbability': data.get('rain', {}).get('1h', 0) / 100.0 if data.get('rain') else 0.0,
            'raw': data,
        }
    except Exception as e:
        logger.error(f'Erro ao buscar dados do OpenWeather: {e}')
        raise


def fetch_weather_data() -> dict:
    """Busca dados climáticos do provedor configurado"""
    if WEATHER_API_PROVIDER == 'open-meteo':
        return fetch_open_meteo_data(LATITUDE, LONGITUDE)
    elif WEATHER_API_PROVIDER == 'openweather':
        if not WEATHER_API_KEY:
            raise ValueError('WEATHER_API_KEY é obrigatório para OpenWeather')
        return fetch_openweather_data(LATITUDE, LONGITUDE, WEATHER_API_KEY)
    else:
        raise ValueError(f'Provedor desconhecido: {WEATHER_API_PROVIDER}')


def publish_to_rabbitmq(message: dict):
    """Publica mensagem no RabbitMQ"""
    max_retries = 3
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            # Parse da URL do RabbitMQ
            parsed_url = pika.URLParameters(RABBITMQ_URL)
            connection = pika.BlockingConnection(parsed_url)
            channel = connection.channel()
            
            # Declarar fila
            channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)
            
            # Publicar mensagem
            channel.basic_publish(
                exchange='',
                routing_key=RABBITMQ_QUEUE,
                body=json.dumps(message),
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Tornar mensagem persistente
                ),
            )
            
            connection.close()
            logger.info(f'Mensagem publicada na fila {RABBITMQ_QUEUE}')
            return
            
        except Exception as e:
            retry_count += 1
            logger.error(f'Erro ao publicar no RabbitMQ (tentativa {retry_count}/{max_retries}): {e}')
            if retry_count < max_retries:
                time.sleep(5)  # Aguardar 5 segundos antes de tentar novamente
            else:
                raise


def main():
    """Loop principal de coleta"""
    logger.info('🚀 Iniciando coletor de dados climáticos')
    logger.info(f'Provedor: {WEATHER_API_PROVIDER}')
    logger.info(f'Cidade: {CITY_NAME}')
    logger.info(f'Intervalo: {PULL_INTERVAL_SECONDS} segundos')
    
    while True:
        try:
            logger.info('Coletando dados climáticos...')
            weather_data = fetch_weather_data()
            logger.info(f'Dados coletados: {weather_data["temperatureC"]:.1f}°C, {weather_data["condition"]}')
            
            publish_to_rabbitmq(weather_data)
            logger.info(f'Próxima coleta em {PULL_INTERVAL_SECONDS} segundos')
            
        except Exception as e:
            logger.error(f'Erro no loop principal: {e}')
            logger.info(f'Aguardando {PULL_INTERVAL_SECONDS} segundos antes de tentar novamente...')
        
        time.sleep(PULL_INTERVAL_SECONDS)


if __name__ == '__main__':
    main()

