# 🌤️ GDASH Weather API with AI Insights

API REST desenvolvida com NestJS para coleta, armazenamento e análise inteligente de dados meteorológicos utilizando Groq AI.

## 📋 Descrição

Sistema backend que integra dados meteorológicos com inteligência artificial para fornecer insights contextualizados. A API recebe dados de um worker Go, armazena no MongoDB e utiliza o modelo **llama-3.1-70b-versatile** da Groq para análises avançadas.

## 🏗️ Arquitetura

```
src/
├── modules/
│   ├── auth/           # Autenticação JWT
│   ├── users/          # Gestão de usuários
│   ├── weather/        # Logs meteorológicos
│   └── insights/       # Análises com IA
├── shared/
│   ├── constants/      # Constantes e rotas
│   ├── guards/         # Guards de autenticação
│   └── exceptions/     # Tratamento de erros
└── main.ts            # Bootstrap da aplicação
```

### Módulos Implementados

#### 🔐 **Auth Module**
- Login com JWT (7 dias de expiração)
- Validação de token
- Proteção de rotas com guards

#### 👤 **Users Module**
- CRUD completo de usuários
- Hash de senhas com bcryptjs
- Validação de email único
- Criação automática de usuário padrão na inicialização

#### 🌡️ **Weather Module**
- Recepção de logs meteorológicos (endpoint público para Go Worker)
- Consulta com filtros (cidade, estado, período)
- Paginação e ordenação
- Endpoint de estatísticas agregadas
- 17 campos meteorológicos (temperatura, umidade, vento, UV, etc.)

#### 🤖 **Insights Module**
- Geração de insights com Groq AI
- 4 contextos pré-definidos:
  - `general`: Análise geral das condições
  - `alerts`: Identificação de alertas e condições extremas
  - `recommendations`: Recomendações práticas (vestuário, atividades)
  - `trends`: Análise de tendências temporais
- Suporte a prompts customizados
- Filtros por localização e período

## 🚀 Instalação

### Pré-requisitos

- Node.js v18+
- MongoDB v7.0+
- npm ou yarn

### Setup

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
```

### Configuração (.env)

```env
# Server
NODE_ENV=development
PORT=4000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/gdash

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-please
JWT_EXPIRES_IN=7d

# Groq AI
GROQ_API_KEY=sua-chave-groq-api
GROQ_MODEL=llama-3.1-70b-versatile
GROQ_BASE_URL=https://api.groq.com/openai/v1

# CORS
CORS_ORIGIN=http://localhost:5173

# Default User (criado automaticamente na primeira execução)
DEFAULT_USER_EMAIL=admin@example.com
DEFAULT_USER_PASSWORD=123456
DEFAULT_USER_NAME=Admin User
```

## 🎯 Execução

```bash
# Desenvolvimento (hot-reload)
npm run start:dev

# Produção
npm run build
npm run start:prod

# Debug
npm run start:debug
```

Após inicialização, acesse:
- 🚀 **API**: http://localhost:4000/api
- 📊 **Health Check**: http://localhost:4000/api/health

## 📡 Endpoints

### Autenticação

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "123456"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "name": "Admin User"
  }
}
```

### Usuários (🔒 Protegido)

```http
# Listar usuários
GET /api/users
Authorization: Bearer {token}

# Buscar usuário
GET /api/users/:id
Authorization: Bearer {token}

# Criar usuário
POST /api/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "senha123",
  "name": "Nome do Usuário"
}

# Atualizar usuário
PATCH /api/users/:id
Authorization: Bearer {token}

# Deletar usuário
DELETE /api/users/:id
Authorization: Bearer {token}
```

### Weather Logs

