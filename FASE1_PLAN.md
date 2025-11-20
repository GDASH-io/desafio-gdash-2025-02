# Fase 1 - Collector OpenWeather - Plano Detalhado

## Resumo
Implementar serviço Python que coleta dados climáticos da OpenWeather OneCall API para Coronel Fabriciano, MG, formata mensagens focadas em métricas de energia solar (irradiância, temperatura, nuvens, precipitação, vento) e publica no Kafka topic `ana.raw.readings`.

---

## Checklist de Tarefas

### 1. Preparação do Ambiente
- [ ] Criar branch: `feature/collector-openweather-coronel-fabriciano`
- [ ] Criar estrutura de diretórios seguindo Clean Architecture
- [ ] Criar `.env.example` na raiz do projeto
- [ ] Criar `requirements.txt` com dependências

### 2. Infraestrutura e Configuração
- [ ] Criar `colletor-python/Dockerfile` (multi-stage se necessário)
- [ ] Criar `colletor-python/.env.example` (específico do collector)
- [ ] Configurar logging estruturado (JSON)

### 3. Camada de Infraestrutura
- [ ] Criar `colletor-python/src/infra/http/openweather_client.py`
  - [ ] Cliente HTTP com timeout configurável
  - [ ] Retry com exponential backoff (3 tentativas)
  - [ ] Tratamento de erros HTTP (429, 500, etc.)
  - [ ] Logging estruturado de requisições

### 4. Camada de Aplicação
- [ ] Criar `colletor-python/src/application/usecases/fetch_and_publish.py`
  - [ ] Use case para buscar dados OpenWeather
  - [ ] Suporte para intervalos hourly e daily (parametrizável)
  - [ ] Normalização de payload conforme contrato
  - [ ] Publicação no Kafka

### 5. Camada de Domínio
- [ ] Criar `colletor-python/src/domain/entities/weather_reading.py`
  - [ ] Entidade com campos relevantes para PV
- [ ] Criar `colletor-python/src/domain/repositories/kafka_producer.py` (interface)

### 6. Camada de Interface
- [ ] Criar `colletor-python/src/main.py`
  - [ ] Loop principal com intervalo configurável
  - [ ] Tratamento de exceções global
  - [ ] Graceful shutdown
- [ ] Criar `colletor-python/src/infra/http/healthcheck.py`
  - [ ] Endpoint `/healthz` (verifica conexão Kafka)

### 7. Testes
- [ ] Criar `colletor-python/tests/unit/test_openweather_client.py`
  - [ ] Teste de parsing de resposta OpenWeather
  - [ ] Teste de retry em caso de erro
- [ ] Criar `colletor-python/tests/unit/test_fetch_and_publish.py`
  - [ ] Teste de normalização de payload
- [ ] Criar `colletor-python/tests/integration/test_collector_integration.py`
  - [ ] Teste end-to-end com Kafka local

### 8. Documentação
- [ ] Atualizar README com instruções de execução
- [ ] Documentar variáveis de ambiente

---

## Estrutura de Arquivos a Criar

```
colletor-python/
├── Dockerfile
├── requirements.txt
├── .env.example
├── .gitignore
├── src/
│   ├── main.py
│   ├── domain/
│   │   ├── __init__.py
│   │   ├── entities/
│   │   │   ├── __init__.py
│   │   │   └── weather_reading.py
│   │   └── repositories/
│   │       ├── __init__.py
│   │       └── kafka_producer.py (interface)
│   ├── application/
│   │   ├── __init__.py
│   │   └── usecases/
│   │       ├── __init__.py
│   │       └── fetch_and_publish.py
│   ├── infra/
│   │   ├── __init__.py
│   │   ├── http/
│   │   │   ├── __init__.py
│   │   │   ├── openweather_client.py
│   │   │   └── healthcheck.py
│   │   └── messaging/
│   │       ├── __init__.py
│   │       └── kafka_producer.py (implementação)
│   └── shared/
│       ├── __init__.py
│       ├── config.py
│       └── logger.py
└── tests/
    ├── __init__.py
    ├── unit/
    │   ├── __init__.py
    │   ├── test_openweather_client.py
    │   └── test_fetch_and_publish.py
    └── integration/
        ├── __init__.py
        └── test_collector_integration.py
```

---

## Contrato de Mensagem (Topic: ana.raw.readings)

```json
{
  "source": "openweather",
  "city": "Coronel Fabriciano",
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

**Campos prioritários para energia solar:**
- `temperature_c`: Efeito de temperatura no rendimento PV
- `clouds_percent`: Proxy para irradiância (quanto mais nuvens, menos irradiância)
- `precipitation_mm`: Risco de soiling (sujeira nos painéis)
- `wind_speed_m_s`: Vento pode ajudar a limpar painéis ou causar derating em velocidades extremas
- `uv_index`: Indicador direto de radiação UV (correlacionado com irradiância)
- `weather_code`: Código OpenWeather para condições gerais

---

## Variáveis de Ambiente (.env.example)

```env
# OpenWeather API
OPENWEATHER_API_KEY=your_api_key_here
LATITUDE=-19.5186
LONGITUDE=-42.6289
TIMEZONE=America/Sao_Paulo

# Coleta
COLLECT_INTERVAL_SECONDS=3600
COLLECT_INTERVAL_TYPE=hourly  # hourly ou daily

