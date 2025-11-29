# 🌤️ GDASH Weather Dashboard - Challenge 2025/02

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

**Sistema completo de monitoramento climático com pipeline de dados em tempo real, análise inteligente com IA e dashboard interativo.**

[🚀 Início Rápido](#-início-rápido) •
[📊 Funcionalidades](#-funcionalidades) •
[🏗️ Arquitetura](#️-arquitetura) •
[📹 Vídeo Demo](#-vídeo-demonstrativo)

</div>

---

## 📹 Vídeo Demonstrativo

> **Link do vídeo:** [YouTube - GDASH Challenge 2025](INSERIR_LINK_DO_VIDEO_AQUI)
> 
> ⚠️ **Substitua o link acima pelo seu vídeo do YouTube (não listado)**

---

## 🎯 Sobre o Projeto

Este projeto foi desenvolvido para o **processo seletivo GDASH 2025/02**. Trata-se de uma aplicação full-stack moderna que:

- 🌡️ **Coleta dados climáticos** em tempo real via Open-Meteo API
- 📨 **Processa via fila de mensagens** (RabbitMQ) com worker em Go
- 💾 **Persiste no MongoDB** através de API NestJS
- 📊 **Exibe em dashboard interativo** com React + Tailwind
- 🤖 **Gera insights com IA** (análise local avançada + OpenAI opcional)
- 🔐 **Autenticação JWT** com CRUD de usuários

---

## 🚀 Início Rápido

### Pré-requisitos

- **Docker Desktop** instalado e rodando
- **Git** para clonar o repositório

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/gdash-challenge-2025.git
cd gdash-challenge-2025
```

### 2. Configure as variáveis de ambiente

```bash
# Windows (PowerShell)
Copy-Item env.example .env

# Linux/Mac
cp env.example .env
```

> ⚠️ **Importante:** Edite o arquivo `.env` e configure `API_BASE_URL=http://api:3000/api`

### 3. Suba todos os serviços

```bash
docker-compose up --build
```

### 4. Acesse a aplicação

| Serviço | URL | Descrição |
|---------|-----|-----------|
| 🌐 **Frontend** | http://localhost:5173 | Dashboard principal |
| 🔌 **API** | http://localhost:3000/api | Endpoints REST |
| 🐰 **RabbitMQ** | http://localhost:15672 | Gerenciamento de filas |
| 🍃 **Mongo Express** | http://localhost:8081 | Visualizar banco de dados |

### 5. Faça login

```
📧 Email: admin@example.com
🔑 Senha: 123456
```

---

## 📊 Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| 🌡️ **Coleta de Dados** | Python coleta dados da Open-Meteo a cada 30 minutos |
| 📨 **Fila de Mensagens** | RabbitMQ + Worker Go para processamento assíncrono |
| 💾 **API REST** | NestJS com MongoDB, validação e tratamento de erros |
| 🔐 **Autenticação** | JWT com roles (admin/user) e Guards |
| 👥 **CRUD Usuários** | Criar, listar, editar e excluir usuários |
| 📈 **Dashboard** | Gráficos interativos com Recharts |
| 🤖 **IA/Insights** | Pontuação de conforto, tendências, alertas, recomendações |
| 📥 **Exportação** | Download de dados em CSV e XLSX |
| 🐳 **Docker** | Todos os serviços orquestrados via Docker Compose |

### 🤖 Sistema de IA

O sistema de análise climática inclui:

- **📊 Pontuação de Conforto (0-100)** - Algoritmo que considera temperatura, umidade e vento
- **🌡️ Sensação Térmica** - Heat Index e Wind Chill calculados
- **📈 Detecção de Tendências** - Regressão linear para identificar se temperatura está subindo/caindo
- **🏷️ Classificação do Dia** - Ensolarado, Nublado, Chuvoso, Ventoso, etc.
- **⚠️ Alertas Inteligentes** - Calor extremo, frio intenso, ventos fortes, alta umidade
- **💡 Recomendações** - Dicas personalizadas de vestuário, hidratação e atividades
- **☀️ Índice UV Estimado** - Baseado no horário e condições

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GDASH Weather Dashboard                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌─────────────┐
│   Python    │─────▶│   RabbitMQ   │─────▶│     Go      │─────▶│   NestJS    │
│  Collector  │      │   (Broker)   │      │   Worker    │      │     API     │
│             │      │              │      │             │      │             │
│ • Open-Meteo│      │ • Fila:      │      │ • Consume   │      │ • REST API  │
│ • Schedule  │      │   weather_   │      │ • Valida    │      │ • JWT Auth  │
│ • Publish   │      │   logs       │      │ • HTTP POST │      │ • MongoDB   │
└─────────────┘      └──────────────┘      └─────────────┘      └──────┬──────┘
                                                                        │
                     ┌──────────────────────────────────────────────────┘
                     │
                     ▼
              ┌─────────────┐              ┌─────────────┐
              │   MongoDB   │◀────────────▶│   React     │
              │             │              │  Frontend   │
              │ • weather_  │              │             │
              │   logs      │              │ • Dashboard │
              │ • users     │              │ • Gráficos  │
              └─────────────┘              │ • IA        │
                                           └─────────────┘
```

### Pipeline de Dados

1. **Collector (Python)** → Busca dados da Open-Meteo API a cada 30 min
2. **RabbitMQ** → Recebe e armazena mensagens na fila `weather_logs`
3. **Worker (Go)** → Consome mensagens, valida e envia para API
4. **API (NestJS)** → Persiste no MongoDB e gera insights de IA
5. **Frontend (React)** → Exibe dashboard com gráficos e análises

---

## 📁 Estrutura do Projeto

```
gdash-challenge-2025/
├── 📂 apps/
│   ├── 📂 api/                 # Backend NestJS
│   │   ├── src/
│   │   │   ├── auth/           # Autenticação JWT
│   │   │   ├── users/          # CRUD de usuários
│   │   │   └── weather/        # Dados climáticos + IA
│   │   └── Dockerfile
│   │
│   └── 📂 web/                 # Frontend React
│       ├── src/
│       │   ├── pages/          # Dashboard, Login, Users
│       │   ├── components/     # Componentes reutilizáveis
│       │   └── lib/            # API client, auth
│       └── Dockerfile
│
├── 📂 services/
│   ├── 📂 collector/           # Coletor Python
│   │   ├── src/
│   │   │   └── scheduler.py    # Agendador + coleta
│   │   └── Dockerfile
│   │
│   └── 📂 worker/              # Worker Go
│       ├── main.go             # Consumidor RabbitMQ
│       └── Dockerfile
│
├── 🐳 docker-compose.yml       # Orquestração
├── 📄 env.example              # Variáveis de ambiente
└── 📖 README.md                # Este arquivo
```

---

## 🛠️ Tecnologias Utilizadas

### Backend (NestJS)
- **NestJS** - Framework Node.js enterprise
- **MongoDB + Mongoose** - Banco de dados NoSQL
- **JWT + Passport** - Autenticação segura
- **bcrypt** - Hash de senhas
- **ExcelJS** - Geração de XLSX
- **csv-stringify** - Geração de CSV
- **OpenAI SDK** - Integração com GPT (opcional)

### Frontend (React)
- **React 18** - Biblioteca UI
- **Vite** - Build tool rápido
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utility-first
- **Recharts** - Gráficos interativos
- **React Router** - Roteamento SPA
- **Axios** - Cliente HTTP

### Serviços
- **Python 3.11** - Collector com httpx + pika
- **Go 1.22** - Worker com amqp091-go
- **RabbitMQ** - Message broker
- **MongoDB** - Banco de dados

### Infraestrutura
- **Docker** - Containerização
- **Docker Compose** - Orquestração multi-container

---

## 🔌 Endpoints da API

### 🔐 Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login (retorna JWT) |

### 👥 Usuários (requer autenticação)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/users` | Listar todos (admin) |
| GET | `/api/users/me` | Usuário atual |
| GET | `/api/users/:id` | Buscar por ID |
| POST | `/api/users` | Criar usuário (admin) |
| PATCH | `/api/users/:id` | Atualizar (admin) |
| DELETE | `/api/users/:id` | Excluir (admin) |

### 🌡️ Clima (requer autenticação)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/weather/logs` | Listar registros |
| GET | `/api/weather/insights` | Análise de IA |
| GET | `/api/weather/export.csv` | Exportar CSV |
| GET | `/api/weather/export.xlsx` | Exportar Excel |
| POST | `/api/weather/logs` | Criar registro (worker) |

---

## ⚙️ Variáveis de Ambiente

```env
# MongoDB
MONGO_URI=mongodb://mongo:27017/gdash

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672

# JWT
JWT_SECRET=sua-chave-secreta-aqui

# Usuário Admin Padrão
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=123456

# Collector (Python)
CITY_NAME=Penápolis
LATITUDE=-21.4178
LONGITUDE=-50.0769

# Worker (Go)
API_BASE_URL=http://api:3000/api

# OpenAI (opcional)
OPENAI_API_KEY=sk-xxxx
```

---

## 🧪 Desenvolvimento Local

### API (NestJS)
```bash
cd apps/api
npm install
npm run start:dev
```

### Frontend (React)
```bash
cd apps/web
npm install
npm run dev
```

### Collector (Python)
```bash
cd services/collector
pip install -r requirements.txt
python -m src
```

### Worker (Go)
```bash
cd services/worker
go mod download
go run main.go
```

---

## 🐛 Troubleshooting

### Erro 404 no Worker
- Verifique se `API_BASE_URL` no `.env` está com `/api` no final
- Exemplo correto: `API_BASE_URL=http://api:3000/api`

### MongoDB não conecta
- Verifique se Docker está rodando: `docker ps`
- Confirme a `MONGO_URI` no `.env`

### RabbitMQ não conecta
- Aguarde ~30 segundos após `docker-compose up`
- Acesse http://localhost:15672 (guest/guest)

### Frontend não carrega estilos
- Reconstrua a imagem: `docker-compose up -d --build web`

---

## 📋 Checklist do Desafio

- ✅ Python coleta dados de clima (Open-Meteo)
- ✅ Python envia dados para a fila RabbitMQ
- ✅ Worker Go consome a fila e envia para API
- ✅ API NestJS armazena logs no MongoDB
- ✅ API expõe endpoints para listar dados
- ✅ API gera/retorna insights de IA
- ✅ API exporta dados em CSV/XLSX
- ✅ API implementa CRUD de usuários + autenticação
- ✅ Frontend React + Vite + Tailwind
- ✅ Dashboard de clima com dados reais
- ✅ Exibição de insights de IA
- ✅ CRUD de usuários + login
- ✅ Docker Compose sobe todos os serviços
- ✅ Código em TypeScript (backend e frontend)
- ✅ README completo com instruções

---

## 🧠 Critérios de Avaliação

- **Funcionalidade completa:** pipeline Python → Message Broker → Go → NestJS → MongoDB → Frontend
- **Clareza de arquitetura:** organização de pastas, camadas e responsabilidades
- **Qualidade de código:** tipagem, legibilidade, padrões adotados
- **Integração entre serviços:** comunicação estável e bem tratada
- **Boas práticas:** validação, tratamento de erros, logs, eslint/prettier
- **UX:** experiência de uso do Dashboard e das telas
- **Criatividade:** na forma de mostrar dados e insights
- **Documentação:** README claro, com passos de execução e configuração
- **Uso correto do Docker Compose** para subir tudo

**Bônus (não obrigatório):**

- Logs detalhados por serviço
- CI (lint/test) configurado
- Dashboard com filtros, múltiplos tipos de gráfico
- Deploy em ambiente gratuito (Railway, Render, etc.)
- Testes automatizados (unitários e/ou e2e)

---

## ⚠️ Regras

- Respeitar termos de uso das APIs utilizadas (Open-Meteo/OpenWeather, PokéAPI, SWAPI, etc.)
- Não coletar ou armazenar dados pessoais sensíveis
- Usar intervalos razoáveis para chamadas às APIs externas
- Focar em **integração, clareza e coesão**, não apenas em adicionar complexidade
- Você é livre para:
  - Renomear endpoints
  - Alterar nomes de coleções
  - Mudar estruturas de diretórios
  - Escolher bibliotecas auxiliares — desde que a proposta do desafio seja atendida

---

## 📹 Vídeo Obrigatório

Grave um vídeo de **até 5 minutos** explicando:

- Arquitetura geral da aplicação
- Pipeline de dados (Python → Message Broker → Go → NestJS → Frontend)
- Como os insights de IA são gerados e exibidos
- Principais decisões técnicas
- Demonstração rápida da aplicação rodando via Docker Compose

O vídeo deve ser enviado via:

- **YouTube (não listado)**

Inclua o link no README e/ou na descrição do Pull Request.

---

## 🧪 Entrega

A entrega deve ser feita via **Pull Request**, em uma **branch com o seu nome completo**, por exemplo:

- `joao-silva`
- `maria-fernanda-souza`

O Pull Request deve conter:

- Código do **backend (NestJS)**
- Código do **frontend (Vite)**
- Código **Python** (coleta de clima)
- Código **Go** (worker da fila)
- `docker-compose.yml` com todos os serviços (API, frontend, banco, Message Broker, etc.)
- Arquivo `.env.example` com todas as variáveis necessárias
- Link do vídeo explicativo (YouTube não listado)
- README com:
  - Como rodar tudo via Docker Compose
  - Como rodar o serviço Python
  - Como rodar o worker Go
  - URLs principais (API, frontend, Swagger, etc.)
  - Usuário padrão (login/senha) para acesso inicial

---

**João Pedro**

Desenvolvido para o processo seletivo **GDASH 2025/02**
