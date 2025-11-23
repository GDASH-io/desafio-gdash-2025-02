import requests
from datetime import datetime
from typing import Dict, Optional
from config import Config


class WeatherAPIClient:
    def __init__(self):
        self.base_url = Config.WEATHER_API_URL
        self.timeout = 10
    
    def fetch_current_weather(self) -> Optional[Dict]:
        try:
            params = {
                'latitude': Config.LOCATION_LATITUDE,
                'longitude': Config.LOCATION_LONGITUDE,
                'current': [
                    'temperature_2m',
                    'relative_humidity_2m',
                    'apparent_temperature',
                    'precipitation',
                    'rain',
                    'weather_code',
                    'cloud_cover',
                    'pressure_msl',
                    'surface_pressure',
                    'wind_speed_10m',
                    'wind_direction_10m',
                ],
                'timezone': 'auto',
                'forecast_days': 1,
            }
            
            print(f"Buscando dados de {Config.LOCATION_CITY}...")
            
            response = requests.get(
                self.base_url,
                params=params,
                timeout=self.timeout
            )
            response.raise_for_status()
            
            data = response.json()
            normalized_data = self._normalize_response(data)
            
            temp = normalized_data['current']['temperature']
            hum = normalized_data['current']['humidity']
            print(f"Dados coletados: {temp}°C, {hum}% umidade")
            
            return normalized_data
            
        except requests.exceptions.Timeout:
            print("Erro: Timeout ao conectar com a API Open-Meteo")
            return None
        except requests.exceptions.RequestException as e:
            print(f"Erro ao buscar dados climáticos: {e}")
            return None
        except Exception as e:
            print(f"Erro inesperado: {e}")
            return None
    
    def _normalize_response(self, raw_data: Dict) -> Dict:
        current = raw_data.get('current', {})

        weather_code = current.get('weather_code', 0)
        condition = self._map_weather_code(weather_code)
        
        # Validar campos obrigatórios
        temperature = current.get('temperature_2m')
        if temperature is None:
            raise ValueError("API não retornou temperatura")
        
        return {
            'timestamp': current.get('time', datetime.utcnow().isoformat()),
            'location': {
                'city': Config.LOCATION_CITY,
                'state': Config.LOCATION_STATE,
                'country': Config.LOCATION_COUNTRY,
                'latitude': Config.LOCATION_LATITUDE,
                'longitude': Config.LOCATION_LONGITUDE,
            },
            'current': {
                'temperature': current.get('temperature_2m'),
                'feels_like': current.get('apparent_temperature'),
                'humidity': current.get('relative_humidity_2m'),
                'wind_speed': current.get('wind_speed_10m'),
                'wind_direction': current.get('wind_direction_10m'),
                'pressure': current.get('pressure_msl'),
                'uv_index': 0,
                'visibility': 10000,
                'condition': condition,
                'rain_probability': self._calculate_rain_probability(current),
                'cloud_cover': current.get('cloud_cover', 0),
            },
            'metadata': {
                'source': 'open-meteo',
                'collector_version': Config.COLLECTOR_VERSION,
            }
        }
    
    def _map_weather_code(self, code: int) -> str:
        weather_map = {
            0: 'clear',
            1: 'partly_cloudy',
            2: 'partly_cloudy',
            3: 'cloudy',
            45: 'foggy',
            48: 'foggy',
            51: 'rainy',
            53: 'rainy',
            55: 'rainy',
            61: 'rainy',
            63: 'rainy',
            65: 'heavy_rain',
            71: 'snowy',
            73: 'snowy',
            75: 'snowy',
            77: 'snowy',
            80: 'rainy',
            81: 'rainy',
            82: 'heavy_rain',
            85: 'snowy',
            86: 'snowy',
            95: 'thunderstorm',
            96: 'thunderstorm',
            99: 'thunderstorm',
        }
        
        return weather_map.get(code, 'partly_cloudy')
    
    def _calculate_rain_probability(self, current_data: Dict) -> int:
        rain = current_data.get('rain', 0)
        precipitation = current_data.get('precipitation', 0)
        cloud_cover = current_data.get('cloud_cover', 0)
        
        if rain > 0 or precipitation > 0:
            return 80
        elif cloud_cover > 70:
            return 40
        elif cloud_cover > 40:
            return 20
        else:
            return 5