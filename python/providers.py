import requests
from datetime import datetime, timezone
from typing import Any, Dict, Optional, Protocol


class WeatherProvider(Protocol):
    name: str

    def fetch(self, latitude: float, longitude: float) -> Dict[str, Any]:
        ...


class OpenMeteoProvider:
    name = "open-meteo"

    def fetch(self, latitude: float, longitude: float) -> Dict[str, Any]:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current_weather": True,
            "hourly": "relativehumidity_2m",
            "timezone": "UTC",
        }
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        current = data.get("current_weather", {})
        humidity = self._extract_humidity(current, data.get("hourly", {}))
        condition = self._translate_weathercode(current.get("weathercode"))

        return {
            "source": self.name,
            "collected_at": datetime.now(timezone.utc).isoformat(),
            "temperature_c": current.get("temperature"),
            "humidity_percent": humidity,
            "wind_speed_kmh": current.get("windspeed"),
            "condition": condition,
            "raw": current,
        }

    @staticmethod
    def _extract_humidity(current: Dict[str, Any], hourly: Dict[str, Any]) -> Optional[float]:
        if not hourly:
            return None

        timestamps = hourly.get("time", [])
        humidity_values = hourly.get("relativehumidity_2m", [])
        try:
            index = timestamps.index(current.get("time"))
            return humidity_values[index]
        except ValueError:
            return humidity_values[0] if humidity_values else None

    @staticmethod
    def _translate_weathercode(code: Any) -> str:
        mapping = {
            0: "ceu limpo",
            1: "principalmente limpo",
            2: "parcialmente nublado",
            3: "nublado",
            45: "neblina",
            48: "neblina umida",
            51: "chuvisco leve",
            53: "chuvisco moderado",
            55: "chuvisco forte",
            61: "chuva fraca",
            63: "chuva moderada",
            65: "chuva forte",
            71: "neve fraca",
            73: "neve moderada",
            75: "neve forte",
            80: "chuva isolada",
            81: "chuva frequente",
            82: "chuva intensa",
        }
        return mapping.get(code, "nao definido")


class OpenWeatherProvider:
    name = "openweather"

    def __init__(self, api_key: str):
        if not api_key:
            raise RuntimeError("OPENWEATHER_API_KEY is required for provider openweather")
        self.api_key = api_key

    def fetch(self, latitude: float, longitude: float) -> Dict[str, Any]:
        url = "https://api.openweathermap.org/data/2.5/weather"
        params = {
            "lat": latitude,
            "lon": longitude,
            "appid": self.api_key,
            "units": "metric",
        }
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        weather = data.get("weather", [])
        main = data.get("main", {})
        wind = data.get("wind", {})
        condition = weather[0]["description"] if weather else "desconhecido"

        return {
            "source": self.name,
            "collected_at": datetime.now(timezone.utc).isoformat(),
            "temperature_c": main.get("temp"),
            "humidity_percent": main.get("humidity"),
            "wind_speed_kmh": wind.get("speed"),
            "condition": condition,
            "raw": {"weather": weather, "main": main, "wind": wind},
        }


def build_provider(name: str, api_key: Optional[str]) -> WeatherProvider:
    if name == "openweather":
        return OpenWeatherProvider(api_key or "")
    return OpenMeteoProvider()