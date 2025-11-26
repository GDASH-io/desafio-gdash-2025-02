# Fase 4 - API NestJS (Persistência e Endpoints)

**Status:** Concluída  
**Data de Conclusão:** 20/11/2025  
**Progresso:** 100%

---

## Objetivo

Implementar API REST em NestJS que receba dados climáticos processados do Worker Go, armazene no MongoDB, exponha endpoints para consumo pelo frontend, implemente autenticação JWT e CRUD de usuários.

## Requisitos do Desafio

Conforme README.md do desafio:

- Receber e armazenar dados de clima
- Expor endpoints para consumo pelo frontend
- Orquestrar ou acionar a camada de IA
- Gerenciar usuários
- CRUD de usuários (com autenticação e usuário padrão)
- Exportação de dados em CSV/XLSX

## Arquitetura Implementada

### Clean Architecture

A API segue Clean Architecture com as seguintes camadas:

```
api-nest/src/
├── domain/
│   ├── entities/
│   │   ├── weather-log.entity.ts
│   │   ├── user.entity.ts
│   │   └── insight.entity.ts
│   └── repositories/
│       ├── weather-log.repository.ts
│       ├── user.repository.ts
│       └── insight.repository.ts
├── application/
│   └── usecases/
│       ├── auth/
│       │   ├── login.use-case.ts
│       │   └── register.use-case.ts
│       ├── users/
│       │   ├── create-user.use-case.ts
│       │   ├── get-users.use-case.ts
│       │   ├── get-user.use-case.ts
│       │   ├── update-user.use-case.ts
│       │   └── delete-user.use-case.ts
│       └── weather/
│           ├── create-weather-logs.use-case.ts
│           ├── get-weather-logs.use-case.ts
│           ├── get-latest-weather-log.use-case.ts
│           └── export-weather-logs.use-case.ts
├── infra/
│   ├── auth/
│   │   ├── jwt.strategy.ts
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   ├── public.decorator.ts
│   │   └── roles.decorator.ts
│   └── database/
│       └── repositories/
│           ├── weather-log.repository.impl.ts
│           ├── user.repository.impl.ts
│           └── insight.repository.impl.ts
├── presentation/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── users.controller.ts
│   │   └── weather-logs.controller.ts
│   └── dto/
│       ├── login.dto.ts
│       ├── register.dto.ts
│       ├── create-user.dto.ts
│       ├── update-user.dto.ts
│       ├── create-weather-log.dto.ts
│       └── get-weather-logs-query.dto.ts
└── modules/
    ├── auth/
    ├── users/
    └── weather/
```

## Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| NestJS | 10+ | Framework principal |
| TypeScript | 5+ | Linguagem |
| MongoDB | 6 | Banco de dados |
| Mongoose | 8+ | ODM |
| Passport | Latest | Autenticação |
| JWT | Latest | Tokens |
| bcryptjs | Latest | Hash de senhas |
| ExcelJS | Latest | Export XLSX |
| class-validator | Latest | Validação de DTOs |
| class-transformer | Latest | Transformação de dados |

## Endpoints Implementados

### Weather Logs

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| POST | `/api/v1/weather/logs` | Pública (interno) | Criar logs (batch) |
| GET | `/api/v1/weather/logs` | JWT | Listar logs com paginação |
| GET | `/api/v1/weather/logs/latest` | JWT | Última leitura |
| GET | `/api/v1/weather/export.csv` | JWT | Exportar CSV |
| GET | `/api/v1/weather/export.xlsx` | JWT | Exportar XLSX |
| GET | `/api/v1/weather/health` | Pública | Healthcheck |

### Autenticação

| Método | Endpoint | Autenticação | Descrição |
|--------|----------|--------------|-----------|
| POST | `/api/v1/auth/login` | Pública | Login |
| POST | `/api/v1/auth/register` | Pública | Registro |

### Usuários

| Método | Endpoint | Autenticação | Role | Descrição |
|--------|----------|--------------|------|-----------|
| GET | `/api/v1/users` | JWT | admin | Listar usuários |
| GET | `/api/v1/users/:id` | JWT | - | Detalhes do usuário |
| POST | `/api/v1/users` | JWT | admin | Criar usuário |
| PUT | `/api/v1/users/:id` | JWT | - | Atualizar usuário |
| DELETE | `/api/v1/users/:id` | JWT | admin | Remover usuário |

## Modelos de Dados

### WeatherLog

