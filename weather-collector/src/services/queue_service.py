import json
import time
import logging
import pika
from typing import Tuple, Optional, Dict, Any
from ..config.settings import RabbitMQConfig, CollectorConfig

logger = logging.getLogger(__name__)


class QueueService:
    def __init__(self):
        self.config = RabbitMQConfig()
        self.collector_config = CollectorConfig()
        self.connection: Optional[pika.BlockingConnection] = None
        self.channel: Optional[pika.channel.Channel] = None
        self._lock = False  # Simple flag to prevent concurrent reconnection attempts

    def is_connected(self) -> bool:
        """Verifica se a conexão está ativa e válida"""
        try:
            if self.connection is None or self.channel is None:
                return False
            if self.connection.is_closed or self.channel.is_closed:
                return False
            # Tenta verificar o status do canal
            self.channel.queue_declare(queue=self.config.QUEUE, durable=True, passive=True)
            return True
        except Exception:
            return False

    def connect(self, force: bool = False) -> Tuple[pika.BlockingConnection, pika.channel.Channel]:
        """Conecta ao RabbitMQ com retry automático"""
        # Se já está conectado e não é forçado, retorna a conexão existente
        if not force and self.is_connected():
            return self.connection, self.channel

        # Fecha conexões antigas se existirem
        self.close()

        for attempt in range(self.collector_config.MAX_RETRIES):
            try:
                credentials = pika.PlainCredentials(
                    self.config.USER,
                    self.config.PASS
                )
                parameters = pika.ConnectionParameters(
                    host=self.config.HOST,
                    port=self.config.PORT,
                    credentials=credentials,
                    heartbeat=600,
                    blocked_connection_timeout=300,
                    connection_attempts=3,
                    retry_delay=2
                )
                
                connection = pika.BlockingConnection(parameters)
                channel = connection.channel()
                
                channel.queue_declare(queue=self.config.QUEUE, durable=True)
                
                self.connection = connection
                self.channel = channel
                
                logger.info("Conectado ao RabbitMQ com sucesso")
                return connection, channel
                
            except Exception as e:
                logger.warning(
                    f"Tentativa {attempt + 1}/{self.collector_config.MAX_RETRIES} "
                    f"de conexão ao RabbitMQ falhou: {e}"
                )
                if attempt < self.collector_config.MAX_RETRIES - 1:
                    time.sleep(self.collector_config.RETRY_DELAY)
                else:
                    logger.error(
                        "Não foi possível conectar ao RabbitMQ após várias tentativas"
                    )
                    raise

    def send_message(self, data: Dict[str, Any]) -> bool:
        """Envia mensagem para a fila com reconexão automática"""
        max_retries = 5
        for attempt in range(max_retries):
            try:
                # Verifica e reconecta se necessário antes de cada tentativa
                if not self.is_connected():
                    logger.info(f"Reconectando ao RabbitMQ (tentativa {attempt + 1}/{max_retries})...")
                    try:
                        self.connect(force=True)
                    except Exception as reconnect_error:
                        logger.warning(f"Erro ao reconectar: {reconnect_error}")
                        if attempt < max_retries - 1:
                            time.sleep(3)
                            continue
                        else:
                            logger.error("Falha ao reconectar após múltiplas tentativas")
                            return False
                
                message = json.dumps(data)
                self.channel.basic_publish(
                    exchange='',
                    routing_key=self.config.QUEUE,
                    body=message,
                    properties=pika.BasicProperties(
                        delivery_mode=2,  # Torna a mensagem persistente
                        content_type='application/json'
                    )
                )
                logger.info(f"Dados enviados para a fila {self.config.QUEUE} com sucesso")
                return True
                
            except (pika.exceptions.ConnectionClosed, 
                    pika.exceptions.StreamLostError,
                    pika.exceptions.ChannelClosed,
                    pika.exceptions.AMQPConnectionError) as e:
                logger.warning(f"Erro de conexão ao enviar dados (tentativa {attempt + 1}/{max_retries}): {e}")
                # Marca conexão como inválida
                if self.connection:
                    try:
                        self.connection.close()
                    except:
                        pass
                self.connection = None
                self.channel = None
                
                if attempt < max_retries - 1:
                    wait_time = min(3 * (attempt + 1), 10)  # Backoff exponencial limitado a 10s
                    logger.info(f"Aguardando {wait_time}s antes de tentar novamente...")
                    time.sleep(wait_time)
                else:
                    logger.error(f"Falha ao enviar dados após {max_retries} tentativas")
                    return False
                    
            except Exception as e:
                logger.error(f"Erro inesperado ao enviar dados para a fila: {e}", exc_info=True)
                if attempt < max_retries - 1:
                    time.sleep(2)
                else:
                    return False
        return False

    def close(self):
        """Fecha a conexão com RabbitMQ"""
        try:
            if self.channel and not self.channel.is_closed:
                self.channel.close()
        except Exception as e:
            logger.debug(f"Erro ao fechar canal: {e}")
        
        try:
            if self.connection and not self.connection.is_closed:
                self.connection.close()
                logger.info("Conexão com RabbitMQ fechada")
        except Exception as e:
            logger.debug(f"Erro ao fechar conexão: {e}")
        
        self.connection = None
        self.channel = None

