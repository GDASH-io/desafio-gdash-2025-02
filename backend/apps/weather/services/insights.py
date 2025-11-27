from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from apps.weather.models import WeatherLog
from openai import OpenAI
import logging

logger = logging.getLogger(__name__)


def _generate_rule_based_insight(qs, hours: int, city: str | None = None) -> str: # noqa E501
    count = qs.count()
    if count == 0:
        if city:
            return f"Ainda não há dados suficientes para gerar insights climáticos para {city}." # noqa E501
        return "Ainda não há dados suficientes para gerar insights climáticos."

    temps = [w.temperature for w in qs]
    hums = [w.humidity for w in qs]
    max_temp = max(temps)
    min_temp = min(temps)
    avg_temp = sum(temps) / len(temps)
    avg_humidity = sum(hums) / len(hums)
    last = qs.first()

    cidade_ref = city or last.city

    texto = (
        f"Nos últimos {hours}h, foram coletadas {count} medições em {cidade_ref}.\n" # noqa E501
        f"Temperatura média: {avg_temp:.1f}°C (máx {max_temp:.1f}°C, mín {min_temp:.1f}°C).\n" # noqa E501
        f"Umidade média: {avg_humidity:.0f}%.\n"
        f"Condição mais recente em {last.city}: {last.condition} "
        f"com {last.temperature:.1f}°C e vento de {last.wind_speed:.1f} m/s."
    )
    return texto


def generate_insights_for_last_hours(hours: int = 24, city: str | None = None) -> str: # noqa E501
    since = timezone.now() - timedelta(hours=hours)

    qs = WeatherLog.objects.filter(timestamp__gte=since)
    if city:
        qs = qs.filter(city__iexact=city)

    qs = qs.order_by("-timestamp")

    logger.info(
        "Gerando insight para últimas %sh. Cidade=%s. Registros encontrados: %s", # noqa E501
        hours,
        city or "(todas)",
        qs.count(),
    )

    base_text = _generate_rule_based_insight(qs, hours, city=city)

    openai_cfg = getattr(settings, "OPENAI_CONFIG", {})
    api_key = openai_cfg.get("api_key") or ""
    model = openai_cfg.get("model") or "gpt-4.1-mini"

    if not api_key:
        logger.warning(
            "OPENAI_API_KEY não configurada. Usando insight numérico."
        )
        return base_text + "\n\n[IA desativada: OPENAI_API_KEY não configurada.]" # noqa E501

    if qs.count() == 0:
        return base_text

    recent_logs = qs[:5]
    linhas = []
    for w in recent_logs:
        linhas.append(
            f"- {w.timestamp:%d/%m %H:%M} | {w.city} | {w.temperature:.1f}°C | " # noqa E501
            f"{w.humidity:.0f}% umidade | {w.condition}"
        )
    resumo_medicoes = "\n".join(linhas)

    cidade_ref = city or recent_logs[0].city

    prompt_usuario = (
        "Você é um especialista em meteorologia explicando dados de clima para um usuário leigo.\n" # noqa E501
        f"A cidade foco é: {cidade_ref}.\n"
        "Use o resumo numérico e as últimas medições abaixo para gerar um texto curto (máximo ~6 frases),\n" # noqa E501
        "em português do Brasil, com tom claro e amigável. Foque em tendências (aquecendo, esfriando,\n" # noqa E501
        "estável, muito úmido, etc.) e recomendações práticas.\n\n"
        "Resumo numérico:\n"
        f"{base_text}\n\n"
        "Últimas medições:\n"
        f"{resumo_medicoes}\n\n"
        "Agora gere o insight:"
    )

    try:
        logger.info(
            "Chamando OpenAI modelo=%s para gerar insight de clima.", model
        )
        client = OpenAI(api_key=api_key)

        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Você é um assistente especializado em clima, "
                        "que gera comentários curtos e úteis sobre o tempo atual e recente." # noqa E501
                    ),
                },
                {"role": "user", "content": prompt_usuario},
            ],
            temperature=0.4,
            max_tokens=300,
        )

        ia_text = (response.choices[0].message.content or "").strip()
        logger.info(
            "Insight IA gerado com sucesso. Tamanho: %s caracteres.", len(ia_text) # noqa E501
        )
        return ia_text

    except Exception as exc:
        logger.exception("Erro ao chamar OpenAI para gerar insight: %s", exc)
        return (
            base_text
            + "\n\n[Não foi possível gerar insight via IA no momento, exibindo resumo numérico.]" # noqa E501
        )
