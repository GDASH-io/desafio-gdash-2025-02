# Fase 1 - Collector (Python) - Open-Meteo

**Status:** Concluída  
**Data de Conclusão:** 20/11/2025  
**Progresso:** 100%

---

## Objetivo

Implementar um serviço em Python que colete dados climáticos periodicamente da API Open-Meteo para Coronel Fabriciano, MG, normalize os dados e publique no Kafka para processamento posterior.

## Requisitos do Desafio

Conforme README.md do desafio:

- Coletar dados climáticos via Open-Meteo ou OpenWeather
- Enviar dados periodicamente para uma fila (Message Broker)
- Extrair informações relevantes (temperatura, umidade, vento, condições do céu, probabilidade de chuva)
- Enviar dados normalizados em formato JSON

## Arquitetura Implementada

### Clean Architecture

O serviço segue Clean Architecture com as seguintes camadas:

```
colletor-python/
├── domain/
│   ├── entities/
│   │   └── weather_reading.py       # Entidade WeatherReading
│   └── repositories/
│       └── kafka_producer.py       # Interface KafkaProducerRepository
├── application/
│   └── usecases/
│       └── fetch_and_publish.py    # Use case principal
├── infra/
│   ├── http/
│   │   ├── openmeteo_client.py     # Cliente Open-Meteo
│   │   └── healthcheck.py           # Servidor healthcheck
│   └── messaging/
│       └── kafka_producer.py       # Implementação Kafka
└── shared/
    ├── config.py                    # Configurações
    └── logger.py                    # Logger estruturado
```

### Componentes Principais

#### 1. Domain Layer

**WeatherReading (Entidade)**
- Representa uma leitura climática individual
- Campos: timestamp, temperature_c, relative_humidity, precipitation_mm, wind_speed_m_s, clouds_percent, weather_code

**KafkaProducerRepository (Interface)**
- Define contrato para publicação de mensagens
- Método: `publish(topic: str, message: dict) -> None`

#### 2. Application Layer

**FetchAndPublishUseCase**
- Orquestra a coleta e publicação de dados
- Fluxo:
  1. Busca dados da Open-Meteo API
  2. Normaliza dados para contrato padrão
  3. Publica no Kafka topic `ana.raw.readings`

#### 3. Infrastructure Layer

**OpenMeteoClient**
- Cliente HTTP para API Open-Meteo
- Endpoint: `https://api.open-meteo.com/v1/forecast`
- Parâmetros: latitude, longitude, hourly, daily, timezone

**KafkaProducerImpl**
- Implementação do Kafka producer
- Biblioteca: kafka-python
- Serialização: JSON

**HealthcheckServer**
- Servidor Flask para healthcheck
- Endpoint: `GET /healthz`
- Verifica conexão com Kafka

## Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Python | 3.11+ | Linguagem principal |
| kafka-python | Latest | Cliente Kafka |
| requests | Latest | Cliente HTTP |
| Flask | Latest | Servidor healthcheck |
| python-dotenv | Latest | Gerenciamento de variáveis |

## Configuração

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `LATITUDE` | Latitude da localização | -19.5186 |
| `LONGITUDE` | Longitude da localização | -42.6289 |
| `TIMEZONE` | Timezone | America/Sao_Paulo |
| `COLLECT_INTERVAL_SECONDS` | Intervalo de coleta (segundos) | 3600 |
| `COLLECT_INTERVAL_TYPE` | Tipo: hourly ou daily | hourly |
| `KAFKA_BOOTSTRAP_SERVERS` | Servidores Kafka | kafka:9093 |
| `KAFKA_TOPIC_RAW` | Tópico Kafka | ana.raw.readings |
| `LOG_LEVEL` | Nível de log | INFO |
| `LOG_FORMAT` | Formato: json ou text | json |
| `HEALTHCHECK_PORT` | Porta do healthcheck | 8080 |

### API Open-Meteo

A API Open-Meteo é totalmente gratuita e não requer chave de API. Características:

- Sem necessidade de autenticação
- Rate limits generosos
- Dados de previsão horária e diária
- Cobertura global

## Contrato de Mensagem

### Formato JSON Publicado no Kafka

```json
{
  "source": "openmeteo",
  "city": "Coronel Fabriciano",
  "country": "BR",
  "coords": {
    "lat": -19.5186,
    "lon": -42.6289
  },
  "fetched_at": "2025-11-19T21:05:00-03:00",
  "interval": "hourly",
  "payload": [
    {
      "timestamp": "2025-11-19T20:00:00-03:00",
      "temperature_c": 23.5,
      "relative_humidity": 78,
      "precipitation_mm": 0.0,
      "wind_speed_m_s": 2.3,
      "clouds_percent": 75,
      "weather_code": 801,
      "pressure_hpa": 1013.25,
      "uv_index": 5.2,
      "visibility_m": 10000
    }
  ]
}
```

