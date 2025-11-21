"""
Cliente HTTP para a API Open-Meteo (gratuita, sem necessidade de chave).
"""
import logging
from typing import Dict, Any, Optional
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from src.shared.config import Config

logger = logging.getLogger("collector")


class OpenMeteoClient:
    """Cliente para consumir a API Open-Meteo (gratuita)."""
    
    BASE_URL = "https://api.open-meteo.com/v1/forecast"
    
    def __init__(
        self,
        latitude: float,
        longitude: float,
        timezone: str = "America/Sao_Paulo",
        timeout: int = None,
        max_retries: int = None,
        retry_backoff_base: int = None,
    ):
        """
        Inicializa o cliente Open-Meteo.
        
        Args:
            latitude: Latitude da localização
            longitude: Longitude da localização
            timezone: Timezone (padrão: America/Sao_Paulo)
            timeout: Timeout em segundos (padrão: Config.HTTP_TIMEOUT_SECONDS)
            max_retries: Número máximo de tentativas (padrão: Config.HTTP_MAX_RETRIES)
            retry_backoff_base: Base para cálculo de backoff exponencial
        """
        self.latitude = latitude
        self.longitude = longitude
        self.timezone = timezone
        self.timeout = timeout or Config.HTTP_TIMEOUT_SECONDS
        self.max_retries = max_retries or Config.HTTP_MAX_RETRIES
        self.retry_backoff_base = retry_backoff_base or Config.HTTP_RETRY_BACKOFF_BASE
        
        # Configurar sessão com retry strategy
        self.session = requests.Session()
        retry_strategy = Retry(
            total=self.max_retries,
            backoff_factor=self.retry_backoff_base,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET"],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
    
    def fetch_forecast(
        self,
        hourly_params: str = "temperature_2m,relative_humidity_2m,precipitation,precipitation_probability,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover,weather_code,pressure_msl,uv_index,visibility",
        daily_params: str = "temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,cloud_cover_mean,weather_code",
        forecast_days: int = 7,
    ) -> Dict[str, Any]:
        """
        Busca dados de previsão do Open-Meteo.
        
        Args:
            hourly_params: Parâmetros horários a buscar
            daily_params: Parâmetros diários a buscar
            forecast_days: Número de dias de previsão (1-16)
        
        Returns:
            Dados da API em formato JSON
        
        Raises:
            requests.RequestException: Em caso de erro na requisição
        """
        params = {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "timezone": self.timezone,
            "hourly": hourly_params,
            "daily": daily_params,
            "forecast_days": forecast_days,
        }
        
        logger.info(
            "Buscando dados Open-Meteo",
            extra={"context": {"latitude": self.latitude, "longitude": self.longitude}},
        )
        
        try:
            response = self.session.get(
                self.BASE_URL,
                params=params,
                timeout=self.timeout,
            )
            response.raise_for_status()
            
            data = response.json()
            logger.info(
                "Dados Open-Meteo obtidos com sucesso",
                extra={
                    "context": {
                        "has_hourly": "hourly" in data,
                        "has_daily": "daily" in data,
                        "hourly_count": len(data.get("hourly", {}).get("time", [])),
                    }
                },
            )
            
            return data
        
        except requests.exceptions.HTTPError as e:
            logger.error(
                f"Erro HTTP ao buscar dados Open-Meteo: {e}",
                extra={"context": {"status_code": e.response.status_code if e.response else None}},
            )
            raise
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao buscar dados Open-Meteo: {e}")
            raise

