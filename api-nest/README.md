# API NestJS - GDASH Challenge

API NestJS responsável por receber dados climáticos do Worker Go, armazenar no MongoDB, expor endpoints REST com paginação, exportação CSV/XLSX, autenticação JWT e CRUD de usuários.

## Arquitetura

O projeto segue **Clean Architecture** com as seguintes camadas:

- **Domain**: Entidades e interfaces de repositórios
- **Application**: Use cases (lógica de negócio)
- **Infrastructure**: Implementações concretas (MongoDB, JWT)
- **Presentation**: Controllers e DTOs

## Estrutura

```
api-nest/
├── src/
│   ├── main.ts                    # Entry point
│   ├── app.module.ts              # Módulo principal
│   ├── domain/                     # Entidades e interfaces
│   │   ├── entities/              # WeatherLog, User, Insight
│   │   └── repositories/          # Interfaces de repositórios
│   ├── application/               # Use cases
│   │   └── usecases/
│   │       ├── auth/               # Login, Register
│   │       ├── users/              # CRUD de usuários
│   │       ├── weather/            # Weather logs
│   │       └── insights/           # Geração de insights
│   ├── infra/                      # Implementações
│   │   ├── auth/                   # JWT, Guards
│   │   ├── database/               # Repositórios MongoDB
│   │   └── ai/                     # Regras, analisadores, scorers
│   ├── presentation/               # Controllers e DTOs
│   │   ├── controllers/           # REST controllers
│   │   └── dto/                    # Data Transfer Objects
│   └── modules/                    # Módulos NestJS
│       ├── auth/
│       ├── users/
│       ├── weather/
│       └── insights/
└── database/seed/                  # Seeds
```

## Endpoints

### Weather Logs

- `POST /api/v1/weather/logs` - Criar logs (sem autenticação - endpoint interno)
- `GET /api/v1/weather/logs` - Listar logs com paginação (com autenticação)
- `GET /api/v1/weather/logs/latest` - Última leitura (com autenticação)
- `GET /api/v1/weather/export.csv` - Exportar CSV (com autenticação)
- `GET /api/v1/weather/export.xlsx` - Exportar XLSX (com autenticação)
- `GET /api/v1/weather/health` - Healthcheck

### Insights de IA

- `GET /api/v1/weather/insights` - Buscar insights (com cache, requer autenticação)
- `POST /api/v1/weather/insights` - Forçar regeneração de insights (requer autenticação)

### Autenticação

- `POST /api/v1/auth/login` - Login (público)
- `POST /api/v1/auth/register` - Registro (público)

### Usuários

- `GET /api/v1/users` - Listar usuários (admin only)
- `GET /api/v1/users/:id` - Detalhes do usuário
- `POST /api/v1/users` - Criar usuário (admin only)
- `PUT /api/v1/users/:id` - Atualizar usuário
- `DELETE /api/v1/users/:id` - Remover usuário (admin only)

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

## Execução Local

### Pré-requisitos
- Node.js 20+
- MongoDB rodando (via Docker Compose)

### Instalar dependências

```bash
npm install
```

### Executar

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

### Executar seed

```bash
npm run build
node dist/database/seed/users.seed.js
```

## Com Docker

```bash
# Build
docker build -t api-nest .

# Executar
docker run --env-file .env api-nest
```

## Autenticação

A maioria dos endpoints requer autenticação via JWT. Obtenha o token via:

```bash
POST /api/v1/auth/login
{
  "email": "admin@example.com",
  "password": "123456"
}
```

Use o token no header:
```
Authorization: Bearer <token>
```

## Testes

```bash
# Testes unitários
npm run test

# Testes com cobertura
npm run test:cov

# Testes e2e
npm run test:e2e
```

## Próximos Passos

Após implementar a API:
1. Testar integração com Worker Go
2. Validar pipeline completo: Collector → Kafka → Worker → API
3. Iniciar Fase 5 (Frontend React)

