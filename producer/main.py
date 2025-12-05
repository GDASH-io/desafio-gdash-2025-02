#!/usr/bin/env python3
import time
import logging
import signal
import sys
from datetime import datetime, timedelta
try:
    from zoneinfo import ZoneInfo
except ImportError:
    # Fallback para Python < 3.9
    from backports.zoneinfo import ZoneInfo
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


def get_next_hour_time():
    """
    Calcula o próximo horário de coleta (início da próxima hora)
    Retorna o timestamp Unix do próximo início de hora no timezone do Brasil
    """
    brazil_tz = ZoneInfo('America/Sao_Paulo')
    now_brazil = datetime.now(brazil_tz)
    
    # Calcular o próximo início de hora
    # Sempre pegar a próxima hora cheia (não a atual, mesmo que estejamos no início dela)
    next_hour = now_brazil.replace(minute=0, second=0, microsecond=0)
    # Se já estamos exatamente no início de uma hora, pegar a próxima
    # Se já passou do início da hora atual, pegar a próxima hora
    if next_hour <= now_brazil:
        next_hour += timedelta(hours=1)
    
    # Converter para timestamp Unix
    return next_hour.timestamp()


def wait_until_next_hour():
    """
    Aguarda até o próximo início de hora
    Retorna True se aguardou com sucesso, False se houve problema
    """
    try:
        next_hour_timestamp = get_next_hour_time()
        current_timestamp = time.time()
        wait_seconds = next_hour_timestamp - current_timestamp
        
        if wait_seconds <= 0:
            # Se o tempo de espera é negativo ou zero, significa que já passou da hora
            # Recalcular para a próxima hora
            brazil_tz = ZoneInfo('America/Sao_Paulo')
            now_brazil = datetime.now(brazil_tz)
            next_hour = now_brazil.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)
            next_hour_timestamp = next_hour.timestamp()
            wait_seconds = next_hour_timestamp - current_timestamp
        
        if wait_seconds > 0:
            brazil_tz = ZoneInfo('America/Sao_Paulo')
            next_hour_dt = datetime.fromtimestamp(next_hour_timestamp, brazil_tz)
            wait_minutes = wait_seconds / 60
            logger.info(f'Aguardando {wait_seconds:.0f} segundos ({wait_minutes:.1f} minutos) até a próxima hora cheia: {next_hour_dt.strftime("%Y-%m-%d %H:%M:%S")} BRT')
            
            # Aguardar em chunks para permitir verificação de interrupção
            while wait_seconds > 0 and running:
                sleep_time = min(wait_seconds, 60)  # Aguardar em chunks de no máximo 60 segundos
                time.sleep(sleep_time)
                wait_seconds -= sleep_time
                
                # Recalcular se necessário (caso o sleep seja interrompido ou haja drift)
                if wait_seconds > 0:
                    current_timestamp = time.time()
                    remaining = next_hour_timestamp - current_timestamp
                    if remaining > 0:
                        wait_seconds = remaining
                    else:
                        wait_seconds = 0
            
            return True
        else:
            logger.warning(f'Tempo de espera inválido ({wait_seconds:.0f}s), coletando imediatamente')
            return False
    except Exception as e:
        logger.error(f'Erro ao aguardar próxima hora: {e}', exc_info=True)
        return False


def main():
    global collector, publisher, running

    # Registrar handlers de sinal
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    logger.info('Iniciando Producer de dados climáticos...')
    logger.info(f'Intervalo de coleta: {COLLECTION_INTERVAL} segundos (coleta no início de cada hora)')

    collector = WeatherCollector()
    publisher = QueuePublisher()

    # Conectar ao RabbitMQ
    if not publisher.connect():
        logger.error('Falha ao conectar ao RabbitMQ. Encerrando...')
        sys.exit(1)

    logger.info('Producer iniciado com sucesso!')
    
    # Aguardar até a próxima hora cheia antes de começar
    wait_until_next_hour()

    # Loop principal
    collection_count = 0
    while running:
        try:
            collection_count += 1
            brazil_tz = ZoneInfo('America/Sao_Paulo')
            now_brazil = datetime.now(brazil_tz)
            
            # Calcular próxima coleta antes de coletar
            next_collection_time = get_next_hour_time()
            next_collection_dt = datetime.fromtimestamp(next_collection_time, brazil_tz)
            
            logger.info(f'=== Iniciando coleta #{collection_count} às {now_brazil.strftime("%Y-%m-%d %H:%M:%S")} BRT ===')
            logger.info(f'Próxima coleta programada para: {next_collection_dt.strftime("%Y-%m-%d %H:%M:%S")} BRT')

            # Coletar dados climáticos
            collect_start_time = time.time()
            weather_data = collector.collect_weather_data()
            collect_duration = time.time() - collect_start_time

            # Avisar se a coleta demorou muito (mais de 2 minutos)
            if collect_duration > 120:
                logger.warning(f'⚠ Coleta demorou {collect_duration:.2f}s ({collect_duration/60:.1f} minutos) - isso é muito longo!')

            if weather_data:
                # Publicar na fila
                publish_start_time = time.time()
                if publisher.publish(weather_data):
                    publish_duration = time.time() - publish_start_time
                    now_brazil_after = datetime.now(brazil_tz)
                    logger.info(f'✓ Dados coletados e publicados com sucesso às {now_brazil_after.strftime("%Y-%m-%d %H:%M:%S")} BRT')
                    logger.info(f'  Tempo de coleta: {collect_duration:.2f}s ({collect_duration/60:.1f} min) | Tempo de publicação: {publish_duration:.2f}s')
                else:
                    logger.error('✗ Falha ao publicar dados na fila')
            else:
                logger.warning('✗ Não foi possível coletar dados climáticos após todas as tentativas')

        except KeyboardInterrupt:
            logger.info('Interrompido pelo usuário')
            running = False
            break
        except Exception as e:
            logger.error(f'✗ Erro no loop principal (tentativa #{collection_count}): {e}', exc_info=True)
            # Continua mesmo com erro, aguarda o intervalo e tenta novamente

        # Aguardar até a próxima hora cheia (sempre recalcula baseado no tempo atual)
        if running:
            try:
                logger.info('Aguardando até a próxima hora cheia...')
                wait_success = wait_until_next_hour()
                if not wait_success:
                    # Se houve problema ao aguardar, aguardar um tempo mínimo antes de tentar novamente
                    logger.warning('Problema ao aguardar próxima hora, aguardando 60 segundos antes de tentar novamente...')
                    time.sleep(60)
            except Exception as e:
                logger.error(f'Erro ao aguardar próxima hora: {e}', exc_info=True)
                # Em caso de erro, aguardar um tempo mínimo antes de continuar
                logger.info('Aguardando 60 segundos antes de continuar...')
                time.sleep(60)

    # Cleanup
    if publisher:
        publisher.close()
    logger.info('Producer encerrado')


if __name__ == '__main__':
    main()

