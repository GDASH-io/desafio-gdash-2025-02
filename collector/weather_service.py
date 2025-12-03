import requests
from datetime import datetime
from utils import find_closest_humidity

def fetch_weather(lat, lon):
    api_url = (
        f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
        "&current_weather=true"
    )

    response = requests.get(
        api_url,
        params={
            "hourly": "relative_humidity_2m",
            "timezone": "America/Sao_Paulo"
        }
    ).json()

    current_time = response["current_weather"]["time"]

    try:
        humidity = find_closest_humidity(response, current_time)
    except ValueError:
        humidity = None

    return {
        "temperatureC": response["current_weather"]["temperature"],
        "windSpeedMs": response["current_weather"]["windspeed"],
        "windDirection": response["current_weather"]["winddirection"],
        "lat": lat,
        "lon": lon,
        "humidity": humidity,
        "raw": response,
        "timestamp": datetime.now().isoformat(),
    }