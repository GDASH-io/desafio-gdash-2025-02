import json
import os
import time
import requests
import pika
import sys
from typing import Dict, Any

class WeatherWorker:
    def __init__(self):
        self.api_base_url = os.getenv('API_BASE_URL', 'http://api:3000')
        self.rabbitmq_url = os.getenv('RABBITMQ_URL', 'amqp://guest:guest@rabbitmq:5672/')
        self.max_retries = 3
        self.retry_delay = 5
        print(f"Weather Worker initialized with API: {self.api_base_url}")
        print(f"RabbitMQ URL: {self.rabbitmq_url}")
        sys.stdout.flush()
        
    def setup_rabbitmq(self):
        """Setup RabbitMQ connection"""
        try:
            print("Attempting to connect to RabbitMQ...")
            sys.stdout.flush()
            connection = pika.BlockingConnection(pika.URLParameters(self.rabbitmq_url))
            channel = connection.channel()
            
            # Declare queue
            channel.queue_declare(queue='weather_data', durable=True)
            print("Successfully connected to RabbitMQ and declared queue")
            sys.stdout.flush()
            
            return connection, channel
        except Exception as e:
            print(f"Error connecting to RabbitMQ: {e}")
            sys.stdout.flush()
            time.sleep(5)
            return self.setup_rabbitmq()
    
    def send_to_api(self, data):
        """Send data to API with retry mechanism"""
        for attempt in range(self.max_retries):
            try:
                print(f"Attempting to send data to API (attempt {attempt + 1}/{self.max_retries})")
                sys.stdout.flush()
                response = requests.post(
                    f"{self.api_base_url}/api/weather/logs",
                    json=data,
                    headers={'Content-Type': 'application/json'},
                    timeout=10
                )
                
                if response.status_code == 201:
                    return True, f"Successfully sent weather data for {data.get('city')}"
                else:
                    return False, f"API returned status code: {response.status_code}"
                    
            except requests.exceptions.ConnectionError as e:
                print(f"Connection error (attempt {attempt + 1}): {e}")
                sys.stdout.flush()
                if attempt < self.max_retries - 1:
                    print(f"Waiting {self.retry_delay} seconds before retry...")
                    sys.stdout.flush()
                    time.sleep(self.retry_delay)
                else:
                    return False, f"Failed to connect after {self.max_retries} attempts"
                    
            except Exception as e:
                print(f"Unexpected error (attempt {attempt + 1}): {e}")
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay)
                else:
                    return False, f"Unexpected error: {e}"
        
        return False, "Max retries exceeded"

    def process_weather_data(self, ch, method, properties, body):
        """Process weather data message"""
        try:
            data = json.loads(body)
            print(f"Processing weather data for {data.get('city', 'unknown')}")
            
            success, message = self.send_to_api(data)
            
            if success:
                print(message)
                ch.basic_ack(delivery_tag=method.delivery_tag)
            else:
                print(f"Failed to send weather data: {message}")
                # Requeue message but with a delay to avoid tight loop
                time.sleep(30)  # Wait 30 seconds before requeuing
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
                
        except Exception as e:
            print(f"Error processing weather data: {e}")
            # Requeue message
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)
    
    def start(self):
        """Start the worker"""
        print("Starting Weather Worker...")
        sys.stdout.flush()
        
        while True:
            try:
                connection, channel = self.setup_rabbitmq()
                
                # Set up consumer
                channel.basic_qos(prefetch_count=1)
                channel.basic_consume(
                    queue='weather_data',
                    on_message_callback=self.process_weather_data
                )
                
                print("Worker started. Waiting for messages...")
                sys.stdout.flush()
                channel.start_consuming()
                
            except KeyboardInterrupt:
                print("Worker stopped by user")
                break
            except Exception as e:
                print(f"Worker error: {e}")
                time.sleep(5)
                print("Restarting worker...")

if __name__ == "__main__":
    worker = WeatherWorker()
    worker.start()