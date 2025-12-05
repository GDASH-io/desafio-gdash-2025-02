import requests
import logging
import time
from datetime import datetime
from typing import Dict, Any, Optional
try:
    from zoneinfo import ZoneInfo
except ImportError:
    # Fallback para Python < 3.9
    from backports.zoneinfo import ZoneInfo
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
        max_retries = 3
        retry_delay = 5
        # Timeout mais agressivo: 10 segundos para conexão, 10 segundos para leitura
        connection_timeout = 10
        read_timeout = 10
        total_timeout = (connection_timeout, read_timeout)

        for attempt in range(max_retries):
            try:
                params = {
                    'latitude': self.latitude,
                    'longitude': self.longitude,
                    'current': 'temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,precipitation_probability,pressure_msl,visibility,shortwave_radiation',
                    'hourly': 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,weather_code',
                    'timezone': 'America/Sao_Paulo',  # Horário do Brasil
                }

                logger.info(f'Tentativa {attempt + 1}/{max_retries} de coletar dados da API Open-Meteo...')
                # Usar timeout mais agressivo com conexão e leitura separados
                response = requests.get(
                    self.base_url, 
                    params=params, 
                    timeout=total_timeout,
                    stream=False  # Não usar stream para garantir que o timeout funcione
                )
                response.raise_for_status()

                data = response.json()

                if 'current' not in data:
                    logger.error('Resposta da API não contém dados atuais')
                    if attempt < max_retries - 1:
                        time.sleep(retry_delay)
                        continue
                    return None

                current = data['current']
                location_name = self._get_location_name()

                # Usar timestamp atual no horário do Brasil
                brazil_tz = ZoneInfo('America/Sao_Paulo')
                now_brazil = datetime.now(brazil_tz)
                timestamp_str = now_brazil.strftime('%Y-%m-%dT%H:%M:%S')

                # Processar campos opcionais com tratamento adequado
                visibility_value = current.get('visibility')
                visibility_km = visibility_value / 1000 if visibility_value is not None and visibility_value > 0 else None
                
                solar_radiation_value = current.get('shortwave_radiation')
                solar_radiation = solar_radiation_value if solar_radiation_value is not None and solar_radiation_value >= 0 else None
                
                pressure_msl_value = current.get('pressure_msl')
                pressure_hpa = pressure_msl_value / 100 if pressure_msl_value is not None and pressure_msl_value > 0 else None
                
                weather_data = {
                    'timestamp': timestamp_str,
                    'location': location_name,
                    'latitude': self.latitude,
                    'longitude': self.longitude,
                    'temperature': current.get('temperature_2m', 0),
                    'humidity': current.get('relative_humidity_2m', 0),
                    'windSpeed': current.get('wind_speed_10m', 0),
                    'windDirection': current.get('wind_direction_10m', 0),
                    'condition': self._get_weather_condition_pt(current.get('weather_code', 0)),
                    'rainProbability': current.get('precipitation_probability', 0),
                    'description': self._get_weather_description(current.get('weather_code', 0)),
                    'visibility': visibility_km,  # Convert to km
                    'solarRadiation': solar_radiation,  # W/m²
                    'pressure': pressure_hpa,  # Convert to hPa
                }
                
                # Log dos campos opcionais para debug
                logger.debug(f'Campos opcionais - Visibilidade: {visibility_km} km, Radiação Solar: {solar_radiation} W/m², Pressão: {pressure_hpa} hPa')

                logger.info(f'Dados climáticos coletados com sucesso: {weather_data["temperature"]}°C em {location_name}')
                return weather_data

            except requests.exceptions.Timeout as e:
                logger.warning(f'Timeout na tentativa {attempt + 1}/{max_retries}: {e}')
                if attempt < max_retries - 1:
                    logger.info(f'Aguardando {retry_delay} segundos antes da próxima tentativa...')
                    time.sleep(retry_delay)
                    continue
                logger.error('Timeout após todas as tentativas')
                return None
            except requests.exceptions.ConnectionError as e:
                logger.error(f'Erro de conexão na tentativa {attempt + 1}/{max_retries}: {e}')
                if attempt < max_retries - 1:
                    logger.info(f'Aguardando {retry_delay} segundos antes da próxima tentativa...')
                    time.sleep(retry_delay)
                    continue
                logger.error('Erro de conexão após todas as tentativas')
                return None
            except requests.exceptions.RequestException as e:
                logger.error(f'Erro na requisição (tentativa {attempt + 1}/{max_retries}): {e}')
                if attempt < max_retries - 1:
                    logger.info(f'Aguardando {retry_delay} segundos antes da próxima tentativa...')
                    time.sleep(retry_delay)
                    continue
                logger.error('Erro na requisição após todas as tentativas')
                return None
            except Exception as e:
                logger.error(f'Erro inesperado ao coletar dados (tentativa {attempt + 1}/{max_retries}): {e}', exc_info=True)
                if attempt < max_retries - 1:
                    logger.info(f'Aguardando {retry_delay} segundos antes da próxima tentativa...')
                    time.sleep(retry_delay)
                    continue
                logger.error('Erro inesperado após todas as tentativas')
                return None

        logger.error('Falha ao coletar dados após todas as tentativas')
        return None

    def _get_location_name(self) -> str:
        """
        Retorna o nome da localização baseado nas coordenadas
        """
        return f'Lat {self.latitude}, Lon {self.longitude}'

    def _get_weather_condition(self, weather_code: int) -> str:
        """
        Converte código do tempo em condição legível (inglês)
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

    def _get_weather_condition_pt(self, weather_code: int) -> str:
        """
        Converte código do tempo em condição legível em português
        """
        weather_codes_pt = {
            0: 'Céu limpo',
            1: 'Principalmente limpo',
            2: 'Parcialmente nublado',
            3: 'Nublado',
            45: 'Nebuloso',
            48: 'Neblina com geada',
            51: 'Garoa leve',
            53: 'Garoa moderada',
            55: 'Garoa densa',
            56: 'Garoa gelada leve',
            57: 'Garoa gelada densa',
            61: 'Chuva leve',
            63: 'Chuva moderada',
            65: 'Chuva forte',
            66: 'Chuva gelada leve',
            67: 'Chuva gelada forte',
            71: 'Neve leve',
            73: 'Neve moderada',
            75: 'Neve forte',
            77: 'Grãos de neve',
            80: 'Pancadas de chuva leves',
            81: 'Pancadas de chuva moderadas',
            82: 'Pancadas de chuva fortes',
            85: 'Pancadas de neve leves',
            86: 'Pancadas de neve fortes',
            95: 'Tempestade',
            96: 'Tempestade com granizo leve',
            99: 'Tempestade com granizo forte',
        }
        return weather_codes_pt.get(weather_code, 'Desconhecido')

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

