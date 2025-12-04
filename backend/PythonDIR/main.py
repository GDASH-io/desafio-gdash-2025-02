import openmeteo_requests

import pandas as pd
import requests_cache
from retry_requests import retry

import pika
import json
import time
import os

cache_session = requests_cache.CachedSession('.cache', expire_after = 3600)
retry_session = retry(cache_session, retries = 5, backoff_factor = 0.2)
openmeteo = openmeteo_requests.Client(session = retry_session)

url = "https://api.open-meteo.com/v1/forecast"
params = {
	"latitude": -21.1306,
	"longitude": -42.3664,
	"daily": ["sunrise", "sunset", "daylight_duration", "sunshine_duration"],
	"hourly": ["temperature_2m", "relative_humidity_2m", "rain",  "sunshine_duration", "precipitation_probability", "cloud_cover"],
	"timezone": "America/Sao_Paulo",
	"forecast_days": 1,
}
responses = openmeteo.weather_api(url, params=params)

response = responses[0]
print(f"Coordinates: {response.Latitude()}°N {response.Longitude()}°E")
print(f"Elevation: {response.Elevation()} m asl")
print(f"Timezone: {response.Timezone()}{response.TimezoneAbbreviation()}")
print(f"Timezone difference to GMT+0: {response.UtcOffsetSeconds()}s")

hourly = response.Hourly()
hourly_temperature_2m = hourly.Variables(0).ValuesAsNumpy()
hourly_relative_humidity_2m = hourly.Variables(1).ValuesAsNumpy()
hourly_rain = hourly.Variables(2).ValuesAsNumpy()
hourly_sunshine_duration = hourly.Variables(3).ValuesAsNumpy()
hourly_precipitation_probability = hourly.Variables(4).ValuesAsNumpy()
hourly_cloud_cover = hourly.Variables(5).ValuesAsNumpy()

hourly_data = {"date": pd.date_range(
	start = pd.to_datetime(hourly.Time(), unit = "s", utc = True),
	end =  pd.to_datetime(hourly.TimeEnd(), unit = "s", utc = True),
	freq = pd.Timedelta(seconds = hourly.Interval()),
	inclusive = "left"
)}

hourly_data["temperature_2m"] = hourly_temperature_2m
hourly_data["relative_humidity_2m"] = hourly_relative_humidity_2m
hourly_data["rain"] = hourly_rain
hourly_data["sunshine_duration"] = hourly_sunshine_duration
hourly_data["precipitation_probability"] = hourly_precipitation_probability
hourly_data["cloud_cover"] = hourly_cloud_cover

hourly_dataframe = pd.DataFrame(data = hourly_data)
print("\nHourly data\n", hourly_dataframe)

daily = response.Daily()
daily_sunrise = daily.Variables(0).ValuesInt64AsNumpy()
daily_sunset = daily.Variables(1).ValuesInt64AsNumpy()
daily_daylight_duration = daily.Variables(2).ValuesAsNumpy()
daily_sunshine_duration = daily.Variables(3).ValuesAsNumpy()

daily_data = {"date": pd.date_range(
	start = pd.to_datetime(daily.Time(), unit = "s", utc = True),
	end =  pd.to_datetime(daily.TimeEnd(), unit = "s", utc = True),
	freq = pd.Timedelta(seconds = daily.Interval()),
	inclusive = "left"
)}

daily_data["sunrise"] = daily_sunrise
daily_data["sunset"] = daily_sunset
daily_data["daylight_duration"] = daily_daylight_duration
daily_data["sunshine_duration"] = daily_sunshine_duration

daily_dataframe = pd.DataFrame(data = daily_data)
print("\nDaily data\n", daily_dataframe)

RABBITMQ_URL = os.getenv("RABBITMQ_URL")
QUEUE_NAME = os.getenv("QUEUE_NAME")
MAX_RETRIES = 10
RETRY_DELAY = 5

def sendToQueue(payload: dict):
    message = json.dumps(payload)

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            print(f"Tentando conectar ao RabbitMQ... tentativa {attempt}/{MAX_RETRIES}")

            connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
            channel = connection.channel()

            channel.queue_declare(queue=QUEUE_NAME, durable=True)

            channel.basic_publish(
                exchange='',
                routing_key=QUEUE_NAME,
                body=message,
                properties=pika.BasicProperties(delivery_mode=2)
            )

            print(f"Mensagem enviada com sucesso: {message[:60]}...")
            connection.close()
            return

        except Exception as e:
            print(f"Erro ao enviar para RabbitMQ: {e}")

            if attempt == MAX_RETRIES:
                print("❌ Erro crítico: não foi possível conectar ao RabbitMQ após várias tentativas.")
                return

            print(f"Aguardando {RETRY_DELAY}s antes de tentar novamente...")
            time.sleep(RETRY_DELAY)
    
def formatWeatherData():
    now = pd.Timestamp.now(tz="America/Sao_Paulo")
    idx = (hourly_dataframe["date"] - now).abs().idxmin()
    print(f"olha isso --->> {idx}")
    latest = hourly_dataframe.iloc[idx]
    day = daily_dataframe.iloc[0]
    allInfo = hourly_dataframe.to_dict()
    
    payload = {
		"cityName":"Muriaé",
		"tempture":float(latest["temperature_2m"]),
		"rain":float(latest["precipitation_probability"]),
		"humidity":float(latest["relative_humidity_2m"]),
		"sun":float(day["sunset"]),
		"allTemp":str(allInfo["temperature_2m"]),
		"cloud":float(latest["cloud_cover"])
	}
    print("saí")
    
    return payload

while True:
    weatherJson = formatWeatherData()
    sendToQueue(weatherJson)
    print("timelapse: 20min")
    time.sleep(1200)