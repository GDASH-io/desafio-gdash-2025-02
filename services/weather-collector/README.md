# Placeholder para o serviço Python Weather Collector

Este diretório conterá o coletor de dados climáticos em Python.

## Estrutura Planejada

```
weather-collector/
├── src/
│   ├── __init__.py
│   ├── main.py                 # Entry point
│   ├── collector.py            # Lógica de coleta
│   ├── publisher.py            # Publicação no RabbitMQ
│   └── config.py               # Configurações
├── Dockerfile
├── requirements.txt
└── .dockerignore
```

## Responsabilidades

- Coletar dados da API Open-Meteo a cada hora
- Normalizar os dados em formato JSON
- Publicar no RabbitMQ (exchange: `weather_exchange`, routing key: `weather.data`)
