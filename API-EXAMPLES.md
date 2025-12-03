# 📖 Exemplos de Uso da API ClimaTempo

## 1. Autenticação

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Guarde este token para as próximas requisições!

---

## 2. Gerenciamento de Usuários

### Criar Novo Usuário
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "username": "joao",
    "password": "senha123",
    "role": "user"
  }'
```

### Listar Todos os Usuários
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "username": "admin",
    "role": "admin"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "username": "joao",
    "role": "user"
  }
]
```

### Atualizar Usuário
```bash
curl -X PUT http://localhost:3000/api/users/507f1f77bcf86cd799439012 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "password": "nova_senha456",
    "role": "admin"
  }'
```

### Deletar Usuário
```bash
curl -X DELETE http://localhost:3000/api/users/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 3. Dados Climáticos

### Salvar Dados Climáticos (Público)
```bash
curl -X POST http://localhost:3000/api/weather/process \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-12-03T15:30:00Z",
    "latitude": 52.52,
    "longitude": 13.40,
    "temperature": 15.5,
    "wind_speed": 12.3,
    "weather_code": 1
  }'
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "timestamp": "2025-12-03T15:30:00.000Z",
  "latitude": 52.52,
  "longitude": 13.40,
  "temperature": 15.5,
  "wind_speed": 12.3,
  "weather_code": 1,
  "insight": "A temperatura amena e o vento suave criam um dia perfeito para atividades ao ar livre."
}
```

### Obter Últimas 100 Leituras
```bash
curl -X GET http://localhost:3000/api/weather \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Exportar Dados em CSV
```bash
curl -X GET http://localhost:3000/api/weather/export \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -o clima-dados.csv
```

---

## 4. Integração PokeAPI

### Listar Pokémon (com paginação)
```bash
curl -X GET "http://localhost:3000/api/pokeapi?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "count": 1025,
  "next": "https://pokeapi.co/api/v2/pokemon?limit=10&offset=10",
  "previous": null,
  "results": [
    {
      "name": "bulbasaur",
      "url": "https://pokeapi.co/api/v2/pokemon/1/"
    },
    {
      "name": "ivysaur",
      "url": "https://pokeapi.co/api/v2/pokemon/2/"
    }
  ]
}
```

---

## 5. Health Check

### Verificar Status da API
```bash
curl -X GET http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok",
  "message": "API is running"
}
```

---

## 🔑 Autorização

### ❌ SEM Token
```bash
curl -X GET http://localhost:3000/api/weather
```
**Response**: `401 Unauthorized - Token de autenticação ausente.`

### ❌ TOKEN INVÁLIDO
```bash
curl -X GET http://localhost:3000/api/weather \
  -H "Authorization: Bearer INVALID_TOKEN"
```
**Response**: `401 Unauthorized - Token de autenticação inválido.`

### ❌ SEM PERMISSÃO
```bash
# Usuário "user" tentando criar novo usuário (requer "admin")
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer USER_TOKEN"
```
**Response**: `403 Forbidden`

---

## 📊 Cenários de Uso

### Cenário 1: Sistema Autônomo
```bash
# 1. API inicia com usuário admin automático
# 2. Go Worker consome fila Redis
# 3. Go Worker envia dados para POST /weather/process
# 4. Frontend acessa GET /weather com token
```

### Cenário 2: Dashboard em Tempo Real
```bash
# 1. Fazer login com admin/password123
# 2. Receber access_token
# 3. Usar token para GET /weather a cada 10 segundos
# 4. Atualizar dashboard com dados mais recentes
```

### Cenário 3: Gerenciamento de Usuários
```bash
# 1. Admin faz login
# 2. Admin cria novo usuário com POST /users
# 3. Novo usuário faz login com suas credenciais
# 4. Novo usuário acessa dashboard (sem permissão para CRUD de usuários)
```

---

## 🐍 Exemplo em Python

```python
import requests

BASE_URL = "http://localhost:3000/api"

# 1. Login
login_response = requests.post(
    f"{BASE_URL}/auth/login",
    json={"username": "admin", "password": "password123"}
)
token = login_response.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 2. Buscar dados climáticos
weather = requests.get(f"{BASE_URL}/weather", headers=headers)
print(weather.json())

# 3. Salvar novo dado (público)
new_data = {
    "timestamp": "2025-12-03T16:00:00Z",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "temperature": 28.5,
    "wind_speed": 8.2,
    "weather_code": 0
}
response = requests.post(f"{BASE_URL}/weather/process", json=new_data)
print(response.json())
```

---

## 🟦 Exemplo em TypeScript

```typescript
const API_BASE = 'http://localhost:3000/api';

// 1. Login
const loginResponse = await fetch(`${API_BASE}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'password123' })
});

const { access_token } = await loginResponse.json();

// 2. Headers com autenticação
const authHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${access_token}`
};

// 3. Buscar usuários
const usersResponse = await fetch(`${API_BASE}/users`, { headers: authHeaders });
const users = await usersResponse.json();
console.log(users);

// 4. Criar novo usuário
const newUser = {
  username: 'maria',
  password: 'senha456',
  role: 'user'
};

const createResponse = await fetch(`${API_BASE}/users`, {
  method: 'POST',
  headers: authHeaders,
  body: JSON.stringify(newUser)
});

const createdUser = await createResponse.json();
console.log(createdUser);
```

---

## 🔗 Fluxo Completo

```
1. Frontend faz login (POST /auth/login)
   └─ Recebe access_token

2. Frontend usa token para todas as requisições protegidas
   ├─ GET /weather (dados climáticos)
   ├─ GET /weather/export (exportar CSV)
   ├─ GET /pokeapi (lista pokémon)
   ├─ POST /users (criar usuário - admin only)
   ├─ GET /users (listar usuários - admin only)
   ├─ PUT /users/:id (editar usuário - admin only)
   └─ DELETE /users/:id (deletar usuário - admin only)

3. Go Worker (sem autenticação)
   └─ POST /weather/process (salvar dados climáticos)

4. Health Check (sem autenticação)
   └─ GET /health
```

---

## ⚙️ Variáveis de Ambiente

Se rodar localmente, configure:

```bash
# .env
MONGO_URI=mongodb://localhost:27017/climatempodb
JWT_SECRET=seu-secret-aqui
GEMINI_API_KEY=sua-chave-gemini-opcional
LOG_LEVEL=info
NODE_ENV=development
PORT=3000
```

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs: `docker-compose logs nestjs-api`
2. Confirme conexão com MongoDB
3. Verifique token JWT (não expirado)
4. Verifique roles (admin vs user)

---

**Desenvolvido com ❤️** | December 2025
