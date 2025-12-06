# Sistema de Coleta e Processamento de Dados Climáticos

Sistema full-stack para coleta, processamento e armazenamento de dados climáticos utilizando múltiplas tecnologias.

## 🏗️ Arquitetura

```
Python (Coletor) → RabbitMQ → Go (Worker) → NestJS API → MongoDB
```

## 📦 Componentes

### 1. Weather Collector (Python)

Serviço responsável por coletar dados climáticos da API Open-Meteo e enviar para a fila RabbitMQ.

**Tecnologias:**

- Python 3.11
- pika (RabbitMQ client)
- requests (HTTP client)
- Open-Meteo API

**Funcionalidades:**

- Coleta dados climáticos periodicamente (configurável, padrão: 1 hora)
- Extrai temperatura, umidade, velocidade do vento, condições do céu e probabilidade de chuva
- Envia dados normalizados em JSON para RabbitMQ

### 2. Weather Worker (Go)

Worker que consome mensagens do RabbitMQ, valida os dados e envia para a API NestJS.

**Tecnologias:**

- Go 1.21
- github.com/rabbitmq/amqp091-go

**Funcionalidades:**

- Consome mensagens da fila RabbitMQ
- Valida dados climáticos
- Envia para API NestJS com retry automático (até 3 tentativas)
- Implementa ack/nack para garantir processamento confiável
- Logs detalhados das operações

### 3. API NestJS

API RESTful responsável por receber, armazenar e expor dados climáticos.

**Tecnologias:**

- NestJS (TypeScript)
- MongoDB com Mongoose
- JWT para autenticação
- Google Gemini para insights
- XLSX para exportação

**Funcionalidades:**

- Recebe dados do worker Go
- Armazena em MongoDB
- CRUD completo de usuários
- Autenticação JWT
- Exportação CSV/XLSX
- Geração de insights com IA

### 4. Frontend React

Dashboard moderno e responsivo para visualização de dados climáticos.

**Tecnologias:**

- React 18 com TypeScript
- Vite
- Tailwind CSS
- shadcn/ui (componentes)
- Recharts (gráficos)
- React Router
- Axios

**Funcionalidades:**

- Dashboard com cards principais (temperatura, umidade, vento, condição)
- Gráficos interativos (temperatura e probabilidade de chuva)
- Tabela de registros climáticos
- Exportação CSV/XLSX
- Seção de insights de IA completa
- Autenticação com JWT
- Rotas protegidas
- Interface moderna e responsiva

## 🚀 Como Executar

### 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Docker** (versão 20.10 ou superior)
- **Docker Compose** (versão 2.0 ou superior)

**Verificar instalação:**

```bash
docker --version
docker-compose --version
```

### ⚙️ Configuração Inicial

#### Passo 1: Criar arquivo de configuração

Copie o arquivo de exemplo e configure as variáveis de ambiente:

```bash
# Na raiz do projeto
cp .env.example .env
```

#### Passo 2: Configurar variáveis de ambiente

Edite o arquivo `.env` com suas preferências (ou use os valores padrão):

**Configurações do Coletor (Python):**

```env
# Localização para coleta de dados
LATITUDE=-23.5505          # Latitude (padrão: São Paulo)
LONGITUDE=-46.6333          # Longitude (padrão: São Paulo)
CITY_NAME=São Paulo         # Nome da cidade
COLLECTION_INTERVAL=3600    # Intervalo de coleta em segundos (3600 = 1 hora)
```

**Configurações do RabbitMQ:**

```env
RABBITMQ_USER=admin         # Usuário do RabbitMQ
RABBITMQ_PASS=admin123      # Senha do RabbitMQ
RABBITMQ_QUEUE=weather_data # Nome da fila
```

**Configurações da API (NestJS):**

```env
# MongoDB
MONGODB_URI=mongodb://mongodb:27017/weather_db

# Autenticação JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Usuário padrão (criado automaticamente)
DEFAULT_USER_EMAIL=admin@example.com
DEFAULT_USER_PASSWORD=123456
DEFAULT_USER_NAME=Administrador

# Google Gemini (Opcional - para insights com IA)
GEMINI_API_KEY=your-gemini-api-key-here
```

