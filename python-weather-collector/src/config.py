import os

try:
    import importlib
    load_dotenv = importlib.import_module("dotenv").load_dotenv
except Exception:
    # Fallback sem operação caso python-dotenv não esteja instalado (evita erros de importação em editores/CI)
    def load_dotenv(*args, **kwargs):
        return False

load_dotenv()


class Config:
    """Configurações do serviço de coleta de dados meteorológicos."""

    # Open-Meteo API (gratuita, sem necessidade de chave de API)
    WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast"

    # Coordenadas padrão (exemplo: São Paulo, Brasil)
    LATITUDE = os.getenv("LATITUDE", "-23.55052")
    LONGITUDE = os.getenv("LONGITUDE", "-46.633308")

    # RABBITMQ
    RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
    RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", 5672))
    RABBITMQ_USER = os.getenv("RABBITMQ_USER", "admin")
    RABBITMQ_PASSWORD = os.getenv("RABBITMQ_PASSWORD", "admin123")
    RABBITMQ_QUEUE = os.getenv("RABBITMQ_QUEUE", "weather_data")

    # Intervalo de coleta em minutos
    COLLECTION_INTERVAL = int(os.getenv("COLLECTION_INTERVAL", 5))


    @classmethod
    def get_rabbitmq_url(cls):
        """Exibe as configurações de conexão do RabbitMQ.(util para debug)"""
        print("=" * 50)
        print(" 🔧 CONFIGURAÇÕES DO RABBITMQ 🔧")
        print("=" * 50)
        print(f"📍 Localização: {cls.LATITUDE}, {cls.LONGITUDE}")
        print(f"🐰 RabbitMQ: {cls.RABBITMQ_HOST}:{cls.RABBITMQ_PORT}")
        print(f"📦 Fila: {cls.RABBITMQ_QUEUE}")
        print(f"⏰ Intervalo de Coleta: {cls.COLLECTION_INTERVAL} minutos")
        print("=" * 50)