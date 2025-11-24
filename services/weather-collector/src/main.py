import signal
import sys
from datetime import datetime
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.interval import IntervalTrigger

from config import Config
from collector import WeatherCollector


collector = None

def signal_handler(_signum, _frame):
    print("\n\nEncerrando...")
    if collector:
        collector.close()
    print("Collector encerrado")
    sys.exit(0)


def main():
    global collector
    
    print("\n" + "="*60)
    print(f"GDASH Weather Collector v{Config.COLLECTOR_VERSION}")
    print("="*60)
    print(f"Iniciado: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Local: {Config.LOCATION_CITY}, {Config.LOCATION_STATE}")
    interval_text = f"{int(Config.COLLECTION_INTERVAL_MINUTES * 60)}s" if Config.COLLECTION_INTERVAL_MINUTES < 1 else f"{Config.COLLECTION_INTERVAL_MINUTES}min"
    print(f"Intervalo: {interval_text}")
    print("="*60 + "\n")
    
    # Configurar handlers de sinais
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        collector = WeatherCollector()
        
        print("Executando primeira coleta...")
        collector.collect_and_publish()
        
        scheduler = BlockingScheduler()
        scheduler.add_job(
            func=collector.collect_and_publish,
            trigger=IntervalTrigger(minutes=Config.COLLECTION_INTERVAL_MINUTES),
            id='weather_collection_job',
            replace_existing=True,
        )
        
        interval_text = f"{int(Config.COLLECTION_INTERVAL_MINUTES * 60)}s" if Config.COLLECTION_INTERVAL_MINUTES < 1 else f"{Config.COLLECTION_INTERVAL_MINUTES}min"
        print(f"\nScheduler OK. Próxima coleta em {interval_text}")
        print("Aguardando... (Ctrl+C para parar)\n")
        
        scheduler.start()
        
    except KeyboardInterrupt:
        print("\nInterrompido")
    except Exception as e:
        print(f"\nErro: {e}")
        sys.exit(1)
    finally:
        if collector:
            collector.close()


if __name__ == '__main__':
    main()
