import logging
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import time
from src.queue_sender import connect_rmq, publish_message

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def main():
    try:
        logger.info("Iniciando coleta de dados meteorológicos...")
        conn, channel = connect_rmq()
        success = publish_message(channel)
        conn.close()
        
        if success:
            logger.info("Ciclo de coleta concluído com sucesso")
        else:
            logger.warning("Ciclo de coleta finalizado com avisos")
            
    except Exception as e:
        logger.error(f"Erro durante o ciclo de coleta: {e}", exc_info=True)


if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("Python Weather Collector Service iniciado")
    logger.info("Localização: Teresina/PI, Brasil")
    logger.info("Intervalo de coleta: 1 hora")
    logger.info("=" * 60)
    
    main()
    
    scheduler = BackgroundScheduler()
    scheduler.add_job(main, "interval", hours=1, next_run_time=datetime.now())
    scheduler.start()
    
    logger.info("Scheduler ativo - Aguardando próxima execução...")
    
    try:
        while True:
            time.sleep(60)
    except (KeyboardInterrupt, SystemExit):
        logger.info("Encerrando serviço...")
        scheduler.shutdown()
        logger.info("Serviço encerrado com sucesso")