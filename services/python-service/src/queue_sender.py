import os
import json
import pika as pk
from src.weather import get_time_info


def connect_rmq():
    credentials = pk.PlainCredentials(os.getenv('RABBITMQ_USER'), os.getenv('RABBITMQ_PASSWORD'))
    parameters = pk.ConnectionParameters(host='rabbitmq', port=5672, virtual_host='/', credentials=credentials)
    
    connection = pk.BlockingConnection(parameters)
    channel = connection.channel() 
    channel.exchange_declare(exchange='weather_exchange', exchange_type='direct', durable=True)
    queue = channel.queue_declare(queue='weather', durable=True)
    channel.queue_bind(queue='weather', exchange='weather_exchange', routing_key='weather_routing_key')
    print("Debug: conectado a RabbitMQ")
    return connection, channel


def publish_message(channel):
    data = get_time_info()
    print(f"Debug: dados obtidos {data}")
    channel.basic_publish(
        exchange='weather_exchange',
        routing_key='weather_routing_key',
        body=json.dumps(data).encode('utf-8'),
        properties=pk.BasicProperties(content_type='application/json', delivery_mode=2)
    )
    print("Debug: mensagem publicada em RabbitMQ")