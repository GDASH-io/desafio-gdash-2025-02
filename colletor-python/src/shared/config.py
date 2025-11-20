"""
Configurações centralizadas do collector.
"""
import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Configurações do aplicativo."""
    
    # Open-Meteo API (gratuita, sem necessidade de chave)
    LATITUDE: float = float(os.getenv("LATITUDE", "-19.5186"))
    LONGITUDE: float = float(os.getenv("LONGITUDE", "-42.6289"))
    TIMEZONE: str = os.getenv("TIMEZONE", "America/Sao_Paulo")
    
    # Coleta
    COLLECT_INTERVAL_SECONDS: int = int(os.getenv("COLLECT_INTERVAL_SECONDS", "3600"))
    COLLECT_INTERVAL_TYPE: str = os.getenv("COLLECT_INTERVAL_TYPE", "hourly")
    
    # Kafka
    KAFKA_BOOTSTRAP_SERVERS: str = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")
    KAFKA_TOPIC_RAW: str = os.getenv("KAFKA_TOPIC_RAW", "ana.raw.readings")
    
    # HTTP Client
    HTTP_TIMEOUT_SECONDS: int = int(os.getenv("HTTP_TIMEOUT_SECONDS", "15"))
    HTTP_MAX_RETRIES: int = int(os.getenv("HTTP_MAX_RETRIES", "3"))
    HTTP_RETRY_BACKOFF_BASE: int = int(os.getenv("HTTP_RETRY_BACKOFF_BASE", "2"))
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = os.getenv("LOG_FORMAT", "json")
    
    # Healthcheck
    HEALTHCHECK_PORT: int = int(os.getenv("HEALTHCHECK_PORT", "8080"))
    
    @classmethod
    def validate(cls) -> None:
        """Valida se as configurações obrigatórias estão presentes."""
        if cls.COLLECT_INTERVAL_TYPE not in ["hourly", "daily"]:
            raise ValueError(f"COLLECT_INTERVAL_TYPE deve ser 'hourly' ou 'daily', recebido: {cls.COLLECT_INTERVAL_TYPE}")

