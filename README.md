# Desafio GDASH 2025/02 - Sistema de Monitoramento Climático

Sistema full-stack para coleta, processamento e visualização de dados climáticos com insights de IA.

## 🏗️ Arquitetura

```
Python (Producer) → RabbitMQ → Go (Worker) → NestJS (API) → MongoDB
                                                      ↓
                                              React (Frontend)
```

### Fluxo de Dados

1. **Producer (Python)**: Coleta dados climáticos da API Open-Meteo periodicamente e publica na fila RabbitMQ
2. **Worker (Go)**: Consome mensagens da fila, valida e envia para a API NestJS
3. **Backend (NestJS)**: Recebe e armazena dados no MongoDB, gera insights com IA
4. **Frontend (React)**: Exibe dados em tempo real, gráficos e insights de IA

## 🚀 Tecnologias

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Recharts
- **Backend**: NestJS + TypeScript + MongoDB + Mongoose
- **Worker**: Go 1.21 + RabbitMQ Client
- **Producer**: Python 3.11 + Requests + Pika
- **Message Broker**: RabbitMQ 3
- **Database**: MongoDB 8
- **IA**: OpenAI GPT-3.5 + Google Gemini (fallback)
- **Containerização**: Docker + Docker Compose (multi-stage builds)

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Conta OpenAI (opcional, para insights)
- Conta Google Gemini (opcional, para fallback)

## 🛠️ Como Executar

### 1. Clone o repositório

```bash
git clone <repository-url>
cd desafio-GDASH
```

### 2. Configure as variáveis de ambiente (opcional)

Crie um arquivo `.env` na raiz do projeto se desejar personalizar as configurações. Caso contrário, o sistema usará os valores padrão definidos no `docker-compose.yml`.

Principais variáveis que você pode configurar:
- `OPENAI_API_KEY` (opcional, para insights de IA)
- `GEMINI_API_KEY` (opcional, para fallback de IA)
- `LATITUDE` e `LONGITUDE` (coordenadas da sua localização)
- `JWT_SECRET` (chave secreta para JWT - altere em produção!)
- Outras configurações conforme necessário

> 💡 **Nota**: Se não criar o arquivo `.env`, o sistema funcionará com os valores padrão do `docker-compose.yml`.

### 3. Execute com Docker Compose

**Primeira execução ou após mudanças no código (recomendado):**
```bash
docker-compose up --build -d
```

Este comando irá:
- Construir todas as imagens Docker dos serviços
- Iniciar todos os containers em modo detached (background)
- Garantir que você tenha as versões mais recentes do código

**Execuções subsequentes (sem mudanças no código):**
```bash
docker-compose up -d
```

**Para ver os logs em tempo real durante a inicialização:**
```bash
docker-compose up --build
# ou sem rebuild:
docker-compose up
```

> 💡 **Dica**: Use `--build` sempre que houver mudanças no código, dependências ou Dockerfiles para garantir que as imagens estejam atualizadas.

### 4. Acesse a aplicação

- **Frontend**: http://localhost:5173
  - **Dashboard** (`/dashboard`): Visualização de dados climáticos, gráficos interativos e insights de IA
  - **Usuários** (`/users`): Gerenciamento completo de usuários (CRUD)
  - **Explorar** (`/explore`): Página para explorar Pokémons com paginação e detalhes
  - **Login** (`/login`): Página de autenticação
  - **Registro** (`/register`): Página de cadastro de novos usuários
- **Backend API**: http://localhost:3000
- **Swagger**: http://localhost:3000/api
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

### 5. Credenciais padrão

- **Email**: admin@example.com
- **Senha**: 123456

## 📁 Estrutura do Projeto

