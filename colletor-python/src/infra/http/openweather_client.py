"""
Cliente HTTP para a API OpenWeather com retries e exponential backoff.
"""
import time
import logging
from typing import Dict, Any, Optional
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from src.shared.config import Config

logger = logging.getLogger("collector")


class OpenWeatherClient:
    """Cliente para consumir a API OpenWeather OneCall."""
    
    BASE_URL_3_0 = "https://api.openweathermap.org/data/3.0/onecall"
    BASE_URL_2_5 = "https://api.openweathermap.org/data/2.5/onecall"
    BASE_URL_CURRENT = "https://api.openweathermap.org/data/2.5/weather"
    
    def __init__(
        self,
        api_key: str,
        latitude: float,
        longitude: float,
        timeout: int = None,
        max_retries: int = None,
        retry_backoff_base: int = None,
    ):
        """
        Inicializa o cliente OpenWeather.
        
        Args:
            api_key: Chave da API OpenWeather
            latitude: Latitude da localização
            longitude: Longitude da localização
            timeout: Timeout em segundos (padrão: Config.HTTP_TIMEOUT_SECONDS)
            max_retries: Número máximo de tentativas (padrão: Config.HTTP_MAX_RETRIES)
            retry_backoff_base: Base para cálculo de backoff exponencial
        """
        self.api_key = api_key
        self.latitude = latitude
        self.longitude = longitude
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
    
    def fetch_onecall(
        self,
        exclude: Optional[str] = "minutely",
        units: str = "metric",
    ) -> Dict[str, Any]:
        """
        Busca dados do OneCall API. Tenta OneCall 3.0, depois 2.5, depois Current Weather.
        
        Args:
            exclude: Campos a excluir (minutely, hourly, daily)
            units: Unidades (metric, imperial, kelvin)
        
        Returns:
            Dados da API em formato JSON
        
        Raises:
            requests.RequestException: Em caso de erro na requisição
        """
        params = {
            "lat": self.latitude,
            "lon": self.longitude,
            "appid": self.api_key,
            "units": units,
        }
        
        logger.info(
            "Buscando dados OpenWeather",
            extra={"context": {"latitude": self.latitude, "longitude": self.longitude}},
        )
        
        # Tentar OneCall 3.0 primeiro
        urls_to_try = [
            (self.BASE_URL_3_0, {**params, "exclude": exclude}),
            (self.BASE_URL_2_5, {**params, "exclude": exclude}),
        ]
        
        for url, url_params in urls_to_try:
            try:
                response = self.session.get(
                    url,
                    params=url_params,
                    timeout=self.timeout,
                )
                
                # Verificar status antes de raise_for_status
                if response.status_code == 401:
                    # 401 significa que a chave não tem acesso a este endpoint, tentar próximo
                    logger.warning(
                        f"Endpoint {url} retornou 401 (não autorizado), tentando próximo...",
                        extra={"context": {"url": url}},
                    )
                    continue
                
                response.raise_for_status()
                
                data = response.json()
                logger.info(
                    "Dados OpenWeather obtidos com sucesso",
                    extra={"context": {"url": url, "has_hourly": "hourly" in data, "has_daily": "daily" in data}},
                )
                
                return data
            
            except requests.exceptions.HTTPError as e:
                # Se não for 401, pode ser outro erro HTTP
                if e.response and e.response.status_code != 401:
                    logger.error(
                        f"Erro HTTP ao buscar dados OpenWeather: {e}",
                        extra={"context": {"status_code": e.response.status_code if e.response else None, "url": url}},
                    )
                    raise
                # Se for 401, continue para próximo endpoint
                logger.warning(
                    f"Endpoint {url} retornou 401, tentando próximo...",
                    extra={"context": {"url": url}},
                )
                continue
            
            except requests.exceptions.RequestException as e:
                logger.warning(f"Erro ao buscar dados OpenWeather de {url}: {e}, tentando próximo...")
                continue
        
        # Se OneCall falhou, usar Current Weather como fallback
        logger.warning("OneCall API não disponível, usando Current Weather como fallback")
        try:
            response = self.session.get(
                self.BASE_URL_CURRENT,
                params=params,
                timeout=self.timeout,
            )
            response.raise_for_status()
            
            current_data = response.json()
            
            # Converter Current Weather para formato similar ao OneCall
            data = {
                "current": {
                    "dt": current_data.get("dt"),
                    "temp": current_data.get("main", {}).get("temp"),
                    "humidity": current_data.get("main", {}).get("humidity"),
                    "wind_speed": current_data.get("wind", {}).get("speed"),
                    "clouds": current_data.get("clouds", {}).get("all", 0),
                    "weather": current_data.get("weather", []),
                    "pressure": current_data.get("main", {}).get("pressure"),
                    "visibility": current_data.get("visibility"),
                },
                "hourly": [],  # Current Weather não tem hourly
                "daily": [],   # Current Weather não tem daily
            }
            
            logger.info(
                "Dados Current Weather obtidos com sucesso (fallback)",
                extra={"context": {"temp": data["current"].get("temp")}},
            )
            
            return data
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro ao buscar Current Weather: {e}")
            raise
    
    def fetch_with_manual_retry(self) -> Dict[str, Any]:
        """
        Busca dados. O fetch_onecall já tenta múltiplos endpoints.
        
        Returns:
            Dados da API em formato JSON
        
        Raises:
            requests.RequestException: Em caso de erro
        """
        # fetch_onecall já tenta múltiplos endpoints, então apenas chama uma vez
        return self.fetch_onecall()

