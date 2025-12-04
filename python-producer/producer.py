# Exemplo simples de producer Python que consulta Open-Meteo e publica no RabbitMQ.
import os, time, json
import requests
import pika

RABBITMQ_URI = os.getenv('RABBITMQ_URI', 'amqp://guest:guest@localhost:5672/')
LAT = os.getenv('OPENMETEO_LAT', '-23.55052')
LON = os.getenv('OPENMETEO_LON', '-46.633308')

def fetch_weather(lat, lon):
    url = f'https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true'
    r = requests.get(url, timeout=10)
    r.raise_for_status()
    data = r.json()
    cw = data.get('current_weather', {})
    payload = {
        "temperature": cw.get('temperature'),
        "windspeed": cw.get('windspeed'),
        "time": cw.get('time'),
        "raw": cw
    }
    return payload

def publish(payload):
    params = pika.URLParameters(RABBITMQ_URI)
    conn = pika.BlockingConnection(params)
    ch = conn.channel()
    ch.queue_declare(queue='weather_logs', durable=True)
    ch.basic_publish(exchange='', routing_key='weather_logs', body=json.dumps(payload))
    print('Published:', payload)
    conn.close()

if __name__ == '__main__':
    while True:
        try:
            p = fetch_weather(LAT, LON)
            publish(p)
        except Exception as e:
            print('Error:', e)
        time.sleep(3600)  # rodar a cada 1 hora (ajuste para testes)
