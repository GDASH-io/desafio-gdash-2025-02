import requests
import redis
import time
import os
import json
from datetime import datetime

REDIS_HOST = os.getenv('REDIS_HOST', 'redis')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
REDIS_CHANNEL = 'weather_data_queue'
LATITUDE = os.getenv('LATITUDE', '-22.9099')
LONGITUDE = os.getenv('LONGITUDE', '-47.0626')
COLLECTION_INTERVAL_SECONDS = int(os.getenv('COLLECTION_INTERVAL_SECONDS', 10))

try:
    r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
    r.ping()
    print("Redis conectado.")
except Exception as e:
    print(f"Erro ao conectar Redis: {e}")
    exit(1)

OPEN_METEO_URL = (
    "https://api.open-meteo.com/v1/forecast?"
    f"latitude={LATITUDE}&longitude={LONGITUDE}&"
    "current_weather=true&hourly=temperature_2m,relative_humidity_2m&timezone=America%2FSao_Paulo"
)

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent'

def _extract_text_from_gemini(json_obj):
    candidates = json_obj.get('candidates') or json_obj.get('candidate')
    if candidates and isinstance(candidates, list) and len(candidates) > 0:
        first = candidates[0]
        content = first.get('content') if isinstance(first, dict) else None
        if content:
            parts = None
            if isinstance(content, dict):
                parts = content.get('parts')
            elif isinstance(content, list) and len(content) > 0 and isinstance(content[0], dict):
                parts = content[0].get('parts')
            if parts and isinstance(parts, list) and len(parts) > 0:
                part = parts[0]
                if isinstance(part, dict) and part.get('text'):
                    return part.get('text')
                if isinstance(part, str):
                    return part

    for key in ('output', 'outputs', 'choices'):
        out = json_obj.get(key)
        if not out:
            continue
        if isinstance(out, list) and len(out) > 0:
            first = out[0]
            if isinstance(first, dict):
                content = first.get('content') or first.get('message') or first
                if isinstance(content, dict):
                    parts = content.get('parts') or content.get('text')
                    if isinstance(parts, list) and len(parts) > 0:
                        p = parts[0]
                        if isinstance(p, dict) and p.get('text'):
                            return p.get('text')
                        if isinstance(p, str):
                            return p
                elif isinstance(content, str):
                    return content
                if first.get('text'):
                    return first.get('text')

    for fld in ('response', 'generated_text', 'text'):
        v = json_obj.get(fld)
        if isinstance(v, str) and v.strip():
            return v

    return None

def collect_and_publish():
    try:
        response = requests.get(OPEN_METEO_URL, timeout=10)
        response.raise_for_status()
        data = response.json()

        current_weather = data.get('current_weather', {})
        
        weather_payload = {
            'timestamp': datetime.now().isoformat(),
            'latitude': float(LATITUDE),
            'longitude': float(LONGITUDE),
            'temperature': current_weather.get('temperature', 0.0),
            'wind_speed': current_weather.get('windspeed', 0.0),
            'weather_code': current_weather.get('weathercode', 0),
        }

        if GEMINI_API_KEY:
            try:
                system_prompt = (
                    "Você é um analista climático conciso. Dada temperatura em °C "
                    "e velocidade do vento em km/h, forneça um insight em uma frase."
                )
                user_query = (
                    f"Temperatura: {weather_payload['temperature']}°C, "
                    f"Vento: {weather_payload['wind_speed']} km/h. Insight."
                )

                gemini_payload = {
                    'contents': [
                        {'parts': [{'text': user_query}]}
                    ],
                    'systemInstruction': {'parts': [{'text': system_prompt}]}
                }

                headers = {"Content-Type": "application/json"}
                if GEMINI_API_KEY:
                    headers["Authorization"] = f"Bearer {GEMINI_API_KEY}"

                resp = requests.post(GEMINI_API_URL, json=gemini_payload, timeout=10, headers=headers)
                resp.raise_for_status()
                resp_json = resp.json()

                insight_text = _extract_text_from_gemini(resp_json)
                if insight_text:
                    weather_payload['insight'] = insight_text
                else:
                    print(f"Aviso: não foi possível extrair insight. Resposta: {resp_json}")
            except Exception as e:
                print(f"Aviso: falha ao gerar insight: {e}")

        r.lpush(REDIS_CHANNEL, json.dumps(weather_payload))
        print(f"[{weather_payload['timestamp']}] Dados enviados. Temp: {weather_payload['temperature']}°C")

    except requests.exceptions.RequestException as e:
        print(f"Erro ao coletar dados: {e}")
    except Exception as e:
        print(f"Erro inesperado: {e}")

if __name__ == "__main__":
    print(f"Iniciando coletor. Coords: Lat={LATITUDE}, Lon={LONGITUDE}")
    while True:
        collect_and_publish()
        time.sleep(COLLECTION_INTERVAL_SECONDS)
