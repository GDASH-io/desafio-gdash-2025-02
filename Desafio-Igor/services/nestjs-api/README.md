# NestJS API

API REST completa para o sistema GDASH com autenticação JWT, CRUD de usuários, insights de IA e exportação de dados.

## 🎯 Funcionalidades

### 🔐 Autenticação
- Registro de usuários
- Login com JWT
- Proteção de rotas

### 🌤️ Weather
- CRUD de dados climáticos
- Estatísticas agregadas
- Insights com IA (OpenAI)
- Exportação CSV/XLSX

### 👥 Users
- CRUD de usuários
- Senhas hasheadas (bcrypt)
- Validação de dados

## 🚀 Execução Local

### Pré-requisitos
```bash
npm install
```

### Desenvolvimento
```bash
npm run start:dev
```

### Produção
```bash
npm run build
npm run start:prod
```

## 🐳 Docker

```bash
docker build -t gdash-nestjs-api .
docker run -p 3000:3000 --env-file .env gdash-nestjs-api
```

## 📚 Documentação API

Acesse: http://localhost:3000/api/docs

## 🔑 Endpoints Principais

### Auth
- `POST /auth/register` - Registrar
- `POST /auth/login` - Login

### Weather
- `GET /weather` - Listar dados
- `GET /weather/insights` - Insights IA
- `GET /weather/export/csv` - Exportar CSV
- `GET /weather/export/xlsx` - Exportar Excel

### Users
- `GET /users` - Listar usuários
- `GET /users/:id` - Obter usuário
- `PUT /users/:id` - Atualizar
- `DELETE /users/:id` - Deletar

## ⚙️ Variáveis de Ambiente

- `MONGO_URI`: String de conexão MongoDB
- `JWT_SECRET`: Chave secreta JWT
- `JWT_EXPIRATION`: Tempo de expiração token
- `OPENAI_API_KEY`: Chave OpenAI
- `PORT`: Porta da API

## 🧪 Testes

```bash
npm run test
npm run test:e2e
npm run test:cov
```
