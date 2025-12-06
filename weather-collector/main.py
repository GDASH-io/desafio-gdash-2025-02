import time
import os
import logging
from src.services.weather_service import WeatherService
from src.services.queue_service import QueueService
from src.config.settings import CollectorConfig
from src.utils.logger import setup_logger

logger = setup_logger(__name__)


def main():
    logger.info("Iniciando coletor de dados climáticos...")
    logger.info(f"Intervalo de coleta configurado: {int(os.getenv('COLLECTION_INTERVAL', 3600))} segundos (1 hora)")
    
    config = CollectorConfig()
    weather_service = WeatherService()
    queue_service = QueueService()
    
    cycle_count = 0
    consecutive_failures = 0
    max_consecutive_failures = 5
    
    # Tentativa inicial de conexão
    try:
        queue_service.connect()
        logger.info("Conectado ao RabbitMQ com sucesso")
    except Exception as e:
        logger.error(f"Erro ao conectar inicialmente ao RabbitMQ: {e}")
        logger.info("Tentando continuar... o sistema tentará reconectar antes de cada coleta")
    
    try:
        while True:
            try:
                cycle_count += 1
                logger.info(f"Iniciando ciclo de coleta #{cycle_count}")
                
                # Verifica e reconecta antes de cada ciclo se necessário
                try:
                    if not queue_service.is_connected():
                        logger.info("Conexão perdida, reconectando antes do ciclo de coleta...")
                        queue_service.connect(force=True)
                except Exception as reconnect_error:
                    logger.warning(f"Não foi possível reconectar antes do ciclo: {reconnect_error}")
                    logger.info("Continuando mesmo assim, o envio tentará reconectar...")
                
                # Coleta dados climáticos
                weather_data = weather_service.fetch_weather_data()
                
                if weather_data:
                    logger.info(
                        f"Dados coletados: temperatura={weather_data.get('current', {}).get('temperature')}°C, "
                        f"timestamp={weather_data.get('timestamp')}"
                    )
                    
                    # Tenta enviar para a fila
                    if queue_service.send_message(weather_data):
                        logger.info(f"✅ Ciclo de coleta #{cycle_count} concluído com sucesso - dados enviados para a fila")
                        consecutive_failures = 0  # Reset contador de falhas
                    else:
                        consecutive_failures += 1
                        logger.warning(
                            f"❌ Falha ao enviar dados para a fila no ciclo #{cycle_count} "
                            f"(falhas consecutivas: {consecutive_failures}/{max_consecutive_failures})"
                        )
                        
                        if consecutive_failures >= max_consecutive_failures:
                            logger.error(
                                f"⚠️ Muitas falhas consecutivas ({consecutive_failures}). "
                                f"Tentando reconectar completamente..."
                            )
                            try:
                                queue_service.close()
                                time.sleep(5)
                                queue_service.connect(force=True)
                                consecutive_failures = 0
                            except Exception as reset_error:
                                logger.error(f"Erro ao resetar conexão: {reset_error}")
                else:
                    consecutive_failures += 1
                    logger.warning(
                        f"Não foi possível coletar dados climáticos no ciclo #{cycle_count}, "
                        f"tentando novamente no próximo ciclo"
                    )
                
                interval_hours = config.COLLECTION_INTERVAL / 3600
                logger.info(
                    f"Ciclo #{cycle_count} finalizado. Aguardando {config.COLLECTION_INTERVAL} segundos "
                    f"({interval_hours:.1f} horas) até a próxima coleta..."
                )
                time.sleep(config.COLLECTION_INTERVAL)
                
            except KeyboardInterrupt:
                logger.info("Interrupção recebida, encerrando...")
                break
            except Exception as e:
                consecutive_failures += 1
                logger.error(f"Erro no loop principal (ciclo #{cycle_count}): {e}", exc_info=True)
                logger.info(
                    f"Aguardando {config.COLLECTION_INTERVAL} segundos "
                    f"antes de tentar novamente..."
                )
                time.sleep(config.COLLECTION_INTERVAL)
                
    except Exception as e:
        logger.error(f"Erro crítico no loop principal: {e}", exc_info=True)
    finally:
        queue_service.close()
        logger.info("Conexão com RabbitMQ fechada")


if __name__ == "__main__":
    main()
