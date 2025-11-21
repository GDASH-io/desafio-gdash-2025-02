# TODO - Desafio GDASH 2025/02

## Estado Atual do Desenvolvimento

**Nota:** O Pull Request será criado apenas quando todo o projeto estiver implementado (todas as fases concluídas).

### Fase 0 - Preparação ✅
- [x] Branch base criada
- [x] Estrutura inicial definida

### Fase 1 - Collector (Open-Meteo) - Coronel Fabriciano ✅ CONCLUÍDA E REVISADA
- [x] Criar branch: `wilker-junio-coelho-pimenta` (conforme README)
- [x] Adicionar `.env.example` com variáveis necessárias
- [x] Implementar client Open-Meteo (API gratuita, sem necessidade de chave)
- [x] Implementar handler para hourly e daily (parametrizável)
- [x] Normalizar payload para contrato padrão (foco em métricas PV)
- [x] Publicar no Kafka topic `ana.raw.readings`
- [x] Healthcheck `/healthz`
- [x] Testes unitários (parsing)
- [x] Testes de integração local
- [x] Documentação (README.md)
- [x] Migração de OpenWeather para Open-Meteo (API gratuita)
- [x] Docker Compose atualizado (removida OPENWEATHER_API_KEY)
- [x] Testes corrigidos (source: "openmeteo")
- [x] Documentação atualizada

### Fase 2 - Paginação ANA (Hidrologia) ⏳ PENDENTE
- [ ] Criar branch: `feature/collector-ana-pagination`
- [ ] Implementar pagination handler com cursor em Redis
- [ ] Respeitar rate limits e Retry-After
- [ ] Normalizar dados em contrato `ana.hydro.readings`
- [ ] Testes com mock da API ANA

### Fase 3 - Worker (Go) 🔄 PRÓXIMA PRIORIDADE
- [ ] Estrutura base do projeto Go (Clean Architecture)
- [ ] Implementar consumer Kafka robusto (ack/nack, retry 3x)
- [ ] Implementar idempotência (messageId/checksum)
- [ ] Separar validação, transformação e publicação (Clean Architecture)
- [ ] Calcular métricas PV: estimated_irradiance, temp_effect_factor, soiling_risk, wind_derating_flag
- [ ] Publicar em `ana.processed.readings`
- [ ] POST para API NestJS `/api/v1/weather/logs`
- [ ] Healthcheck e métricas
- [ ] Dockerfile para worker
- [ ] Testes unitários e integração

### Fase 4 - API NestJS (Persistência & Endpoints) ⏳ PENDENTE
- [ ] Criar branch: `feature/api-weather-logs`
- [ ] Implementar schema Mongoose WeatherLog
- [ ] Endpoint POST `/api/v1/weather/logs` (batch)
- [ ] Endpoint GET `/api/v1/weather/logs` (paginação)
- [ ] Endpoint GET `/api/v1/weather/logs/latest`
- [ ] Endpoint GET `/api/v1/weather/export.csv` e `/export.xlsx`
- [ ] CRUD de usuários + JWT
- [ ] Usuário seed
- [ ] Testes unitários e integração

### Fase 5 - Frontend (Dashboard) ⏳ PENDENTE
- [ ] Criar branch: `feature/frontend-dashboard`
- [ ] Implementar login e rotas protegidas
- [ ] Página Dashboard com cards (Temp, Umidade, Vento, Irradiance, PV derating)
- [ ] Chart: Temperature & irradiance over time
- [ ] Table: últimas N leituras com export CSV/XLSX
- [ ] Integração com endpoints NestJS
- [ ] Polling ou WebSocket para updates
- [ ] Seção de Insights de IA no Dashboard
- [ ] Cards/componentes para exibir insights gerados

### Fase 6 - IA / Insights (NestJS) ⏳ PENDENTE
- [ ] Criar branch: `feature/insights-ai`
- [ ] Implementar módulo de Insights (Clean Architecture)
- [ ] Use case: Gerar insights sob demanda (GET `/api/v1/weather/insights?from=&to=`)
- [ ] Use case: Gerar insights automaticamente (hook após inserção de dados)
- [ ] Implementar regras heurísticas para PV:
  - [ ] High soiling risk (precipitação acumulada)
  - [ ] Consecutive cloudy days (dias consecutivos com alta cobertura de nuvens)
  - [ ] Heat derating (temperatura acima de threshold)
  - [ ] Wind derating (vento extremo)
  - [ ] Estimated production impact (%)
- [ ] Implementar análise estatística:
  - [ ] Média de temperatura/umidade em períodos
  - [ ] Detecção de tendência (subindo/caindo)
  - [ ] Classificação do dia (frio/quente/agradável/chuvoso)
- [ ] Implementar geração de resumos em texto:
  - [ ] Resumo do período (ex: "Últimos 3 dias: temp média 28°C, alta umidade, tendência de chuva")
  - [ ] Alertas contextuais ("Alta chance de chuva", "Calor extremo", "Frio intenso")
- [ ] Implementar pontuação de conforto climático (0-100)
- [ ] Implementar pontuação de produção PV estimada (0-100)
- [ ] Endpoint POST `/api/v1/weather/insights` (forçar recálculo)
- [ ] Cache de insights (Redis opcional ou MongoDB)
- [ ] Testes unitários para cada regra/insight
- [ ] Testes de integração com dados históricos

---

## Notas Técnicas

- Cidade alvo: Coronel Fabriciano, MG
- Coordenadas: LAT=-19.5186, LON=-42.6289
- API de Clima: Open-Meteo (gratuita, sem necessidade de chave)
- Foco: Parâmetros que afetam produção de energia solar
- Kafka topics: `ana.raw.readings`, `ana.hydro.readings`, `ana.processed.readings`
- Rotas API: `/api/v1/...`
- Commits: Conventional Commits (feat:, fix:, chore:, docs:, test:)