> **Nota:** A `GEMINI_API_KEY` é opcional. Sem ela, os insights funcionam com resumos baseados em regras.

### 🚀 Executando o Sistema

#### Passo 1: Subir todos os serviços

```bash
# Na raiz do projeto
docker-compose up -d
```

Este comando irá:

- Construir as imagens Docker (se necessário)
- Subir 6 serviços: RabbitMQ, MongoDB, Coletor Python, Worker Go, API NestJS e Frontend React
- Conectar todos os serviços na mesma rede

#### Passo 2: Verificar se os serviços estão rodando

```bash
docker-compose ps
```

Você deve ver todos os 6 containers com status "Up":

- `weather_rabbitmq`
- `weather_mongodb`
- `weather_collector`
- `weather_worker`
- `weather_api`
- `weather_frontend`

#### Passo 3: Verificar logs

```bash
# Ver todos os logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f weather-collector
docker-compose logs -f weather-worker
docker-compose logs -f api
```

#### Passo 4: Aguardar coleta de dados

O coletor inicia automaticamente e coleta dados a cada hora (ou conforme configurado). Aguarde alguns minutos para ter dados iniciais.

### 🌐 Acessando os Serviços

Após subir os serviços, você pode acessar:

| Serviço                 | URL                       | Credenciais                                        |
| ----------------------- | ------------------------- | -------------------------------------------------- |
| **Frontend**            | http://localhost          | Registre-se ou use: `admin@example.com` / `123456` |
| **API NestJS**          | http://localhost:3000     | -                                                  |
| **RabbitMQ Management** | http://localhost:15672    | `admin` / `admin123`                               |
| **MongoDB**             | mongodb://localhost:27017 | -                                                  |

### ✅ Verificação de Funcionamento

#### 1. Verificar se o coletor está coletando dados:

```bash
docker-compose logs weather-collector | grep "dados coletados"
```

#### 2. Verificar se o worker está processando:

```bash
docker-compose logs weather-worker | grep "processada com sucesso"
```

#### 3. Verificar dados no MongoDB:

```bash
docker exec -it weather_mongodb mongosh weather_db --eval "db.weatherlogs.countDocuments()"
```

#### 4. Testar API:

```bash
# Health check (se disponível)
curl http://localhost:3000

# Listar logs (pode precisar de autenticação)
curl http://localhost:3000/api/weather/logs
```

#### 5. Acessar Frontend:

Abra http://localhost no navegador e faça login.

### 🛑 Parar os Serviços

```bash
# Parar todos os serviços
docker-compose down

# Parar e remover volumes (apaga dados do MongoDB e RabbitMQ)
docker-compose down -v
```

### 🔄 Comandos Úteis

```bash
# Reiniciar um serviço específico
docker-compose restart weather-collector

# Reconstruir imagens (após mudanças no código)
docker-compose build --no-cache
docker-compose up -d

# Ver logs em tempo real de todos os serviços
docker-compose logs -f

# Ver uso de recursos
docker stats
```

## 📝 Estrutura do Projeto

