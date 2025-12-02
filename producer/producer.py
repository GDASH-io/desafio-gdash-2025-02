import requests
import pika
import json
import logging
import time
import os

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class Producer:
    def __init__(self):
        self.base_url = "https://api.open-meteo.com/v1/forecast"
        self.latitude = os.getenv('WEATHER_LATITUDE', '-15.79')
        self.longitude = os.getenv('WEATHER_LONGITUDE', '-47.88')
        self.interval = int(os.getenv('WEATHER_INTERVAL', '60'))
        self.max_retries = 5
        self.retry_delay = 2
        
        # RabbitMQ connection
        rabbitmq_host = os.getenv('RABBITMQ_HOST', 'localhost')
        rabbitmq_user = os.getenv('RABBITMQ_USER', 'guest')
        rabbitmq_password = os.getenv('RABBITMQ_PASSWORD', 'guest')
        
        self.rabbitmq_config = {
            'host': rabbitmq_host,
            'user': rabbitmq_user,
            'password': rabbitmq_password
        }
        
        self.connection = None
        self.channel = None
        self._connect_to_rabbitmq()

    def _connect_to_rabbitmq(self):
        """Estabelece conexão com RabbitMQ com retry"""
        retries = 0
        while retries < self.max_retries:
            try:
                credentials = pika.PlainCredentials(self.rabbitmq_config['user'], self.rabbitmq_config['password'])
                self.connection = pika.BlockingConnection(
                    pika.ConnectionParameters(self.rabbitmq_config['host'], credentials=credentials)
                )
                self.channel = self.connection.channel()
                self.channel.queue_declare(queue='weather_data', durable=True)
                logging.info("✅ Producer conectado ao RabbitMQ")
                return
            except pika.exceptions.AMQPConnectionError as e:
                retries += 1
                wait_time = self.retry_delay ** retries
                logging.warning(f"⚠️ Falha ao conectar RabbitMQ (tentativa {retries}/{self.max_retries}). Aguardando {wait_time}s... Erro: {e}")
                time.sleep(wait_time)
        
        logging.error(f"❌ Falha ao conectar RabbitMQ após {self.max_retries} tentativas")
        raise Exception("Não foi possível conectar ao RabbitMQ")

    def get_data(self):
        params = {
            'latitude': self.latitude,
            'longitude': self.longitude,
            'current': 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability'
        }
        response = requests.get(self.base_url, params=params)
        response.raise_for_status()
        return response.json()
    
    def _ensure_connection(self):
        """Verifica e reconecta ao RabbitMQ se necessário"""
        try:
            if not self.connection or self.connection.is_closed:
                logging.info("🔄 Reconectando ao RabbitMQ...")
                self._connect_to_rabbitmq()
        except Exception as e:
            logging.error(f"❌ Erro ao verificar conexão: {e}")
            raise

    def publish_weather_data(self, data):
        """Publica dados climáticos na fila com retry"""
        retries = 0
        while retries < self.max_retries:
            try:
                self._ensure_connection()
                self.channel.basic_publish(
                    exchange='',
                    routing_key='weather_data',
                    body=json.dumps(data),
                    properties=pika.BasicProperties(delivery_mode=2)  # Make message persistent
                )
                temp = data['current']['temperature_2m']
                humidity = data['current']['relative_humidity_2m']
                wind = data['current']['wind_speed_10m']
                rain_prob = data['current'].get('precipitation_probability', 0)
                logging.info(f"📤 Dados enviados para fila: Temp={temp}°C, Umidade={humidity}%, Vento={wind}km/h, Chuva={rain_prob}%")
                return
            except (pika.exceptions.AMQPConnectionError, pika.exceptions.ChannelError) as e:
                retries += 1
                if retries >= self.max_retries:
                    logging.error(f"❌ Falha permanente ao publicar dados após {self.max_retries} tentativas: {e}")
                    raise
                wait_time = self.retry_delay ** retries
                logging.warning(f"⚠️ Erro ao publicar (tentativa {retries}/{self.max_retries}). Reconectando em {wait_time}s... Erro: {e}")
                time.sleep(wait_time)
                self.connection = None  # Force reconnection
            except Exception as e:
                logging.error(f"❌ Erro inesperado ao publicar dados: {e}")
                raise

if __name__ == "__main__":
    producer = Producer()
    logging.info(f"🚀 Producer iniciado - enviando dados a cada {producer.interval} segundos...")
    while True:
        try:
            weather_data = producer.get_data()
            producer.publish_weather_data(weather_data)
        except requests.exceptions.RequestException as e:
            logging.error(f"❌ Erro ao obter dados da API: {e}")
        except pika.exceptions.AMQPConnectionError as e:
            logging.error(f"❌ Erro permanente de conexão RabbitMQ: {e}. Tentando reconectar...")
            try:
                producer._connect_to_rabbitmq()
            except Exception as reconnect_error:
                logging.error(f"❌ Falha ao reconectar: {reconnect_error}")
        except Exception as e:
            logging.error(f"❌ Erro inesperado: {e}")
        time.sleep(producer.interval)
