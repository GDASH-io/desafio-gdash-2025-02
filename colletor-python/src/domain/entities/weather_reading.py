"""
Entidade de leitura climática focada em métricas de energia solar.
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class WeatherReading:
    """Entidade que representa uma leitura climática."""
    
    timestamp: datetime
    temperature_c: float
    relative_humidity: int
    precipitation_mm: float
    wind_speed_m_s: float
    clouds_percent: int
    weather_code: int
    pressure_hpa: Optional[float] = None
    uv_index: Optional[float] = None
    visibility_m: Optional[int] = None
    
    def to_dict(self) -> dict:
        """Converte a entidade para dicionário."""
        data = {
            "timestamp": self.timestamp.isoformat(),
            "temperature_c": self.temperature_c,
            "relative_humidity": self.relative_humidity,
            "precipitation_mm": self.precipitation_mm,
            "wind_speed_m_s": self.wind_speed_m_s,
            "clouds_percent": self.clouds_percent,
            "weather_code": self.weather_code,
        }
        
        if self.pressure_hpa is not None:
            data["pressure_hpa"] = self.pressure_hpa
        
        if self.uv_index is not None:
            data["uv_index"] = self.uv_index
        
        if self.visibility_m is not None:
            data["visibility_m"] = self.visibility_m
        
        return data