```
.
├── docker-compose.yml          # Orquestração de serviços
├── .env                        # Variáveis de ambiente (criar a partir de .env.example)
├── .env.example                # Template de variáveis de ambiente
│
├── weather-collector/          # Coletor Python (estrutura modular)
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py                # Entry point
│   ├── README.md
│   └── src/
│       ├── config/             # Configurações
│       │   └── settings.py
│       ├── services/           # Serviços de negócio
│       │   ├── weather_service.py
│       │   └── queue_service.py
│       └── utils/              # Utilitários
│           └── logger.py
│
├── weather-worker/             # Worker Go
│   ├── Dockerfile
│   ├── go.mod
│   └── main.go
│
├── api/                        # API NestJS (Padrão MVC)
│   ├── Dockerfile
│   ├── package.json
│   ├── README.md
│   ├── ARCHITECTURE.md         # Documentação da arquitetura MVC
│   └── src/
│       ├── main.ts             # Entry point
│       ├── app.module.ts       # Módulo raiz
│       ├── common/             # Código compartilhado
│       │   ├── exceptions/     # Exceções customizadas
│       │   ├── filters/        # Filtros de exceção
│       │   ├── interceptors/    # Interceptors HTTP
│       │   └── interfaces/     # Interfaces compartilhadas
│       ├── config/             # Configurações centralizadas
│       │   ├── app.config.ts
│       │   ├── database.config.ts
│       │   └── jwt.config.ts
│       ├── weather/            # Módulo de dados climáticos
│       ├── users/              # Módulo de usuários
│       ├── auth/               # Módulo de autenticação
│       └── insights/           # Módulo de insights com IA
│
├── frontend/                   # Frontend React
│   ├── Dockerfile
│   ├── package.json
│   ├── README.md
│   └── src/
│       ├── components/         # Componentes reutilizáveis
│       │   ├── dashboard/      # Componentes do dashboard
│       │   └── ui/             # Componentes shadcn/ui
│       ├── pages/              # Páginas da aplicação
│       ├── services/           # Serviços de API
│       └── utils/              # Utilitários
│
├── PROJECT_STRUCTURE.md         # Visão geral da estrutura
├── DOCKER_GUIDE.md             # Guia de uso do Docker
└── README.md                   # Este arquivo
```

## 🔄 Fluxo de Dados

1. **Coleta**: O serviço Python busca dados da Open-Meteo a cada hora
2. **Fila**: Dados são enviados para a fila `weather_data` no RabbitMQ
3. **Processamento**: O worker Go consome mensagens da fila
4. **Validação**: Dados são validados (temperatura, umidade, etc.)
5. **API**: Dados validados são enviados para `POST /api/weather/logs` na API NestJS
6. **Persistência**: API NestJS armazena no MongoDB
7. **Frontend**: Dashboard React consome a API para exibir dados

## 📊 Formato dos Dados

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "location": {
    "latitude": -23.5505,
    "longitude": -46.6333,
    "city": "São Paulo"
  },
  "current": {
    "temperature": 25.5,
    "humidity": 65.0,
    "wind_speed": 12.3,
    "weather_code": 1
  },
  "forecast": {
    "hourly": [
      {
        "time": "2024-01-15T11:00",
        "temperature": 26.0,
        "humidity": 63.0,
        "wind_speed": 11.5,
        "precipitation_probability": 10.0,
        "weather_code": 1
      }
    ]
  }
}
```

## 🐛 Troubleshooting

### Problemas Comuns

#### Serviços não sobem

```bash
# Verificar logs de erro
docker-compose logs

# Verificar se as portas estão ocupadas
lsof -i :3000  # API
lsof -i :80   # Frontend
lsof -i :5672 # RabbitMQ
lsof -i :27017 # MongoDB

# Reconstruir imagens
docker-compose build --no-cache
docker-compose up -d
```

#### Coletor não está coletando dados

```bash
# Verificar logs do coletor
docker-compose logs weather-collector

# Verificar conexão com RabbitMQ
docker-compose logs weather-collector | grep -i "conectado\|erro"

# Reiniciar o coletor
docker-compose restart weather-collector
```

#### Worker não processa mensagens

```bash
# Verificar se há mensagens na fila
# Acesse http://localhost:15672 e verifique a fila "weather_data"

# Verificar logs do worker
docker-compose logs weather-worker

# Verificar se a API está acessível
curl http://localhost:3000/api/weather/logs
```

#### Frontend não carrega

```bash
# Verificar se o container está rodando
docker-compose ps frontend

# Ver logs do frontend
docker-compose logs frontend

# Verificar se a API está respondendo
curl http://localhost:3000
```

#### Insights não funcionam

```bash
# Verificar se há dados no banco
docker exec -it weather_mongodb mongosh weather_db --eval "db.weatherlogs.countDocuments()"

# Verificar logs da API
docker-compose logs api | grep -i insight

