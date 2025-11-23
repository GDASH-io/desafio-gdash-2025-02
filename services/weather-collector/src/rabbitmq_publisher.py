import pika
import json
import time
from typing import Dict
from config import Config


class RabbitMQPublisher:    
    def __init__(self):
        self.connection = None
        self.channel = None
        self.max_retries = 3
        self._connect()
    
    def _connect(self):
        try:
            print(f"Conectando ao RabbitMQ...")
            
            parameters = pika.URLParameters(Config.RABBITMQ_URL)
            parameters.socket_timeout = 10
            
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()
            
            self.channel.exchange_declare(
                exchange=Config.RABBITMQ_EXCHANGE,
                exchange_type='direct',
                durable=True
            )
            
            print(f"RabbitMQ conectado (exchange: {Config.RABBITMQ_EXCHANGE})")
            
        except pika.exceptions.AMQPConnectionError as e:
            print(f"Erro ao conectar no RabbitMQ: {e}")
            raise
        except Exception as e:
            print(f"Erro inesperado ao conectar no RabbitMQ: {e}")
            raise
    
    def publish(self, weather_data: Dict) -> bool:
        if not weather_data:
            print("Erro: dados vazios não podem ser publicados")
            return False

        try:
            if self.connection is None or self.connection.is_closed:
                print("Reconectando...")
                self._connect()
            
            message_body = json.dumps(weather_data, ensure_ascii=False)
            
            self.channel.basic_publish(
                exchange=Config.RABBITMQ_EXCHANGE,
                routing_key=Config.RABBITMQ_ROUTING_KEY,
                body=message_body,
                properties=pika.BasicProperties(
                    delivery_mode=2,
                    content_type='application/json',
                    content_encoding='utf-8',
                )
            )
            
            print(f"Mensagem publicada ({Config.RABBITMQ_ROUTING_KEY})")
            
            return True
            
        except pika.exceptions.AMQPError as e:
            print(f"Erro ao publicar mensagem no RabbitMQ: {e}")
            return False
        except Exception as e:
            print(f"Erro inesperado ao publicar: {e}")
            return False
    
    def close(self):
        try:
            if self.connection and not self.connection.is_closed:
                self.connection.close()
                print("Conexão com RabbitMQ fechada")
        except Exception as e:
            print(f"Erro ao fechar conexão: {e}")
    
    def __enter__(self):
        return self
    
    def __exit__(self, _exc_type, _exc_val, _exc_tb):
        self.close()