# Kafka
KAFKA_BOOTSTRAP_SERVERS=kafka:9092
KAFKA_TOPIC_RAW=ana.raw.readings

# HTTP Client
HTTP_TIMEOUT_SECONDS=15
HTTP_MAX_RETRIES=3
HTTP_RETRY_BACKOFF_BASE=2

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json  # json ou text

# Healthcheck
HEALTHCHECK_PORT=8080
```

---

## Comandos Git Sugeridos

```bash
# 1. Criar branch
git checkout -b feature/collector-openweather-coronel-fabriciano

# 2. Após implementar estrutura base
git add colletor-python/
git commit -m "feat(collector): add initial structure with Clean Architecture"

# 3. Após implementar client OpenWeather
git add colletor-python/src/infra/http/openweather_client.py
git commit -m "feat(collector): implement OpenWeather client with retries and exponential backoff"

# 4. Após implementar use case
git add colletor-python/src/application/usecases/fetch_and_publish.py
git commit -m "feat(collector): implement fetch and publish use case with hourly/daily support"

# 5. Após implementar Kafka producer
git add colletor-python/src/infra/messaging/kafka_producer.py
git commit -m "feat(collector): implement Kafka producer for ana.raw.readings topic"

# 6. Após implementar healthcheck
git add colletor-python/src/infra/http/healthcheck.py colletor-python/src/main.py
git commit -m "feat(collector): add healthcheck endpoint and main loop with graceful shutdown"

# 7. Após adicionar testes
git add colletor-python/tests/
git commit -m "test(collector): add unit and integration tests"

# 8. Após atualizar documentação
git add .env.example README.md
git commit -m "docs(collector): add environment variables and execution instructions"
```

---

## Critérios de Aceitação

### Funcionalidade
- [ ] Collector grava ao menos 1 mensagem válida em `ana.raw.readings` com payload JSON conforme contrato
- [ ] Logs mostram publicação bem-sucedida com timestamp
- [ ] Mensagens contêm campos prioritários para energia solar (temperature, clouds, precipitation, wind, uv_index)

### Qualidade
- [ ] Código segue Clean Architecture (camadas separadas)
- [ ] Logs estruturados (JSON) com service, level, timestamp, message, context
- [ ] Tratamento de erros robusto (retries, timeouts, graceful degradation)
- [ ] Healthcheck `/healthz` responde 200 quando Kafka está acessível

### Testes
- [ ] Testes unitários cobrem parsing de resposta OpenWeather
- [ ] Testes unitários cobrem normalização de payload
- [ ] Teste de integração local: collector publica mensagem e mensagem é consumível do Kafka

### Execução
- [ ] `docker compose up collector` inicia sem erros
- [ ] Collector publica mensagens periodicamente (conforme `COLLECT_INTERVAL_SECONDS`)
- [ ] Mensagens podem ser consumidas do Kafka topic `ana.raw.readings`

---

## Comandos de Execução e Verificação

### Executar Collector Localmente
```bash
cd colletor-python
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou: venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env
# Editar .env com OPENWEATHER_API_KEY real
python src/main.py
```

### Executar via Docker Compose
```bash
# Na raiz do projeto
docker compose up --build collector
```

### Verificar Mensagens no Kafka
```bash
# Consumir mensagens do topic
docker compose exec kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic ana.raw.readings \
  --from-beginning
```

### Testar Healthcheck
```bash
curl http://localhost:8080/healthz
# Deve retornar: {"status": "healthy", "kafka": "connected"}
```

### Executar Testes
```bash
cd colletor-python
pytest tests/ -v
# ou com coverage:
pytest tests/ --cov=src --cov-report=html
```

---

## Próximos Passos Após Fase 1

1. Validar mensagens no Kafka topic `ana.raw.readings`
2. Iniciar Fase 3 (Worker Go) para consumir e processar mensagens
3. Opcionalmente iniciar Fase 2 (ANA pagination) em paralelo

## Nota sobre IA/Insights

A camada de IA/Insights será implementada na **Fase 6** no NestJS, conforme estratégia detalhada em `IA_INSIGHTS_STRATEGY.md`. Os dados coletados nesta fase (Fase 1) serão utilizados como base histórica para geração de insights focados em energia solar (PV), incluindo:

- Métricas PV: soiling risk, consecutive cloudy days, heat derating, wind derating
- Estatísticas: médias, tendências, classificação do dia
- Alertas contextuais: chuva, calor extremo, frio intenso
- Resumos em texto gerados automaticamente
- Pontuações: conforto climático e produção PV estimada

O endpoint `/api/v1/weather/insights` será implementado na Fase 6, mas os dados coletados aqui são essenciais para alimentar a análise.

---

## Notas de Implementação

- **OpenWeather OneCall API**: Usar endpoint `/data/2.5/onecall` (requer API key)
- **Rate Limits**: OpenWeather Free tier: 60 calls/min, 1M calls/mês
- **Intervalo de Coleta**: Sugestão inicial: 3600s (1 hora) para não exceder rate limits
- **Foco em PV**: Priorizar campos que impactam produção solar (irradiância estimada via clouds, temperatura, precipitação)
- **Idempotência**: Considerar adicionar `message_id` único para evitar duplicatas (será tratado no Worker)

