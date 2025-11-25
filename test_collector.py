import os
import asyncio
import httpx
from datetime import datetime, timezone
import json

async def test_weather_fetch():
    """Testa buscar dados climáticos"""
    lat = os.getenv("COLLECTOR_LAT", "-21.42")
    lon = os.getenv("COLLECTOR_LON", "-50.08")
    city = os.getenv("COLLECTOR_CITY", "Penápolis")
    
    url = f"https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": ["temperature_2m", "relativehumidity_2m", "windspeed_10m"],
        "current_weather": True,
    }
    
    print(f"🌍 Buscando dados de {city} ({lat}, {lon})...")
    
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        payload = response.json()
        
        message = {
            "city": city,
            "ts": datetime.now(timezone.utc).isoformat(),
            "temperature": payload["current_weather"]["temperature"],
            "windspeed": payload["current_weather"]["windspeed"],
            "humidity": payload["hourly"]["relativehumidity_2m"][0],
        }
        
        print(f"✅ Dados obtidos com sucesso!")
        print(json.dumps(message, indent=2))
        return message

if __name__ == "__main__":
    asyncio.run(test_weather_fetch())

