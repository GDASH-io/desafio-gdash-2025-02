import json

def format_coordinates(coordinates):
    return {
        "latitude": coordinates["lat"],
        "longitude": coordinates["lon"]
    }

def format_weather_data(weather):
    return {
        "temperatura": f"{weather['temperature']}°C",
        "umidade": f"{weather['humidity']}%",
        "velocidade_vento": f"{weather['wind_speed']} km/h",
        "descricao": weather['weather_description'],
        "probabilidade_chuva": f"{weather['rain_probability']}%"
    }

def print_weather_info(coordinates, weather):
    print(f"🏙️  Cidade: {coordinates['city']}", flush=True)
    print(f"📅 Data/Hora: {weather['fetched_at']}", flush=True)
    
    print("📍 Coordenadas:")
    coords_formatted = format_coordinates(coordinates)
    print(json.dumps(coords_formatted, indent=2, ensure_ascii=False), flush=True)
    
    print("🌤️  Clima:")
    weather_formatted = format_weather_data(weather)
    print(json.dumps(weather_formatted, indent=2, ensure_ascii=False), flush=True)

