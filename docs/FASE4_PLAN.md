# Fase 4 - API NestJS (Persistência & Endpoints) - Plano Detalhado

## Resumo
Implementar API NestJS completa com MongoDB para receber dados do Worker Go, armazenar em `weather_logs`, expor endpoints REST com paginação, exportação CSV/XLSX, autenticação JWT, CRUD de usuários e usuário seed.

## Status
🔄 **PRÓXIMA PRIORIDADE**

## Justificativa
- Worker Go já está pronto e precisa da API para enviar dados processados
- É o núcleo do sistema (recebe, armazena e expõe dados)
- Necessária para o Frontend funcionar
- Permite testar o pipeline completo: Collector → Kafka → Worker → API

## Checklist de Tarefas

### 1. Preparação do Ambiente
- [ ] Verificar estrutura inicial do projeto NestJS
- [ ] Configurar `package.json` com dependências (NestJS, Mongoose, JWT, etc.)
- [ ] Criar `Dockerfile` para API NestJS
- [ ] Criar `.env.example` com variáveis necessárias
- [ ] Configurar MongoDB connection

### 2. Camada de Domínio
- [ ] Criar `domain/entities/weather-log.entity.ts` (schema Mongoose)
- [ ] Criar `domain/entities/user.entity.ts` (schema Mongoose)
- [ ] Criar `domain/repositories/weather-log.repository.ts` (interface)
- [ ] Criar `domain/repositories/user.repository.ts` (interface)

### 3. Camada de Aplicação (Use Cases)
- [ ] Criar `application/usecases/create-weather-logs.use-case.ts` (batch)
- [ ] Criar `application/usecases/get-weather-logs.use-case.ts` (paginação)
- [ ] Criar `application/usecases/get-latest-weather-log.use-case.ts`
- [ ] Criar `application/usecases/export-weather-logs.use-case.ts` (CSV/XLSX)
- [ ] Criar `application/usecases/auth/login.use-case.ts`
- [ ] Criar `application/usecases/auth/register.use-case.ts`
- [ ] Criar `application/usecases/users/*.use-case.ts` (CRUD)

### 4. Camada de Infraestrutura
- [ ] Criar `infra/database/mongodb.module.ts`
- [ ] Criar `infra/database/repositories/weather-log.repository.impl.ts`
- [ ] Criar `infra/database/repositories/user.repository.impl.ts`
- [ ] Criar `infra/auth/jwt.strategy.ts`
- [ ] Criar `infra/auth/jwt-auth.guard.ts`

### 5. Camada de Apresentação (Controllers)
- [ ] Criar `presentation/controllers/weather-logs.controller.ts`
  - [ ] POST `/api/v1/weather/logs` (batch, sem autenticação - endpoint interno)
  - [ ] GET `/api/v1/weather/logs` (paginação, com autenticação)
  - [ ] GET `/api/v1/weather/logs/latest` (com autenticação)
  - [ ] GET `/api/v1/weather/export.csv` (com autenticação)
  - [ ] GET `/api/v1/weather/export.xlsx` (com autenticação)
- [ ] Criar `presentation/controllers/auth.controller.ts`
  - [ ] POST `/api/v1/auth/login`
  - [ ] POST `/api/v1/auth/register`
- [ ] Criar `presentation/controllers/users.controller.ts`
  - [ ] GET `/api/v1/users` (listar, admin only)
  - [ ] GET `/api/v1/users/:id` (detalhes)
  - [ ] PUT `/api/v1/users/:id` (atualizar)
  - [ ] DELETE `/api/v1/users/:id` (remover, admin only)

### 6. DTOs (Data Transfer Objects)
- [ ] Criar `presentation/dto/create-weather-log.dto.ts`
- [ ] Criar `presentation/dto/get-weather-logs-query.dto.ts`
- [ ] Criar `presentation/dto/login.dto.ts`
- [ ] Criar `presentation/dto/register.dto.ts`
- [ ] Criar `presentation/dto/create-user.dto.ts`
- [ ] Criar `presentation/dto/update-user.dto.ts`

### 7. Módulos NestJS
- [ ] Criar `modules/weather/weather.module.ts`
- [ ] Criar `modules/auth/auth.module.ts`
- [ ] Criar `modules/users/users.module.ts`
- [ ] Configurar `app.module.ts` com todos os módulos

### 8. Seed e Inicialização
- [ ] Criar `database/seed/users.seed.ts` (usuário admin padrão)
- [ ] Configurar seed no `main.ts` ou módulo separado
- [ ] Variáveis de ambiente para usuário padrão

### 9. Healthcheck
- [ ] Criar endpoint `GET /health` (verifica MongoDB)

### 10. Testes
- [ ] Testes unitários para use cases
- [ ] Testes unitários para controllers
- [ ] Testes de integração (API + MongoDB)

### 11. Documentação
- [ ] README.md com instruções de execução
- [ ] Documentar variáveis de ambiente
- [ ] Atualizar `Endpoints.md` com endpoints implementados

## Estrutura de Arquivos

