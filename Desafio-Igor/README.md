# LINK Video

https://www.youtube.com/watch?v=SWJ_An6cSVs

# GDASH - Weather Intelligence System

Sistema de coleta, processamento e análise de dados climáticos com insights de IA.

## Arquitetura

```
Python Collector -> Redis Queue -> Go Worker -> NestJS API -> MongoDB
                                                      ^
                                                      |
                                                React Frontend
```

## Serviços

### 1. Python Collector (services/python-collector)

Coleta dados de clima da API OpenWeatherMap e envia para fila Redis. Executa a cada 5 minutos.

### 2. Go Worker (services/go-worker)

Consome mensagens da fila Redis, processa e envia para API NestJS.

### 3. NestJS API (services/nestjs-api)

API REST com autenticação JWT, geração de insights com IA (OpenAI), exportação CSV/XLSX e persistência no MongoDB.

### 4. React Frontend (services/react-frontend)

Dashboard de clima em tempo real com visualização de insights de IA e interface moderna com Vite.

### 5. Infraestrutura

- Redis: Fila de mensagens
- MongoDB: Banco de dados

## Pré-requisitos

- Docker Desktop
- Docker Compose
- Git

## Instalação e Execução

### 1. Clone o repositório

```bash
git clone <seu-repo>
cd gdash
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:

- `OPENWEATHER_API_KEY`: Obtenha em https://openweathermap.org/api
- `OPENAI_API_KEY`: Obtenha em https://platform.openai.com/api-keys
- `JWT_SECRET`: Use uma chave segura
- `OPENAI_VECTOR_STORE_ID`: Será gerado no passo de Vector Store abaixo

### 3. Preparar Vector Store de Insights Avançados

Este passo é obrigatório para o endpoint `/weather/insights/advanced` funcionar.

1. Entre na pasta do vector e crie um ambiente virtual Python:

```bash
cd vector
python -m venv .venv
```

2. Ative o ambiente virtual (Windows PowerShell):

```bash
.venv\\Scripts\\Activate.ps1
```

3. Instale as dependências do vector:

```bash
pip install -r requirements.txt
```

4. Crie o vector store na OpenAI (usa a mesma `OPENAI_API_KEY` do passo anterior):

```bash
python uploadvector.py
```

O script irá:

- Ler a base `clima_kb.jsonl`
- Criar um vector store na OpenAI
- Fazer upload do arquivo
- Exibir no terminal o **ID do vector store** (ex.: `vs_abc123...`)

5. Copie o ID exibido e adicione no `.env` na raiz do projeto:

```env
OPENAI_VECTOR_STORE_ID=vs_xxxxxxxxxxxxxxxxxxxxxx
```

6. Volte para a raiz do projeto e reinicie o serviço da API (se já estiver rodando via Docker):

```bash
cd ..
docker-compose restart nestjs-api
```

### 4. Inicie todos os serviços

```bash
docker-compose up -d
```

### 5. Verifique os logs

```bash
docker-compose logs -f
```

### 6. Acesse os serviços

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/docs

## Endpoints Principais

### Autenticação

- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Login

### Clima

- `GET /weather` - Lista dados de clima
- `GET /weather/insights` - Insights de IA
- `GET /weather/export/csv` - Exportar CSV
- `GET /weather/export/xlsx` - Exportar XLSX

### Usuários

- `GET /users` - Listar usuários
- `GET /users/:id` - Obter usuário
- `PUT /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Deletar usuário

## Desenvolvimento

### Executar serviço específico

```bash
docker-compose up python-collector
docker-compose up go-worker
docker-compose up nestjs-api
docker-compose up react-frontend
```

### Reconstruir imagens

```bash
docker-compose build --no-cache
```

### Parar todos os serviços

```bash
docker-compose down
```

### Limpar volumes (⚠️ apaga dados)

```bash
docker-compose down -v
```

## Seguridade

- JWT para autenticação
- Senhas hasheadas com bcrypt
- Validação de dados em todas as camadas

## Licença

MIT License
