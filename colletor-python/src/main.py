"""
Ponto de entrada do collector OpenWeather.
"""
import os
import sys
import signal
import time
import logging

# Adicionar diretório raiz ao PYTHONPATH para imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.shared.config import Config
from src.shared.logger import setup_logger
from src.infra.http.openmeteo_client import OpenMeteoClient
from src.infra.messaging.kafka_producer import KafkaProducerImpl
from src.infra.http.healthcheck import start_healthcheck_server
from src.application.usecases.fetch_and_publish import FetchAndPublishUseCase

# Configurar logger
logger = setup_logger()

# Variáveis globais para graceful shutdown
kafka_producer: KafkaProducerImpl = None
healthcheck_server = None
running = True


def signal_handler(signum, frame):
    """Handler para sinais de interrupção."""
    global running
    logger.info("Sinal de interrupção recebido. Encerrando...")
    running = False


def main():
    """Função principal do collector."""
    global kafka_producer, healthcheck_server
    
    try:
        # Validar configurações
        Config.validate()
        logger.info("Configurações validadas")
        
        # Inicializar clientes (Open-Meteo é gratuito, sem necessidade de API key)
        openmeteo_client = OpenMeteoClient(
            latitude=Config.LATITUDE,
            longitude=Config.LONGITUDE,
            timezone=Config.TIMEZONE,
            timeout=Config.HTTP_TIMEOUT_SECONDS,
            max_retries=Config.HTTP_MAX_RETRIES,
            retry_backoff_base=Config.HTTP_RETRY_BACKOFF_BASE,
        )
        
        kafka_producer = KafkaProducerImpl()
        
        # Inicializar use case
        fetch_and_publish = FetchAndPublishUseCase(
            openmeteo_client=openmeteo_client,
            kafka_producer=kafka_producer,
        )
        
        # Iniciar healthcheck server
        healthcheck_server = start_healthcheck_server(
            port=Config.HEALTHCHECK_PORT,
            kafka_producer=kafka_producer,
        )
        
        # Registrar handlers de sinal
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        logger.info(
            "Collector OpenWeather iniciado",
            extra={
                "context": {
                    "interval_seconds": Config.COLLECT_INTERVAL_SECONDS,
                    "interval_type": Config.COLLECT_INTERVAL_TYPE,
                    "city": "Coronel Fabriciano",
                    "healthcheck_port": Config.HEALTHCHECK_PORT,
                }
            },
        )
        
        # Loop principal
        while running:
            try:
                fetch_and_publish.execute()
            
            except Exception as e:
                logger.error(
                    f"Erro no loop principal: {e}",
                    extra={"context": {"error_type": type(e).__name__}},
                    exc_info=True,
                )
            
            # Aguardar intervalo configurado
            if running:
                logger.info(
                    f"Aguardando {Config.COLLECT_INTERVAL_SECONDS}s até próxima coleta",
                    extra={"context": {"wait_seconds": Config.COLLECT_INTERVAL_SECONDS}},
                )
                
                # Aguardar em pequenos intervalos para permitir shutdown rápido
                waited = 0
                while waited < Config.COLLECT_INTERVAL_SECONDS and running:
                    time.sleep(min(1, Config.COLLECT_INTERVAL_SECONDS - waited))
                    waited += 1
    
    except KeyboardInterrupt:
        logger.info("Interrupção pelo usuário")
    
    except Exception as e:
        logger.error(f"Erro fatal: {e}", exc_info=True)
        sys.exit(1)
    
    finally:
        # Cleanup
        logger.info("Encerrando collector...")
        
        if kafka_producer:
            kafka_producer.close()
        
        if healthcheck_server:
            healthcheck_server.shutdown()
        
        logger.info("Collector encerrado")


if __name__ == "__main__":
    main()

