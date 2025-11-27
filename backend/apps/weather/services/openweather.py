import requests
from django.conf import settings
from django.utils import timezone
from ..models import WeatherLog


def geocode_city(city_name: str, country_code: str = "BR"):
    cfg = settings.OPENWEATHER_CONFIG

    params = {
        "q": f"{city_name},{country_code}",
        "limit": 1,
        "appid": cfg["api_key"],
    }

    resp = requests.get(cfg["geocode_url"], params=params, timeout=10)
    resp.raise_for_status()
    data = resp.json()

    if not data:
        raise ValueError(
            f"Cidade '{city_name}' não encontrada na API de geocoding."
        )

    item = data[0]
    lat = float(item["lat"])
    lon = float(item["lon"])
    name = item.get("name") or city_name

    return lat, lon, name


def fetch_current_weather(*, lat: float | None = None, lon: float | None = None): # noqa E501
    cfg = settings.OPENWEATHER_CONFIG

    params = {
        "lat": lat if lat is not None else cfg["lat"],
        "lon": lon if lon is not None else cfg["lon"],
        "appid": cfg["api_key"],
        "units": cfg["units"],
        "lang": cfg["lang"],
    }

    resp = requests.get(cfg["base_url"], params=params, timeout=10)
    resp.raise_for_status()
    data = resp.json()

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


def store_current_weather(*, lat: float | None = None, lon: float | None = None): # noqa E501
    payload = fetch_current_weather(lat=lat, lon=lon)
    return WeatherLog.objects.create(**payload)


def store_weather_for_city(city_name: str, country_code: str = "BR"):
    lat, lon, normalized_name = geocode_city(
        city_name, country_code=country_code
    )
    payload = fetch_current_weather(lat=lat, lon=lon)
    payload["city"] = normalized_name
    return WeatherLog.objects.create(**payload)
