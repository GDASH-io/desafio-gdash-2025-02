import os
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    weather_api_url: str = "https://api.open-meteo.com/v1/forecast"
    location_lat: float
    location_lon: float
    location_city: str

    rabbitmq_host: str = "localhost"
    rabbitmq_port: int = 5672
    rabbitmq_user: str = "admin"
    rabbitmq_pass: str = "admin123"
    rabbitmq_queue: str = "weather_data"

    collection_interval_minutes: int = 5
    log_level: str = "INFO"

    @property
    def rabbitmq_url(self) -> str:
        return (
            f"amqp://{self.rabbitmq_user}:{self.rabbitmq_pass}"
            f"@{self.rabbitmq_host}:{self.rabbitmq_port}/"
        )
    
    @property
    def collection_interval_seconds(self) -> int:
        return self.collection_interval_minutes * 60
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

@lru_cache()
def get_settings() -> Settings:
    return Settings()

def get_rabbitmq_url() -> str:
    return get_settings().rabbitmq_url
