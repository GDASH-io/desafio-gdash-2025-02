import requests
from django.conf import settings
from django.utils import timezone

from ..models import WeatherLog


def fetch_current_weather():
    cfg = settings.OPENWEATHER_CONFIG

    params = {
        "lat": cfg["lat"],
        "lon": cfg["lon"],
        "appid": cfg["api_key"],
        "units": cfg["units"],
        "lang": cfg["lang"],
    }

    resp = requests.get(cfg["base_url"], params=params, timeout=10)
    resp.raise_for_status()

    data = resp.json()

    # Normaliza os campos importantes
    payload = {
        "timestamp": timezone.now(),
        "city": data.get("name") or "Desconhecida",
        "temperature": data["main"]["temp"],
        "humidity": data["main"]["humidity"],
        "pressure": data["main"]["pressure"],
        "wind_speed": data["wind"]["speed"],
        "condition": data["weather"][0]["description"],
        "raw": data,
    }
    return payload


def store_current_weather():
    """
    Busca o clima atual na API externa e salva no banco.
    Pode ser chamada direto ou via Celery.
    """
    payload = fetch_current_weather()
    return WeatherLog.objects.create(**payload)
