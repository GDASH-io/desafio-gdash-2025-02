from datetime import timedelta
from django.utils import timezone

from apps.weather.models import WeatherLog


def generate_insights_for_last_hours(hours: int = 24) -> str:
    """
    Versão simples, baseada em regras, para gerar texto de insight.
    Se depois você quiser integrar com OpenAI, basta trocar a implementação.
    """
    since = timezone.now() - timedelta(hours=hours)
    qs = WeatherLog.objects.filter(timestamp__gte=since)

    count = qs.count()
    if count == 0:
        return "Ainda não há dados suficientes para gerar insights climáticos."

    temps = [w.temperature for w in qs]
    hums = [w.humidity for w in qs]
    max_temp = max(temps)
    min_temp = min(temps)
    avg_temp = sum(temps) / len(temps)
    avg_humidity = sum(hums) / len(hums)
    last = qs.first()  # devido ao ordering '-timestamp'

    texto = (
        f"Nos últimos {hours}h, foram coletadas {count} medições.\n"
        f"Temperatura média: {avg_temp:.1f}°C (máx {max_temp:.1f}°C, mín {min_temp:.1f}°C).\n" # noqa E501
        f"Umidade média: {avg_humidity:.0f}%.\n"
        f"Condição mais recente em {last.city}: {last.condition} "
        f"com {last.temperature:.1f}°C e vento de {last.wind_speed:.1f} m/s."
    )

    # Aqui você poderia complementar chamando um modelo de IA:
    # resposta = openai.chat.completions.create(...)
    # texto = resposta.choices[0].message.content

    return texto
