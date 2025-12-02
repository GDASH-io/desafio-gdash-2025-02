import requests
import config

def fetch_weather():
    # Combina current_weather com hourly para obter umidade e precipitação da hora atual
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={config.LATITUDE}&longitude={config.LONGITUDE}"
        f"&current_weather=true"
        f"&hourly=relative_humidity_2m,precipitation"
        f"&timezone={config.TIMEZONE}"
    )
    resp = requests.get(url, timeout=15)
    data = resp.json()

    current = data.get("current_weather", {})
    hourly = data.get("hourly", {})

    # Descobrir índice correspondente à hora atual
    current_time = current.get("time")
    times = hourly.get("time", [])
    try:
        idx = times.index(current_time)
    except ValueError:
        idx = -1  # fallback: último valor

    humidity = None
    precipitation = None
    if idx != -1:
        humidity = hourly.get("relative_humidity_2m", [None])[idx]
        precipitation = hourly.get("precipitation", [None])[idx]

    # Normalização do JSON de saída
    return {
        "temperature": current.get("temperature"),
        "humidity": humidity,
        "wind_speed": current.get("windspeed"),
        "condition": current.get("weathercode"),  # código numérico
        "rain_probability": precipitation,         # aqui é precipitação (mm), pode ser usada como proxy
        "timestamp": current_time
    }
