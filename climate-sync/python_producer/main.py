from flask import Flask, jsonify
from weather_client import WeatherClient
import os

app = Flask(__name__)
client = WeatherClient()

@app.route('/weather', methods=['GET'])
def get_weather():
    try:
        # Busca dados usando o cliente existente
        data = client.fetch_weather_data()
        
        if data:
            return jsonify(data)
        
        return jsonify({"error": "Failed to fetch weather data"}), 502
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"🚀 Python Producer API starting on port {port}")
    app.run(host='0.0.0.0', port=port)
