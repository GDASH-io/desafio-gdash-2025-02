import os
import time
import json
import requests
import pika
from datetime import datetime
from zoneinfo import ZoneInfo

RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
RABBITMQ_PORT = int(os.getenv('RABBITMQ_PORT', '5672'))
RABBITMQ_USER = os.getenv('RABBITMQ_USER', 'guest')
RABBITMQ_PASS = os.getenv('RABBITMQ_PASS', 'guest')
QUEUE_NAME = 'weather_data'

OPEN_METEO_API_URL = os.getenv('OPEN_METEO_API_URL', 'https://api.open-meteo.com/v1/forecast')
LATITUDE = os.getenv('LATITUDE', '-12.9714')
LONGITUDE = os.getenv('LONGITUDE', '-38.5014')

COLLECTION_INTERVAL = int(os.getenv('COLLECTION_INTERVAL', '3600'))

def get_weather_data():
    try:
        params = {
            'latitude': LATITUDE,
            'longitude': LONGITUDE,
            'current_weather': 'true',
            'hourly': 'temperature_2m,relativehumidity_2m,windspeed_10m,weathercode,precipitation_probability',
            'timezone': 'America/Bahia',
            'windspeed_unit': 'kmh'
        }
        response = requests.get(OPEN_METEO_API_URL, params=params)
        response.raise_for_status()
        data = response.json()
        return data
    except requests.exceptions.RequestException as e:
        print(f"Erro ao buscar dados de clima: {e}")
        return None

def normalize_weather_data(data):
    if not data or 'current_weather' not in data:
        return None

    current_weather = data['current_weather']
    
    current_dt = datetime.fromisoformat(current_weather['time']).replace(tzinfo=ZoneInfo("America/Bahia"))
    rounded_dt = current_dt.replace(minute=0, second=0, microsecond=0)
    
    normalized_data = {
        'timestamp': rounded_dt.isoformat(),
        'latitude': data['latitude'],
        'longitude': data['longitude'],
        'temperature': current_weather['temperature'],
        'windspeed': current_weather['windspeed'],
        'weathercode': current_weather['weathercode'],
        'is_day': current_weather['is_day']
    }

    if 'hourly' in data and data['hourly']['time']:
        hourly_time_target_str = rounded_dt.strftime('%Y-%m-%dT%H:00')
        
        try:
            if hourly_time_target_str in data['hourly']['time']:
                current_time_index = data['hourly']['time'].index(hourly_time_target_str)
                if 'relativehumidity_2m' in data['hourly']:
                    normalized_data['humidity'] = data['hourly']['relativehumidity_2m'][current_time_index]
                if 'precipitation_probability' in data['hourly']:
                    normalized_data['precipitation_probability'] = data['hourly']['precipitation_probability'][current_time_index]
            else:
                print(f"[{datetime.now()}] Dados horários para {hourly_time_target_str} não encontrados, alguns campos podem estar faltando.")
        except ValueError as e:
            print(f"[{datetime.now()}] Erro ao analisar o tempo do current_weather: {e}, alguns campos podem estar faltando.")
    
    return normalized_data

def publish_to_rabbitmq(message):
    try:
        credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials))
        channel = connection.channel()

        channel.queue_declare(queue=QUEUE_NAME, durable=True)
        channel.basic_publish(
            exchange='',
            routing_key=QUEUE_NAME,
            body=json.dumps(message),
            properties=pika.BasicProperties(
                delivery_mode=pika.spec.PERSISTENT_DELIVERY_MODE
            )
        )
        print(f" [x] Enviado {message}")
        connection.close()
    except pika.exceptions.AMQPConnectionError as e:
        print(f"Erro ao conectar ao RabbitMQ: {e}")
    except Exception as e:
        print(f"Ocorreu um erro inesperado: {e}")

if __name__ == "__main__":
    print("Iniciando coletor de dados de clima...")
    print("INTERVALO_COLETA:", COLLECTION_INTERVAL)
    print("LATITUDE:", LATITUDE)
    print("LONGITUDE:", LONGITUDE)

    while True:
        print(f"[{datetime.now()}] Tentando buscar dados de clima...")
        weather_data = get_weather_data()
        if weather_data:
            print(f"[{datetime.now()}] Dados buscados, normalizando...")
            normalized_data = normalize_weather_data(weather_data)
            if normalized_data:
                print(f"[{datetime.now()}] Dados normalizados, publicando no RabbitMQ...")
                publish_to_rabbitmq(normalized_data)
            else:
                print(f"[{datetime.now()}] Falha ao normalizar dados.")
        else:
            print(f"[{datetime.now()}] Falha ao buscar dados de clima.")

        print(f"[{datetime.now()}] Dormindo por {COLLECTION_INTERVAL} segundos...")
        time.sleep(COLLECTION_INTERVAL)
