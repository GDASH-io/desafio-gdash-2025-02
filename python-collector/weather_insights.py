import requests
from datetime import datetime

# --------------------------------------------------
# Ícones por código WMO
# --------------------------------------------------

def icon_from_wmo(code):
    if code == 0:
        return "☀️"
    if code in [1, 2, 3]:
        return "⛅"
    if code in [51, 53, 55, 61, 63, 65, 80, 81, 82]:
        return "🌧️"
    return "🌤️"


# --------------------------------------------------
# Previsão diária (temperatura, chuva, wmo)
# --------------------------------------------------

def fetch_daily_forecast(lat, lon):
    url = (
        "https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}"
        "&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code"
        "&timezone=auto"
        "&forecast_days=8"
    )
    data = requests.get(url, timeout=10).json()

    return {
        "dates": data["daily"]["time"],
        "tmin": data["daily"]["temperature_2m_min"],
        "tmax": data["daily"]["temperature_2m_max"],
        "rain_prob": data["daily"]["precipitation_probability_max"],
        "weather_code": data["daily"]["weather_code"]
    }


def next_7_days(daily):
    result = []

    if not daily.get("dates"):
        return result

    today = datetime.fromisoformat(daily["dates"][0]).date()

    for i in range(len(daily["dates"])):
        d = datetime.fromisoformat(daily["dates"][i]).date()

        if d > today:
            result.append({
                "date": d.isoformat(),
                "tmin": daily["tmin"][i],
                "tmax": daily["tmax"][i],
                "rain": daily["rain_prob"][i],
                "wmo": daily["weather_code"][i],
                "icon": icon_from_wmo(daily["weather_code"][i])
            })

        if len(result) == 7:
            break

    return result


# --------------------------------------------------
# Solar data — usando radiação direta horária
# --------------------------------------------------

def fetch_solar_daily(lat, lon):
    """
    Coleta radiação direta horária (W/m²) e soma para formar
    radiação diária total (Wh/m²).
    """
    url = (
        "https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}"
        "&hourly=direct_radiation,uv_index"
        "&timezone=auto"
        "&forecast_days=8"
    )

    r = requests.get(url, timeout=10).json()

    grouped = {}

    for t, dr, uv in zip(r["hourly"]["time"], r["hourly"]["direct_radiation"], r["hourly"]["uv_index"]):
        day = t.split("T")[0]
        if day not in grouped:
            grouped[day] = {"radiation": [], "uv": []}

        grouped[day]["radiation"].append(dr)  # W/m² por hora
        grouped[day]["uv"].append(uv)

    dates = sorted(grouped.keys())
    daily_rad = [sum(grouped[d]["radiation"]) for d in dates]
    daily_uv = [max(grouped[d]["uv"]) for d in dates]

    return {
        "dates": dates,
        "radiation": daily_rad,
        "uv_index": daily_uv
    }


# --------------------------------------------------
# Solar insights calibrados
# --------------------------------------------------

def estimate_generation_kwh(radiation_wh_m2, area_m2=20, efficiency=0.20):
    return round((radiation_wh_m2 * area_m2 * efficiency) / 1000, 2)


def best_solar_day(solar):
    max_rad = max(solar["radiation"])
    idx = solar["radiation"].index(max_rad)
    return {
        "date": solar["dates"][idx],
        "radiation_wh_m2": max_rad,
        "estimated_kwh": estimate_generation_kwh(max_rad)
    }


def solar_efficiency_index(radiation):
    """
    Índice calibrado para o BRASIL:
    - Dias nublados: < 1500 Wh/m²
    - Médios: 1500–3500
    - Bons: 3500–5500
    - Excelentes: 5500–7500
    """
    match radiation:
        case r if r <= 1500:
            return 20     # nublado
        case r if r <= 3000:
            return 40     # moderado
        case r if r <= 4500:
            return 60     # bom
        case r if r <= 6000:
            return 80     # muito bom
        case _:
            return 100    # excelente


def uv_exposure_level(uv_index):
    if uv_index >= 11:
        return "Extremo"
    if uv_index >= 8:
        return "Muito alto"
    if uv_index >= 6:
        return "Alto"
    if uv_index >= 3:
        return "Moderado"
    return "Baixo"


def solar_recommendation_daily(radiation, uv_index):
    tips = []

    # Radiação — valores realistas do Brasil
    if radiation >= 5500:
        tips.append("Dia excelente para geração solar — máxima produtividade.")
    elif radiation >= 3500:
        tips.append("Bom potencial de geração com radiação consistente.")
    elif radiation >= 2000:
        tips.append("Radiação moderada — geração estável.")
    else:
        tips.append("Baixa radiação — geração limitada hoje.")

    # UV
    if uv_index >= 8:
        tips.append("UV muito alto — evite sol direto e use protetor.")
    elif uv_index >= 6:
        tips.append("Nível alto de UV — recomenda-se proteção.")
    elif uv_index >= 3:
        tips.append("UV moderado — cuidado ao se expor ao sol.")
    else:
        tips.append("UV baixo — exposição segura.")

    return tips


