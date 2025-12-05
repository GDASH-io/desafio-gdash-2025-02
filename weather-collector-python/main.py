import requests
import pika
import json
import time
import schedule
import logging

# Configuração
RABBITMQ_HOST = 'rabbitmq'
QUEUE_NAME = 'weather_data'
CITY_LAT = -23.5505
CITY_LON = -46.6333

# Configurar Logs
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')

def get_weather_data():
    try:
        logging.info("Buscando dados climáticos...")
        # API Open-Meteo
        url = f"https://api.open-meteo.com/v1/forecast?latitude={CITY_LAT}&longitude={CITY_LON}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,cloud_cover,wind_speed_10m"
        response = requests.get(url)
        data = response.json()
        
        current = data.get('current', {})
        
        payload = {
            "latitude": CITY_LAT,
            "longitude": CITY_LON,
            "temperature": current.get('temperature_2m'),
            "humidity": current.get('relative_humidity_2m'),
            "wind_speed": current.get('wind_speed_10m'),
            "condition": "Cloudy" if current.get('cloud_cover', 0) > 50 else "Clear",
            "timestamp": current.get('time')
        }

        return payload
    
    except Exception as e:
        logging.error(f"Erro ao buscar dados: {e}")
        return None

def send_to_queue():
    weather_data = get_weather_data()
    if not weather_data:
        return

    try:
        # Conexão com RabbitMQ
        credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)

        connection = pika.BlockingConnection(pika.ConnectionParameters(host='rabbitmq', credentials=credentials))
        channel = connection.channel()
        channel.queue_declare(queue=QUEUE_NAME, durable=True)
        
        message = json.dumps(weather_data)
        channel.basic_publish(exchange='', routing_key=QUEUE_NAME, body=message)
        
        logging.info(f"Dados enviados para fila: {message}")
        connection.close()
    except Exception as e:
        logging.error(f"Erro ao conectar/enviar RabbitMQ: {e}")

# Agenda para rodar a cada 1 hora
schedule.every(1).hours.do(send_to_queue)

logging.info("Iniciando Coletor Python...")
# Executa uma vez
send_to_queue()

while True:
    schedule.run_pending()
    time.sleep(1)