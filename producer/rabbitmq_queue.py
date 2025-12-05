import pika
import json
import config

def send_to_queue(message: dict):
    connection = pika.BlockingConnection(pika.ConnectionParameters(config.BROKER_HOST))
    channel = connection.channel()
    channel.queue_declare(queue=config.BROKER_QUEUE, durable=True)
    channel.basic_publish(
        exchange="",
        routing_key=config.BROKER_QUEUE,
        body=json.dumps(message),
        properties=pika.BasicProperties(delivery_mode=2)  # persistir mensagem
    )
    connection.close()