```typescript
{
  timestamp: Date;              // Indexado
  city: string;                 // Indexado
  source: string;
  temperature_c: number;
  relative_humidity: number;
  precipitation_mm: number;
  wind_speed_m_s: number;
  clouds_percent: number;
  weather_code: number;
  estimated_irradiance_w_m2?: number;
  temp_effect_factor?: number;
  soiling_risk?: 'low' | 'medium' | 'high';
  wind_derating_flag?: boolean;
  pv_derating_pct?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### User

```typescript
{
  email: string;                // Único, indexado
  password: string;              // Hasheado com bcrypt
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}
```

## Autenticação e Autorização

### JWT Strategy

- Algoritmo: HS256
- Expiração: 3600 segundos (1 hora)
- Payload: sub (user id), email, role

### Guards

**JwtAuthGuard**
- Proteção global de rotas
- Valida token JWT
- Extrai informações do usuário

**RolesGuard**
- Controle de acesso baseado em roles
- Decorator: `@Roles('admin')`

**Public Decorator**
- Marca rotas como públicas
- Decorator: `@Public()`

## Funcionalidades Implementadas

### 1. Persistência de Dados

- Armazenamento de weather logs no MongoDB
- Índices para performance (timestamp, city)
- Validação de dados via DTOs

### 2. Paginação

- Suporte a paginação em listagens
- Parâmetros: page, limit (máximo 100)
- Resposta inclui metadados de paginação

### 3. Filtros

- Filtro por período (start, end)
- Filtro por cidade
- Ordenação (asc, desc)

### 4. Exportação

- Export CSV com todos os campos
- Export XLSX com formatação
- Filtros aplicáveis nas exportações

### 5. Autenticação

- Login com email e senha
- Geração de token JWT
- Registro de novos usuários

### 6. CRUD de Usuários

- Listagem paginada
- Criação (admin only)
- Leitura individual
- Atualização (próprio usuário ou admin)
- Exclusão (admin only)

### 7. Seed Automático

- Criação automática de usuário admin na inicialização
- Credenciais: admin@example.com / 123456
- Configurável via variáveis de ambiente

## Configuração

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `MONGO_URL` | URL de conexão MongoDB | mongodb://root:root@mongodb:27017/gdash?authSource=admin |
| `JWT_SECRET` | Chave secreta JWT | changeme |
| `JWT_EXPIRES_IN` | Expiração do token | 3600s |
| `PORT` | Porta do servidor | 3000 |
| `NODE_ENV` | Ambiente | development |

### Seed de Usuário

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `SEED_USER_EMAIL` | Email do admin | admin@example.com |
| `SEED_USER_PASSWORD` | Senha do admin | 123456 |
| `SEED_USER_NAME` | Nome do admin | Admin |
| `SEED_USER_ROLE` | Role do admin | admin |

## Validação de Dados

### DTOs com class-validator

- Validação automática de tipos
- Validação de formatos (email, dates)
- Mensagens de erro personalizadas
- Transformação de dados

### Exemplo: CreateWeatherLogDto

```typescript
{
  timestamp: Date;              // @IsDate()
  city: string;                 // @IsString()
  source: string;               // @IsString()
  temperature_c: number;       // @IsNumber()
  relative_humidity: number;   // @IsNumber()
  // ... outros campos
}
```

## Tratamento de Erros

### Formato Padrão

```json
{
  "statusCode": 400,
  "message": "Mensagem de erro descritiva",
  "errors": [
    {
      "field": "campo",
      "message": "Mensagem específica do campo"
    }
  ]
}
```

### Códigos HTTP

| Código | Uso |
|--------|-----|
| 200 | Sucesso |
| 201 | Criado |
| 400 | Dados inválidos |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 500 | Erro interno |

## Testes

### Status

- Testes unitários: Pendente
- Testes de integração: Pendente

### Estrutura Proposta

```
api-nest/
├── src/
└── test/
    ├── unit/
    │   ├── usecases/
    │   └── services/
    └── integration/
        └── controllers/
```

## Dockerização

### Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/database ./database
CMD ["node", "dist/main.js"]
```

## Decisões Técnicas

### 1. Framework

**Decisão:** NestJS

**Razões:**
- TypeScript nativo
- Arquitetura modular
- Dependency Injection
- Decorators para validação e autenticação

### 2. Banco de Dados

**Decisão:** MongoDB

**Razões:**
- Flexibilidade de schema
- Performance para dados time-series
- Facilidade de escalabilidade horizontal

### 3. Autenticação

**Decisão:** JWT

**Razões:**
- Stateless
- Escalabilidade
- Padrão da indústria

### 4. Arquitetura

**Decisão:** Clean Architecture

**Razões:**
- Separação de responsabilidades
- Testabilidade
- Manutenibilidade
- Evolução facilitada

## Próximos Passos (Após Fase 4)

1. Implementar testes unitários e de integração
2. Iniciar Fase 5 (Frontend React)
3. Iniciar Fase 6 (IA/Insights)

## Referências

- [NestJS Documentation](https://docs.nestjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Passport JWT](http://www.passportjs.org/packages/passport-jwt/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**Última atualização:** 21/11/2025

