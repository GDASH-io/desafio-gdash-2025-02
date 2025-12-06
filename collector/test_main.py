import pytest
import json
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime
from dataclasses import asdict
import sys
import os

# Add parent directory to path to import main
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import (
    WeatherData,
    get_weather_condition,
    fetch_weather_data,
    publish_to_rabbitmq,
    job
)


class TestWeatherCondition:
    """Tests for weather condition mapping function."""
    
    def test_clear_sky(self):
        assert get_weather_condition(0) == "Clear sky"
    
    def test_partly_cloudy(self):
        assert get_weather_condition(1) == "Mainly clear, partly cloudy, and overcast"
        assert get_weather_condition(2) == "Mainly clear, partly cloudy, and overcast"
        assert get_weather_condition(3) == "Mainly clear, partly cloudy, and overcast"
    
    def test_fog(self):
        assert get_weather_condition(45) == "Fog and depositing rime fog"
        assert get_weather_condition(48) == "Fog and depositing rime fog"
    
    def test_drizzle(self):
        assert get_weather_condition(51) == "Drizzle: Light, moderate, and dense intensity"
        assert get_weather_condition(53) == "Drizzle: Light, moderate, and dense intensity"
        assert get_weather_condition(55) == "Drizzle: Light, moderate, and dense intensity"
    
    def test_rain(self):
        assert get_weather_condition(61) == "Rain: Slight, moderate and heavy intensity"
        assert get_weather_condition(63) == "Rain: Slight, moderate and heavy intensity"
        assert get_weather_condition(65) == "Rain: Slight, moderate and heavy intensity"
    
    def test_snow(self):
        assert get_weather_condition(71) == "Snow fall: Slight, moderate, and heavy intensity"
        assert get_weather_condition(73) == "Snow fall: Slight, moderate, and heavy intensity"
        assert get_weather_condition(75) == "Snow fall: Slight, moderate, and heavy intensity"
    
    def test_thunderstorm(self):
        assert get_weather_condition(95) == "Thunderstorm: Slight or moderate"
        assert get_weather_condition(96) == "Thunderstorm with slight and heavy hail"
        assert get_weather_condition(99) == "Thunderstorm with slight and heavy hail"
    
    def test_unknown_code(self):
        assert get_weather_condition(999) == "Unknown"
        assert get_weather_condition(-1) == "Unknown"


class TestWeatherData:
    """Tests for WeatherData dataclass."""
    
    def test_weather_data_creation(self):
        weather = WeatherData(
            city="São Paulo",
            temperature=25.5,
            humidity=65,
            windSpeed=12.3,
            condition="Clear sky",
            timestamp="2024-01-01T12:00:00"
        )
        
        assert weather.city == "São Paulo"
        assert weather.temperature == 25.5
        assert weather.humidity == 65
        assert weather.windSpeed == 12.3
        assert weather.condition == "Clear sky"
        assert weather.timestamp == "2024-01-01T12:00:00"
    
    def test_weather_data_to_dict(self):
        weather = WeatherData(
            city="Test City",
            temperature=20.0,
            humidity=50,
            windSpeed=10.0,
            condition="Cloudy",
            timestamp="2024-01-01T12:00:00"
        )
        
        data_dict = asdict(weather)
        
        assert data_dict['city'] == "Test City"
        assert data_dict['temperature'] == 20.0
        assert data_dict['humidity'] == 50
        assert data_dict['windSpeed'] == 10.0
        assert data_dict['condition'] == "Cloudy"
        assert data_dict['timestamp'] == "2024-01-01T12:00:00"


class TestFetchWeatherData:
    """Tests for weather data fetching from API."""
    
    @patch('main.requests.get')
    @patch('main.datetime')
    def test_successful_fetch(self, mock_datetime, mock_get):
        # Mock datetime
        mock_datetime.now.return_value.isoformat.return_value = "2024-01-01T12:00:00"
        
        # Mock API response
        mock_response = Mock()
        mock_response.json.return_value = {
            'current_weather': {
                'temperature': 25.5,
                'windspeed': 12.3,
                'weathercode': 0,
                'time': '2024-01-01T12:00'
            },
            'hourly': {
                'time': ['2024-01-01T12:00', '2024-01-01T13:00'],
                'relativehumidity_2m': [65, 70]
            }
        }
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response
        
        weather = fetch_weather_data()
        
        assert weather is not None
        assert weather.temperature == 25.5
        assert weather.humidity == 65
        assert weather.windSpeed == 12.3
        assert weather.condition == "Clear sky"
        assert weather.timestamp == "2024-01-01T12:00:00"
    
    @patch('main.requests.get')
    def test_api_request_error(self, mock_get):
        import requests
        # Config call fails but is caught, weather API call also fails
        def side_effect_func(url, **kwargs):
            raise requests.RequestException("Network error")
        
        mock_get.side_effect = side_effect_func
        
        weather = fetch_weather_data()
        
        assert weather is None
    
    @patch('main.requests.get')
    def test_api_timeout(self, mock_get):
        import requests
        mock_get.side_effect = requests.Timeout("Request timeout")
        
        weather = fetch_weather_data()
        
        assert weather is None
    
    @patch('main.requests.get')
    @patch('main.datetime')
    def test_missing_humidity_data(self, mock_datetime, mock_get):
        mock_datetime.now.return_value.isoformat.return_value = "2024-01-01T12:00:00"
        
        mock_response = Mock()
        mock_response.json.return_value = {
            'current_weather': {
                'temperature': 25.5,
                'windspeed': 12.3,
                'weathercode': 0,
                'time': '2024-01-01T12:00'
            },
            'hourly': {}  # Missing humidity data
        }
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response
        
        weather = fetch_weather_data()
        
        assert weather is not None
        assert weather.humidity == 50  # Default fallback


