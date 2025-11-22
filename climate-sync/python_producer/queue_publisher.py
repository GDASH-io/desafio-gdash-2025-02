import pika
import json
from typing import Dict
from config import Config

class QueuePublisher:
    def __init__(self):
        self.config = Config()
        self.connection = None
        self.channel = None
        self.exchange = "weather.exchange"
        self.routing_key = "weather.data"
        self._connect()
    
    def _connect(self):
        """
        Estabelece conexão com RabbitMQ usando exchange enterprise
        """
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
            
            # Declarar exchange durável
            self.channel.exchange_declare(
                exchange=self.exchange,
                exchange_type="topic",
                durable=True,
                arguments={
        "x-expires": 86400000,   # 24h – fila só some depois disso
        "x-message-ttl": 86400000  # 24h – mensagens persistem por mais tempo
    }
            )
            
            print(f"✅ Connected to RabbitMQ via exchange '{self.exchange}'")
            
        except Exception as e:
            print(f"❌ Failed to connect to RabbitMQ: {e}")
            raise
    
    def publish(self, data: Dict) -> bool:
        """
        Publica mensagem na exchange enterprise
        """
        try:
            message = json.dumps(data)

            self.channel.basic_publish(
                exchange=self.exchange,
                routing_key=self.routing_key,
                body=message,
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Mensagem persistente
                    content_type='application/json'
                )
            )
            
            print(f"📤 Published weather data: {data['data']['temperature']}°C → {self.exchange}:{self.routing_key}")
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
