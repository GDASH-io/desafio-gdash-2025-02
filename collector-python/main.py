import os
import time
import json
import random
import logging
import requests
import pika
import schedule
import google.generativeai as genai
from datetime import datetime
from typing import Optional, Dict, Any


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - [%(funcName)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

LAT = "-21.76"
LON = "-43.35"
WEATHER_API_PARAMS = (
    "current=temperature_2m,relative_humidity_2m,apparent_temperature,"
    "precipitation,wind_speed_10m,is_day,weathercode"
    "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum"
    "&timezone=America%2FSao_Paulo"
)
WEATHER_API_URL = f"https://api.open-meteo.com/v1/forecast?latitude={LAT}&longitude={LON}&{WEATHER_API_PARAMS}"

RABBIT_HOST = os.getenv('RABBIT_HOST', 'localhost')
RABBIT_QUEUE = 'weather_data'
RABBIT_CREDENTIALS = pika.PlainCredentials('admin', 'password123')

GEMINI_KEY = os.getenv('GEMINI_API_KEY', '')

active_model = None
memory = {"last_insight": ""}

def setup_dynamic_model() -> Optional[genai.GenerativeModel]:
    if not GEMINI_KEY:
        logger.warning("Gemini API Key not found. Falling back to rule-based logic.")
        return None

    try:
        genai.configure(api_key=GEMINI_KEY)
        
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            model.generate_content("ping") 
            logger.info("✅ AI Model initialized: gemini-1.5-flash")
            return model
        except Exception:
            logger.warning("Gemini Flash not available, searching for alternatives...")

        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                if 'flash' in m.name:
                    logger.info(f"✅ Alternative AI Model found: {m.name}")
                    return genai.GenerativeModel(m.name)
        
        for m in genai.list_models():
             if 'generateContent' in m.supported_generation_methods:
                logger.info(f"✅ Fallback AI Model found: {m.name}")
                return genai.GenerativeModel(m.name)

        logger.error("❌ No compatible AI models found.")
        return None
    except Exception as e:
        logger.error(f"❌ Fatal error initializing AI: {e}")
        return None

active_model = setup_dynamic_model()


def generate_fallback_insight(current: Dict[str, Any]) -> str:
    """Backup logic in case AI fails."""
    temp = current.get('temperature_2m', 0)
    rain = current.get('precipitation', 0)
    wind = current.get('wind_speed_10m', 0)
    humid = current.get('relative_humidity_2m', 0)

    if rain > 0:
        return f"🌧️ Chuva registrada ({rain}mm). Atenção redobrada nas pistas."
    if temp > 30:
        return f"🔥 Calor intenso ({temp}°C). Mantenha-se hidratado."
    if temp < 15:
        return f"❄️ Frio de {temp}°C. Recomendado agasalho pesado."
    if wind > 20:
        return f"💨 Vento forte ({wind}km/h). Cuidado com janelas abertas."
    if humid < 30:
        return f"🌵 Ar muito seco ({humid}%). Beba bastante água."
    
    return f"✅ Clima estável com {temp}°C. Condições agradáveis."

def generate_ai_insight(current: Dict[str, Any], daily: Dict[str, Any]) -> str:
    global active_model
    
    if not active_model:
        active_model = setup_dynamic_model()
        if not active_model:
            return generate_fallback_insight(current)

    try:
        context = {
            "temp_atual": f"{current.get('temperature_2m')}°C",
            "sensacao_termica": f"{current.get('apparent_temperature')}°C",
            "umidade": f"{current.get('relative_humidity_2m')}%",
            "vento": f"{current.get('wind_speed_10m')}km/h",
            "chuva": f"{current.get('precipitation')}mm",
            "periodo": "Dia" if current.get('is_day') else "Noite",
            "maxima_hoje": f"{daily.get('temperature_2m_max', [0])[0]}°C",
            "minima_hoje": f"{daily.get('temperature_2m_min', [0])[0]}°C"
        }

        prompt = (
            f"Atue como um Meteorologista Sênior. Dados: {context}. "
            "Crie um insight criativo e útil sobre o clima agora. "
            "REGRAS OBRIGATÓRIAS: "
            "1. PROIBIDO apenas saudar (ex: 'Boa noite', 'Boa tarde'). "
            "2. Você DEVE citar um dado específico (sensação, vento ou umidade) para justificar o conselho. "
            "3. Se houver chuva, foque na segurança. "
            "4. Use tom profissional mas próximo. Máximo 18 palavras. Comece com 1 emoji. "
            f"5. Evite repetir esta frase anterior: '{memory['last_insight']}'"
        )

        response = active_model.generate_content(prompt)
        
        if response.text:
            clean_text = response.text.strip().replace('"', '').replace('\n', '')
            if len(clean_text) < 10: 
                return generate_fallback_insight(current)
                
            memory["last_insight"] = clean_text
            return clean_text
        
        return generate_fallback_insight(current)

    except Exception as e:
        logger.error(f"⚠️ AI Generation Error: {e}. Using backup.")
        return generate_fallback_insight(current)

def get_weather() -> Optional[Dict[str, Any]]:
    try:
        response = requests.get(WEATHER_API_URL, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        current = data.get('current', {})
        daily = data.get('daily', {})
        
        insight_text = generate_ai_insight(current, daily)

        payload = {
            "latitude": LAT,
            "longitude": LON,
            "temp": current.get('temperature_2m'),
            "humidity": current.get('relative_humidity_2m'),
            "wind_speed": current.get('wind_speed_10m'),
            "precipitation": current.get('precipitation'),
            "is_day": current.get('is_day'),
            "insight": insight_text,
            "collected_at": datetime.now().isoformat()
        }
        return payload
    except Exception as e:
        logger.error(f"Failed to fetch weather data: {e}")
        return None

def send_to_queue(data: Dict[str, Any]):
    if not data:
        return

    connection = None
    try:
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=RABBIT_HOST, credentials=RABBIT_CREDENTIALS)
        )
        channel = connection.channel()
        channel.queue_declare(queue=RABBIT_QUEUE, durable=True)
        
        message = json.dumps(data)
        channel.basic_publish(
            exchange='',
            routing_key=RABBIT_QUEUE,
            body=message
        )
        
        source = "🤖 AI" if active_model else "💾 Backup"
        logger.info(f"[{source}] {data['insight']}")

    except Exception as e:
        logger.error(f"RabbitMQ Error: {e}")
    finally:
        if connection and not connection.is_closed:
            connection.close()

def job():
    data = get_weather()
    send_to_queue(data)

if __name__ == "__main__":
    logger.info(f"🚀 Smart Weather Collector Started! Target: {RABBIT_HOST}")
    job()
    schedule.every(20).seconds.do(job)
    while True:
        schedule.run_pending()
        time.sleep(1)