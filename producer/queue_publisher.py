import pika
import json
import logging
import time
from typing import Dict, Any, Optional
from config import RABBITMQ_URL, QUEUE_NAME

logger = logging.getLogger(__name__)


class QueuePublisher:
    def __init__(self):
        self.rabbitmq_url = RABBITMQ_URL
        self.queue_name = QUEUE_NAME
        self.connection = None
        self.channel = None

    def connect(self, max_retries: int = 5, retry_delay: int = 5) -> bool:
        """
        Conecta ao RabbitMQ com retry
        """
        for attempt in range(max_retries):
            try:
                parameters = pika.URLParameters(self.rabbitmq_url)
                self.connection = pika.BlockingConnection(parameters)
                self.channel = self.connection.channel()

                # Declara a queue (cria se não existir)
                self.channel.queue_declare(queue=self.queue_name, durable=True)

                logger.info(f'Conectado ao RabbitMQ na tentativa {attempt + 1}')
                return True

            except Exception as e:
                logger.warning(f'Tentativa {attempt + 1} de conexão falhou: {e}')
                if attempt < max_retries - 1:
                    time.sleep(retry_delay)
                else:
                    logger.error('Falha ao conectar ao RabbitMQ após todas as tentativas')
                    return False

        return False

    def publish(self, data: Dict[str, Any]) -> bool:
        """
        Publica mensagem na fila
        """
        if not self.channel or self.connection.is_closed:
            logger.error('Canal não está disponível. Tentando reconectar...')
            if not self.connect():
                return False

        try:
            message = json.dumps(data)
            self.channel.basic_publish(
                exchange='',
                routing_key=self.queue_name,
                body=message,
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Torna a mensagem persistente
                ),
            )

            logger.info(f'Mensagem publicada na fila {self.queue_name}')
            return True

        except Exception as e:
            logger.error(f'Erro ao publicar mensagem: {e}')
            # Tenta reconectar
            if self.connection and self.connection.is_closed:
                if self.connect():
                    return self.publish(data)
            return False

    def close(self):
        """
        Fecha a conexão
        """
        try:
            if self.connection and not self.connection.is_closed:
                self.connection.close()
                logger.info('Conexão com RabbitMQ fechada')
        except Exception as e:
            logger.error(f'Erro ao fechar conexão: {e}')