```
api-nest/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── weather-log.entity.ts
│   │   │   └── user.entity.ts
│   │   └── repositories/
│   │       ├── weather-log.repository.ts
│   │       └── user.repository.ts
│   ├── application/
│   │   └── usecases/
│   │       ├── weather/
│   │       │   ├── create-weather-logs.use-case.ts
│   │       │   ├── get-weather-logs.use-case.ts
│   │       │   ├── get-latest-weather-log.use-case.ts
│   │       │   └── export-weather-logs.use-case.ts
│   │       ├── auth/
│   │       │   ├── login.use-case.ts
│   │       │   └── register.use-case.ts
│   │       └── users/
│   │           ├── create-user.use-case.ts
│   │           ├── get-users.use-case.ts
│   │           ├── get-user.use-case.ts
│   │           ├── update-user.use-case.ts
│   │           └── delete-user.use-case.ts
│   ├── infra/
│   │   ├── database/
│   │   │   ├── mongodb.module.ts
│   │   │   └── repositories/
│   │   │       ├── weather-log.repository.impl.ts
│   │   │       └── user.repository.impl.ts
│   │   └── auth/
│   │       ├── jwt.strategy.ts
│   │       └── jwt-auth.guard.ts
│   ├── presentation/
│   │   ├── controllers/
│   │   │   ├── weather-logs.controller.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── users.controller.ts
│   │   └── dto/
│   │       ├── create-weather-log.dto.ts
│   │       ├── get-weather-logs-query.dto.ts
│   │       ├── login.dto.ts
│   │       ├── register.dto.ts
│   │       ├── create-user.dto.ts
│   │       └── update-user.dto.ts
│   └── modules/
│       ├── weather/
│       │   └── weather.module.ts
│       ├── auth/
│       │   └── auth.module.ts
│       └── users/
│           └── users.module.ts
├── database/
│   └── seed/
│       └── users.seed.ts
├── Dockerfile
├── package.json
├── .env.example
└── README.md
```

## Schema WeatherLog (MongoDB)

```typescript
{
  timestamp: Date,
  city: string,
  source: string,
  temperature_c: number,
  relative_humidity: number,
  precipitation_mm: number,
  wind_speed_m_s: number,
  clouds_percent: number,
  weather_code: number,
  estimated_irradiance_w_m2: number,
  temp_effect_factor: number,
  soiling_risk: string, // "low" | "medium" | "high"
  wind_derating_flag: boolean,
  pv_derating_pct: number,
  createdAt: Date,
  updatedAt: Date
}
```

## Schema User (MongoDB)

```typescript
{
  email: string (unique, required),
  password: string (hashed),
  name: string,
  role: string, // "admin" | "user"
  createdAt: Date,
  updatedAt: Date
}
```

## Variáveis de Ambiente

```env
# MongoDB
MONGO_URL=mongodb://root:root@mongodb:27017/gdash?authSource=admin

# JWT
JWT_SECRET=changeme
JWT_EXPIRES_IN=3600

# Server
PORT=3000
NODE_ENV=development

# Seed User
SEED_USER_EMAIL=admin@example.com
SEED_USER_PASSWORD=123456
SEED_USER_NAME=Admin
SEED_USER_ROLE=admin
```

## Dependências Principais

```json
{
  "@nestjs/common": "^10.0.0",
  "@nestjs/core": "^10.0.0",
  "@nestjs/platform-express": "^10.0.0",
  "@nestjs/mongoose": "^10.0.0",
  "@nestjs/jwt": "^10.0.0",
  "@nestjs/passport": "^10.0.0",
  "passport": "^0.6.0",
  "passport-jwt": "^4.0.1",
  "mongoose": "^8.0.0",
  "bcrypt": "^5.1.1",
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.1",
  "csv-writer": "^1.6.0",
  "exceljs": "^4.4.0"
}
```

## Critérios de Aceitação

- [ ] API recebe POST `/api/v1/weather/logs` do Worker Go
- [ ] Dados são armazenados corretamente no MongoDB
- [ ] GET `/api/v1/weather/logs` retorna dados paginados
- [ ] GET `/api/v1/weather/logs/latest` retorna última leitura
- [ ] GET `/api/v1/weather/export.csv` gera arquivo CSV
- [ ] GET `/api/v1/weather/export.xlsx` gera arquivo XLSX
- [ ] POST `/api/v1/auth/login` autentica e retorna JWT
- [ ] POST `/api/v1/auth/register` cria novo usuário
- [ ] CRUD de usuários funcionando
- [ ] Usuário admin seed criado automaticamente
- [ ] Healthcheck `/health` verifica MongoDB
- [ ] Testes unitários e integração passando
- [ ] Worker Go consegue enviar dados para API

## Comandos Git Sugeridos

```bash
# Commits conforme desenvolvimento
git add api-nest/
git commit -m "feat(api): implement NestJS API with MongoDB and JWT authentication"
```

## Próximos Passos Após Fase 4

1. Testar pipeline completo: Collector → Kafka → Worker → API NestJS
2. Iniciar Fase 5 (Frontend React) para exibir dados
3. Iniciar Fase 6 (IA/Insights) para gerar insights

## Notas Importantes

- Endpoint POST `/api/v1/weather/logs` **não requer autenticação** (endpoint interno para Worker)
- Todos os outros endpoints requerem JWT (exceto login/register)
- Usar Clean Architecture (domain, application, infra, presentation)
- Validar DTOs com class-validator
- Usar Mongoose para MongoDB
- Implementar paginação padrão (page, limit)
- Export CSV/XLSX deve suportar filtros (start, end, city)

