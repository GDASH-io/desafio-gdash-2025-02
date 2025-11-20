"""
Interface do repositório para publicação no Kafka.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any


class KafkaProducerRepository(ABC):
    """Interface para publicação de mensagens no Kafka."""
    
    @abstractmethod
    def publish(self, topic: str, message: Dict[str, Any]) -> None:
        """
        Publica uma mensagem no tópico Kafka.
        
        Args:
            topic: Nome do tópico
            message: Mensagem a ser publicada
        """
        pass
    
    @abstractmethod
    def is_connected(self) -> bool:
        """
        Verifica se está conectado ao Kafka.
        
        Returns:
            True se conectado, False caso contrário
        """
        pass

