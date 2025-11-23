from weather_api import WeatherAPIClient
from rabbitmq_publisher import RabbitMQPublisher


class WeatherCollector:
    def __init__(self):
        self.api_client = WeatherAPIClient()
        self.publisher = RabbitMQPublisher()
    
    def collect_and_publish(self):
        print("\n" + "="*60)
        print("Iniciando coleta...")
        print("="*60)
        
        try:
            weather_data = self.api_client.fetch_current_weather()
            
            if weather_data is None:
                print("Falha na coleta. Tentando no próximo ciclo.")
                return
            
            success = self.publisher.publish(weather_data)
            
            if success:
                print("Ciclo concluído!")
            else:
                print("Falha ao publicar")
            
        except Exception as e:
            print(f"Erro: {e}")
        
        print("="*60 + "\n")
    
    def close(self):
        self.publisher.close()
