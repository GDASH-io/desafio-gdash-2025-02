# /// script
# requires-python = ">=3.14"
# dependencies = [
#     "requests",
#     "pika",
#     "python-dotenv",
# ]
# ///
import requests
import pika
import json
import time
import os
import logging
from dotenv import load_dotenv


# Carrega variáveis de ambiente do arquivo .env
load_dotenv()


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

INTERVAL_SECONDS=int(os.getenv("INTERVAL_SECONDS", 20))
LONG=float(os.getenv("LONG", -46.53632098751176))
LAT=float(os.getenv("LAT", -22.970198162589284))
TIMEZONE=os.getenv("TIMEZONE", "America/Sao_Paulo")

BASE_URL = f"{os.getenv('OPENWEATHER_API_URL')}?timezone={TIMEZONE}&latitude={LAT}&longitude={LONG}&current=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,rain,weather_code,pressure_msl,cloud_cover,visibility,evapotranspiration,et0_fao_evapotranspiration,wind_speed_10m,wind_speed_80m,wind_speed_120m,wind_direction_10m,wind_direction_80m,wind_direction_120m,wind_speed_180m,wind_direction_180m,wind_gusts_10m,temperature_80m,temperature_120m,temperature_180m,is_day,uv_index,uv_index_clear_sky,direct_radiation"

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", 5672))
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "admin")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASS", "admin123")
QUEUE_NAME = os.getenv("QUEUE_NAME")

INTERVAL_SECONDS = max(20, INTERVAL_SECONDS)  # Garantir mínimo de 20 segundos deintervalo

logger.info("=== Iniciando Producer ===")
logger.info(f"Configurações: Intervalo={INTERVAL_SECONDS}s, Lat={LAT}, Long={LONG}")


# Configura conexão com RabbitMQ
try:
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
    parameters = pika.ConnectionParameters(
      host=RABBITMQ_HOST,
      port=RABBITMQ_PORT,
      credentials=credentials,
      heartbeat=600,
      blocked_connection_timeout=300
    )
      
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()
    logger.info("✓ Conexão com RabbitMQ estabelecida com sucesso")
      
    channel.queue_declare(queue=QUEUE_NAME, durable=False)
except Exception as e:
    logger.error(f"✗ Erro ao conectar com RabbitMQ: {e}")
    raise


# Função para enviar dados ao RabbitMQ
def send_to_rabbitmq(data):
  try:
    message = json.dumps(data)
    
    channel.basic_publish(
      exchange='',
      routing_key=QUEUE_NAME,
      body=message
    )
    
    logger.info(f"✓ Mensagem enviada para '{QUEUE_NAME}'")
  except Exception as e:
    logger.error(f"✗ Erro ao enviar mensagem para RabbitMQ: {str(e)}")
    raise



# Função para consultar API e enviar dados
def fetch_and_send():
  max_retries = 3
  retry_delay = 5 
  
  for attempt in range(1, max_retries + 1):
    try:
      logger.info(f"Consultando API de clima... (tentativa {attempt}/{max_retries})")
      
      response = requests.get(BASE_URL, timeout=10)
      response.raise_for_status()
     
      logger.info(f"✓ Dados recebidos da API (status={response.status_code})")
      
      data = response.json()
      send_to_rabbitmq(data)
      
      logger.info("-" * 70)
      return  # Sucesso, sai da função
      
    except requests.exceptions.Timeout:
      logger.warning(f"✗ Timeout ao consultar API de clima (tentativa {attempt}/{max_retries})")
      if attempt < max_retries:
        logger.info(f"Aguardando {retry_delay}s antes de tentar novamente...")
        time.sleep(retry_delay)
      else:
        logger.error("✗ Todas as tentativas de consultar a API falharam (Timeout)")
        
    except requests.exceptions.RequestException as e:
      logger.warning(f"✗ Erro ao consultar API: {e} (tentativa {attempt}/{max_retries})")
      if attempt < max_retries:
        logger.info(f"Aguardando {retry_delay}s antes de tentar novamente...")
        time.sleep(retry_delay)
      else:
        logger.error(f"✗ Todas as tentativas de consultar a API falharam: {e}")
        
    except json.JSONDecodeError as e:
      logger.error(f"✗ Erro ao decodificar resposta JSON: {e}")
      break  # Não faz sentido tentar novamente em caso de JSON inválido
      
    except Exception as e:
      logger.error(f"✗ Erro inesperado no ciclo: {type(e).__name__}: {e}", exc_info=True)
      break  # Não tenta novamente em erros inesperados


# Loop principal
def main():
  logger.info("=== Producer iniciado e aguardando execução ===")
  
  try:
    while True:
      try:
        fetch_and_send()
        
        time.sleep(INTERVAL_SECONDS)
      except Exception as e:
        logger.error(f"✗ Erro crítico: {type(e).__name__}: {e}", exc_info=True)
  except KeyboardInterrupt:
    logger.info("\n=== Processo interrompido pelo usuário ===")
  finally:
    logger.info("Encerrando conexões...")
    try:
      if connection and connection.is_open:
        connection.close()
        channel.close()
        logger.info("✓ Conexão RabbitMQ fechada")
    except Exception as e:
      logger.error(f"Erro ao fechar conexão: {e}")
    logger.info(f"=== Producer finalizado ===")

if __name__ == "__main__":
  main()
