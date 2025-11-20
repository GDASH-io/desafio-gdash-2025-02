"""
Implementação do Kafka Producer.
"""
import json
import logging
from typing import Dict, Any, List
from kafka import KafkaProducer
from kafka.errors import KafkaError
from src.domain.repositories.kafka_producer import KafkaProducerRepository
from src.shared.config import Config

logger = logging.getLogger("collector")


class KafkaProducerImpl(KafkaProducerRepository):
    """Implementação do Kafka Producer usando kafka-python."""
    
    def __init__(
        self,
        bootstrap_servers: str = None,
        topic: str = None,
    ):
        """
        Inicializa o Kafka Producer.
        
        Args:
            bootstrap_servers: Servidores Kafka (padrão: Config.KAFKA_BOOTSTRAP_SERVERS)
            topic: Tópico padrão (padrão: Config.KAFKA_TOPIC_RAW)
        """
        self.bootstrap_servers = (
            bootstrap_servers or Config.KAFKA_BOOTSTRAP_SERVERS
        ).split(",")
        self.default_topic = topic or Config.KAFKA_TOPIC_RAW
        
        try:
            self.producer = KafkaProducer(
                bootstrap_servers=self.bootstrap_servers,
                value_serializer=lambda v: json.dumps(v, default=str).encode("utf-8"),
                retries=5,
                acks="all",
                request_timeout_ms=30000,
            )
            logger.info(
                "Kafka Producer inicializado",
                extra={"context": {"bootstrap_servers": self.bootstrap_servers}},
            )
        except Exception as e:
            logger.error(f"Erro ao inicializar Kafka Producer: {e}")
            raise
    
    def publish(self, topic: str, message: Dict[str, Any]) -> None:
        """
        Publica uma mensagem no tópico Kafka.
        
        Args:
            topic: Nome do tópico
            message: Mensagem a ser publicada
        
        Raises:
            KafkaError: Em caso de erro na publicação
        """
        try:
            future = self.producer.send(topic, message)
            # Aguardar confirmação
            record_metadata = future.get(timeout=10)
            
            logger.info(
                "Mensagem publicada no Kafka",
                extra={
                    "context": {
                        "topic": record_metadata.topic,
                        "partition": record_metadata.partition,
                        "offset": record_metadata.offset,
                    }
                },
            )
        
        except KafkaError as e:
            logger.error(f"Erro ao publicar mensagem no Kafka: {e}")
            raise
    
    def publish_to_default_topic(self, message: Dict[str, Any]) -> None:
        """
        Publica mensagem no tópico padrão.
        
        Args:
            message: Mensagem a ser publicada
        """
        self.publish(self.default_topic, message)
    
    def is_connected(self) -> bool:
        """
        Verifica se está conectado ao Kafka.
        
        Returns:
            True se conectado, False caso contrário
        """
        try:
            # Tentar obter metadados dos tópicos
            metadata = self.producer.list_topics(timeout=5)
            return True
        except Exception as e:
            logger.warning(f"Kafka não está conectado: {e}")
            return False
    
    def close(self) -> None:
        """Fecha a conexão com o Kafka."""
        if self.producer:
            self.producer.close()
            logger.info("Kafka Producer fechado")

