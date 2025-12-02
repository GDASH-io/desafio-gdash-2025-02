import time
import schedule
from src.config import Config
from src.infra.http_client import WeatherClient
from src.infra.queue import RabbitMQPublisher

def job():
    # 1. Instancia os serviços
    client = WeatherClient()
    publisher = RabbitMQPublisher()

    # 2. Executa o fluxo
    print("\n--- Iniciando ciclo de coleta ---")
    weather_data = client.fetch_data()

    if weather_data:
        # 3. Se coletou com sucesso, envia para a fila
        publisher.publish(weather_data.to_dict())
    else:
        print("Sem dados para enviar.")

if __name__ == "__main__":
    print(f"Iniciando Collector Service (Clean Arch)...")
    print(f"Intervalo: {Config.COLLECT_INTERVAL} segundos")
    print("Pressione CTRL+C para parar.")
    
    # Executa imediatamente a primeira vez
    job()

    # Agenda as próximas execuções
    schedule.every(Config.COLLECT_INTERVAL).seconds.do(job)

    while True:
        schedule.run_pending()
        time.sleep(1)