"""
Testes unitários para OpenWeatherClient.
"""
import pytest
import requests
from unittest.mock import Mock, patch, MagicMock
from src.infra.http.openweather_client import OpenWeatherClient


class TestOpenWeatherClient:
    """Testes para OpenWeatherClient."""
    
    @pytest.fixture
    def client(self):
        """Fixture para criar instância do cliente."""
        return OpenWeatherClient(
            api_key="test_key",
            latitude=-19.5186,
            longitude=-42.6289,
            timeout=15,
            max_retries=3,
            retry_backoff_base=2,
        )
    
    @patch("src.infra.http.openweather_client.requests.Session.get")
    def test_fetch_onecall_success(self, mock_get, client):
        """Testa busca bem-sucedida de dados."""
        # Mock da resposta
        mock_response = Mock()
        mock_response.json.return_value = {
            "hourly": [
                {
                    "dt": 1609459200,
                    "temp": 25.5,
                    "humidity": 70,
                    "wind_speed": 3.2,
                    "clouds": 50,
                    "weather": [{"id": 800}],
                    "pressure": 1013.25,
                    "uvi": 5.0,
                }
            ],
            "daily": [],
        }
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response
        
        # Executar
        result = client.fetch_onecall()
        
        # Verificar
        assert "hourly" in result
        assert len(result["hourly"]) == 1
        mock_get.assert_called_once()
    
    @patch("src.infra.http.openweather_client.requests.Session.get")
    def test_fetch_onecall_http_error(self, mock_get, client):
        """Testa tratamento de erro HTTP."""
        # Mock de erro HTTP
        mock_response = Mock()
        mock_response.raise_for_status.side_effect = requests.exceptions.HTTPError(
            "404 Not Found"
        )
        mock_get.return_value = mock_response
        
        # Executar e verificar exceção
        with pytest.raises(requests.exceptions.HTTPError):
            client.fetch_onecall()
    
    @patch("src.infra.http.openweather_client.time.sleep")
    @patch("src.infra.http.openweather_client.OpenWeatherClient.fetch_onecall")
    def test_fetch_with_manual_retry_success_after_retry(
        self, mock_fetch, mock_sleep, client
    ):
        """Testa retry manual com sucesso após tentativas."""
        # Primeira tentativa falha, segunda sucede
        mock_fetch.side_effect = [
            requests.exceptions.RequestException("Erro temporário"),
            {"hourly": [], "daily": []},
        ]
        
        # Executar
        result = client.fetch_with_manual_retry()
        
        # Verificar
        assert result == {"hourly": [], "daily": []}
        assert mock_fetch.call_count == 2
        mock_sleep.assert_called_once()
    
    @patch("src.infra.http.openweather_client.time.sleep")
    @patch("src.infra.http.openweather_client.OpenWeatherClient.fetch_onecall")
    def test_fetch_with_manual_retry_max_retries(
        self, mock_fetch, mock_sleep, client
    ):
        """Testa esgotamento de tentativas."""
        # Todas as tentativas falham
        mock_fetch.side_effect = requests.exceptions.RequestException("Erro")
        
        # Executar e verificar exceção
        with pytest.raises(requests.exceptions.RequestException):
            client.fetch_with_manual_retry()
        
        # Verificar que todas as tentativas foram feitas
        assert mock_fetch.call_count == 3
        assert mock_sleep.call_count == 2  # 2 retries

