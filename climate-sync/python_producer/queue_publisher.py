import pika
import json
from typing import Dict
from config import Config

class QueuePublisher:
    def __init__(self):
        self.config = Config()
        self.connection = None
        self.channel = None
        self._connect()
    
    def _connect(self):
        """
        Estabelece conexão com RabbitMQ
        """
        try:
            credentials = pika.PlainCredentials(
                self.config.RABBITMQ_USER,
                self.config.RABBITMQ_PASS
            )
            
            parameters = pika.ConnectionParameters(
                host=self.config.RABBITMQ_HOST,
                port=self.config.RABBITMQ_PORT,
                credentials=credentials,
                heartbeat=600,
                blocked_connection_timeout=300
            )
            
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()
            
            # Declara a fila (idempotente)
            self.channel.queue_declare(
                queue=self.config.RABBITMQ_QUEUE,
                durable=True
            )
            
            print(f"✅ Connected to RabbitMQ at {self.config.RABBITMQ_HOST}")
            
        except Exception as e:
            print(f"❌ Failed to connect to RabbitMQ: {e}")
            raise
    
    def publish(self, data: Dict) -> bool:
        """
        Publica mensagem na fila
        """
        try:
            message = json.dumps(data)
            
            self.channel.basic_publish(
                exchange='',
                routing_key=self.config.RABBITMQ_QUEUE,
                body=message,
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Mensagem persistente
                    content_type='application/json'
                )
            )
            
            print(f"📤 Published weather data: {data['data']['temperature']}°C at {data['timestamp']}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to publish message: {e}")
            self._reconnect()
            return False
    
    def _reconnect(self):
        """
        Reconecta em caso de falha
        """
        try:
            if self.connection and not self.connection.is_closed:
                self.connection.close()
        except:
            pass
        
        self._connect()
    
    def close(self):
        """
        Fecha conexão
        """
        if self.connection and not self.connection.is_closed:
            self.connection.close()
            print("🔌 Closed RabbitMQ connection")