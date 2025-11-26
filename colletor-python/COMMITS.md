# Comandos Git Sugeridos - Fase 1

## Criar Branch

```bash
git checkout -b feature/collector-openweather-coronel-fabriciano
```

## Commits Sugeridos

### 1. Estrutura inicial e configuração

```bash
git add colletor-python/.env.example colletor-python/.gitignore colletor-python/requirements.txt colletor-python/Dockerfile
git commit -m "feat(collector): add initial structure and configuration files"
```

### 2. Camada de domínio

```bash
git add colletor-python/src/domain/
git commit -m "feat(collector): implement domain layer with WeatherReading entity and KafkaProducerRepository interface"
```

### 3. Camada de infraestrutura - OpenWeather Client

```bash
git add colletor-python/src/infra/http/openweather_client.py
git commit -m "feat(collector): implement OpenWeather client with retries and exponential backoff"
```

### 4. Camada de infraestrutura - Kafka Producer

```bash
git add colletor-python/src/infra/messaging/kafka_producer.py
git commit -m "feat(collector): implement Kafka producer for ana.raw.readings topic"
```

### 5. Camada de infraestrutura - Healthcheck

```bash
git add colletor-python/src/infra/http/healthcheck.py
git commit -m "feat(collector): add healthcheck endpoint with Kafka connection verification"
```

### 6. Camada de aplicação - Use Case

```bash
git add colletor-python/src/application/usecases/fetch_and_publish.py
git commit -m "feat(collector): implement fetch and publish use case with hourly/daily support"
```

### 7. Shared - Config e Logger

```bash
git add colletor-python/src/shared/
git commit -m "feat(collector): add shared configuration and structured logger"
```

### 8. Main loop

```bash
git add colletor-python/src/main.py
git commit -m "feat(collector): implement main loop with graceful shutdown and signal handling"
```

### 9. Testes unitários

```bash
git add colletor-python/tests/unit/
git add colletor-python/pytest.ini
git commit -m "test(collector): add unit tests for OpenWeather client and use case"
```

### 10. Testes de integração

```bash
git add colletor-python/tests/integration/
git commit -m "test(collector): add integration tests for end-to-end flow"
```

### 11. Documentação

```bash
git add colletor-python/README.md
git commit -m "docs(collector): add README with setup and execution instructions"
```

## Commit Único (Alternativa)

Se preferir fazer um único commit com toda a implementação:

```bash
git checkout -b feature/collector-openweather-coronel-fabriciano
git add colletor-python/
git commit -m "feat(collector): implement OpenWeather collector with Clean Architecture

- Add domain layer with WeatherReading entity
- Implement OpenWeather client with retries and exponential backoff
- Implement Kafka producer for ana.raw.readings topic
- Add healthcheck endpoint with Kafka connection verification
- Implement fetch and publish use case with hourly/daily support
- Add structured logging and configuration management
- Add unit and integration tests
- Add Dockerfile and documentation"
```

