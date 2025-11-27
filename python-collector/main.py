import pika
import requests
import json
import time
import schedule

# Configurações (Salvador - BA)
LAT = "-12.97"
LON = "-38.51"
RABBIT_HOST = 'rabbitmq' # Nome do serviço no docker-compose
QUEUE_NAME = 'weather_data'

def get_weather():
    try:
        print("🔄 Buscando dados climáticos...")
        # Pegando temperatura e velocidade do vento
        url = f"https://api.open-meteo.com/v1/forecast?latitude={LAT}&longitude={LON}&current_weather=true"
        response = requests.get(url)
        data = response.json()
        
        payload = {
            "temperature": data['current_weather']['temperature'],
            "windspeed": data['current_weather']['windspeed'],
            "condition_code": data['current_weather']['weathercode'], # Código numérico do clima
            "timestamp": time.time()
        }
        
        publish_to_queue(payload)
    except Exception as e:
        print(f"❌ Erro ao coletar: {e}")

def publish_to_queue(payload):
    try:
        # Conecta ao RabbitMQ
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBIT_HOST))
        channel = connection.channel()
        channel.queue_declare(queue=QUEUE_NAME)
        
        # Envia a mensagem
        message = json.dumps(payload)
        channel.basic_publish(exchange='', routing_key=QUEUE_NAME, body=message)
        print(f"✅ Enviado para fila: {message}")
        
        connection.close()
    except Exception as e:
        print(f"❌ Erro no RabbitMQ (Tentando novamente em breve): {e}")

# Agenda para rodar a cada 30 segundos (para teste rápido)
schedule.every(30).seconds.do(get_weather)

print("🚀 Coletor Python Iniciado...")
# Loop infinito
while True:
    schedule.run_pending()
    time.sleep(1)