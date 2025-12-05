import os
import time
import json
import requests
import pika

API_URL = os.getenv("WEATHER_API_URL")
LAT = os.getenv("CITY_LATITUDE")
LON = os.getenv("CITY_LONGITUDE")
AMQP_URL = os.getenv("AMQP_URL")
QUEUE_NAME = "weather_data_queue"
COLLECT_INTERVAL_SECONDS = int(os.getenv("COLLECT_INTERVAL_SECONDS", 3600))

def connect_to_rabbitmq():
    max_retries = 10
    retry_delay = 5
    for attempt in range(max_retries):
        try:
            print(f"Tentando conectar ao RabbitMQ ({attempt+1}/{max_retries})...")
            params = pika.URLParameters(AMQP_URL)
            connection = pika.BlockingConnection(params)
            print("Conexão com RabbitMQ estabelecida com sucesso.")
            return connection
        except pika.exceptions.AMQPConnectionError as e:
            print(f"Falha ao conectar ao RabbitMQ: {e}. Tentando novamente em {retry_delay}s.")
            time.sleep(retry_delay)
    raise Exception("Não foi possível conectar ao RabbitMQ após várias tentativas.")

def fetch_weather_data():
    print(f"Buscando dados para Lat: {LAT}, Lon: {LON}...")
    try:
        params = {
            "latitude": LAT,
            "longitude": LON,
            "current_weather": "true",
            "timezone": "auto",
            "forecast_days": 1
        }
        response = requests.get(API_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        current = data.get('current_weather', {})
        
        if not current:
            print("AVISO: 'current_weather' não encontrado na resposta da API.")
            return None
        weather_code = current.get('weathercode')
        
        def map_weather_code(code):
            if 0 <= code <= 3:
                return "Céu Limpo/Parcialmente Nublado"
            elif 45 <= code <= 48:
                return "Neblina"
            elif 51 <= code <= 67:
                return "Chuva (Leve a Forte)"
            elif 71 <= code <= 75:
                return "Neve"
            elif 95 <= code <= 99:
                return "Trovoada"
            return "Condição Desconhecida"

        normalized_data = {
            "timestamp": time.time(),
            "location_name": f"Lat: {LAT}, Lon: {LON}",
            "temperature_c": current.get('temperature'),
            "wind_speed_kmh": current.get('windspeed'),
            "weather_code": weather_code,
            "condition": map_weather_code(weather_code)
        }
        
        print(f"Dados Coletados: Temp={normalized_data['temperature_c']}°C, Condição='{normalized_data['condition']}'")
        return normalized_data

    except requests.exceptions.RequestException as e:
        print(f"Erro ao buscar dados da API: {e}")
        return None

def send_to_queue(channel, data):
    message = json.dumps(data)
    channel.queue_declare(queue=QUEUE_NAME, durable=True) 
    
    channel.basic_publish(
        exchange='',
        routing_key=QUEUE_NAME,
        body=message,
        properties=pika.BasicProperties(
            delivery_mode=pika.spec.PERSISTENT_DELIVERY_MODE
        )
    )
    print(f" [x] Enviado para a fila: {message[:100]}...")

def main():
    connection = connect_to_rabbitmq()
    channel = connection.channel()
    
    while True:
        data = fetch_weather_data()
        
        if data:
            send_to_queue(channel, data)
        
        print(f"Aguardando {COLLECT_INTERVAL_SECONDS} segundos para a próxima coleta...")
        time.sleep(COLLECT_INTERVAL_SECONDS)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Erro fatal no serviço de coleta Python: {e}")
    finally:
        if 'connection' in locals() and connection.is_open:
            connection.close()