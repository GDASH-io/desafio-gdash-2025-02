import requests
from datetime import datetime
from typing import Dict, Optional
from config import Config

class WeatherClient:
    def __init__(self):
        self.api_url = Config.WEATHER_API_URL
        self.latitude = Config.LATITUDE
        self.longitude = Config.LONGITUDE
    
    def fetch_weather_data(self) -> Optional[Dict]:
        """
        Busca dados climáticos da API Open-Meteo
        """
        try:
            params = {
                "latitude": self.latitude,
                "longitude": self.longitude,
                "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
                "hourly": "precipitation_probability",
                "timezone": "America/Sao_Paulo"
            }
            
            response = requests.get(self.api_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            return self._normalize_data(data)
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Error fetching weather data: {e}")
            return None
    
    def _normalize_data(self, raw_data: Dict) -> Dict:
        """
        Normaliza dados da API para formato padrão
        """
        current = raw_data.get("current", {})
        hourly = raw_data.get("hourly", {})
        
        # Pega a probabilidade de precipitação da próxima hora
        precipitation_prob = 0
        if hourly.get("precipitation_probability"):
            precipitation_prob = hourly["precipitation_probability"][0]
        
        normalized = {
            "timestamp": datetime.utcnow().isoformat(),
            "location": {
                "latitude": float(self.latitude),
                "longitude": float(self.longitude),
                "city": "Taubaté",
                "state": "São Paulo",
                "country": "Brazil"
            },
            "data": {
                "temperature": current.get("temperature_2m"),
                "humidity": current.get("relative_humidity_2m"),
                "wind_speed": current.get("wind_speed_10m"),
                "weather_code": current.get("weather_code"),
                "weather_condition": self._get_weather_condition(current.get("weather_code", 0)),
                "precipitation_probability": precipitation_prob
            },
            "source": "open-meteo",
            "version": "1.0"
        }
        
        return normalized
    
    def _get_weather_condition(self, code: int) -> str:
        """
        Converte código WMO para descrição textual
        https://open-meteo.com/en/docs
        """
        conditions = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Foggy",
            48: "Depositing rime fog",
            51: "Light drizzle",
            53: "Moderate drizzle",
            55: "Dense drizzle",
            61: "Slight rain",
            63: "Moderate rain",
            65: "Heavy rain",
            71: "Slight snow",
            73: "Moderate snow",
            75: "Heavy snow",
            77: "Snow grains",
            80: "Slight rain showers",
            81: "Moderate rain showers",
            82: "Violent rain showers",
            85: "Slight snow showers",
            86: "Heavy snow showers",
            95: "Thunderstorm",
            96: "Thunderstorm with slight hail",
            99: "Thunderstorm with heavy hail"
        }
        return conditions.get(code, "Unknown")