# Testar endpoint de insights (precisa de token)
curl "http://localhost:3000/api/weather/insights?days=7" \
  -H "Authorization: Bearer TOKEN"
```

### Limpar e Recomeçar

```bash
# Parar tudo
docker-compose down -v

# Remover imagens antigas
docker-compose rm -f

# Reconstruir tudo do zero
docker-compose build --no-cache
docker-compose up -d
```

## 🔧 Desenvolvimento Local

### Executar Python localmente

```bash
cd weather-collector
pip install -r requirements.txt

# Configurar variáveis de ambiente
export RABBITMQ_HOST=localhost
export RABBITMQ_PORT=5672
export RABBITMQ_USER=admin
export RABBITMQ_PASS=admin123

python main.py
```

### Executar Go localmente

```bash
cd weather-worker
go mod download

# Configurar variáveis de ambiente
export RABBITMQ_HOST=localhost
export RABBITMQ_PORT=5672
export RABBITMQ_USER=admin
export RABBITMQ_PASS=admin123
export API_URL=http://localhost:3000

go run main.go
```

### Executar API NestJS localmente

```bash
cd api
npm install

# Configurar variáveis de ambiente no .env
npm run start:dev
```

### Executar Frontend localmente

```bash
cd frontend
npm install
npm run dev
```

## 📡 Endpoints da API

### Autenticação

- `POST /api/auth/register` - Registro de novo usuário (retorna JWT token)
- `POST /api/auth/login` - Login (retorna JWT token)

### Weather Logs

- `POST /api/weather/logs` - Criar log (sem autenticação, usado pelo worker)
- `GET /api/weather/logs` - Listar logs (com paginação e filtros de data)
- `GET /api/weather/logs/statistics` - Estatísticas dos logs
- `GET /api/weather/export.csv` - Exportar CSV
- `GET /api/weather/export.xlsx` - Exportar XLSX
- `GET /api/weather/insights?days=7` - Gerar insights completos (com IA se configurado)
  - Retorna: resumo descritivo, estatísticas, pontuação de conforto (0-100), classificação do dia, alertas e recomendações

### Usuários (requer autenticação)

- `GET /api/users` - Listar todos os usuários
- `GET /api/users/:id` - Buscar usuário por ID
- `POST /api/users` - Criar novo usuário
- `PATCH /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### Exemplo de uso

```bash
# 1. Registrar novo usuário
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@example.com","password":"123456","name":"Nome do Usuário"}'

# 2. Fazer login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"123456"}'

# 3. Usar o token para acessar endpoints protegidos
curl -X GET http://localhost:3000/api/weather/logs \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# 4. Exportar dados
curl -X GET http://localhost:3000/api/weather/export.csv \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -o weather_logs.csv

# 5. Gerar insights
curl -X GET "http://localhost:3000/api/weather/insights?days=7" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# Resposta de insights inclui:
# - summary: Resumo descritivo em texto
# - statistics: Médias, mínimas, máximas e tendências
# - comfortScore: Pontuação de conforto (0-100)
# - dayClassification: "frio", "quente", "agradável", "chuvoso" ou "variável"
# - alerts: Array de alertas (chuva, calor, frio, vento, umidade)
# - recommendations: Recomendações práticas
```

## 📚 Documentação Adicional

- **ARCHITECTURE.md** (em `api/`) - Documentação completa da arquitetura MVC
- **PROJECT_STRUCTURE.md** - Visão geral da estrutura de todos os projetos
- **DOCKER_GUIDE.md** - Guia completo de uso do Docker Compose
- **README.md** (em cada projeto) - Documentação específica de cada componente

## 🏗️ Arquitetura MVC

A API NestJS segue o padrão MVC (Model-View-Controller):

- **Controllers**: Recebem requisições HTTP e retornam respostas
- **Services**: Contêm a lógica de negócio
- **Models/Schemas**: Definem a estrutura de dados no MongoDB
- **DTOs**: Validam dados de entrada e saída
- **Common**: Código compartilhado (exceptions, filters, interceptors)
