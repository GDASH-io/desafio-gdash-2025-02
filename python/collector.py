import logging
import time
from datetime import datetime, timezone
from typing import Any, Dict, List

import requests

from config import CollectorSettings
from providers import WeatherProvider
from publisher import RabbitPublisher


class WeatherCollector:
    def __init__(
        self,
        settings: CollectorSettings,
        provider: WeatherProvider,
        publisher: RabbitPublisher,
        logger: logging.Logger,
    ):
        self.settings = settings
        self.provider = provider
        self.publisher = publisher
        self.logger = logger
        self.last_run: datetime | None = None

    def run(self) -> None:
        self.logger.info("Weather collector started with dynamic locations: %s", bool(self.settings.locations_url))
        while True:
            try:
                self._sync_config()
                locations = self._load_locations()
                self._collect_for_locations(locations)
            except Exception as exc:  # pylint: disable=broad-except
                self.logger.exception("erro ao coletar/enviar dados: %s", exc)
            time.sleep(self.settings.loop_interval_seconds)

    def _sync_config(self) -> None:
        if not self.settings.config_url:
            return
        try:
            response = requests.get(self.settings.config_url, timeout=5)
            response.raise_for_status()
            data = response.json()
            if isinstance(data, dict) and data.get("collectIntervalMinutes"):
                self.settings.default_interval_minutes = int(data["collectIntervalMinutes"])
        except Exception as exc:  # pylint: disable=broad-except
            self.logger.warning("falha ao sincronizar config do coletor: %s", exc)

    def _load_locations(self) -> List[Dict[str, Any]]:
        if self.settings.locations_url:
            try:
                response = requests.get(self.settings.locations_url, timeout=5)
                response.raise_for_status()
                data = response.json()
                if isinstance(data, list) and data:
                    return data
            except Exception as exc:  # pylint: disable=broad-except
                self.logger.warning("falha ao buscar locais dinamicos (%s), usando fallback", exc)

        return [
            {
                "name": self.settings.default_city,
                "latitude": self.settings.default_latitude,
                "longitude": self.settings.default_longitude,
                "intervalMinutes": self.settings.default_interval_minutes,
            }
        ]

    def _collect_for_locations(self, locations: List[Dict[str, Any]]) -> None:
        now = datetime.now(timezone.utc)
        if self.last_run and (now - self.last_run).total_seconds() < self.settings.default_interval_minutes * 60:
            return

        for loc in locations:
            try:
                payload = self._build_payload(loc)
                self.publisher.publish(payload)
                self.logger.info(
                    "mensagem publicada na fila %s (%s - %s)",
                    self.settings.rabbit.queue,
                    payload.get("city"),
                    payload.get("collected_at"),
                )
            except Exception as exc:  # pylint: disable=broad-except
                self.logger.exception("falha ao coletar dados para %s: %s", loc.get("name"), exc)

        self.last_run = now

    def _build_payload(self, loc: Dict[str, Any]) -> Dict[str, Any]:
        latitude = loc.get("latitude", self.settings.default_latitude)
        longitude = loc.get("longitude", self.settings.default_longitude)
        name = loc.get("name") or loc.get("city") or "unknown"
        location_id = str(loc.get("_id") or loc.get("id") or "") or None

        payload = self.provider.fetch(float(latitude), float(longitude))
        payload.update(
            {
                "city": name,
                "latitude": latitude,
                "longitude": longitude,
                "location_id": location_id,
            }
        )
        return payload