"""
GDASH - Python Weather Collector
Coleta dados de clima da API OpenWeatherMap e envia para Redis
"""

import os
import time
import json
import logging
import redis
import requests
from datetime import datetime
from typing import Dict, List

# Configuração de logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("WeatherCollector")


class WeatherCollector:
    """Coletor de dados climáticos"""

    def __init__(self):
        self.api_key = os.getenv("OPENWEATHER_API_KEY")
        self.cities = os.getenv("OPENWEATHER_CITIES", "São Paulo").split(",")
        self.interval = int(os.getenv("COLLECTOR_INTERVAL", 300))

        # Conectar ao Redis
        self.redis_client = redis.Redis(
            host=os.getenv("REDIS_HOST", "redis"),
            port=int(os.getenv("REDIS_PORT", 6379)),
            db=int(os.getenv("REDIS_DB", 0)),
            decode_responses=True,
        )

        logger.info(f"Inicializado para coletar dados de: {', '.join(self.cities)}")
        logger.info(f"Intervalo de coleta: {self.interval} segundos")

    def fetch_weather_data(self, city: str) -> Dict:
        """Busca dados de clima para uma cidade"""
        try:
            url = "http://api.openweathermap.org/data/2.5/weather"
            params = {
                "q": city.strip(),
                "appid": self.api_key,
                "units": "metric",
                "lang": "pt_br",
            }

            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()

            # Formatar dados
            weather_data = {
                "city": data["name"],
                "country": data["sys"]["country"],
                "temperature": data["main"]["temp"],
                "feels_like": data["main"]["feels_like"],
                "temp_min": data["main"]["temp_min"],
                "temp_max": data["main"]["temp_max"],
                "pressure": data["main"]["pressure"],
                "humidity": data["main"]["humidity"],
                "description": data["weather"][0]["description"],
                "wind_speed": data["wind"]["speed"],
                "clouds": data["clouds"]["all"],
                "timestamp": datetime.utcnow().isoformat(),
                "collected_at": datetime.now().isoformat(),
            }

            logger.info(f"Data collected for {city}: {weather_data['temperature']}°C")
            return weather_data

        except requests.exceptions.RequestException as e:
            logger.error(f"✗ Erro ao buscar dados para {city}: {e}")
            return None
        except Exception as e:
            logger.error(f"✗ Erro inesperado para {city}: {e}")
            return None

    def send_to_queue(self, weather_data: Dict):
        """Envia dados para a fila Redis"""
        try:
            # Enviar para lista Redis
            self.redis_client.rpush(
                "weather_queue", json.dumps(weather_data, ensure_ascii=False)
            )
            logger.info(f"Sent to queue: {weather_data['city']}")

        except Exception as e:
            logger.error(f"✗ Erro ao enviar para fila: {e}")

    def collect_all(self):
        """Coleta dados de todas as cidades"""
        logger.info("=" * 60)
        logger.info("Iniciando coleta de dados...")

        for city in self.cities:
            weather_data = self.fetch_weather_data(city)
            if weather_data:
                self.send_to_queue(weather_data)
                time.sleep(1)  # Evitar rate limiting

        logger.info("Coleta finalizada!")
        logger.info("=" * 60)

    def run(self):
        """Loop principal"""
        logger.info("🚀 Weather Collector iniciado!")

        # Verificar conexão Redis
        try:
            self.redis_client.ping()
            logger.info("Connected to Redis")
        except Exception as e:
            logger.error(f"✗ Erro ao conectar ao Redis: {e}")
            return

        # Verificar API Key
        if not self.api_key or self.api_key == "your_api_key_here":
            logger.warning("⚠️  OPENWEATHER_API_KEY não configurada!")
            logger.warning("⚠️  Modo de demonstração - gerando dados mock")
            self.use_mock_data = True
        else:
            self.use_mock_data = False

        # Loop de coleta
        while True:
            try:
                if self.use_mock_data:
                    self.collect_mock_data()
                else:
                    self.collect_all()

                logger.info(f"Waiting {self.interval} seconds...\n")
                time.sleep(self.interval)

            except KeyboardInterrupt:
                logger.info("🛑 Encerrando collector...")
                break
            except Exception as e:
                logger.error(f"✗ Erro no loop principal: {e}")
                time.sleep(60)

    def collect_mock_data(self):
        """Gera dados mock para demonstração"""
        import random

        logger.info("=" * 60)
        logger.info("Gerando dados MOCK...")

        for city in self.cities:
            mock_data = {
                "city": city.strip(),
                "country": "BR",
                "temperature": round(random.uniform(15, 35), 1),
                "feels_like": round(random.uniform(15, 35), 1),
                "temp_min": round(random.uniform(10, 25), 1),
                "temp_max": round(random.uniform(25, 40), 1),
                "pressure": random.randint(1000, 1020),
                "humidity": random.randint(40, 90),
                "description": random.choice(
                    ["céu limpo", "poucas nuvens", "nublado", "chuva leve"]
                ),
                "wind_speed": round(random.uniform(0, 15), 1),
                "clouds": random.randint(0, 100),
                "timestamp": datetime.utcnow().isoformat(),
                "collected_at": datetime.now().isoformat(),
            }

            self.send_to_queue(mock_data)
            logger.info(f"Mock generated for {city}: {mock_data['temperature']}°C")

        logger.info("Mock finalizado!")
        logger.info("=" * 60)


if __name__ == "__main__":
    collector = WeatherCollector()
    collector.run()
