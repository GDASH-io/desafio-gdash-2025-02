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

### Fase 2 - Paginação ANA (Hidrologia) ⏳ OPCIONAL
**Nota:** Esta fase não está no README.md do desafio, mas foi incluída no plano original. Pode ser implementada em paralelo ou após outras fases.

- [ ] Pesquisar documentação da API ANA
- [ ] Decidir se implementa (opcional)
- [ ] Criar estrutura no collector-python ou serviço separado
- [ ] Implementar pagination handler com cursor (Redis ou arquivo)
- [ ] Respeitar rate limits e Retry-After
- [ ] Normalizar dados em contrato `ana.hydro.readings`
- [ ] Publicar no Kafka topic `ana.hydro.readings`
- [ ] Testes com mock da API ANA

### Fase 3 - Worker (Go) ✅ CONCLUÍDA
- [x] Estrutura base do projeto Go (Clean Architecture)
- [x] Implementar consumer Kafka robusto (ack/nack, retry 3x)
- [x] Implementar idempotência (messageId/checksum via UUID)
- [x] Separar validação, transformação e publicação (Clean Architecture)
- [x] Calcular métricas PV: estimated_irradiance, temp_effect_factor, soiling_risk, wind_derating_flag
- [x] Publicar em `ana.processed.readings`
- [x] POST para API NestJS `/api/v1/weather/logs` (com retry exponential backoff)
- [x] Healthcheck e métricas
- [x] Dockerfile para worker
- [x] Testes unitários (PV metrics calculator, validator)
- [x] Documentação (README.md)
- [x] Docker Compose atualizado

### Fase 4 - API NestJS (Persistência & Endpoints) ✅ CONCLUÍDA
- [x] Estrutura base do projeto NestJS (Clean Architecture)
- [x] Implementar schema Mongoose WeatherLog
- [x] Implementar schema Mongoose User
- [x] Implementar repositórios (WeatherLog, User)
- [x] Endpoint POST `/api/v1/weather/logs` (batch, sem autenticação)
- [x] Endpoint GET `/api/v1/weather/logs` (paginação, com autenticação)
- [x] Endpoint GET `/api/v1/weather/logs/latest` (com autenticação)
- [x] Endpoint GET `/api/v1/weather/export.csv` (com autenticação)
- [x] Endpoint GET `/api/v1/weather/export.xlsx` (com autenticação)
- [x] Endpoint GET `/api/v1/weather/health` (healthcheck)
- [x] Autenticação JWT (login, register)
- [x] CRUD de usuários (GET, POST, PUT, DELETE)
- [x] Guards e decorators (JwtAuthGuard, RolesGuard, @Public, @Roles)
- [x] Usuário seed automático
- [x] Dockerfile
- [x] Documentação (README.md)
- [ ] Testes unitários e integração (pendente)

### Fase 5 - Frontend (Dashboard) ✅ CONCLUÍDA
- [x] Criar estrutura base do projeto Vite + React + TypeScript
- [x] Configurar Tailwind CSS e componentes UI (shadcn/ui style)
- [x] Implementar autenticação (login/register) + JWT guards
- [x] Criar layout base (Header, Sidebar, Main) responsivo
- [x] Página Dashboard com cards (Temp, Umidade, Vento, Irradiance, PV derating)
- [x] Chart: Temperature & irradiance over time (Chart.js)
- [x] Table: últimas N leituras com export CSV/XLSX
- [x] Integração com endpoints NestJS
- [x] Polling (30s) para updates em tempo real
- [x] CRUD de usuários (admin only)
- [x] Testes unitários básicos (Vitest)
- [x] Dockerfile e nginx.conf
- [x] Documentação (README.md)
- [x] Seção de Insights de IA no Dashboard

### Fase 6 - IA / Insights (NestJS) ✅ CONCLUÍDA

- [x] Implementar módulo de Insights (Clean Architecture)
- [x] Use case: Gerar insights sob demanda (GET `/api/v1/weather/insights?from=&to=`)
- [x] Use case: Buscar insights com cache (GetInsightsUseCase)
- [x] Implementar regras heurísticas para PV:
  - [x] High soiling risk (precipitação acumulada)
  - [x] Consecutive cloudy days (dias consecutivos com alta cobertura de nuvens)
  - [x] Heat derating (temperatura acima de threshold)
  - [x] Wind derating (vento extremo)
  - [x] Estimated production impact (%)
- [x] Implementar análise estatística:
  - [x] Média de temperatura/umidade em períodos
  - [x] Detecção de tendência (subindo/caindo)
  - [x] Classificação do dia (frio/quente/agradável/chuvoso)
- [x] Implementar geração de resumos em texto:
  - [x] Resumo do período (ex: "Últimos 3 dias: temp média 28°C, alta umidade, tendência de chuva")
  - [x] Alertas contextuais ("Alta chance de chuva", "Calor extremo", "Frio intenso")
- [x] Implementar pontuação de conforto climático (0-100)
- [x] Implementar pontuação de produção PV estimada (0-100)
- [x] Endpoint GET `/api/v1/weather/insights` (buscar insights)
- [x] Endpoint POST `/api/v1/weather/insights` (forçar recálculo)
- [x] Cache de insights (MongoDB com TTL de 1 hora)
- [x] Integração no frontend (componente InsightsSection)
- [ ] Testes unitários para cada regra/insight (opcional)
- [ ] Testes de integração com dados históricos (opcional)
- [ ] Geração automática após inserção (hook - opcional)

---

## Notas Técnicas

- Cidade alvo: Coronel Fabriciano, MG
- Coordenadas: LAT=-19.5186, LON=-42.6289
- API de Clima: Open-Meteo (gratuita, sem necessidade de chave)
- Foco: Parâmetros que afetam produção de energia solar
- Kafka topics: `ana.raw.readings`, `ana.hydro.readings`, `ana.processed.readings`
- Rotas API: `/api/v1/...`
- Commits: Conventional Commits (feat:, fix:, chore:, docs:, test:)
