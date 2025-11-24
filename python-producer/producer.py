# python-producer/producer.py
import os
import json
import time
import pika

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
QUEUE = os.getenv("RABBITMQ_QUEUE", "weather_queue")

params = pika.URLParameters(RABBITMQ_URL)
connection = pika.BlockingConnection(params)
channel = connection.channel()
channel.queue_declare(queue=QUEUE, durable=True)

payload = {
    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    "temperature_c": 25.0,
    "humidity_pct": 60,
    "wind_kph": 5.2,
    "condition": "clear",
    "source": "producer-test"
}

channel.basic_publish(
    exchange="",
    routing_key=QUEUE,
    body=json.dumps(payload),
    properties=pika.BasicProperties(delivery_mode=2)  # persistent
)

print("Published test message to", QUEUE)
connection.close()
