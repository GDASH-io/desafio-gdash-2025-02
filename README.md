# 🌦️ Weathernator - Sistema de Monitoramento Climático

Sistema full-stack moderno para coleta, processamento e visualização de dados climáticos com insights de IA

## 🎥 Vídeo de apresentação

**YouTube:** https://youtu.be/9epUNUiPAqo

## 🏗️ Arquitetura

```
┌─────────────┐
│   Python    │  Coleta dados climáticos (Open-Meteo)
│  Collector  │  a cada 1 hora
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  RabbitMQ   │  Fila de mensagens
│  (Message   │
│   Broker)   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Go Worker  │  Consome fila e processa
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  NestJS API │  Armazena no MongoDB
│  + MongoDB  │  Gera insights de IA
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   React     │  Dashboard interativo
│  Frontend   │  Visualização de dados
└─────────────┘
```

## 🚀 Tecnologias

- **Frontend**: React 18 + Vite + Tailwind CSS + shadcn/ui + Recharts
- **Backend**: NestJS (TypeScript) + MongoDB + JWT Auth
- **Worker**: Go 1.21 + RabbitMQ (amqp091-go)
- **Collector**: Python 3.11 + Pika + Requests
- **Infra**: Docker Compose
- **APIs Externas**: Open-Meteo (dados climáticos)

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Git

## 🛠️ Instalação e Execução

1. Clone o repositório:

```bash
git clone <repo-url>
cd weathernator
```

2. Execute o Docker Compose:

```bash
docker-compose up --build
```

3. Acesse as aplicações:

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000
- **Swagger**: http://localhost:3000/api/docs
- **RabbitMQ Management**: http://localhost:15672 (admin/admin123)
- **MongoDB**: localhost:27017

## 🔐 Credenciais Padrão

- **Usuário padrão**: admin@example.com
- **Senha**: 123456

## 📁 Estrutura do Projeto

```
weathernator/
├── backend/          # API NestJS
├── frontend/         # React + Vite
├── weather-worker/           # Worker Go
├── collector/        # Coletor Python
└── docker-compose.yml
```

## 🔄 Fluxo de Dados

1. **Coletor Python**:

   - Busca dados climáticos da Open-Meteo API a cada hora (configurável)
   - Extrai temperatura, umidade, velocidade do vento, condição do céu, probabilidade de chuva
   - Envia dados normalizados em JSON para a fila RabbitMQ

2. **Worker Go**:

   - Consome mensagens da fila `weather_data`
   - Valida e processa os dados
   - Envia para a API NestJS via HTTP POST
   - Implementa retry e tratamento de erros

3. **API NestJS**:

   - Recebe dados do worker e armazena no MongoDB
   - Gera insights inteligentes baseados em dados históricos
   - Expõe endpoints REST para o frontend
   - Gerencia autenticação JWT e CRUD de usuários

4. **Frontend React**:
   - Dashboard interativo com gráficos e cards
   - Visualização de dados em tempo real
   - Exportação de dados (CSV/XLSX)
   - Gerenciamento de usuários

## 📚 Endpoints da API

### Autenticação

- `POST /api/auth/login` - Login (retorna JWT token)
  ```json
  {
    "email": "admin@example.com",
    "password": "123456"
  }
  ```

### Clima

- `POST /api/weather/logs` - Criar registro (usado pelo worker)
- `GET /api/weather/logs?limit=100&skip=0` - Listar registros climáticos (requer autenticação)
- `GET /api/weather/export.csv` - Exportar dados em CSV (requer autenticação)
- `GET /api/weather/export.xlsx` - Exportar dados em XLSX (requer autenticação)
- `GET /api/weather/insights` - Obter insights de IA (requer autenticação)
  ```json
  {
    "summary": "Análise climática...",
    "statistics": {
      "averageTemperature": 25.5,
      "averageHumidity": 65.2,
      "averageWindSpeed": 12.3,
      "totalRecords": 50
    },
    "trends": {
      "temperature": "subindo"
    },
    "comfort": {
      "score": 85,
      "classification": "muito agradável"
    },
    "alerts": ["Alta chance de chuva"],
    "latest": { ... }
  }
  ```

### Usuários (todos requerem autenticação)

- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Obter usuário por ID
- `POST /api/users` - Criar usuário
- `PATCH /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### PokéAPI

- `GET /pokemon` - Listar pokemons
- `GET /pokemon/:id` - Buscar pokemon por id
- `GET /pokemon/search` - Buscar pokemon pelo nome

## 🧪 Desenvolvimento

Para desenvolvimento local sem Docker:

### Backend

```bash
cd backend
npm install
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Worker

```bash
cd worker
go mod download
go run main.go
```

### Collector