# --------------------------------------------------
# Insights Climáticos
# --------------------------------------------------

def daily_tips(tmin, tmax, rain_prob):
    tips = []

    if tmax >= 33:
        tips.append("Calor intenso — hidrate-se bem.")
    elif tmax <= 18:
        tips.append("Temperatura baixa, use agasalho.")

    if rain_prob >= 60:
        tips.append("Alta chance de chuva. Leve guarda-chuva.")
    else:
        tips.append("Pouca chance de chuva.")

    return tips


def trend_temperature(tmin, tmax):
    delta = tmax - tmin

    if delta >= 12:
        return "Grande variação de temperatura."
    if tmax >= 30:
        return "Dia quente."
    if tmin <= 12:
        return "Manhã fria."

    return "Temperatura estável."


def comfort_score(temp, humidity):
    score = 100

    if temp < 20:
        score -= (20 - temp) * 2
    elif temp > 26:
        score -= (temp - 26) * 2

    if humidity < 40:
        score -= (40 - humidity)
    elif humidity > 65:
        score -= (humidity - 65)

    return max(0, min(100, score))

def calculate_trend(values):
    """
    Calcula a tendência simples com base na variação entre o 1º e o último valor.
    Retorna slope e direction ('increasing' | 'decreasing' | 'stable').
    """

    if len(values) < 2:
        return {
            "slope": 0,
            "direction": "stable"
        }

    slope = values[-1] - values[0]

    if slope > 0.3:
        direction = "increasing"
    elif slope < -0.3:
        direction = "decreasing"
    else:
        direction = "stable"

    return {
        "slope": round(slope, 2),
        "direction": direction
    }


def build_temperature_trend_chart(next_7):
    """
    Converte a previsão dos próximos 7 dias em uma lista para gráfico.
    Formato: [{date, tmin, tmax}]
    """
    data = []

    tmin_values = []
    tmax_values = []

    for d in next_7:
        data.append({
            "date": d["date"],
            "tmin": d["tmin"],
            "tmax": d["tmax"]
        })

        tmin_values.append(d["tmin"])
        tmax_values.append(d["tmax"])

    return {
        "data": data,
        "trend": {
            "tmin": calculate_trend(tmin_values),
            "tmax": calculate_trend(tmax_values)
        }
    }

# --------------------------------------------------
# FUNÇÃO FINAL — INTEGRA TUDO
# --------------------------------------------------

def generate_insights_for_location(lat, lon):
    daily_weather = fetch_daily_forecast(lat, lon)
    next_7 = next_7_days(daily_weather)

    solar = fetch_solar_daily(lat, lon)
    best_day = best_solar_day(solar)

    solar_map = {solar["dates"][i]: i for i in range(len(solar["dates"]))}

    enriched_days = []

    for d in next_7:
        iso = d["date"]

        enriched = {
            **d,
            "daily_tips": daily_tips(d["tmin"], d["tmax"], d["rain"]),
            "trend_temperature": trend_temperature(d["tmin"], d["tmax"])
        }

        if iso in solar_map:
            idx = solar_map[iso]
            rad = solar["radiation"][idx]
            uv = solar["uv_index"][idx]

            enriched["solar_radiation"] = rad
            enriched["estimated_generation_kwh"] = estimate_generation_kwh(rad)
            enriched["solar_efficiency"] = solar_efficiency_index(rad)
            enriched["uv_index"] = uv
            enriched["uv_level"] = uv_exposure_level(uv)
            enriched["solar_recommendations"] = solar_recommendation_daily(rad, uv)

        enriched_days.append(enriched)

    # ---- Dados solares do DIA ATUAL ----
    today_rad = solar["radiation"][0]
    today_uv = solar["uv_index"][0]

    eff_index = solar_efficiency_index(today_rad)

    if eff_index >= 80:
        reco = "Dia excelente para geração solar."
    elif eff_index >= 50:
        reco = "Bom potencial de geração."
    elif eff_index >= 20:
        reco = "Geração moderada devido ao clima."
    else:
        reco = "Baixo potencial solar hoje."

    print("DEBUG temperature_trend_chart:", build_temperature_trend_chart(next_7))

    return {
        "next_7_days": enriched_days,
        "solar_best_day": best_day,
        "solar_efficiency_index": eff_index,
        "today_sun_exposure": today_rad,
        "solar_recommendation": reco,
        "today_uv_index": today_uv,
        "today_uv_level": uv_exposure_level(today_uv),
        "temperature_trend_chart": build_temperature_trend_chart(next_7)
    }
