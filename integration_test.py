import requests
import pika
import json
import time
import os

# Configuration
BACKEND_URL = os.getenv("BACKEND_URL", "http://backend:3000")
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", 5672))
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
RABBITMQ_PASSWORD = os.getenv("RABBITMQ_PASSWORD", "guest")

def get_auth_token():
    """Authenticates with the backend and returns a JWT token."""
    print("Authenticating...")
    try:
        # Try to login first
        response = requests.post(f"{BACKEND_URL}/auth/login", json={
            "email": "admin@example.com",
            "password": "123456"
        })
        if response.status_code == 201:
            return response.json()['access_token']
        
        # If login fails, try to register (idempotent check)
        print("Login failed, trying to register...")
        response = requests.post(f"{BACKEND_URL}/users", json={
            "email": "admin@example.com",
            "password": "123456"
        })
        if response.status_code == 201:
             # Login again after register
            response = requests.post(f"{BACKEND_URL}/auth/login", json={
                "email": "admin@example.com",
                "password": "123456"
            })
            return response.json()['access_token']
            
    except Exception as e:
        print(f"Authentication failed: {e}")
        return None
    return None

def publish_mock_message():
    """Publishes a mock weather message to RabbitMQ."""
    print("Publishing mock message to RabbitMQ...")
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
    parameters = pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials)
    
    try:
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
        channel.queue_declare(queue='weather_data', durable=True)
        
        mock_data = {
            "city": "Integration Test City",
            "temperature": 99.9,
            "humidity": 100,
            "windSpeed": 50.0,
            "condition": "Test Storm",
            "timestamp": "2023-01-01T00:00:00Z"
        }
        
        channel.basic_publish(
            exchange='',
            routing_key='weather_data',
            body=json.dumps(mock_data),
            properties=pika.BasicProperties(delivery_mode=2)
        )
        print("Message published.")
        connection.close()
        return True
    except Exception as e:
        print(f"Failed to publish message: {e}")
        return False

def verify_backend_data(token):
    """Queries the backend to see if the mock message arrived."""
    print("Verifying data in Backend...")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Retry a few times as processing might take a moment
    for i in range(10):
        try:
            response = requests.get(f"{BACKEND_URL}/weather/logs", headers=headers)
            if response.status_code == 200:
                logs = response.json()
                for log in logs:
                    if log['city'] == "Integration Test City" and log['temperature'] == 99.9:
                        print("SUCCESS: Mock data found in backend!")
                        return True
            print(f"Waiting for data... ({i+1}/10)")
            time.sleep(2)
        except Exception as e:
            print(f"Error querying backend: {e}")
            time.sleep(2)
            
    print("FAILURE: Mock data not found after waiting.")
    return False

if __name__ == "__main__":
    token = get_auth_token()
    if not token:
        print("Could not get auth token. Aborting.")
        exit(1)
        
    if publish_mock_message():
        time.sleep(2) # Give worker a head start
        if verify_backend_data(token):
            print("Integration Test PASSED")
            exit(0)
        else:
            print("Integration Test FAILED")
            exit(1)
    else:
        print("Integration Test FAILED (Publishing)")
        exit(1)
