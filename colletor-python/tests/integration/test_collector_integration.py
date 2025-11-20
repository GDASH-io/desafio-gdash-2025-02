"""
Testes de integração para o collector.
"""
import pytest
import os
from kafka import KafkaConsumer
from src.shared.config import Config
from src.infra.http.openweather_client import OpenWeatherClient
from src.infra.messaging.kafka_producer import KafkaProducerImpl
from src.application.usecases.fetch_and_publish import FetchAndPublishUseCase


@pytest.mark.integration
class TestCollectorIntegration:
    """Testes de integração end-to-end."""
    
    @pytest.fixture
    def kafka_consumer(self):
        """Fixture para criar consumer Kafka."""
        consumer = KafkaConsumer(
            Config.KAFKA_TOPIC_RAW,
            bootstrap_servers=Config.KAFKA_BOOTSTRAP_SERVERS.split(","),
            auto_offset_reset="earliest",
            consumer_timeout_ms=10000,
        )
        yield consumer
        consumer.close()
    
    @pytest.mark.skipif(
        not os.getenv("OPENWEATHER_API_KEY"),
        reason="OPENWEATHER_API_KEY não configurada",
    )
    def test_end_to_end_collection_and_publish(self, kafka_consumer):
        """Testa fluxo completo: buscar dados e publicar no Kafka."""
        # Inicializar componentes
        openweather_client = OpenWeatherClient(
            api_key=Config.OPENWEATHER_API_KEY,
            latitude=Config.LATITUDE,
            longitude=Config.LONGITUDE,
        )
        
        kafka_producer = KafkaProducerImpl()
        
        use_case = FetchAndPublishUseCase(
            openweather_client=openweather_client,
            kafka_producer=kafka_producer,
        )
        
        # Executar use case
        use_case.execute()
        
        # Consumir mensagem do Kafka
        messages = list(kafka_consumer)
        
        # Verificar
        assert len(messages) > 0
        
        # Verificar estrutura da mensagem
        import json
        message_value = json.loads(messages[-1].value.decode("utf-8"))
        
        assert message_value["source"] == "openweather"
        assert message_value["city"] == "Coronel Fabriciano"
        assert "payload" in message_value
        assert len(message_value["payload"]) > 0
        
        # Verificar campos prioritários para PV
        first_reading = message_value["payload"][0]
        assert "temperature_c" in first_reading
        assert "clouds_percent" in first_reading
        assert "precipitation_mm" in first_reading
        assert "wind_speed_m_s" in first_reading
        
        kafka_producer.close()

