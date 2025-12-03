# ClimaTempo - Sistema Completo de Monitoramento Climático

Sistema integrado para coleta, processamento e visualização de dados climáticos em tempo real usando Docker Compose.

## 📋 Estrutura do Projeto

- **`nestjs-api/`** - Backend em NestJS com autenticação JWT, MongoDB e integração com Gemini AI
- **`frontend/`** - Interface React com Vite, Tailwind CSS e integração com a API
- **`data-collector/`** - Microsserviço Python que coleta dados de Open-Meteo e publica em Redis
- **`go-worker/`** - Microsserviço Go que consome dados do Redis e envia para a API
- **`docker-compose.yml`** - Orquestração de todos os serviços

## 🚀 Como Executar

### 1. Opção A: Com Docker Compose (Recomendado)

```bash
cd /home/jordao/Downloads/ClimaTempo
docker-compose up --build
```

Serviços estarão disponíveis em:
- **Frontend**: http://localhost:80
- **API Backend**: http://localhost:3000/api
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

### 2. Opção B: Desenvolvimento Local

#### Backend (NestJS)
```bash
cd nestjs-api
npm install
npm run dev  # Inicia com ts-node-dev para hot reload
# ou
npm run build && npm run start:prod
```

API rodará em http://localhost:3000/api

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend rodará em http://localhost:5173

### 3. Credenciais Padrão

- **Usuário**: `admin`
- **Senha**: `password123`

## 📊 Funcionalidades

### Dashboard
- Visualização em tempo real de temperatura, velocidade do vento, latitude, código climático
- Gráfico de histórico de leituras com insights gerados por IA (Gemini)
- Exportação de dados em CSV

### Gerenciamento de Usuários
- CRUD completo (Criar, Ler, Atualizar, Deletar)
- Autenticação JWT
- Controle de roles (admin/user)
- Protegido por autenticação

### Integração PokeAPI
- Lista de Pokémon com paginação
- Protegido por autenticação JWT

## 🔧 Variáveis de Ambiente

### NestJS API
```env
MONGO_URI=mongodb://mongodb:27017/clima-tempo-db
JWT_SECRET=your-secret-key
GEMINI_API_KEY=sua-chave-api-gemini  # Opcional para insights de IA
LOG_LEVEL=info
NODE_ENV=production
PORT=3000
```

### Data Collector (Python)
```env
REDIS_HOST=redis
REDIS_PORT=6379
LATITUDE=52.52
LONGITUDE=13.40
```

### Go Worker
```env
REDIS_HOST=redis
REDIS_PORT=6379
NESTJS_API_URL=http://nestjs-api:3000/api/weather/process
```

## 📦 Dependências Principais

### NestJS API
- `@nestjs/*` - Framework NestJS
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - Autenticação JWT
- `bcrypt` - Hashing de senhas
- `axios` - Cliente HTTP para chamadas de API
- `log4js` - Logging

### Frontend
- `react` - UI library
- `tailwindcss` - CSS utilities
- `lucide-react` - Icons

### Data Collector
- `requests` - HTTP client
- `redis` - Client Redis

### Go Worker
- `github.com/go-redis/redis/v8` - Client Redis

## 🐳 Estrutura do Docker Compose

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| MongoDB | 27017 | Banco de dados |
| Redis | 6379 | Broker de mensagens |
| data-collector | N/A | Coleta de dados climáticos |
| go-worker | N/A | Processamento de dados |
| nestjs-api | 3000 | API Backend |
| frontend | 80 | Interface web |

## ✅ Verificações Realizadas

- ✅ TypeScript compilando corretamente
- ✅ Todas as dependências NPM instaladas
- ✅ Frontend built com sucesso via Vite
- ✅ Dockerfile optimizados com multi-stage builds
- ✅ Configuração de CORS habilitada
- ✅ Healthcheck configurado para a API
- ✅ Variáveis de ambiente configuradas
- ✅ Retry logic implementado para conexões

## 🔍 Troubleshooting

### Erro: "Cannot connect to MongoDB"
- Verifique se MongoDB está rodando
- Confirme a URL em `docker-compose.yml`: `mongodb://mongodb:27017/clima-tempo-db`
- Em desenvolvimento local, ajuste para: `mongodb://localhost:27017/climatempodb`

### Erro: "Redis connection refused"
- Verifique se o serviço Redis está rodando
- Confirme portas: 6379

### Erro: "Falha no login"
- Aguarde a criação automática do usuário admin (levará alguns segundos no primeiro boot)
- Verifique logs do container NestJS: `docker-compose logs nestjs-api`

### Dados não aparecem no dashboard
- Verifique se `data-collector` está coletando dados: `docker-compose logs data-collector`
- Verifique se `go-worker` está processando: `docker-compose logs go-worker`
- Confirme fila Redis: use Redis CLI para verificar `LLEN weather_data_queue`

## 📝 Logs

Ver logs de um serviço específico:
```bash
docker-compose logs -f nestjs-api   # API
docker-compose logs -f data-collector  # Coletor
docker-compose logs -f go-worker       # Worker
docker-compose logs -f frontend        # Frontend
```

## 🛑 Parar os Serviços

```bash
docker-compose down
```

Para remover volumes (dados persistentes):
```bash
docker-compose down -v
```

## 📚 Documentação das APIs

### Autenticação
```
POST /api/auth/login
Body: { "username": "admin", "password": "password123" }
Response: { "access_token": "eyJhbGciOiJIUzI1NiIs..." }
```

### Clima
```
POST /api/weather/process (PUBLIC)
GET /api/weather (PROTEGIDO)
GET /api/weather/export (PROTEGIDO)
```

### Usuários
```
POST /api/users (ADMIN)
GET /api/users (ADMIN)
PUT /api/users/:id (ADMIN)
DELETE /api/users/:id (ADMIN)
```

### PokeAPI
```
GET /api/pokeapi?limit=20&offset=0 (PROTEGIDO)
```

### Health Check
```
GET /health
```

## 🤝 Contribuindo

Sinta-se livre para fazer fork e enviar pull requests.

## 📄 Licença

Este projeto é de código aberto e pode ser usado livremente.

---

**Desenvolvido em December 2025** com ❤️
