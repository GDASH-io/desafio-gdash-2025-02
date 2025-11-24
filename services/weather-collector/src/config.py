import os
from dotenv import load_dotenv

load_dotenv()

class Config:    
    # RabbitMQ
    RABBITMQ_URL = os.getenv('RABBITMQ_URL', 'amqp://gdash:gdash123@localhost:5672/')
    RABBITMQ_EXCHANGE = os.getenv('RABBITMQ_EXCHANGE', 'weather_exchange')
    RABBITMQ_ROUTING_KEY = os.getenv('RABBITMQ_ROUTING_KEY', 'weather.data')
    
    # API do Open-Meteo
    WEATHER_API_URL = os.getenv('WEATHER_API_URL', 'https://api.open-meteo.com/v1/forecast')
    
    # Localização
    LOCATION_CITY = os.getenv('LOCATION_CITY', 'São Paulo')
    LOCATION_STATE = os.getenv('LOCATION_STATE', 'SP')
    LOCATION_COUNTRY = os.getenv('LOCATION_COUNTRY', 'BR')
    LOCATION_LATITUDE = float(os.getenv('LOCATION_LATITUDE', '-23.5505'))
    LOCATION_LONGITUDE = float(os.getenv('LOCATION_LONGITUDE', '-46.6333'))
    
    COLLECTION_INTERVAL_MINUTES = float(os.getenv('COLLECTION_INTERVAL_MINUTES', '60'))
    COLLECTOR_VERSION = os.getenv('COLLECTOR_VERSION', '1.0.0')
    
    @classmethod
    def validate(cls):
        required_vars = [
            ('LOCATION_LATITUDE', cls.LOCATION_LATITUDE),
            ('LOCATION_LONGITUDE', cls.LOCATION_LONGITUDE),
        ]
        
        for var_name, var_value in required_vars:
            if var_value is None:
                raise ValueError(f"Variável obrigatória não encontrada: {var_name}")
            
        if not (-90 <= cls.LOCATION_LATITUDE <= 90):
            raise ValueError(f"Latitude inválida: {cls.LOCATION_LATITUDE}")
        if not (-180 <= cls.LOCATION_LONGITUDE <= 180):
            raise ValueError(f"Longitude inválida: {cls.LOCATION_LONGITUDE}")
        
        if cls.COLLECTION_INTERVAL_MINUTES <= 0:
            raise ValueError("COLLECTION_INTERVAL_MINUTES deve ser maior que zero")
        
        if cls.LOCATION_CITY is None or cls.LOCATION_STATE is None:
            raise ValueError("LOCATION_CITY e LOCATION_STATE devem ser definidas")
        
        print(f"Config OK: {cls.LOCATION_CITY} ({cls.LOCATION_LATITUDE}, {cls.LOCATION_LONGITUDE})")
        interval_text = f"{int(cls.COLLECTION_INTERVAL_MINUTES * 60)}s" if cls.COLLECTION_INTERVAL_MINUTES < 1 else f"{cls.COLLECTION_INTERVAL_MINUTES}min"
        print(f"Intervalo de coleta: {interval_text}")


# Validar configurações ao importar o módulo
Config.validate()
