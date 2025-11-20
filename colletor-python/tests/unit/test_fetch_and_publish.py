"""
Testes unitários para FetchAndPublishUseCase.
"""
import pytest
from datetime import datetime
from unittest.mock import Mock, MagicMock
import pytz
from src.application.usecases.fetch_and_publish import FetchAndPublishUseCase
from src.domain.entities.weather_reading import WeatherReading


class TestFetchAndPublishUseCase:
    """Testes para FetchAndPublishUseCase."""
    
    @pytest.fixture
    def openweather_client(self):
        """Fixture para mock do OpenWeather client."""
        return Mock()
    
    @pytest.fixture
    def kafka_producer(self):
        """Fixture para mock do Kafka producer."""
        return Mock()
    
    @pytest.fixture
    def use_case(self, openweather_client, kafka_producer):
        """Fixture para criar instância do use case."""
        return FetchAndPublishUseCase(
            openweather_client=openweather_client,
            kafka_producer=kafka_producer,
        )
    
    def test_parse_hourly_data(self, use_case):
        """Testa parsing de dados hourly."""
        timezone = pytz.timezone("America/Sao_Paulo")
        hourly_data = [
            {
                "dt": 1609459200,  # 2021-01-01 00:00:00 UTC
                "temp": 25.5,
                "humidity": 70,
                "wind_speed": 3.2,
                "clouds": 50,
                "weather": [{"id": 800}],
                "rain": {"1h": 2.5},
                "pressure": 1013.25,
                "uvi": 5.0,
                "visibility": 10000,
            }
        ]
        
        readings = use_case._parse_hourly_data(hourly_data)
        
        assert len(readings) == 1
        assert readings[0].temperature_c == 25.5
        assert readings[0].relative_humidity == 70
        assert readings[0].precipitation_mm == 2.5
        assert readings[0].wind_speed_m_s == 3.2
        assert readings[0].clouds_percent == 50
        assert readings[0].weather_code == 800
    
    def test_parse_daily_data(self, use_case):
        """Testa parsing de dados daily."""
        daily_data = [
            {
                "dt": 1609459200,
                "temp": {"day": 28.0, "min": 20.0, "max": 30.0},
                "humidity": 75,
                "wind_speed": 4.5,
                "clouds": 60,
                "weather": [{"id": 801}],
                "rain": 5.0,
                "pressure": 1015.0,
                "uvi": 6.0,
            }
        ]
        
        readings = use_case._parse_daily_data(daily_data)
        
        assert len(readings) == 1
        assert readings[0].temperature_c == 28.0
        assert readings[0].relative_humidity == 75
        assert readings[0].precipitation_mm == 5.0
        assert readings[0].wind_speed_m_s == 4.5
        assert readings[0].clouds_percent == 60
    
    def test_build_message(self, use_case):
        """Testa construção de mensagem."""
        timezone = pytz.timezone("America/Sao_Paulo")
        readings = [
            WeatherReading(
                timestamp=datetime.now(tz=timezone),
                temperature_c=25.5,
                relative_humidity=70,
                precipitation_mm=0.0,
                wind_speed_m_s=3.2,
                clouds_percent=50,
                weather_code=800,
            )
        ]
        
        message = use_case._build_message(readings, "hourly")
        
        assert message["source"] == "openweather"
        assert message["city"] == "Coronel Fabriciano"
        assert message["country"] == "BR"
        assert message["interval"] == "hourly"
        assert len(message["payload"]) == 1
        assert "coords" in message
        assert "fetched_at" in message
    
    def test_execute_hourly(self, use_case, openweather_client, kafka_producer):
        """Testa execução completa com dados hourly."""
        # Mock da resposta da API
        openweather_client.fetch_with_manual_retry.return_value = {
            "hourly": [
                {
                    "dt": 1609459200,
                    "temp": 25.5,
                    "humidity": 70,
                    "wind_speed": 3.2,
                    "clouds": 50,
                    "weather": [{"id": 800}],
                    "rain": {"1h": 0.0},
                }
            ],
            "daily": [],
        }
        
        # Executar
        use_case.execute()
        
        # Verificar chamadas
        openweather_client.fetch_with_manual_retry.assert_called_once()
        kafka_producer.publish_to_default_topic.assert_called_once()
        
        # Verificar mensagem publicada
        call_args = kafka_producer.publish_to_default_topic.call_args
        message = call_args[0][0]
        assert message["interval"] == "hourly"
        assert len(message["payload"]) == 1
    
    def test_execute_daily(self, use_case, openweather_client, kafka_producer):
        """Testa execução completa com dados daily."""
        # Mock da resposta da API
        openweather_client.fetch_with_manual_retry.return_value = {
            "hourly": [],
            "daily": [
                {
                    "dt": 1609459200,
                    "temp": {"day": 28.0},
                    "humidity": 75,
                    "wind_speed": 4.5,
                    "clouds": 60,
                    "weather": [{"id": 801}],
                    "rain": 5.0,
                }
            ],
        }
        
        # Mock do config para daily
        with patch("src.application.usecases.fetch_and_publish.Config") as mock_config:
            mock_config.COLLECT_INTERVAL_TYPE = "daily"
            
            # Executar
            use_case.execute()
        
        # Verificar chamadas
        openweather_client.fetch_with_manual_retry.assert_called_once()
        kafka_producer.publish_to_default_topic.assert_called_once()

