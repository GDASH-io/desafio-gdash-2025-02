import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

app = Celery("core")

app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

app.conf.timezone = "America/Sao_Paulo"
app.conf.enable_utc = False

app.conf.beat_schedule = {
    # Coleta dados de clima 1x por hora (no minuto 0 de toda hora)
    "collect-weather-every-hour": {
        "task": "apps.weather.tasks.collect_weather_task",
        "schedule": crontab(minute=0, hour="*"),
    },

    # Gera insight a cada 2 horas
    "generate-weather-insights-every-2-hours": {
        "task": "apps.weather.tasks.generate_insights_task",
        "schedule": crontab(minute=0, hour="*/2"),
        "kwargs": {
            "hours": 24,
            "force_collect": True,
        },
    },
}
