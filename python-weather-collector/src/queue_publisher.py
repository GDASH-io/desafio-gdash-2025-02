import pika
import json
import time
from typing import Dict, Any
from src.config import Config

class QueuePublisher:
    """Publicador de mensagens para uma fila RabbitMQ."""

    def __init__(self):
        self.host = Config.RABBITMQ_HOST
        self.port = getattr(Config, "RABBITMQ_PORT", 5672)  # Adiciona o atributo port
        self.user = Config.RABBITMQ_USER
        self.password = getattr(Config, "RABBITMQ_PASSWORD", getattr(Config, "RABBITMQ_PASS", ""))
        self.queue_name = Config.RABBITMQ_QUEUE
        self.connection = None
        self.channel = None

    def connect(self, retries: int = 12, delay: int = 5) -> bool:
        """Estabelece a conexão com o RabbitMQ e declara a fila.
        
        Returns:
            bool: True se a conexão for bem-sucedida, False caso contrário.
        """

        credentials = pika.PlainCredentials(self.user, self.password)
        parameters = pika.ConnectionParameters(
            host=self.host,
            port=self.port,
            credentials=credentials,
            heartbeat=600,
            blocked_connection_timeout=300
        )
        for attempt in range(1, retries + 1):
            try:
                self.connection = pika.BlockingConnection(parameters)
                self.channel = self.connection.channel()
                self.channel.queue_declare(queue=self.queue_name, durable=True)
                print(f"✅ Conectado ao RabbitMQ em {self.host}:{self.port} (tentativa {attempt})")
                print(f"📦 Fila declarada: {self.queue_name}")
                return True
            except Exception as e:
                print(f"⚠️  Tentativa {attempt}/{retries} de conectar ao RabbitMQ falhou: {repr(e)}")
                time.sleep(delay)
        print("❌ Erro: não foi possível conectar ao RabbitMQ após múltiplas tentativas.")
        return False
        
    def publish_message(self, message: Dict[str, Any]) -> bool:
        """Publica uma mensagem na fila RabbitMQ.

        Args:
            message (Dict[str, Any]): A mensagem a ser publicada.

        Returns:
            bool: True se a mensagem for publicada com sucesso, False caso contrário.
        """

        if not self.channel:
            print("❌ Canal não está aberto. Conecte-se primeiro.")
            return False

        try:
            message_body = json.dumps(message)

            self.channel.basic_publish(
                exchange='',
                routing_key=self.queue_name,
                body=message_body,
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Torna a mensagem persistente
                )
            )

            print(f"✅ Mensagem publicada na fila '{self.queue_name}': {message_body}")
            return True
        
        except Exception as e:
            print(f"❌ Falha ao publicar mensagem: {e}")
            return False
        
    def close_connection(self) -> None:
        """Fecha a conexão com o RabbitMQ."""
        if self.connection and not self.connection.is_closed:
            self.connection.close()
            print(f"🔌 Conexão com RabbitMQ fechada: {self.connection}")