# 🌦️ Weather Dashboard - Full-Stack Microservices

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Go](https://img.shields.io/badge/Go-00ADD8?style=flat&logo=go&logoColor=white)](https://golang.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=flat&logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎬 Apresentação em Vídeo

> **📹 [Assista à apresentação técnica completa no YouTube](https://youtu.be/2N6iTDiLapU)**
> 
> Demonstração da arquitetura, pipeline de dados, decisões técnicas e aplicação funcionando (5 minutos)

---

Sistema completo de monitoramento climático em **tempo real** com arquitetura de microserviços, processamento concorrente, insights com IA e gamificação Pokémon.

> 🎯 **Desafio Técnico Full-Stack** - Implementação completa do pipeline de dados: Python → RabbitMQ → Go → NestJS → MongoDB → React

> ⚠️ **Importante:** Configure suas próprias credenciais em `.env` e `docker-compose.override.yml` antes de usar em produção!

---

## 📋 Índice

- [✨ Características](#-características)
- [🏗️ Arquitetura](#️-arquitetura)
- [🚀 Quick Start](#-quick-start)
- [📦 Pré-requisitos](#-pré-requisitos)
- [⚙️ Instalação](#️-instalação)
- [🌐 Variáveis de Ambiente](#-variáveis-de-ambiente)
- [🔧 Uso](#-uso)
- [📊 Endpoints da API](#-endpoints-da-api)
- [🎨 Páginas do Frontend](#-páginas-do-frontend)
- [🧪 Testes](#-testes)
- [🐛 Troubleshooting](#-troubleshooting)
- [📚 Documentação Adicional](#-documentação-adicional)
- [🛠️ Stack Tecnológica](#️-stack-tecnológica)
- [👥 Contribuição](#-contribuição)
- [📄 Licença](#-licença)

---

## ✨ Características

### 🎯 Core Features

- ✅ **Pipeline Completo de Dados**: Python → RabbitMQ → Go → NestJS → MongoDB → React
- ✅ **Coleta Automática**: Dados climáticos a cada 5 minutos (Open-Meteo API)
- ✅ **Processamento Concorrente**: 5 workers Go com retry e ACK/NACK
- ✅ **API REST Completa**: 16 endpoints NestJS com validação e autenticação
- ✅ **Dashboard Interativo**: React com gráficos, tabelas e filtros
- ✅ **Autenticação JWT**: Sistema completo com roles (admin/user)
- ✅ **Export de Dados**: CSV e XLSX formatados

### 🤖 Features Avançados

- 🤖 **IA Preditiva**: Together AI (Meta-Llama 3.1 8B) com análise e previsão de 6 horas
- 📦 **Cache Inteligente**: Sistema de cache de 6 horas (economia de 99% em chamadas)
- ⚡ **Weather Pokémon**: Gamificação com 8 condições climáticas + sistema de lendários
- 📊 **Insights Avançados**: Estatísticas, tendências e recomendações automáticas
- 🎨 **UI Moderna**: Tailwind CSS com animações e design responsivo
- 🔗 **PokéAPI Integration**: 1328 Pokémon com detalhes completos

### 🎮 Funcionalidades Extras

- 🎲 **Sistema de Lendários**: 2% chance base + bônus por condições extremas
- 📈 **Gráficos Interativos**: Recharts com temperatura, umidade, vento
- 👥 **CRUD de Usuários**: Gerenciamento completo com modal e validações
- 🔐 **Protected Routes**: Sistema de rotas protegidas no frontend
- 📱 **Responsivo**: Design adaptativo para mobile, tablet e desktop
- 🌍 **Localização**: Suporte a português BR com date-fns

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                      WEATHER DASHBOARD                          │
└─────────────────────────────────────────────────────────────────┘

    📡 Python Collector (5 min interval)
    │   ├─ Open-Meteo API
    │   └─ Weather data: temp, humidity, wind, precipitation
    │
    ▼
    📨 RabbitMQ (Message Broker)
    │   ├─ Queue: weather_data
    │   ├─ Management UI: :15672
    │   └─ Persistent messages
    │
    ▼
    ⚙️  Go Worker (5 concurrent workers)
    │   ├─ ACK/NACK handling
    │   ├─ Retry mechanism (3x)
    │   └─ HTTP POST to NestJS
    │
    ▼
    🚀 NestJS API (:3000)
    │   ├─ Weather Module (7 endpoints)
    │   ├─ Users Module (5 endpoints)
    │   ├─ Auth Module (JWT)
    │   ├─ Pokemon Module (3 endpoints)
    │   └─ Together AI Integration
    │
    ▼
    🗄️  MongoDB
    │   ├─ Collection: weathers
    │   └─ Collection: users
    │
    ◄───────────────────┐
                        │
    🎨 React Frontend (:5173)
        ├─ Dashboard (weather + pokémon)
        ├─ Insights (IA + predictions)
        ├─ Export (CSV/XLSX)
        ├─ Explore (1328 pokémon)
        ├─ Users Management
        └─ Authentication
```

### 📐 Padrões de Arquitetura

- **Microserviços**: Separação clara de responsabilidades
- **Message Broker**: Desacoplamento com RabbitMQ
- **Concurrent Workers**: Processamento paralelo em Go
- **REST API**: Interface padronizada com NestJS
- **MVC Pattern**: Separação de camadas (Controller → Service → Repository)
- **Context API**: Gerenciamento de estado global no React

---

## 🚀 Quick Start

### Opção 1: Docker Compose (Recomendado)

```bash
# 1. Clone o repositório
git clone https://github.com/RobertoSilvaDevFullStack/desafio_gdash
cd desafio_gdash

# 2. Configure as variáveis de ambiente (IMPORTANTE!)
cp .env.example .env
cp docker-compose.override.yml.example docker-compose.override.yml
# Edite os arquivos criados e configure suas próprias credenciais

# 3. Suba todos os serviços
docker compose up -d

# 4. Aguarde os serviços iniciarem (30-45 segundos)
docker compose ps

# 5. Acesse o frontend
# Frontend: http://localhost:5173
# API: http://localhost:3000
# RabbitMQ UI: http://localhost:15672 (credenciais no docker-compose.yml)
```

**Pronto! 🎉** O sistema está rodando:

- ✅ Python coletando dados a cada 5 minutos
- ✅ Go processando mensagens
- ✅ NestJS API ativa
- ✅ React Dashboard disponível

### 🔑 Credenciais de Teste

**Usuário de teste já cadastrado:**

```
Email: user@test.com
Senha: 123456
```

> ⚠️ **Importante:** Este usuário é criado automaticamente no primeiro início da aplicação e pode ser usado para testar todas as funcionalidades do sistema.

> 🔒 **Segurança:** As credenciais padrão no `docker-compose.yml` são seguras (valores placeholder). Configure suas próprias credenciais em `docker-compose.override.yml` antes de subir em produção!

### Opção 2: Desenvolvimento Local

```bash
# Terminal 1: MongoDB
docker run -d -p 27017:27017 --name mongodb \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=<sua_senha_segura> \
  mongo:7

# Terminal 2: RabbitMQ
docker run -d -p 5672:5672 -p 15672:15672 --name rabbitmq \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=<sua_senha_segura> \
  rabbitmq:3-management

# Terminal 3: Python Collector
cd python-weather-collector
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python src/main.py

# Terminal 4: Go Worker
cd go-weather-worker
go mod download
go run cmd/worker/main.go

# Terminal 5: NestJS API
cd nestjs-api
npm install
npm run start:dev

# Terminal 6: React Frontend
cd desafio_gdash
npm install
npm run dev
```

---

## 📦 Pré-requisitos

### Para Docker (Recomendado)

- [Docker](https://www.docker.com/get-started) 20.10+
- [Docker Compose](https://docs.docker.com/compose/install/) 2.0+
- 4GB RAM disponível
- 5GB espaço em disco

### Para Desenvolvimento Local

- **Python**: 3.10+
- **Go**: 1.21+
- **Node.js**: 20+
- **MongoDB**: 7+
- **RabbitMQ**: 3+

---

## ⚙️ Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com/RobertoSilvaDevFullStack/desafio_gdash
cd desafio_gdash
```

### 2. Configure Variáveis de Ambiente

#### 2.1 NestJS API

Crie `nestjs-api/.env`:

```env
# MongoDB
MONGODB_URI=mongodb://admin:<sua_senha>@mongodb:27017/weather_dashboard?authSource=admin

# JWT
JWT_SECRET=<sua_chave_secreta_jwt>
JWT_EXPIRES_IN=7d

# App
PORT=3000
NODE_ENV=development

# Together AI (opcional - para insights avançados)
# Obtenha em: https://api.together.xyz/
TOGETHER_API_KEY=<sua_api_key_together_ai>

# Default User (criado automaticamente)
DEFAULT_USER_EMAIL=user@test.com
DEFAULT_USER_PASSWORD=123456
DEFAULT_USER_NAME=Usuário Teste
```

#### 2.2 Frontend React

Crie `desafio_gdash/.env`:

```env
VITE_API_URL=http://localhost:3000
```

#### 2.3 Docker Compose

Edite `docker-compose.yml` e atualize `TOGETHER_API_KEY`:

```yaml
nestjs-api:
  environment:
    - TOGETHER_API_KEY=<sua_api_key_together_ai> # ← Substituir pela sua chave
```

### 3. Suba os Serviços

```bash
# Build e start de todos os containers
docker compose up --build -d

# Verificar status
docker compose ps

# Ver logs
docker compose logs -f
```

### 4. Verifique a Instalação

```bash
# Testar API
curl http://localhost:3000/api/weather/stats

# Testar Frontend
# Abra no navegador: http://localhost:5173
```

---

## 🌐 Variáveis de Ambiente

### NestJS API

| Variável                | Descrição                 | Padrão                                                                      | Obrigatório |
| ----------------------- | ------------------------- | --------------------------------------------------------------------------- | ----------- |
| `MONGODB_URI`           | String de conexão MongoDB | `mongodb://admin:<senha>@mongodb:27017/weather_dashboard?authSource=admin` | ✅          |
| `JWT_SECRET`            | Chave secreta para JWT    | `<string_aleatoria_segura>`                                                 | ✅          |
| `JWT_EXPIRES_IN`        | Tempo de expiração do JWT | `7d`                                                                        | ❌          |
| `PORT`                  | Porta da API              | `3000`                                                                      | ❌          |
| `NODE_ENV`              | Ambiente de execução      | `development`                                                               | ❌          |
| `TOGETHER_API_KEY`      | API key do Together AI    | `<obter_em_api.together.xyz>`                                               | ❌          |
| `DEFAULT_USER_EMAIL`    | Email do usuário padrão   | `user@test.com`                                                             | ❌          |
| `DEFAULT_USER_PASSWORD` | Senha do usuário padrão   | `123456` (apenas para testes)                                               | ❌          |
| `DEFAULT_USER_NAME`     | Nome do usuário padrão    | `Usuário Teste`                                                             | ❌          |

### Python Collector

| Variável              | Descrição                      | Padrão         | Obrigatório |
| --------------------- | ------------------------------ | -------------- | ----------- |
| `RABBITMQ_HOST`       | Host do RabbitMQ               | `rabbitmq`     | ✅          |
| `RABBITMQ_PORT`       | Porta do RabbitMQ              | `5672`         | ✅          |
| `RABBITMQ_USER`       | Usuário do RabbitMQ            | `admin`        | ✅          |
| `RABBITMQ_PASS`       | Senha do RabbitMQ              | `<sua_senha>`  | ✅          |
| `RABBITMQ_QUEUE`      | Nome da fila                   | `weather_data` | ✅          |
| `COLLECTION_INTERVAL` | Intervalo de coleta (segundos) | `300`          | ❌          |
| `LATITUDE`            | Latitude da localização        | `-23.5505`     | ❌          |
| `LONGITUDE`           | Longitude da localização       | `-46.6333`     | ❌          |

### Go Worker

| Variável         | Descrição                      | Padrão                                 | Obrigatório |
| ---------------- | ------------------------------ | -------------------------------------- | ----------- |
| `RABBITMQ_URL`   | URL completa do RabbitMQ       | `amqp://admin:<senha>@rabbitmq:5672/` | ✅          |
| `RABBITMQ_QUEUE` | Nome da fila                   | `weather_data`                         | ✅          |
| `API_URL`        | URL da API NestJS              | `http://nestjs-api:3000`               | ✅          |
| `NUM_WORKERS`    | Número de workers concorrentes | `5`                                    | ❌          |
| `RETRY_ATTEMPTS` | Tentativas de retry            | `3`                                    | ❌          |
| `RETRY_DELAY`    | Delay entre retries            | `2s`                                   | ❌          |

### React Frontend

| Variável       | Descrição          | Padrão                  | Obrigatório |
| -------------- | ------------------ | ----------------------- | ----------- |
| `VITE_API_URL` | URL da API backend | `http://localhost:3000` | ✅          |

---

## 🔧 Uso

### Comandos Docker

```bash
# Iniciar todos os serviços
docker compose up -d

# Parar todos os serviços
docker compose down

# Ver logs de um serviço específico
docker compose logs -f nestjs-api
docker compose logs -f python-weather-collector
docker compose logs -f go-weather-worker

# Rebuild de um serviço
docker compose up -d --build nestjs-api

# Verificar status
docker compose ps

# Acessar shell de um container
docker compose exec nestjs-api sh
docker compose exec mongodb mongosh
```

### Acesso aos Serviços

| Serviço                 | URL                       | Credenciais                |
| ----------------------- | ------------------------- | -------------------------- |
| **Frontend**            | http://localhost:5173     | `user@test.com` / `123456` |
| **API REST**            | http://localhost:3000     | -                          |
| **RabbitMQ Management** | http://localhost:15672    | (ver docker-compose.yml)   |
| **MongoDB**             | mongodb://localhost:27017 | (ver docker-compose.yml)   |

### Testando a Coleta de Dados

```bash
# Ver logs do coletor Python
docker compose logs -f python-weather-collector

# Você verá:
# ✅ Dados climáticos coletados com sucesso
# 📤 Mensagem publicada na fila
```

### Testando o Worker Go

```bash
# Ver logs do worker
docker compose logs -f go-weather-worker

# Você verá:
# [Worker 1] ✅ Dados enviados com sucesso
# [Worker 2] 📨 Processando mensagem...
```

---

## 📊 Endpoints da API

### Weather (7 endpoints)

```http
POST   /api/weather/logs              # Receber dados do Go Worker
GET    /api/weather/logs?limit=100    # Listar registros
GET    /api/weather/recent?hours=24   # Dados recentes
GET    /api/weather/stats             # Estatísticas
GET    /api/weather/export.csv        # Exportar CSV
GET    /api/weather/export.xlsx       # Exportar XLSX
GET    /api/weather/insights?hours=24 # Insights com IA
```

### Users (5 endpoints)

```http
POST   /api/users                # Criar usuário
GET    /api/users                # Listar usuários
GET    /api/users/:id            # Buscar por ID
PATCH  /api/users/:id            # Atualizar usuário
DELETE /api/users/:id            # Deletar usuário
```

### Auth (1 endpoint)

```http
POST   /api/auth/login           # Login (retorna JWT)
```

### Pokemon (3 endpoints)

```http
GET    /api/pokemon                    # Listar (paginado)
GET    /api/pokemon/search?q=pikachu   # Buscar
GET    /api/pokemon/:idOrName          # Detalhes
```

### Exemplos de Uso

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "123456"}'

# Buscar estatísticas (autenticado)
curl http://localhost:3000/api/weather/stats \
  -H "Authorization: Bearer SEU_TOKEN_JWT"

# Insights com IA
curl http://localhost:3000/api/weather/insights?hours=24 \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

---

## 🎨 Páginas do Frontend

### 1. Dashboard (/) 🏠

- Cards climáticos com dados em tempo real
- Gráfico de temperatura (24 horas)
- Tabela paginada de registros
- **Weather Pokémon** baseado no clima atual
- Estatísticas: total, médias, tendências

### 2. Insights (/insights) 🤖

- 4 cards estatísticos (temp/humidity/wind/precipitation)
- Padrões detectados (tendências, anomalias)
- **Análise com IA Together AI** (Meta-Llama 3.1 8B)
- Previsão para as próximas 6 horas
- Recomendações práticas
- Seletor de período (6h, 12h, 24h, 48h)

### 3. Export (/export) 📥

- Download CSV com cabeçalhos em português
- Download XLSX formatado (cores, bordas, auto-width)
- Seletor de limite de registros (50, 100, 500, 1000, Todos)
- Preview das colunas exportadas
- Estatísticas de registros disponíveis

### 4. Explore (/explore) 🎮

- Grid com 1328 Pokémon da PokéAPI
- Paginação (20 por página)
- Sprites oficiais em alta qualidade
- Layout responsivo (1-5 colunas)
- Click para ver detalhes

### 5. PokemonDetail (/explore/:id) 📖

- Artwork oficial em destaque
- 6 base stats com progress bars coloridas
- Tipos com badges coloridas
- Lista de abilities
- 4 sprites (front/back/shiny)

### 6. Profile (/profile) 👤

- Informações do usuário logado
- Formulário para trocar senha
- Validações em tempo real

### 7. Users Management (/users) 👥

- **Admin only**: CRUD completo de usuários
- Tabela com avatar, email, role, status
- Modal para criar/editar usuários
- Confirmação para deletar
- Toast messages de sucesso/erro

### 8. Login (/login) 🔐

- Form unificado (login/register)
- Toggle entre modos
- Validação de email
- Feedback visual de erros

---

## 🧪 Testes

### Testes Manuais

```bash
# Testar coleta de dados
docker compose logs -f python-weather-collector

# Testar processamento
docker compose logs -f go-weather-worker

# Testar API
curl http://localhost:3000/api/weather/stats
```

### Testes Automatizados (Em desenvolvimento)

```bash
# NestJS
cd nestjs-api
npm run test           # Unit tests
npm run test:e2e       # E2E tests
npm run test:cov       # Coverage

# React
cd desafio_gdash
npm run test           # Jest + React Testing Library
```

---

## 🐛 Troubleshooting

### Problema: Containers não sobem

```bash
# Verificar portas em uso
netstat -ano | findstr :3000
netstat -ano | findstr :5672
netstat -ano | findstr :27017

# Solução: Parar processos nas portas ou alterar portas no docker-compose.yml
```

### Problema: MongoDB não conecta

```bash
# Verificar se o container está rodando
docker compose ps mongodb

# Ver logs
docker compose logs mongodb

# Solução: Aguardar o healthcheck (10-15 segundos)
docker compose up -d mongodb
docker compose ps  # Esperar status "healthy"
```

### Problema: RabbitMQ não aceita conexões

```bash
# Ver logs
docker compose logs rabbitmq

# Verificar healthcheck
docker compose ps rabbitmq

# Solução: Aguardar inicialização completa (20-30 segundos)
```

### Problema: Go Worker não processa mensagens

```bash
# Ver logs
docker compose logs go-weather-worker

# Verificar se a fila existe
# Acesse: http://localhost:15672
# Login: admin/admin123
# Vá em Queues → weather_data

# Solução: Garantir que Python Collector está rodando
docker compose restart python-weather-collector
```

### Problema: NestJS retorna erro 500

```bash
# Ver logs detalhados
docker compose logs nestjs-api

# Problemas comuns:
# - MongoDB não conectado (aguardar healthcheck)
# - Variável de ambiente faltando (verificar .env)
# - Together AI key inválida (opcional, sistema funciona sem)
```

### Problema: Frontend não carrega dados

```bash
# Verificar se API está respondendo
curl http://localhost:3000/api/weather/stats

# Verificar variável de ambiente
cat desafio_gdash/.env  # VITE_API_URL deve apontar para :3000

# Solução: Verificar CORS no NestJS (já configurado)
```

### Problema: Insights com IA retornam null

```bash
# Verificar API key do Together AI
docker compose exec nestjs-api printenv TOGETHER_API_KEY

# Ver logs
docker compose logs nestjs-api | grep Together

# Solução:
# 1. Adicionar TOGETHER_API_KEY no docker-compose.yml
# 2. Fazer rebuild: docker compose up -d --build nestjs-api
# 3. Sistema funciona sem IA (só não gera insights textuais)
```

### Problema: Dados não aparecem no Dashboard

```bash
# Verificar se Python está coletando
docker compose logs python-weather-collector | tail -20

# Verificar se há dados no MongoDB
docker compose exec mongodb mongosh \
  -u admin -p admin123 --authenticationDatabase admin \
  weather_dashboard --eval "db.weathers.countDocuments()"

# Solução: Aguardar primeira coleta (5 minutos) ou forçar restart
docker compose restart python-weather-collector
```

### Comandos Úteis para Debug

```bash
# Ver todos os logs
docker compose logs --tail=100

# Reiniciar serviço específico
docker compose restart nestjs-api

# Rebuild completo
docker compose down
docker compose up --build -d

# Limpar tudo e recomeçar
docker compose down -v  # ⚠️ Remove volumes (dados)
docker compose up --build -d
```

---

## 🚀 Deploy em Produção

### Railway (Recomendado)

Deploy completo com 6 serviços em 10 minutos:

```powershell
# 1. Preparar projeto
.\prepare-railway-deploy.ps1

# 2. Commit e push
git add .
git commit -m "Preparar deploy Railway"
git push origin main

# 3. Seguir guia rápido
```

📖 **Guias de Deploy:**
- 🚄 [RAILWAY_QUICK_START.md](./docs/RAILWAY_QUICK_START.md) - Deploy em 10 minutos
- 📋 [RAILWAY_DEPLOY.md](./docs/RAILWAY_DEPLOY.md) - Guia completo e detalhado
- ⚙️ [railway-config.json](./railway-config.json) - Configuração dos serviços

**Custos Railway:**
- ✅ $5/mês grátis (créditos)
- 📊 ~$15-25/mês após créditos (6 serviços)

### Outras Opções de Deploy

- **Vercel** - Frontend only (gratuito)
- **Heroku** - API + Workers ($7/mês por serviço)
- **AWS** - Completo com ECS/Fargate
- **DigitalOcean** - App Platform ou Droplets
- **Azure** - Container Apps

---

## 📚 Documentação Adicional

- 📘 [PROJECT_OVERVIEW.md](./docs/PROJECT_OVERVIEW.md) - Arquitetura detalhada
- 📗 [GEMINI_SETUP.md](./docs/GEMINI_SETUP.md) - Configuração Together AI
- 📙 [FRONTEND.md](./desafio_gdash/FRONTEND.md) - Guia do frontend
- 📕 [test-system.ps1](./test-system.ps1) - Script de teste automatizado
- 🚄 [RAILWAY_DEPLOY.md](./docs/RAILWAY_DEPLOY.md) - Deploy Railway (guia completo)
- ⚡ [RAILWAY_QUICK_START.md](./docs/RAILWAY_QUICK_START.md) - Quick start (10 min)
- ✅ [RAILWAY_CHECKLIST.md](./docs/RAILWAY_CHECKLIST.md) - Checklist passo a passo
- 🤝 [CONTRIBUTING.md](./docs/CONTRIBUTING.md) - Como contribuir
- 🎨 [PRETTIER_SETUP.md](./docs/PRETTIER_SETUP.md) - Setup de formatação

---

## 🛠️ Stack Tecnológica

### Backend

- **NestJS** 10.3.0 - Framework Node.js
- **TypeScript** 5.3.3
- **Mongoose** 8.0.3 - ODM para MongoDB
- **JWT** (@nestjs/jwt 10.2.0) - Autenticação
- **Passport** - Estratégias de autenticação
- **bcrypt** 5.1.1 - Hash de senhas
- **class-validator** - Validação de DTOs
- **Axios** 1.6.2 - HTTP client
- **@json2csv/plainjs** 7.0.6 - Export CSV
- **exceljs** 4.4.0 - Export XLSX

### Frontend

- **React** 19.2.0
- **Vite** 7.2.2 - Build tool
- **TypeScript**
- **React Router DOM** 6.x - Roteamento
- **Tailwind CSS** - Estilização
- **Recharts** 2.x - Gráficos
- **Lucide React** 0.554.0 - Ícones
- **date-fns** - Manipulação de datas
- **Axios** - Cliente HTTP

### Microserviços

- **Python** 3.10+ - Coletor de dados
- **Go** 1.21+ - Worker consumidor
- **RabbitMQ** 3-management - Message broker
- **MongoDB** 7 - Banco de dados NoSQL

### DevOps

- **Docker** 20.10+
- **Docker Compose** 2.0+

### APIs Externas

- **Open-Meteo API** - Dados climáticos gratuitos
- **PokéAPI** - Dados de Pokémon
- **Together AI** - Meta-Llama 3.1 8B (IA)

---

## 👥 Contribuição

Contribuições são muito bem-vindas! Por favor, leia o [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes sobre:

- 🎯 Código de conduta
- 📝 Processo de contribuição
- ✅ Padrões de código
- 🐛 Como reportar bugs
- 💡 Como sugerir melhorias

### Quick Start para Contribuir

```bash
# 1. Fork o projeto no GitHub

# 2. Clone seu fork
git clone https://github.com/RobertoSilvaDevFullStack/desafio_gdash
cd desafio_gdash

# 3. Crie uma branch
git checkout -b feature/minha-feature

# 4. Faça suas alterações e commit
git add .
git commit -m "feat: adiciona nova funcionalidade"

# 5. Push e abra um Pull Request
git push origin feature/minha-feature
```

---

## 📄 Licença

Este projeto é licenciado sob a [Licença MIT](LICENSE) - veja o arquivo LICENSE para detalhes.

---

## 🙏 Agradecimentos

- [Open-Meteo](https://open-meteo.com/) - API climática gratuita
- [PokéAPI](https://pokeapi.co/) - API de Pokémon
- [Together AI](https://www.together.ai/) - Plataforma de IA

---

## 📞 Contato

Para dúvidas, sugestões ou reportar problemas, abra uma [issue no GitHub](https://github.com/RobertoSilvaDevFullStack/desafio_gdash).

---

**Desenvolvido com ❤️ como desafio técnico full-stack**

---

<div align="center">

**🌦️ Desenvolvido por Roberto Silva como desafio técnico full-stack**

[⬆ Voltar ao topo](#-weather-dashboard---full-stack-microservices)

</div>
