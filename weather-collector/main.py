import os
import time
import json
import logging
import schedule
import requests
from datetime import datetime
from weather_api import WeatherAPI
from message_queue import MessageQueue

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class WeatherCollector:
    def __init__(self):
        self.api_key = os.getenv('OPENWEATHER_API_KEY')
        self.api_base_url = os.getenv('API_BASE_URL', 'http://api:3001')
        self.collection_interval = int(os.getenv('COLLECTION_INTERVAL', 300))  # 5 minutes default
        
        if not self.api_key:
            raise ValueError("OPENWEATHER_API_KEY environment variable is required")
        
        # Inicialmente usar localização automática do PC, será atualizada dinamicamente
        location = self.get_pc_location()
        self.city = location['city']
        self.country_code = location['country_code']
        
        self.weather_api = WeatherAPI(self.api_key)
        self.message_queue = MessageQueue()
        
        logger.info(f"Weather Collector initialized")
        logger.info(f"Collection interval: {self.collection_interval} seconds")
        logger.info(f"API Base URL: {self.api_base_url}")
        logger.info(f"Initial location: {self.city}, {self.country_code}")

    def get_pc_location(self):
        """Get PC location using IP geolocation"""
        try:
            # Try to get location from IP geolocation service
            response = requests.get('http://ip-api.com/json/', timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    city = data.get('city', 'Campo Grande')
                    country = data.get('country', 'Brazil')
                    country_code = data.get('countryCode', 'BR')
                    
                    logger.info(f"Detected PC location: {city}, {country} ({country_code})")
                    return {
                        'city': city,
                        'country_code': country_code
                    }
        except Exception as e:
            logger.warning(f"Could not detect PC location via IP: {str(e)}")
        
        # Fallback to Campo Grande if detection fails
        logger.info("Using fallback location: Campo Grande, BR")
        return {
            'city': 'Campo Grande',
            'country_code': 'BR'
        }

    def get_current_location_config(self):
        """Get current location configuration from API"""
        try:
            response = requests.get(f"{self.api_base_url}/api/config/location", timeout=10)
            if response.status_code == 200:
                config = response.json()
                if config.get('location'):
                    self.city = config['location']['city']
                    self.country_code = config['location']['country']
                    logger.info(f"Location updated from API: {self.city}, {self.country_code}")
                    return True
        except Exception as e:
            logger.warning(f"Could not fetch location config from API: {str(e)}")
        
        # Use environment variables as fallback
        env_city = os.getenv('CITY')
        env_country = os.getenv('COUNTRY_CODE')
        
        if env_city and env_country:
            self.city = env_city
            self.country_code = env_country
            logger.info(f"Using environment location: {self.city}, {self.country_code}")
            return True
        
        logger.warning(f"Using default location: {self.city}, {self.country_code}")
        return True

    def collect_weather_data(self):
        """Collect weather data and send to queue"""
        # Atualizar configuração de localização antes de cada coleta
        self.get_current_location_config()
        
        # Verificar se temos localização configurada
        if not self.city or not self.country_code:
            logger.info("No location configured, skipping data collection")
            return
            
        try:
            logger.info(f"Collecting weather data for {self.city}, {self.country_code}")
            
            # Get weather data from OpenWeatherMap
            weather_data = self.weather_api.get_current_weather(self.city, self.country_code)
            
            if weather_data:
                # Prepare message for queue
                message = {
                    'city': weather_data['name'],
                    'country': self.country_code,
                    'temperature': weather_data['main']['temp'],
                    'humidity': weather_data['main']['humidity'],
                    'windSpeed': weather_data['wind']['speed'],
                    'condition': weather_data['weather'][0]['main'],
                    'description': weather_data['weather'][0]['description'],
                    'pressure': weather_data['main'].get('pressure'),
                    'visibility': weather_data.get('visibility'),
                    'cloudiness': weather_data['clouds']['all'],
                    'timestamp': datetime.utcnow().isoformat() + 'Z',
                }
                
                # Add sunrise/sunset if available
                if 'sys' in weather_data:
                    if 'sunrise' in weather_data['sys']:
                        message['sunrise'] = datetime.fromtimestamp(
                            weather_data['sys']['sunrise']
                        ).isoformat() + 'Z'
                    if 'sunset' in weather_data['sys']:
                        message['sunset'] = datetime.fromtimestamp(
                            weather_data['sys']['sunset']
                        ).isoformat() + 'Z'
                
                # Send to message queue
                self.message_queue.send_weather_data(message)
                
                logger.info(f"Weather data collected and sent: {weather_data['name']}, "
                           f"{message['temperature']}°C, {message['condition']}")
            else:
                logger.error("Failed to collect weather data")
                
        except Exception as e:
            logger.error(f"Error collecting weather data: {str(e)}")

    def run(self):
        """Run the weather collector"""
        logger.info("Starting Weather Collector...")
        
        # Collect data immediately on startup
        self.collect_weather_data()
        
        # Schedule periodic collection
        interval_minutes = self.collection_interval // 60
        if interval_minutes < 1:
            # For intervals less than 1 minute, collect every minute
            schedule.every().minute.do(self.collect_weather_data)
            logger.info("Scheduled collection every minute")
        else:
            schedule.every(interval_minutes).minutes.do(self.collect_weather_data)
            logger.info(f"Scheduled collection every {interval_minutes} minutes")
        
        # Keep running
        try:
            while True:
                schedule.run_pending()
                time.sleep(30)  # Check every 30 seconds
        except KeyboardInterrupt:
            logger.info("Weather Collector stopped by user")
        except Exception as e:
            logger.error(f"Weather Collector error: {str(e)}")
        finally:
            self.message_queue.close()

if __name__ == "__main__":
    collector = WeatherCollector()
    collector.run()