import requests
from datetime import datetime
from zoneinfo import ZoneInfo
from unidecode import unidecode
from .const import (
    WEATHER_CODES,
    REQUEST_TIMEOUT,
    DEFAULT_TIMEZONE,
    CITY,
    GEOCODING_API_URL,
    WEATHER_API_URL,
)

def get_city_coordinates():
    city_normalized = unidecode(CITY)
    url = f"{GEOCODING_API_URL}?name={city_normalized}&count=1&language=pt"
        
    response = requests.get(url, timeout=REQUEST_TIMEOUT)
    response.raise_for_status()
    data = response.json()
    
    if not data.get("results"):
        raise Exception(f"City not found: {CITY}")

    result = data["results"][0]
    return {
        "city": result.get("name", CITY),
        "lat": result["latitude"],
        "lon": result["longitude"]
    }


def get_weather(lat, lon):
    url = (
        f"{WEATHER_API_URL}"
        f"?latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code"
        f"&daily=precipitation_probability_max"
        f"&timezone={DEFAULT_TIMEZONE}"
    )
    
    response = requests.get(url, timeout=REQUEST_TIMEOUT)
    response.raise_for_status()
    data = response.json()

    current = data["current"]
    daily = data["daily"]
    
    weather_code = current.get("weather_code", 0)
    weather_description = WEATHER_CODES.get(weather_code, "unknown")

    now_br = datetime.now(ZoneInfo(DEFAULT_TIMEZONE))
    
    wind_speed_kmh = current["wind_speed_10m"] * 3.6
    
    return {
        "temperature": round(current["temperature_2m"], 1),
        "humidity": current["relative_humidity_2m"],
        "wind_speed": round(wind_speed_kmh, 1),
        "weather_description": weather_description,
        "rain_probability": daily["precipitation_probability_max"][0] if daily.get("precipitation_probability_max") else 0,
        "fetched_at": now_br.strftime("%d/%m/%Y %H:%M:%S"),
        "fetched_at_iso": now_br.isoformat(),
    }