```
.
├── backend/                    # API NestJS
│   ├── src/
│   │   ├── modules/
│   │   │   ├── weather/        # Módulo de clima
│   │   │   ├── users/          # Módulo de usuários
│   │   │   ├── auth/           # Módulo de autenticação
│   │   │   ├── pokemon/        # Módulo Pokémon (opcional)
│   │   │   └── seed/           # Seed de dados iniciais
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/                   # Aplicação React
│   ├── src/
│   │   ├── components/         # Componentes reutilizáveis
│   │   │   ├── ui/             # Componentes shadcn/ui (button, card, dialog, input, label, table)
│   │   │   ├── Header.tsx       # Cabeçalho da aplicação
│   │   │   ├── Sidebar.tsx     # Barra lateral de navegação
│   │   │   └── ProtectedRoute.tsx # Componente de proteção de rotas
│   │   ├── pages/              # Páginas da aplicação
│   │   │   ├── Dashboard.tsx   # Dashboard principal com dados climáticos
│   │   │   ├── Users.tsx       # Gerenciamento de usuários
│   │   │   ├── Explore.tsx     # Exploração de Pokémons
│   │   │   ├── Login.tsx       # Página de login
│   │   │   └── Register.tsx    # Página de registro
│   │   ├── services/           # Serviços de API (auth, weather, users, pokemon)
│   │   ├── context/            # Context API (AuthContext)
│   │   └── App.tsx             # Componente principal com rotas
│   ├── Dockerfile
│   └── package.json
├── worker/                     # Worker Go
│   ├── main.go
│   ├── consumer.go
│   ├── api_client.go
│   ├── config.go
│   ├── Dockerfile
│   └── go.mod
├── producer/                   # Producer Python
│   ├── main.py
│   ├── weather_collector.py
│   ├── queue_publisher.py
│   ├── config.py
│   ├── Dockerfile
│   └── requirements.txt
├── docker-compose.yml          # Orquestração de serviços
├── LICENSE                     # Licença MIT
├── scripts/                     # Scripts auxiliares (Windows)
│   ├── check-containers.ps1
│   ├── setup-autostart.ps1
│   └── start-docker-containers.ps1
├── .env.example                # Exemplo de variáveis de ambiente
└── README.md
```

## 🔧 Executando Serviços Individualmente

### Backend (NestJS)

```bash
cd backend
npm install
npm run start:dev
```

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

### Producer (Python)

```bash
cd producer
pip install -r requirements.txt
python main.py
```

### Worker (Go)

```bash
cd worker
go mod download
go run .
```

## 📡 Endpoints da API

### Health Check
- `GET /health` - Verificar status da API

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registrar novo usuário

### Clima
- `GET /api/weather/logs` - Listar registros climáticos (com paginação e filtro por localização)
  - Query params: `page`, `limit`, `location`
- `POST /api/weather/logs` - Receber dados do worker (interno)
- `GET /api/weather/insights` - Obter insights de IA
- `POST /api/weather/collect` - Coletar dados climáticos manualmente
- `GET /api/weather/export.csv` - Exportar dados em CSV
- `GET /api/weather/export.xlsx` - Exportar dados em XLSX

