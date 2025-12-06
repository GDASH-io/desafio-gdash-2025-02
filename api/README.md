# API NestJS - Weather System

API RESTful para gerenciamento de dados climáticos.

## 🚀 Executando Localmente

### Pré-requisitos
- Node.js 20+
- MongoDB rodando (ou via Docker)

### Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações
```

### Executar

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## 📡 Endpoints

### Autenticação

#### POST /api/auth/login
Faz login e retorna JWT token.

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "name": "Administrador"
  }
}
```

### Weather Logs

#### POST /api/weather/logs
Cria um novo log climático (sem autenticação - usado pelo worker Go).

#### GET /api/weather/logs
Lista logs com paginação.

**Query params:**
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 50)
- `startDate`: Data inicial (ISO 8601)
- `endDate`: Data final (ISO 8601)

**Headers:**
```
Authorization: Bearer {token}
```

#### GET /api/weather/logs/statistics
Retorna estatísticas dos logs.

#### GET /api/weather/export.csv
Exporta logs em formato CSV.

**Query params:**
- `startDate`: Data inicial (opcional)
- `endDate`: Data final (opcional)

#### GET /api/weather/export.xlsx
Exporta logs em formato XLSX.

#### GET /api/weather/insights
Gera insights baseados nos dados climáticos.

**Query params:**
- `days`: Número de dias para análise (padrão: 7)

### Usuários

Todos os endpoints de usuários requerem autenticação JWT.

#### GET /api/users
Lista todos os usuários.

#### GET /api/users/:id
Busca usuário por ID.

#### POST /api/users
Cria novo usuário.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "senha123",
  "name": "Nome do Usuário"
}
```

#### PATCH /api/users/:id
Atualiza usuário.

#### DELETE /api/users/:id
Deleta usuário.

## 🔐 Autenticação

A maioria dos endpoints requer autenticação via JWT. Para usar:

1. Faça login em `/api/auth/login`
2. Use o token retornado no header:
   ```
   Authorization: Bearer {seu_token}
   ```

## 🤖 Insights com IA

O sistema suporta geração de insights usando Google Gemini. Para habilitar:

1. Configure `GEMINI_API_KEY` no `.env`
2. Se não configurado, o sistema usa insights baseados em regras

## 📝 Variáveis de Ambiente

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/weather_db
JWT_SECRET=your-secret-key
DEFAULT_USER_EMAIL=admin@example.com
DEFAULT_USER_PASSWORD=123456
DEFAULT_USER_NAME=Administrador
GEMINI_API_KEY=AIzaSy... (opcional)
```

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Cobertura
npm run test:cov
```

