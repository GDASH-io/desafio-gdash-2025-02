# GDASH Weather Dashboard

Sistema full-stack de monitoramento climático com coleta automatizada de dados, processamento via fila de mensagens e insights gerados por IA.

## Arquitetura

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Python    │───▶│  RabbitMQ   │───▶│  Go Worker  │───▶│   NestJS    │
│  Collector  │    │   (Fila)    │    │  (Consumer) │    │    API      │
└─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
                                                                │
                                                                ▼
┌─────────────┐                                          ┌─────────────┐
│    React    │◀─────────────────────────────────────────│   MongoDB   │
│  Frontend   │                                          │  (Database) │
└─────────────┘                                          └─────────────┘
```

## Stack Tecnológica

| Serviço | Tecnologia |
|---------|------------|
| Frontend | React + Vite + Tailwind + shadcn/ui |
| Backend API | NestJS + TypeScript |
| Banco de Dados | MongoDB |
| Message Broker | RabbitMQ |
| Collector | Python |
| Worker | Go |
| Infra | Docker + Docker Compose |

## Funcionalidades

- **Dashboard de Clima**: Exibição de temperatura, umidade, vento e condição climática
- **Gráficos**: Visualização histórica de temperatura e probabilidade de chuva
- **Insights de IA**: Análise inteligente dos dados climáticos (tendências, alertas, conforto térmico)
- **CRUD de Usuários**: Gerenciamento completo com autenticação JWT
- **Exportação**: Download de dados em CSV e XLSX
- **API Pública**: Integração com PokéAPI (página Explorar)
- **Coleta Automatizada**: Pipeline Python → RabbitMQ → Go → NestJS → MongoDB

## Como Executar

### Pré-requisitos

- Docker e Docker Compose instalados
- Git

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd desafio-gdash-2025-02
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` conforme necessário (valores padrão já funcionam).

### 3. Subir todos os serviços

```bash
docker compose up -d
```

Aguarde alguns minutos para todos os serviços inicializarem.

### 4. Acessar a aplicação

| Serviço | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **API** | http://localhost:3333 |
| **Swagger (Documentação)** | http://localhost:3333/api/docs |
| **RabbitMQ Management** | http://localhost:15672 |

## Credenciais de Acesso

### Usuário Padrão (Admin)

```
Email: admin@example.com
Senha: 123456
```

### RabbitMQ

```
Usuário: guest
Senha: guest
```

## Executando Serviços Individualmente

### Python Collector

```bash
cd services/collector
pip install -r requirements.txt
python main.py
```

Variáveis de ambiente necessárias:
```env
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_QUEUE=weather_data
WEATHER_LATITUDE=-23.5505
WEATHER_LONGITUDE=-46.6333
WEATHER_LOCATION=São Paulo
COLLECTION_INTERVAL_MINUTES=60
```

### Go Worker

```bash
cd services/worker
go mod download
go run main.go
```

Variáveis de ambiente necessárias:
```env
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_QUEUE=weather_data
API_BASE_URL=http://localhost:3333
```

### API NestJS (desenvolvimento)

```bash
cd apps/api
pnpm install
pnpm run start:dev
```

### Frontend React (desenvolvimento)

```bash
cd apps/web
pnpm install
pnpm run dev
```

## Estrutura do Projeto

```
.
├── apps/
│   ├── api/                 # Backend NestJS
│   │   ├── src/
│   │   │   ├── auth/        # Autenticação JWT
│   │   │   ├── users/       # CRUD de usuários
│   │   │   ├── weather/     # Dados climáticos + insights
│   │   │   ├── insights/    # Geração de insights IA
│   │   │   └── pokemon/     # Integração PokéAPI
│   │   └── test/            # Testes E2E
│   │
│   └── web/                 # Frontend React
│       └── src/
│           ├── components/  # Componentes UI
│           ├── services/    # Chamadas API
│           ├── contexts/    # Context API (auth)
│           └── routes/      # Páginas
│
├── services/
│   ├── collector/           # Python - Coleta de dados
│   └── worker/              # Go - Processamento da fila
│
├── packages/
│   └── shared/              # Tipos compartilhados
│
└── docker-compose.yml       # Orquestração dos serviços
```

## Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/refresh` - Refresh token

### Usuários
- `GET /api/users` - Listar usuários (paginado)
- `GET /api/users/:id` - Buscar usuário
- `POST /api/users` - Criar usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Remover usuário

### Clima
- `GET /api/weather/logs` - Listar registros (paginado)
- `GET /api/weather/logs/latest` - Último registro
- `POST /api/weather/collect` - Coletar dados manualmente
- `GET /api/weather/export/csv` - Exportar CSV
- `GET /api/weather/export/xlsx` - Exportar XLSX

### Insights
- `GET /api/weather/insights` - Listar insights
- `POST /api/weather/insights/generate` - Gerar novos insights

### Pokémon (opcional)
- `GET /api/pokemon` - Listar pokémons (paginado)
- `GET /api/pokemon/:id` - Detalhes do pokémon

## Testes

### Backend

```bash
# Testes unitários
pnpm --filter api test

# Testes E2E
pnpm --filter api test:e2e
```

### Frontend

```bash
pnpm --filter web test
```

## CI/CD

O projeto possui CI configurado com GitHub Actions (`.github/workflows/ci.yml`):

- Lint (ESLint)
- Type Check (TypeScript)
- Testes unitários e E2E
- Build

## Variáveis de Ambiente

### Root (.env)

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| JWT_SECRET | Chave secreta JWT | gdash-super-secret-jwt-key-min-32-chars |
| ADMIN_EMAIL | Email do admin | admin@example.com |
| ADMIN_PASSWORD | Senha do admin | 123456 |
| WEATHER_LATITUDE | Latitude da localização | -23.5505 |
| WEATHER_LONGITUDE | Longitude da localização | -46.6333 |
| WEATHER_LOCATION | Nome da localização | São Paulo |
| COLLECTION_INTERVAL_MINUTES | Intervalo de coleta | 60 |

## Vídeo Explicativo

[Link do vídeo no YouTube]

<!-- TODO: Adicionar link do vídeo -->

## Autor

Elias Marques Cruz

## Licença

Este projeto foi desenvolvido como parte do processo seletivo GDASH 2025/02.
