# Weather Collector - Python Service

Serviço Python responsável por coletar dados climáticos da API Open-Meteo e publicar no RabbitMQ.

## 📁 Estrutura

```
weather-collector/
├── src/
│   ├── __init__.py
│   ├── main.py                 # Entry point + Scheduler
│   ├── collector.py            # Orquestrador
│   ├── weather_api.py          # Cliente Open-Meteo API
│   ├── rabbitmq_publisher.py   # Publisher RabbitMQ
│   └── config.py               # Configurações
├── Dockerfile
├── requirements.txt
└── .dockerignore
```

## 🚀 Como Rodar

### Com Docker (recomendado)
```bash
docker-compose up weather-collector
```

### Localmente (desenvolvimento)
```bash
cd services/weather-collector
pip install -r requirements.txt
python src/main.py
```

## ⚙️ Configuração

Todas as configurações são carregadas via variáveis de ambiente (definidas no `.env`):

- `RABBITMQ_URL` - URL de conexão do RabbitMQ
- `RABBITMQ_EXCHANGE` - Nome do exchange
- `RABBITMQ_ROUTING_KEY` - Routing key para publicação
- `WEATHER_API_URL` - URL da API Open-Meteo
- `LOCATION_*` - Dados de localização (cidade, estado, país, lat/lon)
- `COLLECTION_INTERVAL_MINUTES` - Intervalo de coleta (padrão: 60 min)

## 📊 Fluxo de Dados

1. **Scheduler** (APScheduler) executa coleta periodicamente
2. **WeatherAPIClient** busca dados da Open-Meteo API
3. **Normalização** dos dados para formato padronizado
4. **RabbitMQPublisher** publica mensagem no exchange
5. **Aguarda** próximo ciclo

## 🔧 Dependências

- `pika` - Cliente RabbitMQ
- `requests` - HTTP client para API
- `apscheduler` - Scheduler de jobs
- `python-dotenv` - Carregamento de variáveis de ambiente

## 📝 Logs

O serviço emite logs detalhados no stdout:
- ✅ Sucesso nas operações
- ❌ Erros e falhas
- 🌐 Requisições HTTP
- 🔌 Conexões RabbitMQ
