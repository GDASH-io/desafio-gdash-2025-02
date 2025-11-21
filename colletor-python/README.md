# Collector Open-Meteo - Coronel Fabriciano

Serviço Python responsável por coletar dados climáticos da API Open-Meteo (gratuita) para Coronel Fabriciano, MG, e publicar no Kafka topic `ana.raw.readings`.

## Arquitetura

O projeto segue **Clean Architecture** com as seguintes camadas:

- **Domain**: Entidades e interfaces de repositórios
- **Application**: Use cases (lógica de negócio)
- **Infrastructure**: Implementações concretas (HTTP client, Kafka producer, healthcheck)
- **Shared**: Configurações e utilitários compartilhados

## Configuração

### Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Principais variáveis:

- `OPENWEATHER_API_KEY`: Chave da API OpenWeather (obrigatória)
- `LATITUDE`: Latitude da localização (padrão: -19.5186)
- `LONGITUDE`: Longitude da localização (padrão: -42.6289)
- `COLLECT_INTERVAL_SECONDS`: Intervalo de coleta em segundos (padrão: 3600)
- `COLLECT_INTERVAL_TYPE`: Tipo de intervalo - `hourly` ou `daily` (padrão: hourly)
- `KAFKA_BOOTSTRAP_SERVERS`: Servidores Kafka (padrão: kafka:9092)
- `KAFKA_TOPIC_RAW`: Tópico Kafka para mensagens raw (padrão: ana.raw.readings)

### API Open-Meteo

A API Open-Meteo é totalmente gratuita e não requer chave de API. O collector está configurado para usar esta API automaticamente.

## Execução Local

### Pré-requisitos

- Python 3.11+
- Kafka rodando (via Docker Compose ou local)

### Instalação

```bash
# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou: venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt
```

### Executar

**Opção 1: Usando o script (recomendado)**
```bash
./run.sh
```

**Opção 2: Executar diretamente**
```bash
# Ativar ambiente virtual
source venv/bin/activate

# Executar
python3 src/main.py
```

**Nota:** O collector precisa do Kafka rodando. Se estiver usando Docker Compose, execute:
```bash
# Na raiz do projeto
docker compose up kafka zookeeper
```

## Execução via Docker

```bash
# Na raiz do projeto
docker compose up --build collector
```

## Healthcheck

O collector expõe um endpoint de healthcheck:

```bash
curl http://localhost:8080/healthz
```

Resposta esperada:

```json
{"status": "healthy", "kafka": "connected"}
```

## Testes

### Executar todos os testes

```bash
pytest
```

### Executar apenas testes unitários

```bash
pytest tests/unit/
```

### Executar testes de integração

```bash
pytest tests/integration/ -m integration
```

**Nota**: Testes de integração requerem Kafka rodando e `OPENWEATHER_API_KEY` configurada.

### Com coverage

```bash
pytest --cov=src --cov-report=html
```

## Estrutura do Projeto

```
colletor-python/
├── src/
│   ├── main.py                          # Ponto de entrada
│   ├── domain/                          # Camada de domínio
│   │   ├── entities/
│   │   │   └── weather_reading.py       # Entidade WeatherReading
│   │   └── repositories/
│   │       └── kafka_producer.py        # Interface KafkaProducerRepository
│   ├── application/                     # Camada de aplicação
│   │   └── usecases/
│   │       └── fetch_and_publish.py    # Use case principal
│   ├── infra/                           # Camada de infraestrutura
│   │   ├── http/
│   │   │   ├── openweather_client.py   # Cliente OpenWeather
│   │   │   └── healthcheck.py          # Servidor healthcheck
│   │   └── messaging/
│   │       └── kafka_producer.py       # Implementação Kafka
│   └── shared/                          # Utilitários compartilhados
│       ├── config.py                    # Configurações
│       └── logger.py                     # Logger estruturado
├── tests/
│   ├── unit/                            # Testes unitários
│   └── integration/                    # Testes de integração
├── Dockerfile
├── requirements.txt
├── .env.example
└── README.md
```

## Contrato de Mensagem

As mensagens publicadas no Kafka seguem o seguinte formato:

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

- `temperature_c`: Efeito de temperatura no rendimento PV
- `clouds_percent`: Proxy para irradiância (quanto mais nuvens, menos irradiância)
- `precipitation_mm`: Risco de soiling (sujeira nos painéis)
- `wind_speed_m_s`: Vento pode ajudar a limpar painéis ou causar derating
- `uv_index`: Indicador direto de radiação UV (correlacionado com irradiância)
- `weather_code`: Código OpenWeather para condições gerais

## Logs

Os logs são estruturados em formato JSON (quando `LOG_FORMAT=json`):

```json
{
  "timestamp": "2025-11-19T21:05:00Z",
  "level": "INFO",
  "service": "collector-openweather",
  "message": "Dados publicados no Kafka com sucesso",
  "context": {
    "readings_count": 48,
    "interval": "hourly",
    "topic": "ana.raw.readings"
  }
}
```

## Troubleshooting

### Erro: "Kafka não está conectado"

Verifique se o Kafka está rodando e se `KAFKA_BOOTSTRAP_SERVERS` está correto.

### Erro: "Kafka não está conectado"

Verifique se o Kafka está rodando e se `KAFKA_BOOTSTRAP_SERVERS` está correto.

### Mensagens não aparecem no Kafka

1. Verifique os logs do collector
2. Verifique se o tópico `ana.raw.readings` existe no Kafka
3. Teste o healthcheck: `curl http://localhost:8080/healthz`

## Próximos Passos

Após validar que o collector está funcionando:

1. Verificar mensagens no Kafka topic `ana.raw.readings`
2. Iniciar Fase 3 (Worker Go) para consumir e processar mensagens
3. Opcionalmente iniciar Fase 2 (ANA pagination) em paralelo

