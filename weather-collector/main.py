import os
import time
import json
import requests
import pika
import schedule
from dotenv import load_dotenv

load_dotenv()

class WeatherCollector:
    def __init__(self):
        self.api_key = os.getenv('OPENWEATHER_API_KEY')
        self.lat = os.getenv('LAT')
        self.lon = os.getenv('LON')
        self.city = os.getenv('CITY')
        self.rabbitmq_url = os.getenv('RABBITMQ_URL')
        
    def get_weather_data(self):
        url = f"http://api.openweathermap.org/data/2.5/weather?lat={self.lat}&lon={self.lon}&appid={self.api_key}&units=metric&lang=pt_br"
        
        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            
            weather_data = {
                'city': self.city,
                'latitude': float(self.lat),
                'longitude': float(self.lon),
                'temperature': data['main']['temp'],
                'feels_like': data['main']['feels_like'],
                'humidity': data['main']['humidity'],
                'pressure': data['main']['pressure'],
                'wind_speed': data['wind']['speed'],
                'wind_direction': data['wind'].get('deg', 0),
                'weather_condition': data['weather'][0]['description'],
                'weather_main': data['weather'][0]['main'],
                'cloudiness': data['clouds']['all'],
                'visibility': data.get('visibility', 0),
                'timestamp': data['dt'],
                'collection_time': int(time.time())
            }
            
            return weather_data
            
        except Exception as e:
            print(f"Erro ao coletar dados do clima: {e}")
            return None
    
    def send_to_queue(self, data):
        try:
            connection = pika.BlockingConnection(
                pika.URLParameters(self.rabbitmq_url)
            )
            channel = connection.channel()
            
            channel.queue_declare(queue='weather_data', durable=True)
            
            channel.basic_publish(
                exchange='',
                routing_key='weather_data',
                body=json.dumps(data),
                properties=pika.BasicProperties(
                    delivery_mode=2,
                )
            )
            
            print(f"Dados enviados para a fila: {data['temperature']}°C em {data['city']}")
            connection.close()
            
        except Exception as e:
            print(f"Erro ao enviar para a fila: {e}")
    
    def collect_and_send(self):
        print("Coletando dados do clima...")
        weather_data = self.get_weather_data()
        if weather_data:
            self.send_to_queue(weather_data)
        else:
            print("Falha na coleta de dados")
    
    def start_scheduler(self):
        self.collect_and_send()
        schedule.every(1).hours.do(self.collect_and_send)
        
        print("Coletor iniciado. Coletando dados a cada hora...")
        
        while True:
            schedule.run_pending()
            time.sleep(1)

if __name__ == "__main__":
    collector = WeatherCollector()
    collector.start_scheduler()