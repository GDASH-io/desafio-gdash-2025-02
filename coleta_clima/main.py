import time
import json
import requests
import pika
import os 
from dotenv import load_dotenv


load_dotenv(dotenv_path="../.env")


RABBIT_HOST = '127.0.0.1'
RABBIT_PORT = int(os.getenv('RABBIT_PORT', 5672))
RABBIT_USER = os.getenv('RABBIT_USER', 'guest')
RABBIT_PASS = os.getenv('RABBIT_PASS', 'guest')
QUEUE_NAME = 'weather_data'

LATITUDE = -23.55
LONGITUDE = -46.63
URL_API = f"https://api.open-meteo.com/v1/forecast?latitude={LATITUDE}&longitude={LONGITUDE}&current=temperature_2m,relative_humidity_2m,is_day,precipitation&timezone=America%2FSao_Paulo"

def conectar_rabbitmq():
    """Tentar conectar no RabbitMQ com pesistência (Retry)"""
    credentials = pika.PlainCredentials(RABBIT_USER, RABBIT_PASS)
    parameters = pika.ConnectionParameters(host=RABBIT_HOST, port=RABBIT_PORT, credentials=credentials)

    try:
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()

        channel.queue_declare(queue=QUEUE_NAME, durable=True)
        print("Conectado ao RabbitMQ com sucesso!")
        return connection, channel
    except Exception as e:
        print(f"Erro ao conectar no RabbitMQ: {e}")
        return None, None
    
def buscar_clima():
    """Vai na internet buscar o clima atual""" 
    try:
        resposta = requests.get(URL_API)  
        if resposta.status_code == 200:
            dados = resposta.json()

            clima_atual = {
                "latitude": dados.get("latitude"),
                "longitude": dados.get("longitude"),
                "temperatura": dados["current"]["temperature_2m"],
                "umidade": dados["current"]["relative_humidity_2m"],
                "chuva": dados["current"]["precipitation"],
                "eh_dia": bool(dados["current"]["is_day"]),
                "timestamp": time.strftime('%Y-%m-%d %H:%M:%S')
            }
            return clima_atual
        else:
            print(f"Erro na API do Tempo: {resposta.status_code}") 
            return None
    except Exception as e:
        print(f"Erro  de conexão com Api:{e}") 
        return None
if __name__ == "__main__":
    print("Iniciando o coletor de clima")

    connection, channel = conectar_rabbitmq()

    while True:
        if connection is None or connection.is_closed:
            print("Reconectando ao RabbitMQ...")   
            connection, channel = conectar_rabbitmq()
            time.sleep(5)
            continue

        dados_clima = buscar_clima()

        if dados_clima:
            mensagem_json = json.dumps(dados_clima)

            try: 
                channel.basic_publish(
                    exchange='',
                    routing_key=QUEUE_NAME,
                    body=mensagem_json,
                    properties=pika.BasicProperties(
                        delivery_mode=2,
                    )
                )
                print(f"[ENVIADO] {dados_clima['temperatura']}°C em SP")
            except Exception as e:
                print(f"Erro ao enviar mensagem: {e}")
                connection = None


        time.sleep(10)