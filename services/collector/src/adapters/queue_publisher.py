import json
import logging
from typing import Optional, Any
import pika
from pika.exceptions import AMQPError

from domain.models import WeatherData

class QueuePublisherError(Exception):
    pass

class RabbitMQPublisher:
    def __init__(
            self,
            rabbitmq_url: str,
            queue_name: str,
            logger: Optional[logging.Logger] = None
    ):
        self.rabbitmq_url = rabbitmq_url
        self.queue_name = queue_name
        self.logger = logger or logging.getLogger(__name__)
        self._connection: Optional[pika.BlockingConnection] = None
        self._channel: Optional[pika.channel.Channel] = None
    
    def connect(self) -> None:
        try:
            self.logger.info(f"Connecting to RabbitMQ: {self._safe_url()}")

            parameters = pika.URLParameters(self.rabbitmq_url)
            self._connection = pika.BlockingConnection(parameters)
            self._channel = self._connection.channel()

            self._channel.queue_declare(
                queue=self.queue_name,
                durable=True,
                arguments={
                    'x-message-ttl': 86400000,
                    'x-max-length': 10000
                }
            )

            self.logger.info(
                f"Connected to RabbitMQ and queue '{self.queue_name}'"
            )

        except AMQPError as e:
            error_msg = f"Failed to connect to RabbitMQ: {str(e)}"
            self.logger.error(error_msg)
            raise QueuePublisherError(error_msg) from e
    
    def publish(self, weather_data: WeatherData) -> None:
        if not self._channel or self._channel.is_closed:
            self.logger.warning("Channel closed, reconnecting...")
            self.connect()
        
        try:
            message = weather_data.to_queue_message()
            body = json.dumps(message, ensure_ascii=False)

            self._channel.basic_publish(
                exchange='',
                routing_key=self.queue_name,
                body=body,
                properties=pika.BasicProperties(
                    delivery_mode=pika.DeliveryMode.Persistent,
                    content_type='application/json',
                    timestamp=int(weather_data.timestamp.timestamp()),
                )
            )

            self.logger.info(
                f"Weather data to queue '{self.queue_name}': "
                f"{weather_data.location.city}, {weather_data.temperature}°C"
            )
        
        except AMQPError as e:
            error_msg = f"Failed to publish message: {str(e)}"
            self.logger.error(error_msg)
            raise QueuePublisherError(error_msg) from e
        
        except (TypeError, ValueError) as e:
            error_msg = f"Failed to serialize message: {str(e)}"
            self.logger.error(error_msg)
            raise QueuePublisherError(error_msg) from e
        
    def close(self) -> None:
        try:
            if self._connection and not self._connection.is_closed:
                self._connection.close()
                self.logger.info("Closed RabbitMQ connection")
        
        except Exception as e:
            self.logger.error(f"Error closing connection: {str(e)}")
    
    def _safe_url(self) -> str:
        try:
            parts = self.rabbitmq_url.split('@')
            if len(parts) == 2:
                auth_part = parts[0].split('://')
                if len(auth_part) == 2:
                    return f"{auth_part[0]}://***:***@{parts[1]}"
        except Exception:
            pass
        return "amqp://***:***@***"
    
    def __enter__(self):
        self.connect()
        return self
    
    def __exit__(self, exc_type, exc_value, exc_tb):
        self.close()