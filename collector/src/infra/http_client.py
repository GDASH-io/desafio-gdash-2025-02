import requests
from src.config import Config
from src.domain.weather import WeatherData

class WeatherClient:
    def fetch_data(self) -> WeatherData:
        """Busca dados na API Open-Meteo e retorna um objeto WeatherData"""
        try:
            params = {
                "latitude": Config.LATITUDE,
                "longitude": Config.LONGITUDE,
                "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code"
            }
            
            # Faz a chamada HTTP
            response = requests.get(Config.API_URL, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()['current']
            
            # Retorna nossa Entidade de Domínio limpa
            return WeatherData(
                location_lat=float(Config.LATITUDE),
                location_lon=float(Config.LONGITUDE),
                temperature=data['temperature_2m'],
                humidity=data['relative_humidity_2m'],
                wind_speed=data['wind_speed_10m'],
                condition_code=data['weather_code']
            )
        except Exception as e:
            print(f"[Erro HTTP] Falha ao buscar clima: {e}")
            return None