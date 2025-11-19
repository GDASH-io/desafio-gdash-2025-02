from weather import get_city_coordinates, get_weather
from display import print_weather_info
import sys
import time
import traceback
import os

def get_interval():
    return int(os.getenv("WEATHER_INTERVAL", "3600"))

def fetch_and_display_weather():
    print("\n📡 Fetching weather data...", flush=True)
    coordinates = get_city_coordinates()
    weather = get_weather(coordinates["lat"], coordinates["lon"])
    print_weather_info(coordinates, weather)

def handle_error(error):
    print(f"❌ Error: {str(error)}", file=sys.stderr, flush=True)
    traceback.print_exc(file=sys.stderr)
    sys.stderr.flush()

def main():
    interval = get_interval()
    
    print("🚀 Weather producer started!", flush=True)
    print(f"⏰ Update interval: {interval}s ({interval/60:.1f} minutes)", flush=True)
    
    while True:
        try:
            fetch_and_display_weather()
            print(f"⏳ Waiting {interval}s ({interval/60:.1f} minutes) until next update...", flush=True)
        except Exception as e:
            handle_error(e)
        
        time.sleep(interval)

if __name__ == "__main__":
    main()