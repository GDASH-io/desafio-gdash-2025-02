import pika
import json
from typing import Dict
from config import Config
import time

class QueuePublisher:
    def __init__(self):
        self.config = Config()
        self.connection = None
        self.channel = None
        self.exchange = "weather.exchange"
        self.routing_key = "weather.raw"  # Python envia RAW, Go processa e envia DATA
        self._connect()
    
    def _connect(self):
        try:
            # Retry logic simples na conexão
            while True:
                try:
                    credentials = pika.PlainCredentials(
                        self.config.RABBITMQ_USER,
                        self.config.RABBITMQ_PASS
                    )
                    
                    parameters = pika.ConnectionParameters(
                        host=self.config.RABBITMQ_HOST,
                        port=self.config.RABBITMQ_PORT,
                        virtual_host=self.config.RABBITMQ_VHOST,
                        credentials=credentials,
                        heartbeat=600,
                        blocked_connection_timeout=300
                    )
                    
                    self.connection = pika.BlockingConnection(parameters)
                    self.channel = self.connection.channel()
                    
                    self.channel.exchange_declare(
                        exchange=self.exchange,
                        exchange_type="topic",
                        durable=True
                    )
                    
                    print(f"✅ Connected to RabbitMQ via exchange '{self.exchange}'")
                    break
                except pika.exceptions.AMQPConnectionError:
                    print("⏳ Waiting for RabbitMQ...")
                    time.sleep(5)
            
        except Exception as e:
            print(f"❌ Failed to connect to RabbitMQ: {e}")
            raise
    
    def publish(self, data: Dict) -> bool:
        try:
            message = json.dumps(data)

            self.channel.basic_publish(
                exchange=self.exchange,
                routing_key=self.routing_key,
                body=message,
                properties=pika.BasicProperties(
                    delivery_mode=2,
                    content_type='application/json'
                )
            )
            
            print(f"📤 Published raw weather data: {data['data']['temperature']}°C → {self.exchange}:{self.routing_key}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to publish message: {e}")
            try:
                self._connect() # Tenta reconectar
            except:
                pass
            return False
    
    def close(self):
        if self.connection and not self.connection.is_closed:
            self.connection.close()
            print("🔌 Closed RabbitMQ connection")
