import json
import time
import pika

from config.settings import (
    RABBITMQ_HOST,
    RABBITMQ_PORT,
    RABBITMQ_USER,
    RABBITMQ_PASSWORD,
    RABBITMQ_QUEUE
)

def publish_weather(message: dict, max_retries=5, retry_delay=5):
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
    
    for attempt in range(max_retries):
        try:
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host=RABBITMQ_HOST,
                    port=RABBITMQ_PORT,
                    credentials=credentials
                )
            )
            channel = connection.channel()

            channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)

            channel.basic_publish(
                exchange="",
                routing_key=RABBITMQ_QUEUE,
                body=json.dumps(message, ensure_ascii=False),
                properties=pika.BasicProperties(
                    delivery_mode=pika.spec.PERSISTENT_DELIVERY_MODE
                )
            )

            connection.close()
            print(f"✅ Weather data published to RabbitMQ queue: {RABBITMQ_QUEUE}")
            return
        except (pika.exceptions.AMQPConnectionError, OSError) as e:
            if attempt < max_retries - 1:
                print(f"⚠️  Failed to connect to RabbitMQ (attempt {attempt + 1}/{max_retries}). Retrying in {retry_delay}s...")
                time.sleep(retry_delay)
            else:
                raise Exception(f"Failed to connect to RabbitMQ after {max_retries} attempts: {e}")