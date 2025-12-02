import time
from fetch_weather import fetch_weather
from rabbitmq_queue import send_to_queue
import config

def run_loop():
    while True:
        try:
            data = fetch_weather()
            send_to_queue(data)
            print("Dados enviados para a fila:", data)
        except Exception as e:
            print("Erro no producer:", e)
        time.sleep(config.INTERVAL)

if __name__ == "__main__":
    run_loop()
