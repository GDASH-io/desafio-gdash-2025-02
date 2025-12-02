import json
import pika
from src.config import Config

class RabbitMQPublisher:
    def __init__(self):
        self.credentials = pika.PlainCredentials(Config.RABBITMQ_USER, Config.RABBITMQ_PASS)
        self.params = pika.ConnectionParameters(
            host=Config.RABBITMQ_HOST, 
            port=Config.RABBITMQ_PORT, 
            credentials=self.credentials
        )

    def publish(self, payload: dict):
        """Conecta e publica uma mensagem na fila"""
        connection = None
        try:
            connection = pika.BlockingConnection(self.params)
            channel = connection.channel()
            
            # Garante que a fila existe (durable=True salva no disco)
            channel.queue_declare(queue=Config.QUEUE_NAME, durable=True)
            
            message = json.dumps(payload)
            
            channel.basic_publish(
                exchange='',
                routing_key=Config.QUEUE_NAME,
                body=message,
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Persistência da mensagem
                )
            )
            print(f" [x] Enviado para fila: Temp {payload['temperature']}°C")
            
        except Exception as e:
            print(f"[Erro RabbitMQ] Falha ao publicar: {e}")
        finally:
            if connection and connection.is_open:
                connection.close()