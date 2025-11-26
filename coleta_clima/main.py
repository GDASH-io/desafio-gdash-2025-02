import time
import json
import requests
import pika
import os 
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env")

RABBIT_HOST = os.getenv('RABBITMQ_HOST', '127.0.0.1')
RABBIT_PORT = int(os.getenv('RABBITMQ_PORT', 5672))
RABBIT_USER = os.getenv('RABBITMQ_USER', 'guest')
RABBIT_PASS = os.getenv('RABBITMQ_PASS', 'guest')
QUEUE_NAME = 'weather_data'

LATITUDE = -23.55
LONGITUDE = -46.63
URL_API = f"https://api.open-meteo.com/v1/forecast?latitude={LATITUDE}&longitude={LONGITUDE}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,wind_speed_10m,cloud_cover&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FSao_Paulo"

def enviar_para_fila(dados):
    try:
        credentials = pika.PlainCredentials(RABBIT_USER, RABBIT_PASS)
        parameters = pika.ConnectionParameters(host=RABBIT_HOST, port=RABBIT_PORT, credentials=credentials)
        
        # Abre
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
        channel.queue_declare(queue=QUEUE_NAME, durable=True)
        
        # Manda
        mensagem_json = json.dumps(dados)
        channel.basic_publish(
            exchange='',
            routing_key=QUEUE_NAME,
            body=mensagem_json,
            properties=pika.BasicProperties(delivery_mode=2)
        )
        print(f"[ENVIADO] {dados['temperatura']}°C em SP")
        
        # Fecha
        connection.close()
        return True
    except Exception as e:
        print(f"Erro ao enviar para RabbitMQ: {e}")
        return False

def buscar_clima():
    try:
        resposta = requests.get(URL_API)   
        if resposta.status_code == 200:
            dados = resposta.json()
            return {
                "latitude": dados.get("latitude"),
                "longitude": dados.get("longitude"),
                "temperatura": dados["current"]["temperature_2m"],
                "umidade": dados["current"]["relative_humidity_2m"],
                "chuva": dados["current"]["precipitation"],
                "eh_dia": bool(dados["current"]["is_day"]),
                "timestamp": time.strftime('%Y-%m-%d %H:%M:%S'),
                "cidade": "Butantã, SP",
                "pais": "🇧🇷",
                "temp_max": dados["daily"]["temperature_2m_max"][0],
                "temp_min": dados["daily"]["temperature_2m_min"][0],
                "velocidade_vento": dados["current"]["wind_speed_10m"],
                "condicao_ceu": dados["current"]["cloud_cover"],
                "probabilidade_chuva": dados["daily"]["precipitation_probability_max"][0]
            }
        else:
            print(f"Erro na API do Tempo: {resposta.status_code}") 
            return None
    except Exception as e:
        print(f" Erro de conexão com Api: {e}") 
        return None

if __name__ == "__main__":
    print("Iniciando o coletor de clima (Modo Seguro)...")

    time.sleep(10)

    while True:
        dados_clima = buscar_clima()

        if dados_clima:
            enviar_para_fila(dados_clima)
       
        print(" Dormindo...")
        time.sleep(1800) 