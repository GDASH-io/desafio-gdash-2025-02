# 🌦️ GDASH Weather Dashboard - Sistema de Monitoramento Climático

Sistema full-stack completo para coleta, processamento e visualização de dados climáticos com insights de IA.


Link do vídeo: https://youtu.be/JysjN2o8kP8

## 📋 Sobre o Projeto

Este projeto foi desenvolvido como parte do desafio técnico para o processo seletivo GDASH 2025/02. O sistema implementa um pipeline completo de dados climáticos utilizando múltiplas tecnologias e linguagens de programação.

### 🏗️ Arquitetura do Sistema

```
Python Collector → RabbitMQ → Go Worker → NestJS API → React Frontend
                                      ↓
                                   MongoDB
```

## 🚀 Tecnologias Utilizadas

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: NestJS + TypeScript + MongoDB + JWT Auth
- **Message Broker**: RabbitMQ
- **Data Collector**: Python + OpenWeatherMap API
- **Queue Worker**: Go
- **Containerização**: Docker + Docker Compose
- **APIs Externas**: OpenWeatherMap, PokéAPI (opcional)

## ⚡ Início Rápido

### Pré-requisitos

- Docker e Docker Compose instalados
- Chave da API OpenWeatherMap ([obter aqui](https://openweathermap.org/api))

### 1️⃣ Configuração

1. **Clone o repositório**
```bash
git clone [url-do-repositório]
cd "Desafio para o processo seletivo GDASH 202502"
```

2. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

3. **Edite o arquivo `.env`** com suas configurações:
```env
# Substitua pela sua chave da OpenWeatherMap API
OPENWEATHER_API_KEY=sua-chave-api-aqui

# Personalize sua cidade (opcional)
CITY={Insira nome do local}
COUNTRY_CODE={insira nome do pais}
```

### 2️⃣ Execução

**Execute todo o sistema com Docker Compose:**
```bash
docker-compose up --build
```

### 3️⃣ Acesso ao Sistema

Após alguns minutos, os serviços estarão disponíveis:

- **🌐 Frontend (Dashboard)**: http://localhost:5173
- **🔧 API Backend**: http://localhost:3000
- **📚 Documentação API (Swagger)**: http://localhost:3000/api/docs
- **🐰 RabbitMQ Management**: http://localhost:15672
- **📊 MongoDB**: localhost:27017

### 4️⃣ Login no Sistema

**Usuário padrão:**
- **Email**: `admin@gdash.com`
- **Senha**: `admin123`

## 📊 Funcionalidades

### 🌡️ Dashboard Climático
- **Dados em tempo real** da sua cidade
- **Insights de IA** baseados nos dados coletados
- **Gráficos e estatísticas** das condições climáticas
- **Score de conforto** calculado automaticamente
- **Alertas inteligentes** (temperaturas extremas, umidade, vento)

### 👥 Gerenciamento de Usuários
- **CRUD completo** de usuários
- **Autenticação JWT** segura
- **Controle de acesso** às funcionalidades

### 📈 Exportação de Dados
- **Download em CSV** de todos os dados climáticos
- **Download em XLSX** para análise avançada

### 🔍 Integração PokéAPI (Opcional)
- **Exploração de Pokémons** com paginação
- **Detalhes completos** de cada Pokémon

## 🛠️ Estrutura do Projeto

```
📦 projeto-gdash-weather/
├── 🔧 api/                      # Backend NestJS + TypeScript
│   ├── src/
│   │   ├── auth/               # Autenticação JWT
│   │   ├── users/              # CRUD de usuários
│   │   ├── weather/            # Dados climáticos e IA
│   │   └── main.ts            # Entry point
│   ├── Dockerfile
│   └── package.json
│
├── 🌐 web/                      # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/         # Componentes shadcn/ui
│   │   ├── pages/              # Dashboard, Login, etc.
│   │   ├── contexts/           # Context API (Auth)
│   │   └── services/           # API calls
│   ├── Dockerfile
│   └── package.json
│
├── 🐍 weather-collector/        # Serviço Python
│   ├── main.py                 # Coletador principal
│   ├── weather_api.py          # Cliente OpenWeatherMap
│   ├── message_queue.py        # Cliente RabbitMQ
│   ├── Dockerfile
│   └── requirements.txt
│
├── 🔄 weather-worker/           # Worker Go
│   ├── main.go                 # Processador da fila
│   ├── Dockerfile
│   └── go.mod
│
├── 🐳 docker-compose.yml        # Orquestração completa
├── 📄 .env.example              # Configurações
└── 📖 README.md                 # Este arquivo
```

## 🔧 Desenvolvimento Local (Sem Docker)

### Backend (NestJS)
```bash
cd api
npm install
npm run start:dev
# Roda em: http://localhost:3000
```

### Frontend (React)
```bash
cd web
npm install
npm run dev
# Roda em: http://localhost:5173
```

### Python Collector
```bash
cd weather-collector
pip install -r requirements.txt
python main.py
```

### Go Worker
```bash
cd weather-worker
go mod download
go run main.go
```

## 📊 Monitoramento e Logs

### Logs dos Serviços
```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Logs específicos
docker-compose logs -f api
docker-compose logs -f weather-collector
docker-compose logs -f weather-worker
```

### RabbitMQ Management
- **URL**: http://localhost:15672
- **Usuário**: admin
- **Senha**: password123

### MongoDB (Compass/CLI)
```bash
# Connection string
mongodb://admin:password123@localhost:27017/gdash_weather?authSource=admin
```

## 🔍 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login do usuário

### Usuários
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário
- `GET /api/users/:id` - Buscar usuário
- `PATCH /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Remover usuário

### Dados Climáticos
- `POST /api/weather/logs` - Criar registro (usado pelo worker Go)
- `GET /api/weather/logs` - Listar registros
- `GET /api/weather/recent` - Dados recentes
- `GET /api/weather/statistics` - Estatísticas
- `GET /api/weather/insights` - Insights de IA
- `GET /api/weather/export/csv` - Exportar CSV
- `GET /api/weather/export/xlsx` - Exportar Excel

