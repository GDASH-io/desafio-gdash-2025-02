import requests
from geopy.geocoders import Nominatim
from datetime import datetime
from pytz import timezone


WEATHER_CODE = {
    0: "Céu limpo",
    1: "Principalmente limpo",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Nevoeiro",
    48: "Nevoeiro com gelo",
    51: "Garoa leve",
    53: "Garoa",
    55: "Garoa intensa",
    61: "Chuva leve",
    63: "Chuva moderada",
    65: "Chuva forte",
    80: "Aguaceiros fracos",
    81: "Aguaceiros moderados",
    82: "Aguaceiros fortes",
} # Código de condição climática baseado na API Open-Meteo


COORDINATES_EXISTING = {}


def get_coordinates():
    geolocator = Nominatim(user_agent="coordenadas_teresina")
    cidade = "Teresina, Piauí, Brasil"
    location = geolocator.geocode(cidade, timeout=20)
    try:
        if location is None:
            raise ValueError("Não foi possível obter as coordenadas para a cidade especificada.")
        if location:
            latitude = location.latitude
            longitude = location.longitude
            cordinates = {
                "latitude": latitude,
                "longitude": longitude
            }
            return cordinates
    except ValueError as e:
        print(e)
        return None, None


def search_forecast(lat: float, lon: float, tz: str):
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "timezone": tz,
        "current_weather": True,
        "hourly": (
            "temperature_2m,"
            "relative_humidity_2m,"
            "precipitation_probability"
        )
    }
    response = requests.get(url, params=params)
    
    return response.json()


def get_time_info():
    try:
        cordinates = get_coordinates()
        forecast = search_forecast(cordinates["latitude"], cordinates["longitude"], "America/Fortaleza")
        data = extract_data(forecast)
        formatted_data = format_data(**data)
        return formatted_data
    
    except Exception as e:
        print(f"Erro ao obter as coordenadas: {e}")


def extract_data(func):
    current = func["current_weather"]
    hourly = func["hourly"]
    weather_code = current["weathercode"]
    condition = WEATHER_CODE.get(weather_code, "Desconhecido")
    return {
        "current": current,
        "hourly": hourly,
        "condition": condition
    }


def format_data(**kwargs):
    tz_brasil = timezone("America/Fortaleza")
    data_formatted = {
        "temperatura": kwargs["current"]["temperature"],
        "umidade": float(kwargs['hourly']['relative_humidity_2m'][0]),
        "vento": kwargs["current"]["windspeed"],
        "condicao": kwargs["condition"],
        "probabilidade_chuva": float(kwargs['hourly']['precipitation_probability'][0]),
        "data_coleta": (datetime.now(tz=tz_brasil)).strftime("%Y-%m-%d %H:%M:%S"),
        "cidade": "Teresina"
    }

    return data_formatted


#if __name__ == "__main__":
#    cordinates = get_coordinates()
#    forecast = search_forecast(cordinates["latitude"], cordinates["longitude"], "America/Fortaleza")
#    data = extract_data(forecast)
#    formatted_data = format_data(**data)
#    print(formatted_data)