import time
import json
import os
import requests
import schedule
import pika
from datetime import datetime

RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'localhost')
QUEUE_NAME = 'weather_data'

LATITUDE = -15.79
LONGITUDE = -47.88

def get_weather_data():
    """
    Busca dados da API Open-Meteo.
    Não requer chave de API.
    """
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": LATITUDE,
        "longitude": LONGITUDE,
        "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
        "timezone": "America/Sao_Paulo"
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status() 
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Erro ao buscar dados da API: {e}")
        return None

def process_data(raw_data):
    """
    Extrai apenas os dados necessários do JSON gigante da API.
    """
    if not raw_data:
        return None
        
    current = raw_data.get('current', {})
    
    payload = {
        "location": {
            "lat": raw_data.get('latitude'),
            "lon": raw_data.get('longitude')
        },
        "temperature": current.get('temperature_2m'),
        "humidity": current.get('relative_humidity_2m'),
        "wind_speed": current.get('wind_speed_10m'),
        "condition_code": current.get('weather_code'), 
        "collected_at": datetime.now().isoformat()
    }
    return payload

def publish_to_rabbitmq(payload):
    """
    Conecta no RabbitMQ e envia a mensagem.
    """
    if not payload:
        return

    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
        channel = connection.channel()
        channel.queue_declare(queue=QUEUE_NAME, durable=True)

        message = json.dumps(payload)
        channel.basic_publish(
            exchange='',
            routing_key=QUEUE_NAME,
            body=message,
            properties=pika.BasicProperties(
                delivery_mode=2, 
            )
        )
        
        print(f" [x] Dados enviados para fila '{QUEUE_NAME}': {payload['temperature']}°C")
        connection.close()
        
    except pika.exceptions.AMQPConnectionError as e:
        print(f"Erro de conexão com RabbitMQ: {e}")
        print("DICA: Verifique se o container do RabbitMQ está rodando.")

def job():
    """
    Tarefa principal que será agendada.
    """
    print(f"--- Iniciando coleta: {datetime.now()} ---")
    raw_data = get_weather_data()
    clean_data = process_data(raw_data)
    publish_to_rabbitmq(clean_data)

if __name__ == "__main__":
    print("🚀 Serviço de Coleta Climática Iniciado")
    print(f"📡 Conectando ao RabbitMQ em: {RABBITMQ_HOST}")
    
    job()
    
    schedule.every(1).hours.do(job)
    
    while True:
        schedule.run_pending()
        time.sleep(1)