```http
# Criar log (público - recebe do Go Worker)
POST /api/weather/logs
Content-Type: application/json
X-Worker-ID: queue-worker-01

{
  "timestamp": "2025-11-23T21:00:00Z",
  "city": "São Paulo",
  "state": "SP",
  "country": "Brazil",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "temperature": 25.5,
  "feelsLike": 26.2,
  "humidity": 65,
  "windSpeed": 12.5,
  "windDirection": 180,
  "pressure": 1013,
  "uvIndex": 7,
  "visibility": 10000,
  "condition": "Parcialmente nublado",
  "rainProbability": 20,
  "cloudCover": 40,
  "source": "Open-Meteo"
}

# Listar logs (🔒 Protegido)
GET /api/weather/logs?city=São Paulo&startDate=2025-11-01&limit=50&offset=0
Authorization: Bearer {token}

# Último log (🔒 Protegido)
GET /api/weather/latest?city=São Paulo
Authorization: Bearer {token}

# Estatísticas (🔒 Protegido)
GET /api/weather/stats?city=São Paulo&startDate=2025-11-01
Authorization: Bearer {token}
```

### Insights com IA (🔒 Protegido)

```http
POST /api/insights/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "city": "São Paulo",
  "state": "SP",
  "startDate": "2025-11-01T00:00:00Z",
  "endDate": "2025-11-23T23:59:59Z",
  "context": "alerts"
}

Response:
{
  "insights": "Análise detalhada gerada pela IA...",
  "context": "alerts",
  "dataCount": 50,
  "dateRange": {
    "start": "2025-11-01T00:00:00Z",
    "end": "2025-11-23T23:59:59Z"
  },
  "location": {
    "city": "São Paulo",
    "state": "SP"
  },
  "generatedAt": "2025-11-23T21:30:00.000Z"
}
```

## 🛠️ Stack Tecnológica

- **Framework**: NestJS 11.0
- **Database**: MongoDB 8.0 + Mongoose
- **Auth**: JWT + Passport
- **Validation**: class-validator + class-transformer
- **AI**: Groq API (llama-3.1-70b-versatile)
- **HTTP Client**: Axios (@nestjs/axios)
- **Password Hashing**: bcryptjs
- **TypeScript**: 5.7

## 📦 Dependências Principais

```json
{
  "@nestjs/core": "^11.0.1",
  "@nestjs/mongoose": "^11.0.3",
  "@nestjs/jwt": "^11.0.1",
  "@nestjs/passport": "^11.0.5",
  "@nestjs/axios": "^4.0.1",
  "mongoose": "^8.20.1",
  "bcryptjs": "^3.0.3",
  "class-validator": "^0.14.2",
  "exceljs": "^4.4.0"
}
```

## 🔐 Segurança

- ✅ Senhas hasheadas com bcryptjs (10 salt rounds)
- ✅ JWT com expiração configurável
- ✅ Validação de entrada com class-validator
- ✅ Guards de autenticação em rotas protegidas
- ✅ CORS configurável
- ✅ Whitelist de propriedades em DTOs

## 🎨 Boas Práticas Implementadas

- ✨ Arquitetura modular por features
- ✨ Separação de responsabilidades (Controllers → Services → Models)
- ✨ DTOs com validação automática
- ✨ Constantes centralizadas
- ✨ Mensagens de erro padronizadas
- ✨ Tratamento de exceções com tipos do NestJS
- ✨ Transformação automática de tipos
- ✨ Índices no MongoDB para otimização

## 📝 Schemas MongoDB

### User
```typescript
{
  email: string (unique)
  password: string (hashed)
  name: string
  createdAt: Date
  updatedAt: Date
}
```

### WeatherLog
```typescript
{
  timestamp: Date (indexed)
  city: string (indexed)
  state: string
  country: string
  latitude: number
  longitude: number
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  windDirection: number
  pressure: number
  uvIndex: number
  visibility: number
  condition: string
  rainProbability: number
  cloudCover: number
  source?: string
  workerId?: string
  createdAt: Date
}
```

## 🚀 Deploy

A API pode ser deployada usando Docker:

```bash
# Build
docker build -t gdash-api .

# Run
docker run -p 4000:4000 --env-file .env gdash-api
```

Ou usando docker-compose (recomendado):

```bash
docker-compose up -d
```

## 📚 Documentação Adicional

- [NestJS Documentation](https://docs.nestjs.com)
- [Mongoose Documentation](https://mongoosejs.com)
- [Groq API Documentation](https://console.groq.com/docs)
