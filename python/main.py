import logging

from collector import WeatherCollector
from config import load_settings
from providers import build_provider
from publisher import RabbitPublisher


def configure_logging() -> logging.Logger:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    return logging.getLogger("python-collector")


def main() -> None:
    logger = configure_logging()
    settings = load_settings()
    provider = build_provider(settings.provider, settings.api_key)
    publisher = RabbitPublisher(settings.rabbit)

    collector = WeatherCollector(settings, provider, publisher, logger)
    collector.run()


if __name__ == "__main__":
    main()