### Usuários (protegido - requer autenticação JWT)
- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Obter usuário por ID
- `POST /api/users` - Criar usuário
- `PATCH /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### Pokémon (opcional)
- `GET /api/pokemon` - Listar Pokémons (paginado)
- `GET /api/pokemon/:id` - Detalhes de Pokémon

## 🎨 Rotas do Frontend

O frontend possui as seguintes rotas:

- `/login` - Página de login
- `/register` - Página de registro de novos usuários
- `/dashboard` - Dashboard principal com dados climáticos, gráficos interativos e insights de IA (protegida)
- `/users` - Gerenciamento completo de usuários com CRUD (protegida)
- `/explore` - Página para explorar Pokémons com paginação e visualização de detalhes (protegida)
- `/` - Redireciona automaticamente para `/dashboard`

> 🔒 **Nota**: As rotas `/dashboard`, `/users` e `/explore` são protegidas e requerem autenticação JWT.

## 🧪 Testes

Para testar o pipeline completo:

1. Verifique se todos os serviços estão rodando:
```bash
docker-compose ps
```

2. Verifique os logs:
```bash
docker-compose logs -f producer
docker-compose logs -f worker
docker-compose logs -f backend
```

3. Acesse o frontend e faça login
4. Verifique o dashboard de clima
5. Explore outras funcionalidades:
   - Gerenciamento de usuários na página `/users`
   - Exploração de Pokémons na página `/explore`

## 📝 Características Técnicas

### Diferenciais Implementados

- ✅ **Multi-stage Docker builds** em todos os serviços (redução de ~70% no tamanho das imagens)
- ✅ **Healthchecks configurados** em todos os serviços
- ✅ **Pipeline de dados configurável** (intervalo de coleta ajustável via variável de ambiente)
- ✅ **Sistema de retries automático** no Producer (Python) e Consumer (Go)
- ✅ **Cache de insights de IA** para evitar chamadas desnecessárias
- ✅ **Fallback automático** de OpenAI para Gemini em caso de falha
- ✅ **Validação de dados** em todas as camadas
- ✅ **Tratamento de erros robusto** com logs detalhados
- ✅ **Exportação de dados** em CSV e XLSX
- ✅ **Interface moderna** com Tailwind CSS e componentes shadcn/ui
- ✅ **Gráficos interativos** com Recharts
- ✅ **Autenticação JWT** com rotas protegidas
- ✅ **Página de exploração de Pokémons** com paginação e detalhes (funcionalidade adicional)
- ✅ **Gerenciamento completo de usuários** com CRUD na interface
- ✅ **Layout responsivo** com Sidebar e Header
- ✅ **Atualização automática de dados** no dashboard (a cada 5 minutos)

### Notas Importantes

- O producer coleta dados a cada hora por padrão (configurável via `COLLECTION_INTERVAL` em segundos)
- Os insights de IA são gerados sob demanda quando solicitados via endpoint e são cacheados para evitar chamadas desnecessárias
- O usuário padrão é criado automaticamente na primeira inicialização do backend
- As APIs de IA (OpenAI/Gemini) são opcionais - o sistema funciona sem elas usando fallback
- Todos os serviços têm retry logic implementado para maior resiliência
- O sistema possui healthchecks configurados em todos os serviços Docker
- A API possui validação de dados em todas as rotas usando class-validator
- CORS está configurado para permitir requisições do frontend

## 🔄 Autostart no Windows (Coleta Automática)

Para garantir que os dados sejam coletados automaticamente a cada hora, mesmo quando você não estiver usando o computador:

### Configuração Rápida

1. **Execute o script de configuração** (como Administrador):
   ```powershell
   # Abra PowerShell como Administrador
   cd C:\Users\caiod\desafio-GDASH
   .\scripts\setup-autostart.ps1
   ```

2. **Configure Docker Desktop para iniciar automaticamente**:
   - Abra Docker Desktop
   - Settings → General
   - Marque "Start Docker Desktop when you log in"

3. **Inicie os containers uma vez**:
   ```powershell
   .\scripts\start-docker-containers.ps1
   ```


### Serviços não iniciam
- Verifique se as portas estão disponíveis
- Verifique os logs: `docker-compose logs <service-name>`
- No Windows: Execute `.\scripts\start-docker-containers.ps1`

### Dados não são coletados automaticamente
- Verifique se o Docker Desktop está rodando
- Verifique se os containers estão rodando: `docker-compose ps`
- No Windows: Verifique se a tarefa agendada está configurada (veja seção Autostart acima)
- Verifique os logs do producer: `docker-compose logs -f producer`

### Erro de conexão com MongoDB
- Aguarde o MongoDB estar completamente inicializado
- Verifique as credenciais no `.env`

### Erro de conexão com RabbitMQ
- Aguarde o RabbitMQ estar completamente inicializado
- Verifique as credenciais no `.env`

## 🔐 Variáveis de Ambiente

As variáveis de ambiente podem ser configuradas através de um arquivo `.env` na raiz do projeto ou diretamente no `docker-compose.yml`. Principais variáveis:

### Backend
- `MONGODB_URI`: String de conexão do MongoDB (gerada automaticamente no docker-compose)
- `MONGO_ROOT_USERNAME`: Usuário root do MongoDB (padrão: admin)
- `MONGO_ROOT_PASSWORD`: Senha root do MongoDB (padrão: admin123)
- `MONGO_DATABASE`: Nome do banco de dados (padrão: gdash)
- `JWT_SECRET`: Chave secreta para JWT (altere em produção!)
- `JWT_EXPIRES_IN`: Tempo de expiração do token JWT (padrão: 24h)
- `OPENAI_API_KEY`: Chave da API OpenAI (opcional, para insights)
- `GEMINI_API_KEY`: Chave da API Gemini (opcional, para fallback)
- `LATITUDE` / `LONGITUDE`: Coordenadas para coleta de dados climáticos (padrão: 52.52, 13.41)
- `OPEN_METEO_URL`: URL da API Open-Meteo (padrão: https://api.open-meteo.com/v1/forecast)
- `NODE_ENV`: Ambiente de execução (development/production)
- `PORT`: Porta do backend (padrão: 3000)

### Frontend
- `VITE_API_URL`: URL da API backend (padrão: http://localhost:3000)

### Producer
- `RABBITMQ_URL`: URL de conexão do RabbitMQ
- `RABBITMQ_USER`: Usuário do RabbitMQ (padrão: guest)
- `RABBITMQ_PASS`: Senha do RabbitMQ (padrão: guest)
- `QUEUE_NAME`: Nome da fila (padrão: weather_data)
- `COLLECTION_INTERVAL`: Intervalo de coleta em segundos (padrão: 3600 = 1 hora)

### Worker
- `API_URL`: URL da API backend para envio de dados (padrão: http://backend:3000/api/weather/logs)

## 🧪 Testando o Pipeline

### 1. Verificar Status dos Serviços

```bash
docker-compose ps
```

Todos os serviços devem estar com status "Up" e healthcheck "healthy".

### 2. Verificar Logs

```bash
# Logs do producer (coleta de dados)
docker-compose logs -f producer

