import os
import json
import requests
import pika
import time
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()


class Collector:
    def __init__(self):
        self.RABBIT_URL = os.getenv("RABBIT_URL")
        self.LAT = None
        self.LON = None
        self.USER_ID = None
        self.connection = None
        self.channel = None
        self.location_channel = None

    def connect_rabbit(self):
        if not self.channel:
            params = pika.URLParameters(self.RABBIT_URL)
            self.connection = pika.BlockingConnection(params)
            self.channel = self.connection.channel()
            self.channel.queue_declare(queue="weather_data", durable=True)
        return self.channel

    def connect_location_queue(self):
        if not self.location_channel:
            params = pika.URLParameters(self.RABBIT_URL)
            if not self.connection or self.connection.is_closed:
                self.connection = pika.BlockingConnection(params)
            self.location_channel = self.connection.channel()
            self.location_channel.queue_declare(queue="location_data", durable=True)
        return self.location_channel

    def wait_for_location(self):
        """Escuta a fila location_data e espera receber LAT/LON e userId"""
        channel = self.connect_location_queue()
        print("[INFO] Waiting for location from RabbitMQ...")
        for method_frame, properties, body in channel.consume("location_data", inactivity_timeout=None):
            if body:
                try:
                    data = json.loads(body)
                    self.LAT = data.get("latitude")
                    self.LON = data.get("longitude")
                    self.USER_ID = data.get("userId")
                    print(f"[INFO] Received location: {self.LAT}, {self.LON}, userId: {self.USER_ID}")
                    channel.basic_ack(method_frame.delivery_tag)
                    break
                except Exception as e:
                    print(f"[ERROR] Failed to parse location: {e}")

    def fetch_weather(self):
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={self.LAT}&longitude={self.LON}&"
            f"hourly=temperature_2m,relativehumidity_2m,windspeed_10m,precipitation_probability,weathercode&"
            f"daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&"
            f"timezone=auto&past_days=7"
        )
        try:
            res = requests.get(url, timeout=10)
            res.raise_for_status()
            return res.json()
        except Exception as e:
            print(f"[ERROR] Open-Meteo request failed: {e}")
            return None

    @staticmethod
    def map_weather_code(code):
        mapping = {
            0: "clear", 1: "partly_cloudy", 2: "partly_cloudy", 3: "partly_cloudy",
            45: "fog", 48: "fog",
            51: "drizzle", 53: "drizzle", 55: "drizzle", 56: "drizzle", 57: "drizzle",
            61: "rain", 63: "rain", 65: "rain", 66: "rain", 67: "rain",
            71: "snow", 73: "snow", 75: "snow", 77: "snow",
            80: "rain_showers", 81: "rain_showers", 82: "rain_showers",
            95: "thunderstorm", 96: "thunderstorm", 99: "thunderstorm",
        }
        return mapping.get(code, "unknown")

    def prepare_all_days(self, data):
        if not data:
            return []

        daily = data.get("daily", {})
        hourly = data.get("hourly", {})
        days = daily.get("time", [])
        payloads = []

        for day in days:
            today_hourly_indices = [
                i for i, t in enumerate(hourly.get("time", [])) if t.startswith(day)
            ]
            temp_list = [hourly["temperature_2m"][i] for i in today_hourly_indices] or [0]
            humidity_list = [hourly["relativehumidity_2m"][i] for i in today_hourly_indices] or [0]
            wind_list = [hourly["windspeed_10m"][i] for i in today_hourly_indices] or [0]

            i = days.index(day)
            payload = {
                "time": day,
                "type": "all_in_one",
                "userId": self.USER_ID,
                "temperature": round(sum(temp_list) / len(temp_list), 1),
                "temp_max": round(daily["temperature_2m_max"][i], 1),
                "temp_min": round(daily["temperature_2m_min"][i], 1),
                "humidity": round(sum(humidity_list) / len(humidity_list), 1),
                "wind_speed": round(sum(wind_list) / len(wind_list), 1),
                "rain_probability": round(daily["precipitation_probability_max"][i], 1),
                "weather_code": daily["weathercode"][i],
                "sky_condition": self.map_weather_code(daily["weathercode"][i]),
            }
            payloads.append(payload)

        return payloads

    def send_one(self, payload):
        try:
            channel = self.connect_rabbit()
            channel.basic_publish(
                exchange="",
                routing_key="weather_data",
                body=json.dumps(payload),
            )
            print(f"[INFO] Sent data for {payload['time']}")
        except Exception as e:
            print(f"[ERROR] Failed to send: {e}")

    def run_loop(self):
        self.wait_for_location()
        while True:
            data = self.fetch_weather()
            payloads = self.prepare_all_days(data)
            for payload in payloads:
                self.send_one(payload)
            print("[INFO] Sleeping 5 hours...")
            time.sleep(5 * 3600)


if __name__ == "__main__":
    collector = Collector()
    collector.run_loop()
