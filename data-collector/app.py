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
LATITUDE = os.getenv('LATITUDE', '-22.9099') # Campinas (padrão)
LONGITUDE = os.getenv('LONGITUDE', '-47.0626') # Campinas (padrão)
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
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
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

                # Prefer header auth if key provided, otherwise fall back to query param
                headers = {"Content-Type": "application/json"}
                if GEMINI_API_KEY:
                    headers["Authorization"] = f"Bearer {GEMINI_API_KEY}"

                resp = requests.post(GEMINI_API_URL, json=gemini_payload, timeout=10, headers=headers)
                resp.raise_for_status()
                resp_json = resp.json()

                # Função utilitária para extrair texto de várias estruturas possíveis de resposta
                def _extract_text_from_gemini(json_obj):
                    # 1) Formato com 'candidates' -> candidate[0].content.parts[0].text
                    candidates = json_obj.get('candidates') or json_obj.get('candidate')
                    if candidates and isinstance(candidates, list) and len(candidates) > 0:
                        first = candidates[0]
                        # caminho possível 1
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

                    # 2) Formato com 'output' / 'outputs' (ou 'choices') -> buscar texto em nested fields
                    for key in ('output', 'outputs', 'choices'):
                        out = json_obj.get(key)
                        if not out:
                            continue
                        if isinstance(out, list) and len(out) > 0:
                            first = out[0]
                            # procurar por 'content'->'text' ou 'text'
                            if isinstance(first, dict):
                                # content.parts
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
                                # fallback: top-level 'text'
                                if first.get('text'):
                                    return first.get('text')

                    # 3) Se houver um 'response' ou 'generated_text' direto
                    for fld in ('response', 'generated_text', 'text'):
                        v = json_obj.get(fld)
                        if isinstance(v, str) and v.strip():
                            return v

                    return None

                insight_text = _extract_text_from_gemini(resp_json)
                if insight_text:
                    weather_payload['insight'] = insight_text
                else:
                    print(f"Aviso: não foi possível extrair insight do Gemini. Resposta: {resp_json}")
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