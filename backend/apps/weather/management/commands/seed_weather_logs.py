import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.weather.models import WeatherLog


class Command(BaseCommand):
    help = "Gera dados fictícios de WeatherLog para testes de dashboard/insights." # noqa E501

    def add_arguments(self, parser):
        parser.add_argument(
            "--days",
            type=int,
            default=7,
            help="Quantidade de dias para trás a partir de hoje (default: 7).",
        )
        parser.add_argument(
            "--step",
            type=int,
            default=3,
            help="Intervalo em horas entre leituras (default: 3h).",
        )

    def handle(self, *args, **options):
        days = options["days"]
        step = options["step"]

        now = timezone.now()
        total = 0

        self.stdout.write(
            self.style.NOTICE(
                f"Gerando dados de {days} dia(s), a cada {step}h..."
            )
        )

        for day_offset in range(days, 0, -1):
            base = (now - timedelta(days=day_offset)).replace(
                hour=0, minute=0, second=0, microsecond=0
            )

            for hour in range(0, 24, step):
                dt = base + timedelta(hours=hour)
                temp = random.uniform(18, 34)          # °C
                humidity = random.uniform(30, 90)      # %
                wind = random.uniform(0, 12)           # m/s (ou algo assim)
                rain_prob = random.choice([0, 10, 20, 30, 40, 60, 80, 100])
                condition_code = random.choice(["0", "1", "2", "3", "45", "61"]) # noqa E501

                WeatherLog.objects.create(
                    collected_at=dt,
                    temperature=round(temp, 1),
                    humidity=round(humidity, 1),
                    wind_speed=round(wind, 1),
                    rain_probability=rain_prob,
                    condition=str(condition_code),
                    source="seed-script",
                    raw_payload={},
                )

                total += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seed concluído: {total} registros criados em WeatherLog."
            )
        )
