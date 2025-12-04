from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field, field_validator

class Location(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, description="Latitude in decimal degrees")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude in decimal degrees")
    city: str = Field(..., min_length=1, description="City name")

    @field_validator('city')
    @classmethod
    def city_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('City name must not be empty')
        return v.strip()
    
def utc_now() -> datetime:
    return datetime.now(timezone.utc)
    
class WeatherData(BaseModel):
    timestamp: datetime = Field(
        default_factory=utc_now,
        description="UTC timestamp"
    )
    location: Location
    temperature: float = Field(..., description="Temperature in Celsius")
    apparent_temperature: Optional[float] = Field(
        None,
        description="Feels-like temperature"
    )
    humidity: float = Field(..., ge=0, le=100, description="Humidity percentage")
    pressure: Optional[float] = Field(None, description="Atmospheric pressure")
    wind_speed: float = Field(..., ge=0, description="Wind speed")
    wind_direction: Optional[int] = Field(
        None,
        ge=0,
        le=360,
        description="wind direction in degrees"
    )
    precipitation: Optional[float] = Field(
        None,
        ge=0,
        le=100,
        description="Probability of precipitation percentage"
    )
    cloud_cover: Optional[float] = Field(
        None,
        ge=0,
        le=100,
        description="Cloud cover percentage"
    )
    weather_code: Optional[int] = Field(
        None,
        description="Weather condition code"
    )
    
    def to_queue_message(self) -> dict:
        data = self.model_dump()
        timestamp_str = self.timestamp.isoformat()
        if not timestamp_str.endswith('Z') and '+' not in timestamp_str:
            timestamp_str += 'Z'
        data['timestamp'] = timestamp_str
        
        return data