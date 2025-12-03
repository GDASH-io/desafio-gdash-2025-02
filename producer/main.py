#!/usr/bin/env python3
import time
import logging
import signal
import sys
from config import COLLECTION_INTERVAL
from weather_collector import WeatherCollector
from queue_publisher import QueuePublisher

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
)

logger = logging.getLogger(__name__)

# Variáveis globais para graceful shutdown
running = True
collector = None
publisher = None


def signal_handler(sig, frame):
    """
    Handler para encerramento graceful
    """
    global running
    logger.info('Recebido sinal de encerramento. Finalizando...')
    running = False
    if publisher:
        publisher.close()
    sys.exit(0)


def main():
    global collector, publisher, running

    # Registrar handlers de sinal
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    logger.info('Iniciando Producer de dados climáticos...')
    logger.info(f'Intervalo de coleta: {COLLECTION_INTERVAL} segundos')

    collector = WeatherCollector()
    publisher = QueuePublisher()

    # Conectar ao RabbitMQ
    if not publisher.connect():
        logger.error('Falha ao conectar ao RabbitMQ. Encerrando...')
        sys.exit(1)

    logger.info('Producer iniciado com sucesso!')

    # Loop principal
    while running:
        try:
            # Coletar dados climáticos
            weather_data = collector.collect_weather_data()

            if weather_data:
                # Publicar na fila
                if publisher.publish(weather_data):
                    logger.info('Dados climáticos coletados e publicados com sucesso')
                else:
                    logger.error('Falha ao publicar dados na fila')
            else:
                logger.warning('Não foi possível coletar dados climáticos')

            # Aguardar intervalo antes da próxima coleta
            if running:
                time.sleep(COLLECTION_INTERVAL)

        except KeyboardInterrupt:
            logger.info('Interrompido pelo usuário')
            running = False
            break
        except Exception as e:
            logger.error(f'Erro no loop principal: {e}')
            if running:
                time.sleep(COLLECTION_INTERVAL)

    # Cleanup
    if publisher:
        publisher.close()
    logger.info('Producer encerrado')


if __name__ == '__main__':
    main()

