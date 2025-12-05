# Weather Dashboard - Desafio GDASH 2025/02

Sistema full-stack de monitoramento climático com insights de IA, desenvolvido com React, NestJS, Python, Go e RabbitMQ.

## Link do Video explicativo

[![Assista](https://i.ytimg.com/vi/uzY5uKRCbtE/hqdefault.jpg?sqp=-oaymwFBCPYBEIoBSFryq4qpAzMIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB8AEB-AH-CYAC0AWKAgwIABABGH8gPCg0MA8=&rs=AOn4CLBhLFpxe2Kyf4JNvSaUkEHTwJ9oug)](https://youtu.be/uzY5uKRCbtE?si=hCLWJavsP-Pteu4W)

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Arquitetura](#arquitetura)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Como Executar](#como-executar)
- [Acessos e Credenciais](#acessos-e-credenciais)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Variáveis de Ambiente](#variáveis-de-ambiente)

---

## Sobre o Projeto

Aplicação completa de monitoramento meteorológico que:
- Coleta dados climáticos em tempo real de Teresina/PI via Open-Meteo API
- Processa dados através de message broker (RabbitMQ)
- Armazena histórico no MongoDB
- Gera insights inteligentes usando Google Gemini AI
- Exibe dashboard interativo com gráficos e estatísticas
- Permite exportação de dados em CSV/XLSX
- Integra com PokéAPI para demonstração de consumo de APIs públicas

---

## Arquitetura

```
┌─────────────┐      ┌──────────────┐      ┌─────────┐      ┌─────────────┐
│   Python    │─────>│   RabbitMQ   │─────>│   Go    │─────>│   NestJS    │
│  Collector  │      │ Message Queue│      │  Worker │      │     API     │
└─────────────┘      └──────────────┘      └─────────┘      └──────┬──────┘
      │                                                              │
      │                                                              │
      └──> Open-Meteo API                                    MongoDB │
                                                                     │
                                                              ┌──────▼──────┐
                                                              │   React     │
                                                              │  Frontend   │
                                                              └─────────────┘
```

**Fluxo de Dados:**
1. **Python Service**: Coleta dados meteorológicos a cada hora da Open-Meteo API
2. **RabbitMQ**: Enfileira mensagens para processamento assíncrono
3. **Go Worker**: Consome fila, valida dados e envia para API
4. **NestJS API**: Armazena no MongoDB e gera insights com IA
5. **React Frontend**: Exibe dashboard com visualizações e permite interações

---

## Tecnologias Utilizadas

### Frontend
- **React 18** + **Vite** - Framework e build tool
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **Recharts** - Gráficos interativos
- **TanStack Query** - Gerenciamento de estado assíncrono
- **Zustand** - Estado global
- **React Router** - Navegação

### Backend
- **NestJS** - Framework Node.js
- **MongoDB** + **Mongoose** - Banco de dados
- **Passport JWT** - Autenticação
- **Google Gemini AI** - Geração de insights
- **ExcelJS** + **fast-csv** - Exportação de dados
- **Swagger** - Documentação de API

### Microservices
- **Python 3.11** - Coleta de dados meteorológicos
- **Go 1.21** - Worker de processamento de fila
- **RabbitMQ** - Message broker

### DevOps
- **Docker** + **Docker Compose** - Containerização
- **Nginx** - Servidor web (frontend)

---

## Como Executar

### Pré-requisitos
- Docker e Docker Compose instalados
- Porta 3000, 5173, 5672, 15672 e 27017 disponíveis

### Execução com Docker Compose (Recomendado)

1. **Clone o repositório:**
```bash
git clone https://github.com/jp066/desafio-gdash-2025-02.git
cd desafio-gdash-2025-02
```

2. **Configure as variáveis de ambiente:**
```bash
# Copie os arquivos de exemplo
cp .env.example .env
cp services/api-nestjs/.env.example services/api-nestjs/.env
cp services/python-service/.env.example services/python-service/.env
cp frontend/.env.example frontend/.env
```

3. **Inicie todos os serviços:**
```bash
docker-compose up -d --build
```

4. **Aguarde a inicialização** (pode levar alguns minutos na primeira vez)

5. **Acesse a aplicação** em: http://localhost:5173

### Execução Individual dos Serviços

#### Backend (NestJS)
```bash
cd services/api-nestjs
npm install
npm run start:dev
```

#### Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

#### Python Service
```bash
cd services/python-service
python -m venv .venv
.venv\Scripts\activate  # Windows
# ou: source .venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python -m src.main
```

#### Go Worker
```bash
cd services/go-worker
go mod download
go run cmd/main.go
```

---

## Acessos e Credenciais

### Aplicação Web
- **Pessoal**: Crie sua conta via tela de cadastro
- **URL:** http://localhost:5173
- **Usuário padrão:**
  - Email: `admin@weather.com`
  - Senha: `senha123`

### APIs e Ferramentas

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | - |
| API NestJS | http://localhost:3000 | - |
| Swagger (Docs) | http://localhost:3000/api | - |
| RabbitMQ Management | http://localhost:15672 | admin / admin |
| MongoDB | localhost:27017 | - |

---

## Estrutura do Projeto

```
desafio-gdash-2025-02/
├── frontend/                 # Aplicação React
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── hooks/           # Custom hooks
│   │   ├── stores/          # Estado global (Zustand)
│   │   └── core/            # API client
│   └── Dockerfile
├── services/
│   ├── api-nestjs/          # Backend NestJS
│   │   ├── src/
│   │   │   ├── auth/        # Autenticação JWT
│   │   │   ├── users/       # CRUD de usuários
│   │   │   ├── weather/     # Endpoints climáticos
│   │   │   ├── insights-ia/ # Geração de insights IA
│   │   │   ├── exports/     # CSV/XLSX export
│   │   │   └── schema/      # Schemas MongoDB
│   │   └── Dockerfile
│   ├── python-service/      # Coletor de dados
│   │   ├── src/
│   │   │   ├── weather.py   # Integração Open-Meteo
│   │   │   └── queue_sender.py # Publisher RabbitMQ
│   │   └── Dockerfile
│   └── go-worker/           # Worker de processamento
│       ├── cmd/             # Main application
│       ├── internal/        # Lógica de negócio
│       └── Dockerfile
└── docker-compose.yml       # Orquestração de containers
```

---

## Funcionalidades

### Dashboard Climático
- Cards com dados em tempo real (temperatura, umidade, vento, condição)
- Gráficos de temperatura e probabilidade de chuva ao longo do tempo
- Tabela com histórico de registros meteorológicos
- Insights de IA com análise técnica e índice de conforto climático
- Exportação de dados em CSV e Excel

### Gestão de Usuários
- Autenticação JWT com refresh token
- CRUD completo de usuários
- Rotas protegidas
- Cadastro de novos usuários

### Exploração (Opcional)
- Integração com PokéAPI
- Paginação de resultados
- Detalhes de Pokémons

### Recursos Técnicos
- Tema claro/escuro
- Design responsivo
- Atualizações em tempo real
- Loading states e feedback visual
- Tratamento de erros
- Logs estruturados

---

## Variáveis de Ambiente

### Backend (services/api-nestjs/.env)
```env
MONGO_URI=mongodb://mongo:27017/gdash
GEMINI_API_KEY=sua_chave_aqui
ACCESS_JWT_SECRET=sua_secret_key
REFRESH_JWT_SECRET=sua_refresh_secret_key
```

### Frontend (frontend/.env)
```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Weather Dashboard
```

### Python Service (services/python-service/.env)
```env
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=admin
```


---

## Endpoints da API

### Autenticação
- `POST /auth/login` - Login
- `GET /auth/me` - Usuário autenticado

### Usuários
- `GET /users` - Listar usuários
- `POST /users` - Criar usuário
- `PUT /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Deletar usuário

### Weather
- `GET /weather/logs` - Listar logs climáticos
- `GET /weather/logs/:id` - Buscar log climático
- `PUT /weather/logs/:id` - Atualizar log climático
- `DELETE /weather/logs/:id` - Deletar log climático
- `POST /weather/logs` - Criar log (usado pelo Go worker)
- `GET /weather/export-csv` - Exportar CSV
- `GET /weather/export-xlsx` - Exportar Excel
- `POST /weather/insights` - Gerar insights de IA

### Pokémon - Diretamente da PokéAPI no frontend


Documentação completa: http://localhost:3000/docs

---

## Testes

```bash
# Backend
cd services/api-nestjs
npm run test

# E2E
npm run test:e2e
```

---

## Monitoramento

- **Logs do Docker:** `docker-compose logs -f [service-name]`
- **RabbitMQ Queue:** Acesse http://localhost:15672 para monitorar filas

---


### Verificar saúde de todos os serviços

```bash
# Ver status de todos os containers
docker-compose ps

# Ver logs de um serviço específico
docker-compose logs -f api
docker-compose logs -f python-collector
docker-compose logs -f go-worker
docker-compose logs -f rabbitmq

# Recriar tudo do zero
docker-compose down -v
docker-compose up --build
```

---

## Contribuindo

Este é um projeto de desafio técnico. Para mais informações sobre o Desafio, consulte o README principal: https://github.com/gdash-io/desafio-gdash-2025-02