```bash
cd collector
pip install -r requirements.txt
python main.py
```

## 📝 Variáveis de Ambiente

### Docker Compose

As variáveis estão configuradas no `docker-compose.yml`. Para desenvolvimento local, você pode criar arquivos `.env`:

### Collector (Python)

- `RABBITMQ_URL`: URL de conexão do RabbitMQ
- `LOCATION_LAT`: Latitude da localização
- `LOCATION_LON`: Longitude da localização
- `LOCATION_NAME`: Nome da localização
- `COLLECT_INTERVAL`: Intervalo de coleta em segundos (padrão: 3600)

### Worker (Go)

- `RABBITMQ_URL`: URL de conexão do RabbitMQ
- `API_URL`: URL da API NestJS

### Backend (NestJS)

- `MONGODB_URI`: URI de conexão do MongoDB
- `JWT_SECRET`: Chave secreta para JWT
- `PORT`: Porta da API (padrão: 3000)

### Frontend (React)

- `VITE_API_URL`: URL da API NestJS

## 🎯 Funcionalidades

### Dashboard Climático

- ✅ Visualização de dados em tempo real
- ✅ Cards com métricas principais (temperatura, umidade, vento, condição)
- ✅ Gráficos interativos (temperatura, umidade e probabilidade de chuva ao longo do tempo)
- ✅ Tabela de registros recentes
- ✅ Exportação de dados (CSV/XLSX)

### Insights de IA

- ✅ Análise estatística dos dados históricos
- ✅ Detecção de tendências (temperatura subindo/descendo)
- ✅ Cálculo de conforto climático (0-100)
- ✅ Classificação do clima (muito agradável, agradável, moderado, etc.)
- ✅ Sistema de alertas (calor extremo, frio intenso, alta chance de chuva)
- ✅ Resumo textual inteligente

### Gerenciamento de Usuários

- ✅ CRUD completo de usuários
- ✅ Autenticação JWT
- ✅ Usuário padrão criado automaticamente
- ✅ Rotas protegidas

## 🐳 Docker Compose

O projeto utiliza Docker Compose para orquestrar todos os serviços:

```bash
# Subir todos os serviços
docker-compose up --build

# Subir em background
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Ver logs
docker-compose logs -f [service-name]

# Reconstruir um serviço específico
docker-compose up --build [service-name]
```

### Serviços Disponíveis

- `mongodb`: Banco de dados MongoDB
- `rabbitmq`: Message broker RabbitMQ
- `api`: API NestJS
- `worker`: Worker Go
- `collector`: Coletor Python
- `frontend`: Frontend React

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 🧠 Insights de IA - Como Funciona

O sistema gera insights inteligentes baseados nos dados históricos coletados:

1. **Estatísticas**: Calcula médias de temperatura, umidade e velocidade do vento
2. **Tendências**: Compara dados recentes com dados anteriores para detectar tendências
3. **Conforto Climático**: Pontuação de 0-100 baseada em:
   - Temperatura ideal (20-26°C)
   - Umidade ideal (40-60%)
   - Velocidade do vento adequada (5-15 km/h)
4. **Classificação**: Categoriza o clima como "muito agradável", "agradável", "moderado", etc.
5. **Alertas**: Detecta condições extremas e gera alertas automáticos
6. **Resumo Textual**: Gera um resumo descritivo das condições climáticas

## 🚨 Troubleshooting

### Problemas Comuns

**Erro de conexão com MongoDB:**

- Verifique se o MongoDB está rodando: `docker-compose ps`
- Verifique as credenciais no `docker-compose.yml`

**Erro de conexão com RabbitMQ:**

- Acesse o RabbitMQ Management: http://localhost:15672
- Verifique se a fila `weather_data` foi criada

**Frontend não carrega dados:**

- Verifique se a API está rodando: http://localhost:3000
- Verifique o console do navegador para erros
- Confirme que o token JWT está sendo enviado

**Coletor não está coletando dados:**

- Verifique os logs: `docker-compose logs collector`
- Confirme as coordenadas da localização
- Verifique a conexão com a Open-Meteo API

## 📊 Estrutura de Dados

### WeatherLog (MongoDB)

```typescript
{
  timestamp: string;
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  temperature?: number; // °C
  humidity?: number; // %
  windSpeed?: number; // km/h
  weatherCode?: number;
  condition: string;
  precipitationProbability?: number; // %
}
```

## 🔒 Segurança

- Senhas são hasheadas com bcrypt
- Autenticação JWT com expiração de 24h
- Rotas protegidas com guards
- Validação de dados com class-validator
- CORS configurado para desenvolvimento

## 📄 Licença

Este projeto é um desafio técnico desenvolvido para demonstrar habilidades em desenvolvimento full-stack.
