import logging
from celery import shared_task
from .services.openweather import store_current_weather
from .services.insights import generate_insights_for_last_hours

logger = logging.getLogger(__name__)


@shared_task
def collect_weather_task():
    log = store_current_weather()
    logger.info("Weatherlog criado com id=%s para %s", log.id, log.city)
    return log.id


@shared_task
def generate_insights_task(hours: int = 24, force_collect: bool = False, city: str | None = None): # noqa E501
    """
    Gera insights de IA para as últimas `hours` horas.
    Se `city` for informado, filtra por cidade.
    `force_collect` hoje só coleta a cidade padrão (Brasília).
    """
    from .models import WeatherInsight

    if force_collect and not city:
        log = store_current_weather()
        logger.info(
            "Coleta forçada antes do insight. Weatherlog id=%s (%s)", log.id, log.city # noqa E501
        )

    text = generate_insights_for_last_hours(hours=hours, city=city)
    insight = WeatherInsight.objects.create(text=text)
    logger.info(
        "Insight_id=%s salvo com sucesso. city=%s", insight.id, city or "(todas)" # noqa E501
    )
    return insight.id
