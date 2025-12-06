import logging
import requests
from datetime import datetime
from typing import Optional, Dict, Any
from ..config.settings import WeatherAPIConfig

logger = logging.getLogger(__name__)


class WeatherService:
    def __init__(self):
        self.config = WeatherAPIConfig()

    def fetch_weather_data(self) -> Optional[Dict[str, Any]]:
        try:
            params = {
                'latitude': self.config.LATITUDE,
                'longitude': self.config.LONGITUDE,
                'current': 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
                'hourly': 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,weather_code',
                'timezone': self.config.TIMEZONE,
                'forecast_days': self.config.FORECAST_DAYS
            }
            
            logger.info(
                f"Buscando dados climáticos para coordenadas: "
                f"{self.config.LATITUDE}, {self.config.LONGITUDE}"
            )
            
            response = requests.get(
                self.config.BASE_URL,
                params=params,
                timeout=self.config.TIMEOUT
            )
            response.raise_for_status()
            
            data = response.json()
            weather_data = self._normalize_data(data)
            
            logger.info(
                f"Dados climáticos coletados com sucesso. "
                f"Temperatura atual: {weather_data['current']['temperature']}°C"
            )
            
            return weather_data
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao buscar dados climáticos: {e}")
            return None
        except Exception as e:
            logger.error(f"Erro inesperado ao processar dados climáticos: {e}")
            return None

    def _normalize_data(self, api_data: Dict[str, Any]) -> Dict[str, Any]:
        current = api_data.get('current', {})
        hourly = api_data.get('hourly', {})
        
        weather_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'location': {
                'latitude': self.config.LATITUDE,
                'longitude': self.config.LONGITUDE,
                'city': self.config.CITY_NAME
            },
            'current': {
                'temperature': current.get('temperature_2m'),
                'humidity': current.get('relative_humidity_2m'),
                'wind_speed': current.get('wind_speed_10m'),
                'weather_code': current.get('weather_code')
            },
            'forecast': {
                'hourly': self._process_hourly_forecast(hourly)
            }
        }
        
        return weather_data

    def _process_hourly_forecast(self, hourly: Dict[str, Any]) -> list:
        forecast_list = []
        
        if not hourly.get('time'):
            logger.warning("Dados horários não contêm 'time', retornando lista vazia")
            return forecast_list
        
        times = hourly.get('time', [])[:24]
        temperatures = hourly.get('temperature_2m', [])[:24] if hourly.get('temperature_2m') else [None] * len(times)
        humidities = hourly.get('relative_humidity_2m', [])[:24] if hourly.get('relative_humidity_2m') else [None] * len(times)
        wind_speeds = hourly.get('wind_speed_10m', [])[:24] if hourly.get('wind_speed_10m') else [None] * len(times)
        precipitations = hourly.get('precipitation_probability', [])[:24] if hourly.get('precipitation_probability') else [None] * len(times)
        weather_codes = hourly.get('weather_code', [])[:24] if hourly.get('weather_code') else [None] * len(times)
        
        logger.info(f"Processando {len(times)} horas de previsão, com {len(precipitations)} valores de precipitação")
        
        for i in range(len(times)):
            forecast_list.append({
                'time': times[i],
                'temperature': temperatures[i] if i < len(temperatures) else None,
                'humidity': humidities[i] if i < len(humidities) else None,
                'wind_speed': wind_speeds[i] if i < len(wind_speeds) else None,
                'precipitation_probability': (
                    precipitations[i] if i < len(precipitations) else None
                ),
                'weather_code': weather_codes[i] if i < len(weather_codes) else None
            })
        
        logger.info(f"Previsão processada: {len(forecast_list)} itens criados")
        return forecast_list

