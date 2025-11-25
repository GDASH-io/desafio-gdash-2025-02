# Python Weather Collector

Serviço responsável por coletar dados climáticos da API OpenWeatherMap e enviá-los para a fila Redis.

## 🎯 Funcionalidades

- Coleta dados de múltiplas cidades
- Envia para fila Redis
- Execução periódica configurável
- Logs detalhados
- Modo mock para testes sem API key

## 🚀 Execução Local

### Pré-requisitos

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
.\venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

### Executar

```bash
export OPENWEATHER_API_KEY=your_key
export REDIS_HOST=localhost
python main.py
```

## 🐳 Docker

```bash
docker build -t gdash-python-collector .
docker run --env-file .env gdash-python-collector
```

## ⚙️ Variáveis de Ambiente

- `OPENWEATHER_API_KEY`: Chave da API OpenWeatherMap
- `OPENWEATHER_CITIES`: Cidades separadas por vírgula
- `REDIS_HOST`: Host do Redis
- `REDIS_PORT`: Porta do Redis
- `COLLECTOR_INTERVAL`: Intervalo em segundos (padrão: 300)

## 📊 Formato dos Dados

```json
{
  "city": "São Paulo",
  "country": "BR",
  "temperature": 25.5,
  "feels_like": 26.0,
  "temp_min": 23.0,
  "temp_max": 28.0,
  "pressure": 1013,
  "humidity": 65,
  "description": "céu limpo",
  "wind_speed": 3.5,
  "clouds": 20,
  "timestamp": "2025-11-25T12:00:00",
  "collected_at": "2025-11-25T09:00:00"
}
```
