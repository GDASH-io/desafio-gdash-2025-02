import requests
from typing import Optional
from datetime import datetime
import logging

from domain.models import WeatherData, Location

class WeatherAPIError(Exception):
    pass

class OpenMeteoAdapter:
    def __init__(
        self,
        api_url: str,
        timeout: int = 10,
        logger: Optional[logging.Logger] = None
    ):
        self.api_url = api_url
        self.timeout = timeout
        self.logger = logger or logging.getLogger(__name__)
    
    def fetch_weather_data(
        self,
        latitude: float,
        longitude: float,
        city: str
    ) -> WeatherData:
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "precipitation",
                "weather_code",
                "cloud_cover",
                "surface_pressure",
                "wind_speed_10m",
                "wind_direction_10m",
            ],
            "timezone": "auto",
            "forecast_days": 1,
        }

        try:
            self.logger.info(
                f"Fetching weather data for {city} "
                f"(lat={latitude}, lon={longitude})"
            )

            response = requests.get(
                self.api_url,
                params=params,
                timeout=self.timeout
            )

            print(response)

            self.logger.info(f"Weather API response: {response.text}")

            response.raise_for_status()

            data = response.json()

            self.logger.info(f"Parsed weather data: {data}")

            weather_data = self._transform_response(data, latitude, longitude, city)

            self.logger.info(
                f"Successfully fetched weather data for {city}: "
                f"{weather_data.temperature}°C, {weather_data.humidity}% humidity"
            )

            return weather_data
        
        except requests.exceptions.Timeout:
            error_msg = f'Timeout fetching weather data for {city}'
            self.logger.error(error_msg)
            raise WeatherAPIError(error_msg)
        
        except requests.exceptions.RequestException as e:
            error_msg = f"Error fetching weather data for {city}: {str(e)}"
            self.logger.error(error_msg)
            raise WeatherAPIError(error_msg) from e
        
        except (KeyError, ValueError) as e:
            error_msg = f"Error parsing weather data response: {str(e)}"
            self.logger.error(error_msg)
            raise WeatherAPIError(error_msg) from e
        
    def _transform_response(
            self,
            api_response: dict,
            latitude: float,
            longitude: float,
            city: str
    ) -> WeatherData:
        current = api_response["current"]

        location = Location(
            latitude=latitude,
            longitude=longitude,
            city=city
        )

        return WeatherData(
            timestamp=datetime.utcnow(),
            location=location,
            temperature=current.get("temperature_2m"),
            apparent_temperature=current.get("apparent_temperature"),
            humidity=current.get("relative_humidity_2m"),
            pressure=current.get("surface_pressure"),
            wind_speed=current.get("wind_speed_10m"),
            wind_direction=current.get("wind_direction_10m"),
            precipitation=current.get("precipitation"),
            cloud_cover=current.get("cloud_cover"),
            weather_code=current.get("weather_code")
        )