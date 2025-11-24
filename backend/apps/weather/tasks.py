from celery import shared_task
from .services.openweather import store_current_weather
from .services.insights import generate_insights_for_last_hours


@shared_task
def collect_weather_task():
    """
    Produtor + consumidor ao mesmo tempo:
    busca na API do tempo e grava na base.
    """
    log = store_current_weather()
    return log.id


@shared_task
def generate_insights_task(hours: int = 24):
    """
    Gera insights de IA (regra simples ou IA externa) a partir dos últimos registros. # noqa E501
    """
    from .models import WeatherInsight

    text = generate_insights_for_last_hours(hours=hours)
    insight = WeatherInsight.objects.create(text=text)
    return insight.id
