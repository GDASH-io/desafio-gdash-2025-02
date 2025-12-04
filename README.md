# GDASH - Weather Analytics Dashboard

Sistema completo de coleta, processamento e visualização de dados climáticos com insights gerados por IA (Gemini), desenvolvido como parte do desafio técnico GDASH 2025/02.

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Arquitetura](#arquitetura)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Configuração](#instalação-e-configuração)
- [Como Executar](#como-executar)
- [Acessando o Sistema](#acessando-o-sistema)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Troubleshooting](#troubleshooting)
- [Comandos Úteis](#comandos-úteis)
- [Licença](#licença)

---

## 🎯 Sobre o Projeto

O GDASH é uma plataforma completa de analytics meteorológico que:

- **Coleta** dados climáticos em tempo real via Open-Meteo API
- **Processa** dados através de um pipeline assíncrono
- **Armazena** informações no MongoDB
- **Gera** insights inteligentes usando IA (Google Gemini)
- **Visualiza** dados em um dashboard moderno e responsivo

### Identidade Visual

O projeto utiliza a paleta de cores oficial da GDASH:

- **Primary**: `#00947c` (Verde principal)
- **Secondary**: `#50e3c2` (Verde claro)
- **Accent**: `#097d77` (Verde escuro)
- **Dark**: `#18857f` (Verde profundo)
- **Light**: `#f4fdfb` (Verde muito claro)
- **Black**: `#000000`
- **Gray**: `#323232`

---

## 🏗️ Arquitetura

### Pipeline de Dados

```
┌─────────────┐      ┌──────────────┐      ┌─────────┐      ┌──────────┐      ┌──────────┐
│   Python    │─────▶│  RabbitMQ    │─────▶│   Go    │─────▶│  NestJS  │─────▶│  React   │
│  Collector  │      │    Queue     │      │ Worker  │      │   API    │      │ Frontend │
└─────────────┘      └──────────────┘      └─────────┘      └──────────┘      └──────────┘
      │                                                             │                 
      ▼                                                             ▼                 
┌─────────────┐                                              ┌──────────┐            
│ Open-Meteo  │                                              │ MongoDB  │            
│     API     │                                              │  Atlas   │            
└─────────────┘                                              └──────────┘            
                                                                   │
                                                                   ▼
                                                            ┌────────────┐
                                                            │   Gemini   │
                                                            │     AI     │
                                                            └────────────┘
```

### Componentes

1. **Python Collector**: Coleta dados climáticos a cada N minutos
2. **RabbitMQ**: Message broker para comunicação assíncrona
3. **Go Worker**: Consome mensagens e envia para API
4. **NestJS API**: Backend REST com Clean Architecture
5. **MongoDB**: Banco de dados NoSQL para armazenamento
6. **React Frontend**: Interface moderna com shadcn/ui
7. **Gemini AI**: Geração de insights inteligentes

---

## 🛠️ Tecnologias Utilizadas

### Backend

- **NestJS** 11.x (TypeScript)
- **MongoDB** 8.x com Mongoose
- **JWT** para autenticação
- **Google Gemini AI** para insights
- **ExcelJS** e **Papaparse** para exportação

### Worker & Collector

- **Go** 1.25 (Worker)
- **Python** 3.11 (Collector)
- **RabbitMQ** 4 (Message Broker)
- **Pika** (RabbitMQ client Python)
- **amqp091-go** (RabbitMQ client Go)

### Frontend

- **React** 19.x
- **Vite** 7.x
- **TypeScript** 5.x
- **Tailwind CSS** 4.x
- **shadcn/ui** (componentes)
- **Recharts** (gráficos)
- **React Query** (state management)
- **Zustand** (auth state)
- **Axios** (HTTP client)

### Infraestrutura

- **Docker** 20.10+
- **Docker Compose** 2.0+

---

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

### Obrigatórios

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (versão 20.10 ou superior)
- [Docker Compose](https://docs.docker.com/compose/install/) (versão 2.0 ou superior)
- [Git](https://git-scm.com/downloads)

### Opcional (para desenvolvimento local)

- [Node.js](https://nodejs.org/) 24.x
- [Python](https://www.python.org/) 3.11+
- [Go](https://go.dev/) 1.25+

### Verificar Instalação

```bash
# Windows PowerShell
docker --version
docker-compose --version
git --version

# Linux/macOS
docker --version
docker compose version
git --version
```

---

## 📦 Instalação e Configuração

### 1. Clonar o Repositório

```bash
# Clone o repositório
git clone https://github.com/luisvictorbelo/desafio-gdash-2025-02
cd desafio-gdash-2025-02
```

### 2. Configurar Variáveis de Ambiente

```bash
# Windows PowerShell
Copy-Item .env.example .env
notepad .env

# Linux/macOS
cp .env.example .env
nano .env
```

### 3. Configurar Localização

Edite o arquivo `.env` e atualize com as coordenadas da sua cidade:

```env
# Obtenha as coordenadas em: https://www.latlong.net/

# Exemplo: São Luís, Maranhão
LOCATION_LAT=-2.5307
LOCATION_LON=-44.3068
LOCATION_CITY=São Luís

# Exemplo: São Paulo
# LOCATION_LAT=-23.5505
# LOCATION_LON=-46.6333
# LOCATION_CITY=São Paulo
```

### 4. Obter API Key do Gemini (Opcional mas Recomendado)

Para habilitar insights de IA:

1. Acesse: [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em **"Create API Key"**
4. Copie a chave gerada
5. Cole no `.env`:

```env
GEMINI_API_KEY=sua-chave-aqui
AI_ENABLED=true
```

**Sem API Key?** O sistema funcionará com insights estáticos (fallback).

### 5. Configurações Avançadas (Opcional)

```env
# Intervalo de coleta (em minutos)
COLLECTION_INTERVAL_MINUTES=5

# Credenciais do usuário padrão
DEFAULT_USER_EMAIL=admin@gdash.com
DEFAULT_USER_PASSWORD=Admin123456

# Segurança JWT (MUDE EM PRODUÇÃO!)
JWT_SECRET=sua-chave-secreta-aqui
```

---

## 🚀 Como Executar

### Passo 1: Buildar e Iniciar os Serviços

```bash
# Windows PowerShell
docker-compose up --build -d

# Linux/macOS
docker compose up --build -d
```

Este comando irá:
- Baixar todas as imagens Docker necessárias
- Buildar os containers (Python, Go, NestJS, React)
- Iniciar MongoDB e RabbitMQ
- Subir todos os serviços em background

**Tempo estimado**: 5-10 minutos (primeira execução)

### Passo 2: Verificar Status dos Containers

```bash
# Windows PowerShell
docker-compose ps

# Linux/macOS
docker compose ps
```

**Status esperado:**
```
NAME              STATUS
gdash-api         Up (healthy)
gdash-collector   Up
gdash-mongodb     Up (healthy)
gdash-rabbitmq    Up (healthy)
gdash-web         Up
gdash-worker      Up
```

### Passo 3: Criar Usuário Padrão

```bash
# Windows PowerShell
docker-compose exec api npm run seed

# Linux/macOS
docker compose exec api npm run seed
```

**Saída esperada:**
```
🌱 Starting database seed...
✅ Default user created successfully!
📧 Email: admin@gdash.com
🔑 Password: Admin123456
```

### Passo 4: Verificar Logs (Opcional)

```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f api
docker-compose logs -f collector
docker-compose logs -f worker
docker-compose logs -f web
```

Pressione `Ctrl + C` para sair dos logs.

---

## 🌐 Acessando o Sistema

### URLs Principais

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | http://localhost:5173 | Dashboard principal |
| **API** | http://localhost:3000 | Backend REST |
| **Swagger** | http://localhost:3000/api/docs | Documentação da API |
| **RabbitMQ UI** | http://localhost:15672 | Gerenciamento de filas |
| **MongoDB** | mongodb://localhost:27017 | Banco de dados |

### Credenciais de Acesso

#### Dashboard (Frontend)
```
Email: admin@gdash.com
Senha: Admin123456
```

#### RabbitMQ Management
```
Username: admin
Password: admin123
```

#### MongoDB
```
Username: admin
Password: admin123
Database: gdash
```

---

## 📁 Estrutura do Projeto

```
gdash-challenge/
├── services/
│   ├── collector/              # Python - Coleta de dados
│   │   ├── src/
│   │   │   ├── adapters/       # Weather API, Queue Publisher
│   │   │   ├── domain/         # Models (Pydantic)
│   │   │   ├── config/         # Settings
│   │   │   └── main.py         # Entry point
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   │
│   ├── worker/                 # Go - Consumidor de fila
│   │   ├── cmd/
│   │   │   └── main.go
│   │   ├── internal/
│   │   │   ├── adapters/       # Queue, HTTP Client
│   │   │   ├── domain/         # Weather models
│   │   │   ├── usecases/       # Business logic
│   │   │   └── config/         # Configuration
│   │   ├── Dockerfile
│   │   └── go.mod
│   │
│   ├── api/                    # NestJS - Backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/       # Autenticação JWT
│   │   │   │   ├── users/      # CRUD de usuários
│   │   │   │   └── weather/    # Logs climáticos
│   │   │   ├── common/         # Guards, DTOs
│   │   │   ├── config/         # Database, JWT, AI
│   │   │   └── main.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── web/                    # React - Frontend
│       ├── src/
│       │   ├── features/
│       │   │   ├── auth/       # Login, Auth Store
│       │   │   └── weather/    # Dashboard, Charts
│       │   ├── shared/
│       │   │   └── components/ # shadcn/ui
│       │   ├── lib/            # API Client, React Query
│       │   └── App.tsx
│       ├── Dockerfile
│       └── package.json
│
├── docker-compose.yml
├── .env.example
├── .env
└── README.md
```

---

## ✨ Funcionalidades

### 1. Dashboard de Clima

- **Cards de Dados em Tempo Real**: Temperatura, Umidade, Vento, Nuvens
- **Gráficos Interativos**: Recharts com temperatura e umidade ao longo do tempo
- **Localização**: Exibe cidade e última atualização

### 2. Insights de IA (Gemini)

- **Resumo Geral**: Análise do clima em linguagem natural
- **Tendências**: Padrões observados (temperatura, umidade, vento)
- **Alertas**: Avisos sobre condições adversas
- **Índice de Conforto**: Score de 0-100
- **Recomendações**: Sugestões práticas baseadas no clima

### 3. Exportação de Dados

- **CSV**: Formato universal
- **Excel (XLSX)**: Com formatação e cores

### 4. Autenticação

- **JWT Token**: Segurança baseada em tokens
- **Protected Routes**: Rotas protegidas no frontend
- **CRUD de Usuários**: Gerenciamento completo

### 5. API REST

- **Swagger Documentation**: Documentação interativa
- **Paginação**: Listagem eficiente de dados
- **Filtros**: Por cidade, data, período
- **Rate Limiting**: Proteção contra abuso

---

## 🔧 Troubleshooting

### Problema: Containers não sobem

```bash
# Limpar tudo e recomeçar
docker-compose down -v
docker-compose up --build
```

### Problema: "Port already in use"

```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <numero> /F

# Linux/macOS
lsof -ti:5173 | xargs kill -9
```

### Problema: Frontend fica em branco

1. Abra o console do browser (F12)
2. Verifique erros no console
3. Limpe o cache (Ctrl + Shift + R)
4. Verifique se a API está respondendo:

```bash
curl http://localhost:3000/health
```

### Problema: Insights não aparecem

**Sem API Key do Gemini:**
- O sistema usará insights estáticos (fallback)
- Configure `GEMINI_API_KEY` no `.env`

**Com API Key:**
- Verifique se `AI_ENABLED=true` no `.env`
- Veja logs da API: `docker-compose logs api`

### Problema: Nenhum dado climático

1. Verifique se o collector está rodando:
```bash
docker-compose logs collector
```

2. Verifique se há mensagens no RabbitMQ:
- Acesse: http://localhost:15672
- Vá em **Queues** → `weather_data`

3. Verifique se o worker está consumindo:
```bash
docker-compose logs worker
```

### Problema: Erro de autenticação

1. Certifique-se de que executou o seed:
```bash
docker-compose exec api npm run seed
```

2. Use as credenciais padrão:
- Email: `admin@gdash.com`
- Senha: `Admin123456`

---

## 📝 Comandos Úteis

### Docker Compose

```bash
# Iniciar todos os serviços
docker-compose up -d

# Parar todos os serviços
docker-compose stop

# Remover containers (mantém volumes)
docker-compose down

# Remover tudo (incluindo volumes/dados)
docker-compose down -v

# Rebuildar um serviço específico
docker-compose build api
docker-compose up -d api

# Reiniciar um serviço
docker-compose restart collector

# Ver logs em tempo real
docker-compose logs -f api

# Ver últimas 100 linhas
docker-compose logs --tail=100 worker

# Executar comando dentro do container
docker-compose exec api npm run seed
docker-compose exec api npm run lint
```

### MongoDB

```bash
# Conectar no MongoDB
docker exec -it gdash-mongodb mongosh -u admin -p admin123

# Comandos dentro do mongosh:
use gdash
show collections
db.weather_logs.find().limit(5)
db.weather_logs.countDocuments()
db.users.find()
exit
```

### RabbitMQ

```bash
# Ver status das filas
curl -u admin:admin123 http://localhost:15672/api/queues
```

### Desenvolvimento

```bash
# Instalar dependências localmente (opcional)
cd services/api
npm install

cd ../web
npm install

cd ../collector
pip install -r requirements.txt

cd ../worker
go mod download
```

---

## 📄 Licença

Este projeto foi desenvolvido como parte do desafio técnico GDASH 2025/02.

---

## 👥 Autor

**Seu Nome**
- GitHub: [@seu-usuario](https://github.com/luisvictorbelo)
- LinkedIn: [Seu Nome](https://linkedin.com/in/seu-perfil)

---