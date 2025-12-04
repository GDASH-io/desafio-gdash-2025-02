import requests
from datetime import datetime
from typing import Dict, Any, Optional, List
from src.config import Config


class WeatherAPI:
    """Cliente da Open-Meteo com fallback para dados horários quando 'current' estiver incompleto."""

    def __init__(self) -> None:
        self.base_url: str = Config.WEATHER_API_URL
        self.latitude: str = Config.LATITUDE
        self.longitude: str = Config.LONGITUDE

    def fetch_current_weather(self) -> Optional[Dict[str, Any]]:
        """Busca dados atuais com fallback para 'hourly' se necessário."""
        params = {
            "latitude": self.latitude,
            "longitude": self.longitude,
            "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation",
            "hourly": "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation",
            "timezone": "America/Sao_Paulo",
            "models": "best_match",
        }

        try:
            print(f"🌐 Buscando dados climáticos para: {self.latitude}, {self.longitude}")
            response = requests.get(self.base_url, params=params, timeout=15)
            response.raise_for_status()
            data: Dict[str, Any] = response.json()
        except requests.exceptions.RequestException as e:
            print(f"❌ Erro ao buscar dados climáticos: {e}")
            return None
        except Exception as e:
            print(f"❌ Erro inesperado: {e}")
            return None

        current: Dict[str, Any] = data.get("current") or {}
        hourly: Dict[str, Any] = data.get("hourly") or {}

        def latest_hourly(key: str) -> Optional[float]:
            series: List[Optional[float]] = hourly.get(key) or []
            if not series:
                return None
            val = series[-1]
            try:
                return float(val) if val is not None else None
            except Exception:
                return None

        def with_fallback(key: str) -> Optional[float]:
            val = current.get(key)
            if val is not None:
                try:
                    return float(val)
                except Exception:
                    return None
            return latest_hourly(key)

        temperature = with_fallback("temperature_2m")
        humidity = with_fallback("relative_humidity_2m")
        wind_speed = with_fallback("wind_speed_10m")
        precipitation = with_fallback("precipitation")

        wc_val = current.get("weather_code")
        if wc_val is None:
            wc_val = latest_hourly("weather_code")
        try:
            weather_code = int(wc_val) if wc_val is not None else None
        except Exception:
            weather_code = None

        weather_data: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat(),
            "collected_at": current.get("time"),
            "location": {
                "latitude": float(self.latitude),
                "longitude": float(self.longitude),
            },
            "temperature": temperature,
            "humidity": humidity,
            "wind_speed": wind_speed,
            "precipitation": precipitation,
            "weather_code": weather_code,
            "condition": self._get_weather_condition(weather_code),
        }

        print("✅ Dados coletados com sucesso!")
        print(f"   🌡️  Temperatura: {weather_data['temperature']}°C")
        print(f"   💧 Umidade: {weather_data['humidity']}%")
        print(f"   🌬️  Vento: {weather_data['wind_speed']} km/h")
        print(f"   ☁️  Condição: {weather_data['condition']}")

        return weather_data

    def _get_weather_condition(self, code: Optional[int]) -> str:
        if code is None:
            return "unknown"
        weather_codes = {
            0: "limpo",
            1: "principalmente_limpo",
            2: "parcialmente_nublado",
            3: "nublado",
            45: "nebuloso",
            48: "nebuloso",
            51: "garoa_leve",
            53: "garoa",
            55: "garoa_forte",
            61: "chuva_leve",
            63: "chuva",
            65: "chuva_forte",
            71: "neve_leve",
            73: "neve",
            75: "neve_forte",
            77: "granizo_neve",
            80: "pancadas_leves",
            81: "pancadas",
            82: "pancadas_fortes",
            85: "pancadas_neve_leves",
            86: "pancadas_neve",
            95: "tempestade",
            96: "tempestade_com_granizo",
            99: "tempestade_forte_com_granizo",
        }
        return weather_codes.get(code, "unknown")