class TestPublishToRabbitMQ:
    """Tests for RabbitMQ publishing functionality."""
    
    @patch('main.pika.BlockingConnection')
    def test_successful_publish(self, mock_connection_class):
        # Setup mocks
        mock_connection = Mock()
        mock_channel = Mock()
        mock_connection.channel.return_value = mock_channel
        mock_connection_class.return_value = mock_connection
        
        weather_data = WeatherData(
            city="Test City",
            temperature=20.0,
            humidity=50,
            windSpeed=10.0,
            condition="Clear sky",
            timestamp="2024-01-01T12:00:00"
        )
        
        publish_to_rabbitmq(weather_data)
        
        # Verify queue was declared
        mock_channel.queue_declare.assert_called_once_with(
            queue='weather_data',
            durable=True
        )
        
        # Verify message was published
        assert mock_channel.basic_publish.called
        call_args = mock_channel.basic_publish.call_args
        assert call_args[1]['routing_key'] == 'weather_data'
        
        # Verify message content
        published_message = call_args[1]['body']
        message_data = json.loads(published_message)
        assert message_data['city'] == "Test City"
        assert message_data['temperature'] == 20.0
        
        # Verify connection was closed
        mock_connection.close.assert_called_once()
    
    @patch('main.pika.BlockingConnection')
    @patch('main.time.sleep')
    def test_connection_retry_logic(self, mock_sleep, mock_connection_class):
        import pika.exceptions
        
        # Simulate connection failures then success
        mock_connection_class.side_effect = [
            pika.exceptions.AMQPConnectionError("Connection failed"),
            pika.exceptions.AMQPConnectionError("Connection failed"),
            Mock()  # Success on third attempt
        ]
        
        weather_data = WeatherData(
            city="Test",
            temperature=20.0,
            humidity=50,
            windSpeed=10.0,
            condition="Clear",
            timestamp="2024-01-01T12:00:00"
        )
        
        publish_to_rabbitmq(weather_data)
        
        # Verify retries occurred
        assert mock_connection_class.call_count == 3
        assert mock_sleep.call_count == 2
    
    @patch('main.pika.BlockingConnection')
    @patch('main.time.sleep')
    def test_max_retries_exceeded(self, mock_sleep, mock_connection_class):
        import pika.exceptions
        
        # Simulate all connection attempts failing
        mock_connection_class.side_effect = pika.exceptions.AMQPConnectionError("Connection failed")
        
        weather_data = WeatherData(
            city="Test",
            temperature=20.0,
            humidity=50,
            windSpeed=10.0,
            condition="Clear",
            timestamp="2024-01-01T12:00:00"
        )
        
        publish_to_rabbitmq(weather_data)
        
        # Verify max retries (5) were attempted
        assert mock_connection_class.call_count == 5


class TestJob:
    """Tests for the main job function."""
    
    @patch('main.publish_to_rabbitmq')
    @patch('main.fetch_weather_data')
    def test_successful_job_execution(self, mock_fetch, mock_publish):
        weather_data = WeatherData(
            city="Test",
            temperature=20.0,
            humidity=50,
            windSpeed=10.0,
            condition="Clear",
            timestamp="2024-01-01T12:00:00"
        )
        mock_fetch.return_value = weather_data
        
        job()
        
        mock_fetch.assert_called_once()
        mock_publish.assert_called_once_with(weather_data)
    
    @patch('main.publish_to_rabbitmq')
    @patch('main.fetch_weather_data')
    def test_job_with_no_weather_data(self, mock_fetch, mock_publish):
        mock_fetch.return_value = None
        
        job()
        
        mock_fetch.assert_called_once()
        mock_publish.assert_not_called()
