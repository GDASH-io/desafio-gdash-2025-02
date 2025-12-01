import time
from config import LOCATION_NAME, LOCATION_LAT, LOCATION_LON, COLLECT_INTERVAL, HEARTBEAT_CHECK_INTERVAL
from weather_api import get_weather_data
from rabbitmq_client import RabbitMQClient
from utils import display_weather_summary


class WeatherCollector:
    
    
    def __init__(self):
        self.rabbitmq_client = RabbitMQClient()
        self.last_heartbeat = time.time()
    
    def print_header(self):
        
        print(f"🌦️  Coletor de dados climáticos iniciado")
        print(f"📍 Localização: {LOCATION_NAME} ({LOCATION_LAT}, {LOCATION_LON})")
        print(f"⏰  Intervalo: {COLLECT_INTERVAL} segundos")
        print(f"📡 API: Open-Meteo")
        print("-" * 60)
    
    def ensure_connection(self):
        
        if not self.rabbitmq_client.is_connected():
            if self.rabbitmq_client.connect():
                self.last_heartbeat = time.time()
                return True
            else:
                print("⏳ Aguardando conexão com RabbitMQ... (tentando novamente em 5s)")
                time.sleep(5)
                return False
        return True
    
    def handle_heartbeat(self):
       
        current_time = time.time()
        if current_time - self.last_heartbeat > HEARTBEAT_CHECK_INTERVAL:
            if self.rabbitmq_client.process_heartbeat():
                self.last_heartbeat = current_time
    
    def collect_and_send(self):
       
        weather_data = get_weather_data()
        
        if weather_data:
            if self.rabbitmq_client.send_message(weather_data):
                display_weather_summary(weather_data)
                return True
        else:
            print("⚠️  Falha ao coletar dados climáticos")
        
        return False
    
    def run(self):
        
        self.print_header()
        
        try:
            while True:
                # Garante conexão
                if not self.ensure_connection():
                    continue
                
                # Processa heartbeat
                self.handle_heartbeat()
                
                # Coleta e envia dados
                self.collect_and_send()
                
                # Aguarda próximo ciclo
                print(f"\n⏳ Próxima coleta em {COLLECT_INTERVAL} segundos...")
                print("-" * 60)
                time.sleep(COLLECT_INTERVAL)
                
        except KeyboardInterrupt:
            print("\n🛑 Coletor interrompido pelo usuário")
        except Exception as e:
            print(f"❌ Erro no loop principal: {e}")
            import traceback
            traceback.print_exc()
        finally:
            self.rabbitmq_client.close()


def main():
    collector = WeatherCollector()
    collector.run()


if __name__ == '__main__':
    main()