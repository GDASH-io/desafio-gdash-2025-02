import json
import pika
from config import (
    RABBITMQ_URL, 
    QUEUE_NAME, 
    HEARTBEAT_INTERVAL,
    BLOCKED_CONNECTION_TIMEOUT,
    SOCKET_TIMEOUT,
    CONNECTION_ATTEMPTS,
    RETRY_DELAY
)


class RabbitMQClient:
    
    
    def __init__(self):
        self.connection = None
        self.channel = None
    
    def connect(self):
        
        try:
            params = pika.URLParameters(RABBITMQ_URL)
            params.heartbeat = HEARTBEAT_INTERVAL
            params.blocked_connection_timeout = BLOCKED_CONNECTION_TIMEOUT
            params.socket_timeout = SOCKET_TIMEOUT
            params.connection_attempts = CONNECTION_ATTEMPTS
            params.retry_delay = RETRY_DELAY
            
            self.connection = pika.BlockingConnection(params)
            self.channel = self.connection.channel()
            self.channel.queue_declare(queue=QUEUE_NAME, durable=True)
            print("✅ Conectado ao RabbitMQ")
            return True
        except Exception as e:
            print(f"❌ Erro ao conectar ao RabbitMQ: {e}")
            return False
    
    def is_connected(self):
        
        return self.connection and not self.connection.is_closed
    
    def process_heartbeat(self):
        
        try:
            if self.is_connected():
                self.connection.process_data_events()
                return True
        except Exception as e:
            print(f"⚠️ Erro ao processar heartbeat: {e}")
            self.close()
        return False
    
    def send_message(self, data):
        
        try:
            message = json.dumps(data)
            self.channel.basic_publish(
                exchange='',
                routing_key=QUEUE_NAME,
                body=message,
                properties=pika.BasicProperties(
                    delivery_mode=2,
                    content_type='application/json'
                )
            )
            print(f"✅ Dados enviados para a fila: {data['timestamp']}")
            return True
        except Exception as e:
            print(f"❌ Erro ao enviar para a fila: {e}")
            return False
    
    def close(self):
        
        if self.connection and not self.connection.is_closed:
            try:
                self.connection.close()
                print("✅ Conexão RabbitMQ encerrada")
            except Exception as e:
                print(f"⚠️ Erro ao fechar conexão: {e}")
        self.connection = None
        self.channel = None