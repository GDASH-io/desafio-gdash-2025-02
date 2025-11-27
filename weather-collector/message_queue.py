import os
import json
import logging
import pika
from pika.exceptions import AMQPConnectionError, AMQPChannelError

logger = logging.getLogger(__name__)

class MessageQueue:
    def __init__(self):
        self.rabbitmq_url = os.getenv('RABBITMQ_URL', 'amqp://admin:password123@localhost:5672')
        self.queue_name = 'weather_data'
        self.connection = None
        self.channel = None
        self.connect()
    
    def connect(self):
        """Connect to RabbitMQ"""
        max_retries = 5
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                # Parse connection URL
                parameters = pika.URLParameters(self.rabbitmq_url)
                
                # Establish connection
                self.connection = pika.BlockingConnection(parameters)
                self.channel = self.connection.channel()
                
                # Declare queue (create if doesn't exist)
                self.channel.queue_declare(queue=self.queue_name, durable=True)
                
                logger.info("Connected to RabbitMQ successfully")
                return
                
            except (AMQPConnectionError, AMQPChannelError) as e:
                retry_count += 1
                wait_time = 2 ** retry_count  # Exponential backoff
                logger.warning(f"Failed to connect to RabbitMQ (attempt {retry_count}/{max_retries}): {str(e)}")
                
                if retry_count < max_retries:
                    logger.info(f"Retrying in {wait_time} seconds...")
                    import time
                    time.sleep(wait_time)
                else:
                    logger.error("Max retries reached. Could not connect to RabbitMQ")
                    raise
    
    def send_weather_data(self, weather_data):
        """Send weather data to the queue"""
        try:
            if not self.connection or self.connection.is_closed:
                self.connect()
            
            # Convert data to JSON
            message = json.dumps(weather_data)
            
            # Publish message
            self.channel.basic_publish(
                exchange='',
                routing_key=self.queue_name,
                body=message,
                properties=pika.BasicProperties(
                    delivery_mode=2,  # Make message persistent
                    content_type='application/json'
                )
            )
            
            logger.info(f"Weather data sent to queue: {weather_data['city']}")
            
        except Exception as e:
            logger.error(f"Error sending weather data to queue: {str(e)}")
            # Try to reconnect on next send
            self.connection = None
            self.channel = None
            raise
    
    def close(self):
        """Close the connection"""
        try:
            if self.connection and not self.connection.is_closed:
                self.connection.close()
                logger.info("RabbitMQ connection closed")
        except Exception as e:
            logger.error(f"Error closing RabbitMQ connection: {str(e)}")