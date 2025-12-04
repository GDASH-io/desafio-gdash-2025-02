import sys
import time
import signal
from datetime import datetime
from typing import Optional

from config.settings import get_settings
from logger import setup_logger
from adapters.weather_api import OpenMeteoAdapter, WeatherAPIError
from adapters.queue_publisher import RabbitMQPublisher, QueuePublisherError

class WeatherCollector:
    def __init__(self):
        self.settings = get_settings()
        self.logger = setup_logger("collector", self.settings.log_level)
        self.weather_api = OpenMeteoAdapter(
            api_url=self.settings.weather_api_url,
            logger=self.logger
        )
        self.publisher = RabbitMQPublisher(
            rabbitmq_url=self.settings.rabbitmq_url,
            queue_name=self.settings.rabbitmq_queue,
            logger=self.logger
        )

        self.running = True
        self.last_collection: Optional[datetime] = None

        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

    def _signal_handler(self, signum, frame):
        signal_name = signal.Signals(signum).name
        self.logger.info(f"Received {signal_name}, initiating shutdown...")
        self.running = False

    def collect_and_publish(self) ->  bool:
        try:
            weather_data = self.weather_api.fetch_weather_data(
                latitude=self.settings.location_lat,
                longitude=self.settings.location_lon,
                city=self.settings.location_city
            )

            self.publisher.publish(weather_data)
            self.last_collection = datetime.utcnow()

            self.logger.info(
                f"Collection cycle completed. "
                f"Next collection in {self.settings.collection_interval_minutes} minutes."
            )

            return True
        
        except WeatherAPIError as e:
            self.logger.error(f"Weather API error: {str(e)}")
            return False
        
        except QueuePublisherError as e:
            self.logger.error(f"Queue publishing error: {str(e)}")
            return False
        
        except Exception as e:
            self.logger.error(f"Unexpected error during collection: {str(e)}", exc_info=True)
            return False
    
    def run(self):
        self.logger.info("=" * 60)
        self.logger.info("Weather Collector Service Starting")
        self.logger.info("=" * 60)
        self.logger.info(f"Location: {self.settings.location_city}")
        self.logger.info(f"Coordinates: {self.settings.location_lat}, {self.settings.location_lon}")
        self.logger.info(f"Collection interval: {self.settings.collection_interval_minutes} minutes")
        self.logger.info(f"RabbitMQ queue: {self.settings.rabbitmq_queue}")
        self.logger.info("=" * 60)
        
        try:
            self.publisher.connect()
            
            self.logger.info("Starting initial data collection...")
            self.collect_and_publish()

            while self.running:
                time.sleep(60)

                if not self.running:
                    break

                if self.last_collection:
                    elapsed = (datetime.utcnow() - self.last_collection).total_seconds()
                    if elapsed >= self.settings.collection_interval_seconds:
                        self.collect_and_publish()
                
                else:
                    self.collect_and_publish()
        
        except KeyboardInterrupt:
            self.logger.info("Received keyboard interrupt")
            
        except Exception as e:
            self.logger.error(f"Fatal error in main loop: {str(e)}", exc_info=True)
            sys.exit(1)
        
        finally:
            self.shutdown()
    
    def shutdown(self) -> None:
        self.logger.info("Shutting down collector service...")
        
        try:
            self.publisher.close()
        
        except Exception as e:
            self.logger.error(f"Error during shutdown: {str(e)}")
        
        self.logger.info("Collector service stopped")
        self.logger.info("=" * 60)

def main():
    collector = WeatherCollector()
    collector.run()

if __name__ == "__main__":
    main()
