import requests
import logging
from queue_service import send_to_queue


logging.basicConfig(level=logging.INFO)

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

def coletar_clima(lat=-7.06, lon=-34.88):  
    try:
        params = {
            "latitude": lat,
            "longitude": lon,
            "current_weather": True
        }

        response = requests.get(OPEN_METEO_URL, params=params)
        response.raise_for_status()

        data = response.json()

        logging.info(f"[Python] Dados coletados: {data}")

        return {
            "temperature": data["current_weather"]["temperature"],
            "windspeed": data["current_weather"]["windspeed"],
            "time": data["current_weather"]["time"],
            "lat": lat,
            "lon": lon
        }

    except Exception as e:
        logging.error(f"Erro ao coletar dados de clima: {e}")
        return None


if __name__ == "__main__":
    clima = coletar_clima()

    if clima:
        send_to_queue("weather_queue", clima)
