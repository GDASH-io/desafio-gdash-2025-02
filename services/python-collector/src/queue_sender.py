import os
import json
import pika as pk
from src.weather import get_time_info
from dotenv import load_dotenv

load_dotenv()

credentials = pk.PlainCredentials(os.getenv('RABBITMQ_USER'), os.getenv('RABBITMQ_PASSWORD'))
parameters = pk.ConnectionParameters(host='rabbitmq', port=5672, virtual_host='/', credentials=credentials)


def connect_rmq():
    connection = pk.BlockingConnection(parameters)
    channel = connection.channel() 
    channel.exchange_declare(exchange='weather_exchange', exchange_type='direct', durable=True)
    queue = channel.queue_declare(queue='weather', durable=True)
    channel.queue_bind(queue='weather', exchange='weather_exchange', routing_key='weather_routing_key')
    return connection, channel


def publish_message(channel):
    data = get_time_info()
    channel.basic_publish(
        exchange='weather_exchange',
        routing_key='weather_routing_key',
        body=json.dumps(data).encode('utf-8'),
        properties=pk.BasicProperties(content_type='application/json', delivery_mode=2)
    )