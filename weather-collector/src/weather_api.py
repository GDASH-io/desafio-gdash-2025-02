import requests
from datetime import datetime
from config import LATITUDE, LONGITUDE, CITY_NAME, OPEN_METEO_URL


class WeatherAPI:
    def __init__(self):
        self.api_url = OPEN_METEO_URL
        self.latitude = LATITUDE
        self.longitude = LONGITUDE
        self.city = CITY_NAME
    
    def fetch_weather(self):
        try:
            params = {
                'latitude': self.latitude,
                'longitude': self.longitude,
                'current': [
                    'temperature_2m',           
                    'relative_humidity_2m',     
                    'wind_speed_10m',           
                    'weather_code',             
                    'precipitation'             
                ]
            }
            
            print(f"Buscando dados meteorológicos para {self.city}...")
            
            response = requests.get(self.api_url, params=params, timeout=10)
            response.raise_for_status()  
            
            data = response.json()
            
            return self._normalize_data(data)
            
        except requests.exceptions.RequestException as e:
            print(f"Erro ao buscar dados da API: {e}")
            return None
        except Exception as e:
            print(f"Erro inesperado: {e}")
            return None
    
    def _normalize_data(self, api_data):
        current = api_data.get('current', {})
        
        weather_conditions = {
            0: 'Céu limpo',
            1: 'Principalmente limpo',
            2: 'Parcialmente nublado',
            3: 'Nublado',
            45: 'Neblina',
            48: 'Neblina com geada',
            51: 'Garoa leve',
            53: 'Garoa moderada',
            55: 'Garoa forte',
            61: 'Chuva leve',
            63: 'Chuva moderada',
            65: 'Chuva forte',
            71: 'Neve leve',
            73: 'Neve moderada',
            75: 'Neve forte',
            95: 'Tempestade'
        }
        
        weather_code = current.get('weather_code', 0)
        condition = weather_conditions.get(weather_code, 'Desconhecido')
        
        precipitation = current.get('precipitation', 0)
        rain_probability = min(100, int(precipitation * 20)) if precipitation else 0
        
        normalized = {
            'temperature': current.get('temperature_2m'),
            'temperature_unit': '°C',
            'humidity': current.get('relative_humidity_2m'),
            'humidity_unit': '%',
            'wind_speed': current.get('wind_speed_10m'),
            'wind_speed_unit': 'km/h',
            'condition': condition,
            'weather_code': weather_code,
            'precipitation': precipitation,
            'precipitation_unit': 'mm',
            'rain_probability': rain_probability
        }
        
        print(f"Dados coletados: {normalized['temperature']}°C, {condition}")
        print(f"DEBUG - Dados normalizados: {normalized}")
        
        return normalized