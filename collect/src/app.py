import requests
from requests.exceptions import HTTPError, Timeout
import os
from dotenv import load_dotenv
import time
import pika

load_dotenv()
api_url = "https://api.open-meteo.com/v1/forecast?latitude=-19.4658&longitude=-44.2467&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,precipitation_hours,uv_index_max,sunshine_duration,sunrise,sunset,wind_gusts_10m_max,relative_humidity_2m_max,temperature_2m_mean,cape_max,cloud_cover_mean&hourly=temperature_2m,precipitation_probability,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_gusts_10m,relative_humidity_2m,visibility&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation,weather_code,cloud_cover&past_days=14&forecast_days=16"
rabbitmq_host = os.getenv("RABBITMQ_HOST")
rabbitmq_user = os.getenv("RABBITMQ_USER")
rabbitmq_pass = os.getenv("RABBITMQ_PASS")
rabbitmq_queue_name = os.getenv("RABBITMQ_QUEUE_NAME")
main_sleep_time = int(os.getenv("SLEEP_TIME"))
error_retry_time = int(os.getenv("ERROR_RETRY_TIME"))

connection = pika.BlockingConnection(pika.ConnectionParameters(host=rabbitmq_host, credentials=pika.credentials.PlainCredentials(rabbitmq_user, rabbitmq_pass), heartbeat=3600, connection_attempts=10, retry_delay=5))
channel = connection.channel()
channel.queue_declare(rabbitmq_queue_name, durable=True)

sleep_time = main_sleep_time
while True:
  try:
    response = requests.get(api_url)
    response.raise_for_status()
    channel.basic_publish(exchange="", routing_key=rabbitmq_queue_name, body=response.text)
    print("Dados enviados com sucesso!")
    sleep_time = main_sleep_time
  except HTTPError:
    print("A requisicao retornou status error")
    sleep_time = error_retry_time
  except Timeout:
    print("A requisicao demorou demais e expirou")
    sleep_time = error_retry_time
  except Exception as e:
    print(f"Error: {e}")
    sleep_time = error_retry_time

  time.sleep(sleep_time)

connection.close()