import time
import json
import requests
import pika
import os
import sys
from datetime import datetime

LATITUDE = "-20.37"
LONGITUDE = "-43.41"
RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
RABBITMQ_USER = os.getenv('RABBITMQ_USER', 'gdash')
RABBITMQ_PASS = os.getenv('RABBITMQ_PASS', 'gdash2025')
WEATHER_DATA_QUEUE = 'weather_queue'

CONNECTION = None

def get_weather_data():
    print(f"Coletando dados climáticos de Mariana/MG")
    
    url = f"https://api.open-meteo.com/v1/forecast?latitude={LATITUDE}&longitude={LONGITUDE}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=precipitation_probability&timezone=America/Sao_Paulo"
    
    try:
        meteo_response = requests.get(url, timeout=10)
        meteo_response.raise_for_status() 
        data = meteo_response.json()
        
        current_weather = data.get('current', {})
        hourly = data.get('hourly', {})
        
        current_hour = datetime.now().hour
        rain_prob = 0
        
        if 'precipitation_probability' in hourly:
            if len(hourly['precipitation_probability']) > current_hour:
                rain_prob = hourly['precipitation_probability'][current_hour]

        current_weather_code = current_weather.get('weather_code', 0)
        
        if current_weather_code >= 51 and current_weather_code <= 82:
             rain_prob = 100
        
        elif current_weather_code >= 2 and current_weather_code <= 3 and rain_prob == 0:
             rain_prob = 20

        std_report = {
            "latitude": LATITUDE,
            "longitude": LONGITUDE,
            "temp_c": current_weather.get('temperature_2m'),
            "humidity": current_weather.get('relative_humidity_2m'),
            "wind_speed": current_weather.get('wind_speed_10m'),
            "condition_code": current_weather.get('weather_code'),
            "rain_prob": rain_prob,
            "collected_at": time.time()
        }
        return std_report
        
    except Exception as e:
        print(f"Erro ao buscar clima: {e}")
        return None

def send_to_queue(channel, data):
    try:
        json_packet = json.dumps(data)
        
        channel.basic_publish(
            exchange='',
            routing_key=WEATHER_DATA_QUEUE,
            body=json_packet,
            properties=pika.BasicProperties(
                delivery_mode=2,
            )
        )
        print(f"Enviado para fila: Temp {data.get('temp_c')}°C | Chuva {data.get('rain_prob')}%")
    
    except Exception as e:
        print(f"Erro ao publicar mensagem: {e}")
        raise 

def setup_rabbitmq():
    global CONNECTION
    try:
        credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
        CONNECTION = pika.BlockingConnection(
            pika.ConnectionParameters(host=RABBITMQ_HOST, credentials=credentials, heartbeat=600)
        )
        return CONNECTION.channel()
    except Exception as e:
        print(f"Erro Crítico ao conectar no RabbitMQ: {e}")
        return None

if __name__ == "__main__":
    print("Iniciando Coletor de Clima")
    
    channel = setup_rabbitmq()
    if channel is None:
        print("Falha na inicialização do RabbitMQ. Encerrando.")
        sys.exit(1)

    try:
        while True:
            weather_data = get_weather_data()
            
            if weather_data:
                try:
                    send_to_queue(channel, weather_data)
                except Exception as e:
                    print(f"Conexão perdida. Tentando reconectar no próximo ciclo.")
                    channel = setup_rabbitmq() 
            
            time.sleep(3600) 
            
    except KeyboardInterrupt:
        print("Encerrando coletor...")
        if CONNECTION and not CONNECTION.is_closed:
            CONNECTION.close()
        sys.exit(0)