import time
import requests


from config import DEFAULT_CITY, DEFAULT_LAT, DEFAULT_LON, PRODUCER_URL
from geocode import geocode
from weather_service import fetch_weather


def main():
    print("Iniciando coletor de clima...")

    city = DEFAULT_CITY
    print(f"🌎 Cidade configurada: {city}")

    lat, lon = geocode(city)

    if not lat or not lon:
        lat = DEFAULT_LAT
        lon = DEFAULT_LON
        print("Usando coordenadas padrão: São Paulo")

    while True:
        try:
            weather_data = fetch_weather(lat, lon)

            if PRODUCER_URL:
                requests.post(PRODUCER_URL, json=weather_data)

            print("📨 Dados enviados:", weather_data["raw"]["current_weather"])
            print("💧 Umidade calculada:", weather_data["humidity"])
            
        except Exception as e:
            print("Erro:", e)

        time.sleep(3600)  # 1 hora


if __name__ == "__main__":
    main()