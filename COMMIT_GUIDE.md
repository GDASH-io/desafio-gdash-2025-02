# Guia de Commits - Fase 1 (Open-Meteo)

## Branch Atual
`feature/collector-openmeteo-coronel-fabriciano`

## Comandos Git Sugeridos

### 1. Adicionar arquivos modificados e novos

```bash
# Adicionar todos os arquivos do collector
git add colletor-python/

# Adicionar arquivos de documentação e configuração
git add docker-compose.yml
git add TODO.md
git add FASE1_PLAN.md
git add IA_INSIGHTS_STRATEGY.md
```

### 2. Commits Sugeridos (Conventional Commits)

#### Opção A: Commits Separados (Recomendado)

```bash
# Commit 1: Estrutura inicial e configuração
git add colletor-python/.env.example colletor-python/.gitignore colletor-python/requirements.txt colletor-python/Dockerfile
git commit -m "feat(collector): add initial structure and configuration files"

# Commit 2: Camada de domínio
git add colletor-python/src/domain/
git commit -m "feat(collector): implement domain layer with WeatherReading entity and KafkaProducerRepository interface"

# Commit 3: Camada de infraestrutura - Open-Meteo Client
git add colletor-python/src/infra/http/openmeteo_client.py
git commit -m "feat(collector): implement Open-Meteo client (free API, no key required)"

# Commit 4: Camada de infraestrutura - Kafka Producer
git add colletor-python/src/infra/messaging/kafka_producer.py
git commit -m "feat(collector): implement Kafka producer for ana.raw.readings topic"

# Commit 5: Camada de infraestrutura - Healthcheck
git add colletor-python/src/infra/http/healthcheck.py
git commit -m "feat(collector): add healthcheck endpoint with Kafka connection verification"

# Commit 6: Camada de aplicação - Use Case
git add colletor-python/src/application/usecases/fetch_and_publish.py
git commit -m "feat(collector): implement fetch and publish use case with Open-Meteo integration"

# Commit 7: Shared - Config e Logger
git add colletor-python/src/shared/
git commit -m "feat(collector): add shared configuration and structured logger"

# Commit 8: Main loop
git add colletor-python/src/main.py
git commit -m "feat(collector): implement main loop with graceful shutdown and signal handling"

# Commit 9: Testes
git add colletor-python/tests/ colletor-python/pytest.ini
git commit -m "test(collector): add unit and integration tests"

# Commit 10: Documentação
git add colletor-python/README.md colletor-python/COMMITS.md
git commit -m "docs(collector): add README with setup and execution instructions"

# Commit 11: Docker Compose
git add docker-compose.yml
git commit -m "feat(infra): add docker-compose with Kafka and Zookeeper services"

# Commit 12: Documentação do projeto
git add TODO.md FASE1_PLAN.md IA_INSIGHTS_STRATEGY.md
git commit -m "docs: add project documentation and roadmap"
```

#### Opção B: Commit Único (Mais Rápido)

```bash
# Adicionar todos os arquivos
git add .

# Commit único
git commit -m "feat(collector): implement Open-Meteo collector with Clean Architecture

- Add domain layer with WeatherReading entity
- Implement Open-Meteo client (free API, no key required)
- Implement Kafka producer for ana.raw.readings topic
- Add healthcheck endpoint with Kafka connection verification
- Implement fetch and publish use case with hourly/daily support
- Add structured logging and configuration management
- Add unit and integration tests
- Add Docker Compose with Kafka and Zookeeper
- Add project documentation and roadmap"
```

### 3. Push da Branch

```bash
# Push da branch renomeada
git push -u origin feature/collector-openmeteo-coronel-fabriciano

# Se a branch antiga existir no remoto, deletar
git push origin --delete feature/collector-openweather-coronel-fabriciano
```

## Nota sobre a Mudança de API

A migração de OpenWeather para Open-Meteo foi feita porque:
- Open-Meteo é totalmente gratuita (sem necessidade de chave de API)
- Fornece dados horários e diários completos
- Sem rate limits restritivos
- Melhor adequada para o desafio

O código mantém a mesma estrutura e contrato de mensagem, apenas mudando a fonte de dados.

