import requests

def obter_cidade(lat, lon):
    try:
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}&accept-language=pt-BR"
        headers = {"User-Agent": "gdash-weather-challenge-student-app"}

        res = requests.get(url, headers=headers, timeout=5)
        res.raise_for_status()
        data = res.json()

        addr = data.get("address", {})
        cidade =  addr.get("city") or addr.get("town") or addr.get("village") or addr.get("municipality")

        return cidade if cidade else f"Lat: {lat}, Lon: {lon}"

    except Exception as e:
        print(f"⚠️ Erro ao obter nome da cidade: {e}", flush=True)
        return f"Lat: {lat}, Lon: {lon}"