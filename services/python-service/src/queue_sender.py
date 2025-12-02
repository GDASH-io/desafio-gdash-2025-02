import os
import json
import logging
import time
import pika as pk
from src.weather import get_time_info

logger = logging.getLogger(__name__)


def connect_rmq(max_retries=10, retry_delay=5):
    """
    Conecta ao RabbitMQ com retry automático para aguardar inicialização do container
    """
    for attempt in range(1, max_retries + 1):
        try:
            credentials = pk.PlainCredentials(os.getenv('RABBITMQ_USER'), os.getenv('RABBITMQ_PASSWORD'))
            parameters = pk.ConnectionParameters(
                host='rabbitmq', 
                port=5672, 
                virtual_host='/', 
                credentials=credentials,
                connection_attempts=3,
                retry_delay=2
            )
            connection = pk.BlockingConnection(parameters)
            channel = connection.channel() 
            channel.exchange_declare(exchange='weather_exchange', exchange_type='direct', durable=True)
            queue = channel.queue_declare(queue='weather', durable=True)
            channel.queue_bind(queue='weather', exchange='weather_exchange', routing_key='weather_routing_key')
            logger.info("Conectado ao RabbitMQ com sucesso")
            return (connection, channel)
        except Exception as e:
            if attempt < max_retries:
                logger.warning(f"Tentativa {attempt}/{max_retries} falhou. Aguardando RabbitMQ inicializar... (próxima tentativa em {retry_delay}s)")
                time.sleep(retry_delay)
            else:
                logger.error(f"❌ Falha ao conectar ao RabbitMQ após {max_retries} tentativas: {e}")
                raise


def publish_message(channel):
    try:
        data = get_time_info()
        if not data:
            logger.warning("Nenhum dado meteorológico disponível para publicar")
            return False
        
        logger.info(f"Dados meteorológicos coletados: Temperatura={data.get('temperatura')}°C, Cidade={data.get('cidade')}")
        
        channel.basic_publish(
            exchange='weather_exchange',
            routing_key='weather_routing_key',
            body=json.dumps(data).encode('utf-8'),
            properties=pk.BasicProperties(content_type='application/json', delivery_mode=2)
        )
        logger.info("Mensagem publicada no RabbitMQ com sucesso")
        return True
    except Exception as e:
        logger.error(f"Erro ao publicar mensagem: {e}", exc_info=True)
        return False