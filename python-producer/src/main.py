import sys
import time
import traceback

from config.settings import WEATHER_INTERVAL
from weather.weather import get_city_coordinates, get_weather
from display.print_weather import print_weather_info
from rabbit.producer import publish_weather

def fetch_weather_cycle():
    coordinates = get_city_coordinates()
    weather = get_weather(coordinates["lat"], coordinates["lon"])
    print_weather_info(coordinates, weather)
    publish_weather(weather)
    return weather

def handle_error(error):
    print(f"❌ Error: {error}", file=sys.stderr, flush=True)
    traceback.print_exc(file=sys.stderr)

def main():
    interval = WEATHER_INTERVAL
    print(f"🚀 Weather producer started! Update interval: {interval}s ({interval/60:.1f} min)")

    while True:
        try:
            fetch_weather_cycle()
        except Exception as e:
            handle_error(e)
        finally:
            print(f"⏳ Sleeping {interval}s...")
            time.sleep(interval)

if __name__ == "__main__":
    main()
