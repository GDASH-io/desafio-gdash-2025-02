import requests
import redis
import time
import os
import json
from datetime import datetime

# --- CONFIGURAÇÕES ---
REDIS_HOST = os.getenv('REDIS_HOST', 'redis')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
REDIS_CHANNEL = 'weather_data_queue'
LATITUDE = os.getenv('LATITUDE', '-23.5505') # São Paulo
LONGITUDE = os.getenv('LONGITUDE', '-46.6333') # São Paulo
COLLECTION_INTERVAL_SECONDS = int(os.getenv('COLLECTION_INTERVAL_SECONDS', 10)) # Coleta a cada 10 segundos por padrão (ambiente pode sobrescrever)

# Conexão com o Redis
try:
    r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
    r.ping()
    print("Conexão com Redis estabelecida com sucesso!")
except Exception as e:
    print(f"Erro ao conectar ao Redis em {REDIS_HOST}:{REDIS_PORT}: {e}")
    exit(1)

# URL da Open-Meteo
OPEN_METEO_URL = (
    "https://api.open-meteo.com/v1/forecast?"
    f"latitude={LATITUDE}&longitude={LONGITUDE}&"
    "current_weather=true&hourly=temperature_2m,relative_humidity_2m&timezone=America%2FSao_Paulo"
)

# --- Gemini (Generative Language) API (opcional) ---
GEMINI_API_KEY = os.getenv('AIzaSyD8dIWN5No7PofGqDI0-SNwiB8H5LaAiws', '')
GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent'

def collect_and_publish():
    """Coleta dados climáticos atuais e publica na fila do Redis."""
    try:
        response = requests.get(OPEN_METEO_URL, timeout=10)
        response.raise_for_status() # Lança erro para status HTTP ruins
        data = response.json()

        # Extraindo dados atuais
        current_weather = data.get('current_weather', {})
        
        # Estruturando o dado a ser enviado (payload)
        weather_payload = {
            'timestamp': datetime.now().isoformat(),
            'latitude': float(LATITUDE),
            'longitude': float(LONGITUDE),
            'temperature': current_weather.get('temperature', 0.0),
            'wind_speed': current_weather.get('windspeed', 0.0),
            'weather_code': current_weather.get('weathercode', 0),
        }

        # Se houver chave Gemini, gere um insight curto e adicione ao payload
        if GEMINI_API_KEY:
            try:
                system_prompt = (
                    "Você é um analista climático amigável e conciso. Dada a temperatura em Celsius "
                    "e a velocidade do vento em km/h, forneça um insight de uma única frase sobre o clima."
                )
                user_query = (
                    f"Temperatura: {weather_payload['temperature']}°C, "
                    f"Velocidade do Vento: {weather_payload['wind_speed']} km/h. Gere um insight."
                )

                gemini_payload = {
                    'contents': [
                        {'parts': [{'text': user_query}]}
                    ],
                    'systemInstruction': {'parts': [{'text': system_prompt}]}
                }

                resp = requests.post(f"{GEMINI_API_URL}?key={GEMINI_API_KEY}", json=gemini_payload, timeout=10, headers={"Content-Type": "application/json"})
                resp.raise_for_status()
                resp_json = resp.json()
                # Navega até o texto candidato (estrutura compatível com o uso no backend TS)
                candidate = resp_json.get('candidates', [])
                if candidate and isinstance(candidate, list):
                    text = candidate[0].get('content', {}).get('parts', [])
                    if text and isinstance(text, list):
                        insight_text = text[0].get('text')
                        if insight_text:
                            weather_payload['insight'] = insight_text
            except Exception as e:
                print(f"Aviso: falha ao gerar insight com Gemini: {e}")

        # Publicando na fila (usando LPUSH/BLPOP)
        r.lpush(REDIS_CHANNEL, json.dumps(weather_payload))
        print(f"[{weather_payload['timestamp']}] Dados coletados e enviados para a fila. Temp: {weather_payload['temperature']}°C")

    except requests.exceptions.RequestException as e:
        print(f"Erro ao coletar dados da Open-Meteo: {e}")
    except Exception as e:
        print(f"Erro inesperado no coletor: {e}")

if __name__ == "__main__":
    print(f"Iniciando Coletor de Dados. Coordenadas: Lat={LATITUDE}, Lon={LONGITUDE}")
    while True:
        collect_and_publish()
        time.sleep(COLLECTION_INTERVAL_SECONDS)