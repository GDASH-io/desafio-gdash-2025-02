import json
import pika
from config import (
    RABBITMQ_HOST, 
    RABBITMQ_PORT, 
    RABBITMQ_USER, 
    RABBITMQ_PASS, 
    RABBITMQ_QUEUE
)


class QueueSender:
    def __init__(self):
        self.host = RABBITMQ_HOST
        self.port = RABBITMQ_PORT
        self.queue_name = RABBITMQ_QUEUE
        self.connection = None
        self.channel = None
        
        
        self._connect()
    
    def _connect(self):
        try:
            print(f"Conectando ao RabbitMQ em {self.host}:{self.port}...")
            
            credentials = pika.PlainCredentials(
                RABBITMQ_USER,
                RABBITMQ_PASS
            )
            
            parameters = pika.ConnectionParameters(
                host=self.host,
                port=self.port,
                credentials=credentials,
                heartbeat=600,                    
                blocked_connection_timeout=300    
            )
            
            self.connection = pika.BlockingConnection(parameters)
            self.channel = self.connection.channel()
            
            self.channel.queue_declare(
                queue=self.queue_name,
                durable=True
            )
            
            print(f"Conectado ao RabbitMQ! Fila: {self.queue_name}")
            
        except pika.exceptions.AMQPConnectionError as e:
            print(f"Erro de conexão com RabbitMQ: {e}")
            raise
        except Exception as e:
            print(f"Erro ao configurar RabbitMQ: {e}")
            raise
    
    def send_message(self, data):
        try:
            message = json.dumps(data, ensure_ascii=False, indent=2)
            
            self.channel.basic_publish(
                exchange='',                    
                routing_key=self.queue_name,    
                body=message,
                properties=pika.BasicProperties(
                    delivery_mode=2,            
                    content_type='application/json'
                )
            )
            
            print(f"Mensagem enviada para a fila '{self.queue_name}'")
            return True
            
        except pika.exceptions.AMQPError as e:
            print(f"Erro ao enviar mensagem: {e}")
            return False
        except Exception as e:
            print(f"Erro inesperado ao enviar: {e}")
            return False
    
    def close(self):
        try:
            if self.connection and not self.connection.is_closed:
                self.connection.close()
                print("Conexão com RabbitMQ fechada")
        except Exception as e:
            print(f"Erro ao fechar conexão: {e}")