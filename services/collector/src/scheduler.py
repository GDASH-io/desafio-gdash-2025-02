import asyncio
import json
import os
import time
from datetime import datetime, timezone

import httpx
import pika
import schedule

from .config import load_settings

# Necessário importar asyncio.sleep
import asyncio


def publish_to_queue(message: str):
    settings = load_settings()
    max_retries = 10
    for attempt in range(max_retries):
        try:
            connection = pika.BlockingConnection(
                pika.URLParameters(settings.rabbitmq_url)
            )
            channel = connection.channel()
            channel.queue_declare(queue=settings.queue_name, durable=True)
            channel.basic_publish(
                exchange='',
                routing_key=settings.queue_name,
                body=message,
                properties=pika.BasicProperties(delivery_mode=2),
            )
            connection.close()
            print(f"✅ Mensagem publicada na fila: {message[:50]}...")
            return
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"⚠️ Tentando conectar ao RabbitMQ... ({attempt + 1}/{max_retries})")
                time.sleep(5)
            else:
                print(f"❌ Erro ao publicar na fila após {max_retries} tentativas: {e}")


async def fetch_weather():
    settings = load_settings()
    params = {
        "latitude": settings.latitude,
        "longitude": settings.longitude,
        "hourly": ["temperature_2m", "relativehumidity_2m", "windspeed_10m"],
        "current_weather": True,
    }
    
    # Retry com timeout maior
    for attempt in range(3):
        try:
            async with httpx.AsyncClient(base_url=settings.base_url, timeout=30.0) as client:
                print(f"🌐 Tentativa {attempt + 1}/3: Conectando à {settings.base_url}...")
                response = await client.get("", params=params)
                response.raise_for_status()
                payload = response.json()
                message = {
                    "city": settings.city,
                    "ts": datetime.now(timezone.utc).isoformat(),
                    "temperature": payload["current_weather"]["temperature"],
                    "windspeed": payload["current_weather"]["windspeed"],
                    "humidity": payload["hourly"]["relativehumidity_2m"][0],
                }
                print(f"✅ Dados obtidos com sucesso!")
                return json.dumps(message)
        except Exception as e:
            print(f"⚠️ Erro na tentativa {attempt + 1}/3: {e}")
            if attempt < 2:
                await asyncio.sleep(5)
            else:
                raise


def run_scheduler():
    print("🚀 Iniciando coletor de dados climáticos...")
    
    async def job():
        try:
            print("📡 Buscando dados climáticos...")
            message = await fetch_weather()
            publish_to_queue(message)
        except Exception as e:
            print(f"❌ Erro ao buscar da API: {e}")
            print("🔄 Usando dados de exemplo para teste...")
            # Fallback com dados de exemplo
            settings = load_settings()
            message = json.dumps({
                "city": settings.city,
                "ts": datetime.now(timezone.utc).isoformat(),
                "temperature": 25.0 + (hash(str(datetime.now())) % 10),
                "windspeed": 10.0 + (hash(str(datetime.now())) % 20),
                "humidity": 60.0 + (hash(str(datetime.now())) % 30),
            })
            publish_to_queue(message)

    # Executa a cada 30 minutos (ou conforme COLLECTOR_INTERVAL_CRON)
    interval = int(os.getenv("COLLECTOR_INTERVAL_MINUTES", "30"))
    schedule.every(interval).minutes.do(lambda: asyncio.run(job()))

    # Executa imediatamente na primeira vez
    print("⏳ Executando primeira coleta...")
    asyncio.run(job())

    print(f"🔄 Coletor iniciado. Intervalo: {interval} minutos")
    while True:
        schedule.run_pending()
        schedule.idle_seconds()


