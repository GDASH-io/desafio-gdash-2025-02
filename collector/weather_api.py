import requests
from datetime import datetime, timezone
from config import OPEN_METEO_URL, LOCATION_LAT, LOCATION_LON, LOCATION_NAME


WEATHER_CONDITIONS = {
    0: 'céu_limpo',
    1: 'predominantemente_limpo',
    2: 'parcialmente_nublado',
    3: 'encoberto',
    45: 'neblina',
    48: 'neblina_com_geada',
    51: 'garoa_leve',
    53: 'garoa_moderada',
    55: 'garoa_intensa',
    56: 'garoa_congelante_leve',
    57: 'garoa_congelante_intensa',
    61: 'chuva_fraca',
    63: 'chuva_moderada',
    65: 'chuva_forte',
    66: 'chuva_congelante_leve',
    67: 'chuva_congelante_forte',
    71: 'neve_fraca',
    73: 'neve_moderada',
    75: 'neve_forte',
    77: 'grãos_de_neve',
    80: 'chuva_fraca_intermitente',
    81: 'chuva_moderada_intermitente',
    82: 'chuva_violenta_intermitente',
    85: 'neve_fraca_intermitente',
    86: 'neve_forte_intermitente',
    95: 'trovoada',
    96: 'trovoada_com_granizo_leve',
    99: 'trovoada_com_granizo_forte'
}


def get_weather_condition(code):
    
    return WEATHER_CONDITIONS.get(code, 'desconhecido')


def extract_precipitation_probability(current, hourly):
   
    precipitation_prob = None
    current_time = current.get('time', '')
    
    if not (hourly.get('time') and hourly.get('precipitation_probability')):
        return None
    
    try:
        hourly_times = hourly['time']
        hourly_precip = hourly['precipitation_probability']
        
        if current_time:
            current_dt = datetime.fromisoformat(current_time.replace('Z', '+00:00'))
            current_hour_str = current_dt.strftime('%Y-%m-%dT%H:00')
            
            # Procurar correspondência exata
            for i, time_str in enumerate(hourly_times):
                if time_str.startswith(current_hour_str):
                    precipitation_prob = hourly_precip[i]
                    print(f"🔍 Probabilidade de chuva encontrada para {current_hour_str}: {precipitation_prob}%")
                    break
        
        # Se não encontrou, usar a primeira hora disponível
        if precipitation_prob is None and hourly_precip and len(hourly_precip) > 0:
            precipitation_prob = hourly_precip[0]
            print(f"⚠️ Usando primeira hora disponível: {precipitation_prob}%")
            
    except (ValueError, IndexError) as e:
        print(f"⚠️ Erro ao extrair probabilidade de chuva: {e}")
    
    return precipitation_prob


def get_weather_data():
  
    try:
        params = {
            'latitude': LOCATION_LAT,
            'longitude': LOCATION_LON,
            'current': 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
            'hourly': 'precipitation_probability',
            'wind_speed_unit': 'kmh',
            'timezone': 'auto',
            'forecast_days': 1
        }
        
        response = requests.get(OPEN_METEO_URL, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        current = data.get('current', {})
        hourly = data.get('hourly', {})
        
        wind_speed_kmh = current.get('wind_speed_10m')
        precipitation_prob = extract_precipitation_probability(current, hourly)
        
        weather_data = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'location': {
                'name': LOCATION_NAME,
                'lat': LOCATION_LAT,
                'lon': LOCATION_LON
            },
            'temperature': current.get('temperature_2m'),
            'humidity': current.get('relative_humidity_2m'),
            'windSpeed': wind_speed_kmh,
            'weatherCode': current.get('weather_code'),
            'condition': get_weather_condition(current.get('weather_code')),
            'precipitationProbability': precipitation_prob
        }
        
        # Validação
        if wind_speed_kmh is None:
            print(f"⚠️ Aviso - Velocidade do vento não disponível")
        if precipitation_prob is None:
            print(f"⚠️ Aviso - Probabilidade de chuva não disponível")
        
        return weather_data
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro na requisição à API: {e}")
        return None
    except Exception as e:
        print(f"❌ Erro ao coletar dados climáticos: {e}")
        import traceback
        traceback.print_exc()
        return None