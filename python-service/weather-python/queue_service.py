import pika
import json
import os
from dotenv import load_dotenv

load_dotenv()

RABBIT_URL = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")

def send_to_queue(queue_name: str, data: dict):
    connection = pika.BlockingConnection(
        pika.URLParameters(RABBIT_URL)
    )
    channel = connection.channel()

    channel.queue_declare(queue=queue_name, durable=True)

    channel.basic_publish(
        exchange="",
        routing_key=queue_name,
        body=json.dumps(data),
        properties=pika.BasicProperties(delivery_mode=2)
    )

    print(f"[Python] Enviado para fila {queue_name}: {data}")

    connection.close()
