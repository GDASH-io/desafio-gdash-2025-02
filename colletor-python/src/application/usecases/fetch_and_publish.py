"""
Use case para buscar dados climáticos (Open-Meteo) e publicar no Kafka.
"""
import logging
from datetime import datetime
from typing import List, Dict, Any, Union
import pytz
from src.domain.entities.weather_reading import WeatherReading
from src.domain.repositories.kafka_producer import KafkaProducerRepository
from src.infra.http.openmeteo_client import OpenMeteoClient
from src.shared.config import Config

logger = logging.getLogger("collector")


class FetchAndPublishUseCase:
    """Use case para buscar dados climáticos e publicar no Kafka."""
    
    CITY_NAME = "Coronel Fabriciano"
    COUNTRY = "BR"
    
    def __init__(
        self,
        openmeteo_client: OpenMeteoClient,
        kafka_producer: KafkaProducerRepository,
    ):
        """
        Inicializa o use case.
        
        Args:
            openmeteo_client: Cliente Open-Meteo
            kafka_producer: Repositório Kafka
        """
        self.openmeteo_client = openmeteo_client
        self.kafka_producer = kafka_producer
        self.timezone = pytz.timezone(Config.TIMEZONE)
    
    def _parse_hourly_data_openmeteo(self, api_data: Dict[str, Any]) -> List[WeatherReading]:
        """
        Parse dos dados hourly da API Open-Meteo.
        
        Args:
            api_data: Dados completos da API Open-Meteo
        
        Returns:
            Lista de entidades WeatherReading
        """
        readings = []
        hourly = api_data.get("hourly", {})
        
        if not hourly:
            return readings
        
        times = hourly.get("time", [])
        temperatures = hourly.get("temperature_2m", [])
        humidities = hourly.get("relative_humidity_2m", [])
        precipitations = hourly.get("precipitation", [])
        precipitation_probs = hourly.get("precipitation_probability", [])
        wind_speeds = hourly.get("wind_speed_10m", [])
        wind_directions = hourly.get("wind_direction_10m", [])
        wind_gusts = hourly.get("wind_gusts_10m", [])
        cloud_covers = hourly.get("cloud_cover", [])
        weather_codes = hourly.get("weather_code", [])
        pressures = hourly.get("pressure_msl", [])
        uv_indices = hourly.get("uv_index", [])
        visibilities = hourly.get("visibility", [])
        
        for i in range(len(times)):
            try:
                # Converter timestamp ISO para datetime
                dt_str = times[i]
                dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
                if dt.tzinfo is None:
                    dt = self.timezone.localize(dt)
                
                reading = WeatherReading(
                    timestamp=dt,
                    temperature_c=temperatures[i] if i < len(temperatures) else 0.0,
                    relative_humidity=int(humidities[i]) if i < len(humidities) else 0,
                    precipitation_mm=precipitations[i] if i < len(precipitations) else 0.0,
                    wind_speed_m_s=wind_speeds[i] if i < len(wind_speeds) else 0.0,
                    clouds_percent=int(cloud_covers[i]) if i < len(cloud_covers) else 0,
                    weather_code=int(weather_codes[i]) if i < len(weather_codes) else 0,
                )
                
                readings.append(reading)
            
            except Exception as e:
                logger.warning(
                    f"Erro ao parsear entrada hourly: {e}",
                    extra={"context": {"index": i}},
                )
                continue
        
        return readings
    
    def _parse_daily_data_openmeteo(self, api_data: Dict[str, Any]) -> List[WeatherReading]:
        """
        Parse dos dados daily da API Open-Meteo.
        
        Args:
            api_data: Dados completos da API Open-Meteo
        
        Returns:
            Lista de entidades WeatherReading
        """
        readings = []
        daily = api_data.get("daily", {})
        
        if not daily:
            return readings
        
        times = daily.get("time", [])
        temp_max = daily.get("temperature_2m_max", [])
        temp_min = daily.get("temperature_2m_min", [])
        precipitations = daily.get("precipitation_sum", [])
        wind_speeds = daily.get("wind_speed_10m_max", [])
        cloud_covers = daily.get("cloud_cover_mean", [])
        weather_codes = daily.get("weather_code", [])
        
        for i in range(len(times)):
            try:
                # Converter timestamp ISO para datetime
                dt_str = times[i]
                dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
                if dt.tzinfo is None:
                    dt = self.timezone.localize(dt)
                
                # Usar temperatura média (max + min) / 2
                temp_avg = (temp_max[i] + temp_min[i]) / 2 if i < len(temp_max) and i < len(temp_min) else 0.0
                
                reading = WeatherReading(
                    timestamp=dt,
                    temperature_c=temp_avg,
                    relative_humidity=0,  # Open-Meteo daily não fornece umidade média
                    precipitation_mm=precipitations[i] if i < len(precipitations) else 0.0,
                    wind_speed_m_s=wind_speeds[i] if i < len(wind_speeds) else 0.0,
                    clouds_percent=int(cloud_covers[i]) if i < len(cloud_covers) else 0,
                    weather_code=int(weather_codes[i]) if i < len(weather_codes) else 0,
                )
                
                readings.append(reading)
            
            except Exception as e:
                logger.warning(
                    f"Erro ao parsear entrada daily: {e}",
                    extra={"context": {"index": i}},
                )
                continue
        
        return readings
    
    def _build_message(
        self,
        readings: List[WeatherReading],
        interval_type: str,
    ) -> Dict[str, Any]:
        """
        Constrói mensagem no formato do contrato.
        
        Args:
            readings: Lista de leituras climáticas
            interval_type: Tipo de intervalo (hourly ou daily)
        
        Returns:
            Mensagem formatada para publicação
        """
        now = datetime.now(tz=self.timezone)
        
        payload = [reading.to_dict() for reading in readings]
        
        message = {
            "source": "openmeteo",
            "city": self.CITY_NAME,
            "country": self.COUNTRY,
            "coords": {
                "lat": Config.LATITUDE,
                "lon": Config.LONGITUDE,
            },
            "fetched_at": now.isoformat(),
            "interval": interval_type,
            "payload": payload,
        }
        
        return message
    
    def execute(self) -> None:
        """
        Executa o use case: busca dados e publica no Kafka.
        
        Raises:
            Exception: Em caso de erro na busca ou publicação
        """
        try:
            logger.info("Iniciando busca de dados Open-Meteo")
            
            # Buscar dados da API Open-Meteo
            api_data = self.openmeteo_client.fetch_forecast()
            
            # Determinar tipo de intervalo
            interval_type = Config.COLLECT_INTERVAL_TYPE
            
            # Parsear dados conforme intervalo
            readings: List[WeatherReading] = []
            
            if interval_type == "hourly":
                readings = self._parse_hourly_data_openmeteo(api_data)
                logger.info(
                    f"Parseados {len(readings)} leituras hourly",
                    extra={"context": {"count": len(readings)}},
                )
            
            elif interval_type == "daily":
                readings = self._parse_daily_data_openmeteo(api_data)
                logger.info(
                    f"Parseados {len(readings)} leituras daily",
                    extra={"context": {"count": len(readings)}},
                )
            
            if not readings:
                logger.warning("Nenhuma leitura foi parseada")
                return
            
            # Construir mensagem
            message = self._build_message(readings, interval_type)
            
            # Publicar no Kafka
            self.kafka_producer.publish_to_default_topic(message)
            
            logger.info(
                "Dados publicados no Kafka com sucesso",
                extra={
                    "context": {
                        "readings_count": len(readings),
                        "interval": interval_type,
                        "topic": Config.KAFKA_TOPIC_RAW,
                    }
                },
            )
        
        except Exception as e:
            logger.error(
                f"Erro ao executar use case: {e}",
                extra={"context": {"error_type": type(e).__name__}},
                exc_info=True,
            )
            raise

