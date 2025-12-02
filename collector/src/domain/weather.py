from dataclasses import dataclass, asdict
from datetime import datetime

@dataclass
class WeatherData:
    location_lat: float
    location_lon: float
    temperature: float
    humidity: float
    wind_speed: float
    condition_code: int
    # Cria o timestamp automaticamente se não for passado
    collected_at: str = None 

    def __post_init__(self):
        if self.collected_at is None:
            self.collected_at = datetime.now().isoformat()

    def to_dict(self):
        """Converte a classe para dicionário (JSON)"""
        return asdict(self)