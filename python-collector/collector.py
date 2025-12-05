import os
import time
import json
import requests
import pika
import random
from datetime import datetime
import numpy as np
from sklearn.linear_model import LinearRegression

import geo_utils

from weather_insights import generate_insights_for_location


# --- Configurações ---
RABBITMQ_HOST = os.getenv('RABBITMQ_HOST', 'rabbitmq')
RABBITMQ_QUEUE_NAME = os.getenv('RABBITMQ_QUEUE_NAME', 'weather_data_queue')
RABBITMQ_USER = os.getenv('RABBITMQ_USER', 'user')
RABBITMQ_PASS = os.getenv('RABBITMQ_PASSWORD', 'password')

# Coordenadas (Padrão: São Paulo, mas lidas do .env se existirem)
LAT = os.getenv('WEATHER_LAT', '-23.5505') 
LON = os.getenv('WEATHER_LON', '-46.6333')

# Intervalo de coleta (em segundos)
COLLECTION_INTERVAL = 1800

print(f"🚀 Inicializando Coletor Python (Open-Meteo)...", flush=True)
print(f"📍 Alvo: Lat {LAT}, Lon {LON} | RabbitMQ: {RABBITMQ_HOST}", flush=True)

# --- Mapeamento de Códigos WMO (Open-Meteo) ---
def get_condition_from_code(code):
    """Traduz o código numérico WMO do Open-Meteo para texto legível."""
    if code == 0: return "Céu Limpo ☀️"
    if code in [1, 2, 3]: return "Parcialmente Nublado ⛅"
    if code in [45, 48]: return "Nevoeiro 🌫️"
    if code in [51, 53, 55, 61, 63, 65]: return "Chuva Fraca/Moderada 🌧️"
    if code in [80, 81, 82, 66, 67]: return "Chuva Forte ⛈️"
    if code >= 95: return "Tempestade ⚡"
    return "Condição Desconhecida"

# --- Módulo IA (Regressão Linear Simples com Scikit-learn) ---
def train_simple_model():
    # Treina com dados históricos fictícios para criar o modelo
    # X = [Temp Atual, Humidade]
    X = np.array([[20, 80], [25, 60], [30, 40], [15, 90], [28, 50]])
    # y = [Temp Máxima Prevista na próxima hora]
    y = np.array([22, 28, 33, 17, 30])
    
    model = LinearRegression()
    model.fit(X, y)
    return model

# Carrega o modelo na memória ao iniciar
ai_model = train_simple_model()

def generate_ai_insight(temp, humidity):
    """Gera uma previsão baseada nos dados atuais."""
    try:
        # Faz a previsão usando o modelo treinado
        input_data = np.array([[temp, humidity]])
        prediction = ai_model.predict(input_data)[0]
        
        return {
            "predicted_max_temp": round(prediction, 1),
            "ai_message": f"IA: Previsão de {round(prediction, 1)}°C na próxima hora com base na humidade de {humidity}%."
        }
    except Exception as e:
        return {"ai_message": "IA indisponível no momento."}
    
def fetch_with_retry(url, max_retries=3):
    """Tenta chamar a API várias vezes antes de desistir."""
    delay = 2  # segundos

    for attempt in range(1, max_retries + 1):
        try:
            print(f"🔁 Tentativa {attempt}/{max_retries} para Open-Meteo...", flush=True)
            res = requests.get(url, timeout=25)
            res.raise_for_status()
            return res
        
        except Exception as e:
            print(f"⚠️ Falha na tentativa {attempt}: {e}", flush=True)

            if attempt == max_retries:
                raise e  # aqui vamos cair no fallback lá embaixo
            
            print(f"⏳ Aguardando {delay}s antes da próxima tentativa...", flush=True)
            time.sleep(delay)
            delay *= 2  # backoff exponencial

# --- Coleta de Dados (Open-Meteo) ---
def fetch_weather_data():
    print(f"🌍 Consultando Open-Meteo...", flush=True)
    
    try:
        # URL da API gratuita do Open-Meteo
        url = f"https://api.open-meteo.com/v1/forecast?latitude={LAT}&longitude={LON}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto"
        
        res = fetch_with_retry(url)
        res.raise_for_status()
        data = res.json()
        
        # Extração dos dados do objeto 'current'
        current = data.get('current', {})
        
        temp = current.get('temperature_2m')
        hum = current.get('relative_humidity_2m')
        wind = current.get('wind_speed_10m')
        wmo_code = current.get('weather_code')
        loaction = geo_utils.obter_cidade(LAT, LON)
        
        condition_text = get_condition_from_code(wmo_code)

        payload = {
            "timestamp": datetime.now().isoformat(),
            "location": loaction,
            "temperature_c": temp,
            "humidity_percent": hum,
            "wind_speed_kmh": wind,
            "condition": condition_text,
            "insights": generate_insights_for_location(float(LAT), float(LON))
        }
        return payload

    except Exception as e:
        print(f"⚠️ Erro na API Open-Meteo: {e}. Usando dados simulados de fallback.", flush=True)
        
        # Fallback: Dados Simulados (para garantir que o sistema não pare)
        sim_temp = round(random.uniform(20.0, 30.0), 1)
        sim_hum = random.randint(40, 80)
        
        return {
            "timestamp": datetime.now().isoformat(),
            "location": "Dados Simulados (Erro API)",
            "temperature_c": sim_temp,
            "humidity_percent": sim_hum,
            "wind_speed_kmh": random.randint(5, 20),
            "condition": "Simulado 🎲",
            "insights": generate_ai_insight(sim_temp, sim_hum)
        }

# --- RabbitMQ ---
def publish_to_queue(data):
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
    params = pika.ConnectionParameters(host=RABBITMQ_HOST, credentials=credentials)
    
    connection = None
    try:
        connection = pika.BlockingConnection(params)
        channel = connection.channel()
        # Garante que a fila existe
        channel.queue_declare(queue=RABBITMQ_QUEUE_NAME, durable=True)
        
        channel.basic_publish(
            exchange='',
            routing_key=RABBITMQ_QUEUE_NAME,
            body=json.dumps(data),
            properties=pika.BasicProperties(delivery_mode=2) # Mensagem persistente
        )
        print(f"✅ [ENVIADO] {data['location']} | {data['temperature_c']}°C | {data['condition']} | {data['insights']}", flush=True)
        
    except Exception as e:
        print(f"❌ Erro de conexão RabbitMQ: {e}", flush=True)
    finally:
        if connection and connection.is_open:
            connection.close()

# --- Loop Principal ---
if __name__ == "__main__":
    # Pequena pausa inicial para garantir que o RabbitMQ suba primeiro
    print("⏳ Aguardando serviços iniciarem...", flush=True)
    time.sleep(10)
    
    while True:
        weather_data = fetch_weather_data()
        if weather_data:
            publish_to_queue(weather_data)
        
        print(f"💤 Aguardando {COLLECTION_INTERVAL} segundos...", flush=True)
        time.sleep(COLLECTION_INTERVAL)