# Logs do worker (processamento)
docker-compose logs -f worker

# Logs do backend (API)
docker-compose logs -f backend

# Logs de todos os serviços
docker-compose logs -f
```

### 3. Testar Endpoints

```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"123456"}'

# Registrar novo usuário
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"123456","name":"Nome do Usuário"}'

# Listar registros climáticos (requer token JWT)
curl http://localhost:3000/api/weather/logs \
  -H "Authorization: Bearer <seu-token>"

# Coletar dados climáticos manualmente
curl -X POST http://localhost:3000/api/weather/collect \
  -H "Authorization: Bearer <seu-token>"

# Obter insights de IA
curl http://localhost:3000/api/weather/insights \
  -H "Authorization: Bearer <seu-token>"
```

### 4. Verificar RabbitMQ

Acesse http://localhost:15672 (guest/guest) e verifique:
- Queue `weather_data` criada
- Mensagens sendo publicadas pelo producer
- Mensagens sendo consumidas pelo worker

## 📹 Vídeo Explicativo

[Link do vídeo será adicionado aqui após gravação]

O vídeo deve incluir:
- Arquitetura geral da aplicação
- Demonstração do pipeline de dados
- Como os insights de IA são gerados
- Principais decisões técnicas
- Demo da aplicação rodando

## 🚀 Deploy

### Build e Execução

```bash
# Build e iniciar todos os serviços (recomendado na primeira execução)
docker-compose up --build -d

# Build e iniciar com logs visíveis
docker-compose up --build

# Apenas build das imagens (sem iniciar os containers)
docker-compose build

# Build de um serviço específico
docker-compose build backend

# Rebuild forçado (ignora cache)
docker-compose build --no-cache
```

### Limpeza

```bash
# Parar e remover containers
docker-compose down

# Remover volumes também
docker-compose down -v

# Remover imagens
docker-compose down --rmi all
```

## 👤 Autor

Caio Dias Oliveira

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

Este projeto foi desenvolvido para o processo seletivo GDASH 2025/02.

