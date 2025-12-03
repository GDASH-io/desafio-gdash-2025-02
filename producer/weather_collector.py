import requests
import logging
from typing import Dict, Any, Optional
from config import OPEN_METEO_URL, LATITUDE, LONGITUDE

logger = logging.getLogger(__name__)


class WeatherCollector:
    def __init__(self):
        self.base_url = OPEN_METEO_URL
        self.latitude = LATITUDE
        self.longitude = LONGITUDE

    def collect_weather_data(self) -> Optional[Dict[str, Any]]:
        """
        Coleta dados climáticos da API Open-Meteo
        """
        try:
            params = {
                'latitude': self.latitude,
                'longitude': self.longitude,
                'current': 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation_probability',
                'hourly': 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,weather_code',
                'timezone': 'auto',
            }

            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()

            if 'current' not in data:
                logger.error('Resposta da API não contém dados atuais')
                return None

            current = data['current']
            location_name = self._get_location_name()

            weather_data = {
                'timestamp': current.get('time', ''),
                'location': location_name,
                'latitude': self.latitude,
                'longitude': self.longitude,
                'temperature': current.get('temperature_2m', 0),
                'humidity': current.get('relative_humidity_2m', 0),
                'windSpeed': current.get('wind_speed_10m', 0),
                'condition': self._get_weather_condition(current.get('weather_code', 0)),
                'rainProbability': current.get('precipitation_probability', 0),
                'description': self._get_weather_description(current.get('weather_code', 0)),
            }

            logger.info(f'Dados climáticos coletados: {weather_data["temperature"]}°C em {location_name}')
            return weather_data

        except requests.exceptions.RequestException as e:
            logger.error(f'Erro ao coletar dados climáticos: {e}')
            return None
        except Exception as e:
            logger.error(f'Erro inesperado ao coletar dados: {e}')
            return None

    def _get_location_name(self) -> str:
        """
        Retorna o nome da localização baseado nas coordenadas
        """
        return f'Lat {self.latitude}, Lon {self.longitude}'

    def _get_weather_condition(self, weather_code: int) -> str:
        """
        Converte código do tempo em condição legível
        """
        weather_codes = {
            0: 'Clear sky',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Foggy',
            48: 'Depositing rime fog',
            51: 'Light drizzle',
            53: 'Moderate drizzle',
            55: 'Dense drizzle',
            56: 'Light freezing drizzle',
            57: 'Dense freezing drizzle',
            61: 'Slight rain',
            63: 'Moderate rain',
            65: 'Heavy rain',
            66: 'Light freezing rain',
            67: 'Heavy freezing rain',
            71: 'Slight snow fall',
            73: 'Moderate snow fall',
            75: 'Heavy snow fall',
            77: 'Snow grains',
            80: 'Slight rain showers',
            81: 'Moderate rain showers',
            82: 'Violent rain showers',
            85: 'Slight snow showers',
            86: 'Heavy snow showers',
            95: 'Thunderstorm',
            96: 'Thunderstorm with slight hail',
            99: 'Thunderstorm with heavy hail',
        }
        return weather_codes.get(weather_code, 'Unknown')

    def _get_weather_description(self, weather_code: int) -> str:
        """
        Retorna descrição mais detalhada do tempo
        """
        descriptions = {
            0: 'Céu limpo',
            1: 'Principalmente limpo',
            2: 'Parcialmente nublado',
            3: 'Nublado',
            45: 'Nebuloso',
            48: 'Neblina com geada',
            51: 'Garoa leve',
            53: 'Garoa moderada',
            55: 'Garoa densa',
            61: 'Chuva leve',
            63: 'Chuva moderada',
            65: 'Chuva forte',
            71: 'Neve leve',
            73: 'Neve moderada',
            75: 'Neve forte',
            80: 'Pancadas de chuva leves',
            81: 'Pancadas de chuva moderadas',
            82: 'Pancadas de chuva fortes',
            95: 'Tempestade',
            96: 'Tempestade com granizo leve',
            99: 'Tempestade com granizo forte',
        }
        return descriptions.get(weather_code, 'Condição desconhecida')

