import os
import time
import json
from datetime import datetime, timezone, timedelta
import requests
import pika
from dateutil import parser as dt_parser

RABBIT_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
# Sanitiza coordenadas substituindo vírgula por ponto caso venham com formato local
LAT = os.getenv("WEATHER_API_LAT", "-7.2306").replace(',', '.')
LON = os.getenv("WEATHER_API_LON", "-35.8811").replace(',', '.')
FETCH_INTERVAL = int(os.getenv("FETCH_INTERVAL_SECONDS", "3600"))  # padrão 1h
QUEUE_NAME = os.getenv("WEATHER_QUEUE", "weather.raw")

HOURLY_VARS = "temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation,precipitation_probability,cloudcover,weather_code"

def build_url():
    base = "https://api.open-meteo.com/v1/forecast"
    params = (
        f"latitude={LAT}&longitude={LON}&hourly={HOURLY_VARS}"
        "&timezone=UTC&windspeed_unit=kmh&precipitation_unit=mm&timeformat=iso8601"
    )
    return f"{base}?{params}"

def connect_rabbit():
    params = pika.URLParameters(RABBIT_URL)
    connection = pika.BlockingConnection(params)
    channel = connection.channel()
    channel.queue_declare(queue=QUEUE_NAME, durable=True)
    return connection, channel

def fetch_data():
    url = build_url()
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    return resp.json()

def map_messages(api_json):
    hourly = api_json.get("hourly", {})
    times = hourly.get("time", [])
    fetched_at = datetime.now(timezone.utc).isoformat()

    api_units = api_json.get("hourly_units", {})
    units_template = {
        "temperature2m": api_units.get("temperature_2m", "°C"),
        "windSpeed10m": api_units.get("wind_speed_10m", "km/h"),
        "pressureMsl": api_units.get("pressure_msl", "hPa"),
        "precipitation": api_units.get("precipitation", "mm"),
        "cloudcover": api_units.get("cloudcover", "%"),
        "relativeHumidity2m": api_units.get("relative_humidity_2m", "%")
    }

    def arr(name):
        return hourly.get(name, [])

    # Hora atual em UTC exatamente no formato da API (YYYY-MM-DDTHH:00)
    current_hour_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:00")
    print('-------------',current_hour_str, flush=True)
    try:
        i = times.index(current_hour_str)
    except ValueError:
        # Depuração: mostrar janela disponível
        preview = {
            "now": current_hour_str,
            "first": times[0] if times else None,
            "last": times[-1] if times else None,
            "count": len(times),
        }
        print(f"[collector][debug] Hora atual não encontrada em hourly.time: {preview}", flush=True)
        return []

    ts = current_hour_str
    selected = {
        "timestamp": ts,
        "location": {"latitude": float(LAT), "longitude": float(LON)},
        "temperature2m": arr("temperature_2m")[i] if i < len(arr("temperature_2m")) else None,
        "relativeHumidity2m": arr("relative_humidity_2m")[i] if i < len(arr("relative_humidity_2m")) else None,
        "pressureMsl": arr("pressure_msl")[i] if i < len(arr("pressure_msl")) else None,
        "windSpeed10m": arr("wind_speed_10m")[i] if i < len(arr("wind_speed_10m")) else None,
        "windDirection10m": arr("wind_direction_10m")[i] if i < len(arr("wind_direction_10m")) else None,
        "windGusts10m": arr("wind_gusts_10m")[i] if i < len(arr("wind_gusts_10m")) else None,
        "precipitation": arr("precipitation")[i] if i < len(arr("precipitation")) else None,
        "precipitationProbability": arr("precipitation_probability")[i] if i < len(arr("precipitation_probability")) else None,
        "cloudcover": arr("cloudcover")[i] if i < len(arr("cloudcover")) else None,
        "weatherCode": arr("weather_code")[i] if i < len(arr("weather_code")) else None,
        "units": units_template,
        "fetchedAt": fetched_at,
        "source": "open-meteo"
    }
    return [selected]

def publish_messages(channel, messages):
    for m in messages:
        body = json.dumps(m)
        channel.basic_publish(
            exchange="",
            routing_key=QUEUE_NAME,
            body=body,
            properties=pika.BasicProperties(content_type="application/json", delivery_mode=2)
        )

def run_once():
    print("[collector] Fetching Open-Meteo...",flush=True)
    data = fetch_data()
    msgs = map_messages(data)
    print(f"[collector] Selected {len(msgs)} record(s) for current hour", flush=True)
    connection, channel = connect_rabbit()
    try:
        publish_messages(channel, msgs)
        print(f"[collector] Published {len(msgs)} messages to '{QUEUE_NAME}'", flush=True)
    finally:
        connection.close()

def main():
    print(f"[collector] Starting loop (lat={LAT} lon={LON})", flush=True)
    while True:
        try:
            run_once()
        except Exception as e:
            print(f"[collector] Error: {e}")
        print(f"[collector] Sleeping {FETCH_INTERVAL} seconds")
        time.sleep(FETCH_INTERVAL)

if __name__ == "__main__":
    main()