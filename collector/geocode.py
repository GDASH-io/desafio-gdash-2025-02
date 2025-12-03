import requests

def geocode(city_name: str):
    url = f"https://geocoding-api.open-meteo.com/v1/search?name={city_name}"
    response = requests.get(url)
    data = response.json()

    if "results" in data and len(data["results"]) > 0:
        lat = data["results"][0]["latitude"]
        lon = data["results"][0]["longitude"]
        print(f"Coordenadas de {city_name}: lat={lat}, lon={lon}")
        return lat, lon

    print(f"⚠ Não foi possível encontrar a cidade '{city_name}', usando padrão.")
    return None, None