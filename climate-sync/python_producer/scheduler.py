import schedule
import time
from weather_client import WeatherClient
from queue_publisher import QueuePublisher
from config import Config

class WeatherScheduler:
    def __init__(self):
        self.weather_client = WeatherClient()
        self.queue_publisher = QueuePublisher()
        self.config = Config()
    
    def collect_and_publish(self):
        print(f"\n🌤️  Collecting weather data...")
        weather_data = self.weather_client.fetch_weather_data()
        if weather_data:
            success = self.queue_publisher.publish(weather_data)
            print("✅ Data published" if success else "⚠️ Failed to publish")
        else:
            print("⚠️ Failed to fetch weather data")
    
    def run(self):
        print("🔵 Iniciando o scheduler...")
        print(f"🚀 Weather Producer started at {self.config.LATITUDE},{self.config.LONGITUDE}")
        self.collect_and_publish()
        schedule.every(self.config.COLLECTION_INTERVAL_MINUTES).minutes.do(self.collect_and_publish)
        try:
            while True:
                schedule.run_pending()
                time.sleep(1)
        except KeyboardInterrupt:
            print("⏹️ Shutting down...")
            self.queue_publisher.close()

if __name__ == "__main__":
    scheduler = WeatherScheduler()
    scheduler.run()
