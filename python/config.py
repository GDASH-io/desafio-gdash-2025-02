import os
from dataclasses import dataclass
from typing import Optional

from dotenv import load_dotenv


@dataclass
class RabbitSettings:
    host: str
    port: int
    user: str
    password: str
    queue: str
    vhost: str


@dataclass
class CollectorSettings:
    default_city: str
    default_latitude: float
    default_longitude: float
    provider: str
    default_interval_minutes: int
    loop_interval_seconds: int
    config_url: Optional[str]
    locations_url: Optional[str]
    api_key: Optional[str]
    rabbit: RabbitSettings


def load_settings() -> CollectorSettings:
    """Load collector settings from environment, applying sensible defaults."""
    load_dotenv()

    rabbit = RabbitSettings(
        host=os.getenv("RABBITMQ_HOST", "rabbitmq"),
        port=int(os.getenv("RABBITMQ_PORT", "5672")),
        user=os.getenv("RABBITMQ_USER", "guest"),
        password=os.getenv("RABBITMQ_PASSWORD", "guest"),
        queue=os.getenv("RABBITMQ_QUEUE", "weather-data"),
        vhost=os.getenv("RABBITMQ_VHOST", "/"),
    )

    return CollectorSettings(
        default_city=os.getenv("CITY_NAME", "Sao Paulo"),
        default_latitude=float(os.getenv("CITY_LATITUDE", "-23.55052")),
        default_longitude=float(os.getenv("CITY_LONGITUDE", "-46.633308")),
        provider=os.getenv("WEATHER_PROVIDER", "open-meteo").lower(),
        default_interval_minutes=int(os.getenv("COLLECT_INTERVAL_MINUTES", "60")),
        loop_interval_seconds=int(os.getenv("LOOP_INTERVAL_SECONDS", "60")),
        config_url=os.getenv("COLLECTOR_CONFIG_URL"),
        locations_url=os.getenv("COLLECTOR_LOCATIONS_URL"),
        api_key=os.getenv("OPENWEATHER_API_KEY"),
        rabbit=rabbit,
    )