import requests
import logging

logger = logging.getLogger(__name__)

class WeatherAPI:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "http://api.openweathermap.org/data/2.5"
    
    def get_current_weather(self, city, country_code=None):
        """Get current weather data from OpenWeatherMap API"""
        try:
            # Prepare location string
            location = city
            if country_code:
                location = f"{city},{country_code}"
            
            # API parameters
            params = {
                'q': location,
                'appid': self.api_key,
                'units': 'metric',  # Use Celsius
                'lang': 'pt_br'     # Portuguese descriptions
            }
            
            # Make API request
            url = f"{self.base_url}/weather"
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"Successfully retrieved weather data for {location}")
                return data
            else:
                logger.error(f"OpenWeatherMap API error {response.status_code}: {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error when calling OpenWeatherMap API: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in WeatherAPI: {str(e)}")
            return None