def format_value(value, unit='', decimals=1):
    
    if value is None:
        return 'N/A'
    if isinstance(value, (int, float)):
        return f"{value:.{decimals}f}{unit}"
    return str(value)


def display_weather_summary(weather_data):
   
    temp = format_value(weather_data.get('temperature'), '°C')
    humidity = format_value(weather_data.get('humidity'), '%', 0)
    wind = format_value(weather_data.get('windSpeed'), ' km/h')
    precip = format_value(weather_data.get('precipitationProbability'), '%', 0)
    condition = weather_data.get('condition', 'desconhecido').replace('_', ' ').title()
    
    print(f"📊 {condition}")
    print(f"   🌡️  Temperatura: {temp}")
    print(f"   💧 Umidade: {humidity}")
    print(f"   🌬️  Vento: {wind}")
    print(f"   🌧️  Prob. Chuva: {precip}")