### Campos Prioritários para Energia Solar

| Campo | Descrição | Impacto PV |
|-------|-----------|------------|
| `temperature_c` | Temperatura em Celsius | Efeito de temperatura no rendimento |
| `clouds_percent` | Percentual de nuvens | Proxy para irradiância |
| `precipitation_mm` | Precipitação em mm | Risco de soiling |
| `wind_speed_m_s` | Velocidade do vento | Pode ajudar limpeza ou causar derating |
| `uv_index` | Índice UV | Correlacionado com irradiância |
| `weather_code` | Código WMO | Condições gerais |

## Funcionalidades Implementadas

### 1. Coleta Periódica

- Coleta automática a cada 1 hora (configurável)
- Suporte para dados horários (hourly) e diários (daily)
- 168 leituras por coleta (7 dias de previsão horária)

### 2. Normalização de Dados

- Conversão de unidades (se necessário)
- Padronização de formatos
- Validação de dados

### 3. Publicação no Kafka

- Publicação assíncrona
- Retry automático em caso de falha
- Serialização JSON

### 4. Healthcheck

- Endpoint `/healthz`
- Verifica conexão com Kafka
- Retorna status do serviço

### 5. Logs Estruturados

- Formato JSON (configurável)
- Níveis: DEBUG, INFO, WARNING, ERROR
- Contexto adicional para rastreabilidade

## Testes

### Cobertura de Testes

| Tipo | Arquivos | Cobertura |
|------|----------|-----------|
| Unitários | `test_fetch_and_publish.py` | Parsing e normalização |
| Unitários | `test_openweather_client.py` | Cliente HTTP |
| Integração | `test_collector_integration.py` | Fluxo completo |

### Execução

```bash
# Todos os testes
pytest

# Apenas unitários
pytest tests/unit/

# Com coverage
pytest --cov=src --cov-report=html
```

## Dockerização

### Dockerfile

```dockerfile
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY src/ ./src/
CMD ["python", "src/main.py"]
```

### Docker Compose

O serviço está configurado no `docker-compose.yml`:

```yaml
collector:
  build: ./colletor-python
  environment:
    - KAFKA_BOOTSTRAP_SERVERS=kafka:9093
    - LATITUDE=-19.5186
    - LONGITUDE=-42.6289
    - COLLECT_INTERVAL_SECONDS=3600
  ports:
    - "8080:8080"
  depends_on:
    - kafka
```

## Métricas e Monitoramento

### Logs

Exemplo de log estruturado:

```json
{
  "timestamp": "2025-11-19T21:05:00Z",
  "level": "INFO",
  "service": "collector-openweather",
  "message": "Dados publicados no Kafka com sucesso",
  "context": {
    "readings_count": 168,
    "interval": "hourly",
    "topic": "ana.raw.readings"
  }
}
```

### Healthcheck Response

```json
{
  "status": "healthy",
  "kafka": "connected"
}
```

## Decisões Técnicas

### 1. Escolha da API

**Decisão:** Open-Meteo ao invés de OpenWeather

**Razões:**
- Gratuita e sem necessidade de chave API
- Rate limits generosos
- Dados de qualidade similar
- Facilita setup e testes

### 2. Arquitetura

**Decisão:** Clean Architecture

**Razões:**
- Separação clara de responsabilidades
- Testabilidade
- Manutenibilidade
- Facilita evolução

### 3. Message Broker

**Decisão:** Kafka

**Razões:**
- Alta performance
- Persistência de mensagens
- Suporte a múltiplos consumidores
- Escalabilidade

## Problemas Encontrados e Soluções

### Problema 1: Migração de OpenWeather para Open-Meteo

**Solução:** Refatoração completa do cliente HTTP e normalização de dados

### Problema 2: Conexão com Kafka no Docker

**Solução:** Uso de `kafka:9093` (porta interna) ao invés de `localhost:9092`

## Próximos Passos (Após Fase 1)

1. Validar mensagens no Kafka topic `ana.raw.readings`
2. Iniciar Fase 3 (Worker Go) para consumir e processar mensagens
3. Opcionalmente iniciar Fase 2 (ANA pagination) em paralelo

## Referências

- [Open-Meteo API Documentation](https://open-meteo.com/en/docs)
- [Kafka Python Client](https://kafka-python.readthedocs.io/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**Última atualização:** 21/11/2025

