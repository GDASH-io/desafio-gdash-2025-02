import logging
import time
from datetime import datetime
import schedule
import sys

from config import (
    LATITUDE,
    LONGITUDE,
    COLLECTION_INTERVAL
)
from weather_api import WeatherAPI
from queue_sender import QueueSender

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)


def collect_weather_data(weather_api: WeatherAPI, queue_sender: QueueSender):
    try:
        logger.info("Iniciando coleta de dados meteorológicos...")
        
        weather_data = weather_api.fetch_weather()
        
        if not weather_data:
            logger.error("Nenhum dado retornado pela API")
            return
        
        message = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "location": {
                "latitude": LATITUDE,
                "longitude": LONGITUDE,
                "city": "Natal",
                "state": "RN"
            },
            "weather": weather_data
        }
        
        if queue_sender.send_message(message):
                temp = weather_data.get('temperature', 'N/A')
                condition = weather_data.get('condition', 'N/A')
                logger.info(
                    f"Dados enviados com sucesso - "
                    f"Temp: {temp}°C, "
                    f"Condição: {condition}"
                )
        else:
            logger.error("Falha ao enviar dados para a fila")
            
    except Exception as e:
        logger.error(f"Erro durante coleta: {str(e)}")


def main():
    logger.info("Weather Collector iniciando...")
    logger.info(f"Localização: Natal, RN ({LATITUDE}, {LONGITUDE})")
    logger.info(f"Intervalo de coleta: {COLLECTION_INTERVAL} minutos")
    
    weather_api = None
    queue_sender = None
    
    try:
        logger.info("Conectando aos serviços...")
        weather_api = WeatherAPI()
        queue_sender = QueueSender()
        logger.info("Conexões estabelecidas com sucesso")
        
        logger.info("Executando primeira coleta...")
        collect_weather_data(weather_api, queue_sender)

        schedule.every(COLLECTION_INTERVAL).minutes.do(
            collect_weather_data,
            weather_api=weather_api,
            queue_sender=queue_sender
        )
        
        logger.info(f"Próxima coleta agendada para daqui a {COLLECTION_INTERVAL} minutos")
        logger.info("Serviço em execução... (Ctrl+C para parar)")
        
        while True:
            schedule.run_pending()
            time.sleep(1)
            
    except KeyboardInterrupt:
        logger.info("\n Interrupção detectada (Ctrl+C)")
        logger.info("Encerrando serviço...")
        
    except Exception as e:
        logger.error(f"Erro fatal: {str(e)}")
        sys.exit(1)
        
    finally:
        if queue_sender:
            try:
                queue_sender.close()
                logger.info("Conexão RabbitMQ fechada")
            except Exception as e:
                logger.error(f"Erro ao fechar conexão: {str(e)}")
        
        logger.info("Weather Collector encerrado")


if __name__ == "__main__":
    main()