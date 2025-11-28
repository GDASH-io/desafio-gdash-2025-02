import json
from typing import Any, Dict

import pika

from config import RabbitSettings


class RabbitPublisher:
    def __init__(self, settings: RabbitSettings):
        self.settings = settings

    def publish(self, payload: Dict[str, Any]) -> None:
        parameters = pika.ConnectionParameters(
            host=self.settings.host,
            port=self.settings.port,
            virtual_host=self.settings.vhost,
            credentials=pika.PlainCredentials(self.settings.user, self.settings.password),
        )
        connection = pika.BlockingConnection(parameters)
        try:
            channel = connection.channel()
            channel.queue_declare(queue=self.settings.queue, durable=True)
            channel.basic_publish(
                exchange="",
                routing_key=self.settings.queue,
                body=json.dumps(payload),
                properties=pika.BasicProperties(content_type="application/json", delivery_mode=2),
            )
        finally:
            connection.close()