import requests
from config import API_KEY

def search_location(city:str= ""):
  GEOCODING_API = f"http://api.openweathermap.org/geo/1.0/direct?q={city}&limit=10&appid={API_KEY}"
  try:
    # valida o nome da cidade
    if not city or city.isdigit():
      raise Exception("Cidade inválida.")
    
    response = requests.get(GEOCODING_API, timeout=10)
    response.raise_for_status()
    location = response.json()[0]

    return {"success": True, "lat": location["lat"], "lon": location["lon"], "city_name": location["name"]}
  except requests.exceptions.RequestException as e:
    print("Erro na procura pela cidade:", e)
    return {"success": False, "message": "Erro interno na procura pela cidade"}
  except Exception as e:
    print("Erro na procura pela cidade:", e)
    return {"success": False, "message": "Erro na procura pela cidade"}

def get_weather(needDaily: bool, city:str=""):
  try:
    # procura pelas coordenadas da cidade
    # necessário para usar Open Meteo API
    loc = search_location(city)
    if not loc["success"]:
      return loc
    latitude = loc["lat"]
    longitude = loc["lon"]

    WEATHER_API = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,wind_speed_10m,precipitation,rain,cloud_cover&timezone=America%2FSao_Paulo&forecast_days=7"
    if needDaily:
      WEATHER_API += "&daily=uv_index_max,shortwave_radiation_sum,temperature_2m_max,temperature_2m_min"
    # verifica se o nome não ta vazio ou é uma string de fato
    if city == "" or not isinstance(city, str):
      raise Exception("Cidade inválida.")
    if not isinstance(latitude, float) or not isinstance(longitude, float):
      raise Exception("Latitude e longitude precisam ser float")
    
    response = requests.get(WEATHER_API, timeout=10)
    response.raise_for_status()
    sendData = response.json()
    sendData["city_name"] = loc["city_name"]
    sendData["has_daily"] = needDaily

    return sendData
  except requests.exceptions.RequestException as e:
    print("Erro na obtenção do clima:", e)
    return {"success": False, "message": "Erro na consulta do clima"}
  except Exception as e:
    print("Houve um erro na obtenção do clima:", e)
    return {"success": False, "message": "Erro na consulta do clima"}

def start(city:str, needDaily: bool):
  if __name__ != "__main__":
    if city == "" or not isinstance(city, str):
      print("Nome da cidade inválido")
      return {"success": False, "message": "Cidade inválida"}
    
    print(f"Iniciando consulta para: {city}")

    # pega somente o nome da cidade
    weather_data = get_weather(needDaily,city)

    # Publica o resultado
    print(f"Consulta finalizada para: {city}")
    return weather_data