# GDASH Challenge 2025/02 - Documentação de Implementação

Este documento contém as instruções completas para executar a aplicação desenvolvida para o desafio GDASH 2025/02.

## 📋 Visão Geral

Sistema full-stack desenvolvido para coletar, processar e exibir dados climáticos em tempo real, com integração de múltiplas tecnologias:

- **Python**: Coleta de dados climáticos da API Open-Meteo e envio para RabbitMQ
- **Go**: Worker que consome mensagens do RabbitMQ e envia para a API NestJS
- **NestJS**: API REST com MongoDB para armazenamento e processamento
- **React + Vite**: Frontend moderno com Tailwind CSS e shadcn/ui

## 🚀 Como Executar com Docker Compose

### Pré-requisitos

- Docker e Docker Compose instalados
- Portas disponíveis: 3000 (API), 5173 (Frontend), 27017 (MongoDB), 5672 (RabbitMQ), 15672 (RabbitMQ Management)

### Passos

1. **Clone o repositório** (se ainda não tiver):
```bash
git clone <url-do-repositorio>
cd desafio-gdash-2025-02
```

2. **Configure as variáveis de ambiente**:
A partir do arquivo .env.example, criar um arquivo .env

```bash
cp env.example .env
```

Edite o arquivo `.env` se necessário. Os valores padrão são:

```env
# MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=admin123
MONGO_DATABASE=gdash

# RabbitMQ
RABBITMQ_USER=guest
RABBITMQ_PASS=guest
QUEUE_NAME=weather_data

# NestJS API
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
DEFAULT_USER_EMAIL=admin@example.com
DEFAULT_USER_PASSWORD=123456

# Open-Meteo API
OPEN_METEO_BASE_URL=https://api.open-meteo.com/v1
LATITUDE=23.5505
LONGITUDE=-46.6333
LOCATION_NAME=São Paulo

# Python Collector
COLLECT_INTERVAL=3600

# Frontend
VITE_API_URL=http://localhost:3000/api
```

3. **Execute o Docker Compose**:
```bash
docker-compose up --build
```

Isso irá:
- Construir todas as imagens necessárias
- Iniciar MongoDB, RabbitMQ, API NestJS, Worker Go, Coletor Python e Frontend React
- Configurar a rede interna entre os serviços

4. **Aguarde todos os serviços iniciarem** (pode levar alguns minutos na primeira execução)

5. **Acesse a aplicação**:
   - **Frontend**: http://localhost:5173
   - **API**: http://localhost:3000/api
   - **RabbitMQ Management**: http://localhost:15672 (guest/guest)
   - **Health Check API**: http://localhost:3000/api/health

### Credenciais Padrão

- **Email**: admin@example.com
- **Senha**: 123456

O usuário padrão é criado automaticamente na inicialização da API.

## 🏗️ Arquitetura

```
Python Collector → RabbitMQ → Go Worker → NestJS API → MongoDB
                                               ↓
                                         React Frontend
```

### Fluxo de Dados

1. **Coleta (Python)**: O serviço Python busca dados climáticos da API Open-Meteo a cada hora (configurável via `COLLECT_INTERVAL`) e envia para a fila RabbitMQ.

2. **Processamento (Go)**: O worker Go consome mensagens da fila RabbitMQ, valida os dados e envia para a API NestJS via HTTP POST.

3. **Armazenamento (NestJS)**: A API NestJS recebe os dados, armazena no MongoDB e processa insights de IA automaticamente.

4. **Visualização (React)**: O frontend React consome os endpoints da API para exibir dados em tempo real, gráficos e insights.

## 📁 Estrutura do Projeto

```
desafio-gdash-2025-02/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── auth/           # Módulo de autenticação JWT
│   │   ├── users/          # CRUD de usuários
│   │   ├── weather/        # Módulo de clima (logs, insights, exportação)
│   │   ├── poke-api/       # Integração opcional com PokéAPI
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/                # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/     # Componentes UI (shadcn/ui)
│   │   ├── contexts/       # Contextos React (Auth)
│   │   ├── pages/          # Páginas (Login, Dashboard, Users, Pokemons)
│   │   └── lib/            # Utilitários e API client
│   ├── Dockerfile
│   └── package.json
├── python-collector/        # Serviço de coleta Python
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── go-worker/               # Worker Go
│   ├── main.go
│   ├── go.mod
│   ├── go.sum
│   └── Dockerfile
├── docker-compose.yml       # Orquestração de todos os serviços
├── env.example              # Exemplo de variáveis de ambiente
└── README.md                # Este arquivo
```

## 🔌 Endpoints da API

### Autenticação

- `POST /api/auth/login` - Login de usuário
  ```json
  {
    "email": "admin@example.com",
    "password": "123456"
  }
  ```

### Clima

- `POST /api/weather/logs` - Criar log de clima (usado pelo worker Go)
- `GET /api/weather/logs?page=1&limit=50&location=São Paulo` - Listar logs
- `GET /api/weather/latest?location=São Paulo` - Último registro
- `GET /api/weather/insights?days=7` - Insights de IA
- `GET /api/weather/export/csv?location=São Paulo` - Exportar CSV
- `GET /api/weather/export/xlsx?location=São Paulo` - Exportar XLSX

### Usuários (requer autenticação)

- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Obter usuário
- `POST /api/users` - Criar usuário
- `PATCH /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Deletar usuário

### PokéAPI (opcional)

- `GET /api/poke-api/pokemons?page=1&limit=20` - Listar Pokémons
- `GET /api/poke-api/pokemons/:idOrName` - Detalhes de um Pokémon

## 🧪 Como Rodar Cada Serviço Individualmente

### Backend (NestJS)

```bash
cd backend
npm install
npm run start:dev
```

A API estará em http://localhost:3000/api

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

O frontend estará em http://localhost:5173

### Python Collector

```bash
cd python-collector
pip install -r requirements.txt
export RABBITMQ_URL=amqp://guest:guest@localhost:5672/
export QUEUE_NAME=weather_data
export COLLECT_INTERVAL=3600
export LATITUDE=23.5505
export LONGITUDE=-46.6333
export LOCATION_NAME=São Paulo
python main.py
```

### Go Worker

```bash
cd go-worker
go mod download
export RABBITMQ_URL=amqp://guest:guest@localhost:5672/
export API_URL=http://localhost:3000/api/weather/logs
export QUEUE_NAME=weather_data
go run main.go
```

**Nota**: Certifique-se de que o MongoDB e RabbitMQ estejam rodando antes de executar os serviços individuais.

## 📊 Funcionalidades Implementadas

### ✅ Obrigatórias

- [x] Python coleta dados de clima (Open-Meteo) periodicamente
- [x] Python envia dados para RabbitMQ
- [x] Worker Go consome a fila e envia para API NestJS
- [x] API NestJS armazena logs em MongoDB
- [x] API NestJS expõe endpoints para listar dados
- [x] API NestJS gera/retorna insights de IA
- [x] API NestJS exporta dados em CSV/XLSX
- [x] API NestJS implementa CRUD de usuários + autenticação JWT
- [x] Frontend React + Vite + Tailwind + shadcn/ui
- [x] Dashboard de clima com dados reais
- [x] Exibição de insights de IA
- [x] CRUD de usuários + login
- [x] Docker Compose sobe todos os serviços
- [x] Código em TypeScript (backend e frontend)
- [x] Logs e tratamento de erros em cada serviço

### ✅ Opcionais

- [x] Integração com API pública paginada (PokéAPI)
- [x] Página de Pokémons no frontend
- [x] Gráficos de temperatura e umidade no Dashboard
- [x] Sistema de alertas baseado em insights

## 🧠 Insights de IA

Os insights são gerados a partir dos dados históricos de clima e incluem:

- **Pontuação de Conforto (0-100)**: Baseada em temperatura, umidade e vento ideais
- **Classificação do Clima**: Frio, Quente, Agradável, Chuvoso, etc.
- **Tendência de Temperatura**: Subindo, Caindo ou Estável
- **Estatísticas**: Médias, máximas e mínimas
- **Alertas**: Calor extremo, frio intenso, alta chance de chuva, etc.
- **Resumo Textual**: Descrição em linguagem natural dos últimos dias

## 🔧 Configurações Importantes

### MongoDB

- Usuário padrão: `admin` / `admin123`
- Banco de dados: `gdash`
- URI de conexão: `mongodb://admin:admin123@mongodb:27017/gdash?authSource=admin`

### RabbitMQ

- Usuário padrão: `guest` / `guest`
- Interface web: http://localhost:15672
- Fila: `weather_data`

### JWT

- Secret padrão: `your-secret-key-change-in-production` (altere em produção!)
- Expiração: 24 horas

## 🐛 Troubleshooting

### Serviços não iniciam

- Verifique se as portas estão disponíveis
- Verifique os logs: `docker-compose logs [servico]`
- Certifique-se de que o `.env` está configurado corretamente

### Worker Go não processa mensagens

- Verifique se o RabbitMQ está saudável: `docker-compose ps rabbitmq`
- Verifique se a API NestJS está respondendo: `curl http://localhost:3000/api/health`
- Veja os logs: `docker-compose logs go-worker`

### Frontend não carrega dados

- Verifique se a API está rodando: http://localhost:3000/api/health
- Verifique o console do navegador para erros
- Certifique-se de estar autenticado (faça login primeiro)

### Python não envia dados

- Verifique se o RabbitMQ está acessível
- Veja os logs: `docker-compose logs python-collector`
- Verifique se a variável `COLLECT_INTERVAL` está configurada

## 📝 Notas de Implementação

### Decisões Técnicas

1. **Insights de IA**: Implementados diretamente no NestJS usando algoritmos estatísticos e regras de negócio, sem necessidade de bibliotecas externas de IA pesada.

2. **Autenticação**: JWT com Passport.js, armazenando token no localStorage do frontend.

3. **Validação**: Class-validator e class-transformer para validação de DTOs.

4. **Exportação**: CSV usando `csv-stringify` e XLSX usando `xlsx`.

5. **Componentes UI**: shadcn/ui (componentes Radix UI estilizados com Tailwind).

6. **Gráficos**: Recharts para visualização de dados.

### Melhorias Futuras

- Testes automatizados (unitários e e2e)
- CI/CD com GitHub Actions
- Logs centralizados (ELK Stack)
- Cache Redis para melhorar performance
- WebSockets para atualização em tempo real
- Filtros avançados no Dashboard
- Suporte a múltiplas localizações

## 📹 Vídeo Explicativo

**IMPORTANTE**: Grave um vídeo de até 5 minutos explicando:

- Arquitetura geral da aplicação
- Pipeline de dados (Python → RabbitMQ → Go → NestJS → Frontend)
- Como os insights de IA são gerados e exibidos
- Principais decisões técnicas
- Demonstração rápida da aplicação rodando via Docker Compose

Inclua o link do vídeo (YouTube não listado) no README ou na descrição do Pull Request.

## 📄 Licença

Este projeto foi desenvolvido para o processo seletivo GDASH 2025/02.

---

**Desenvolvido com ❤️ para o desafio GDASH 2025/02**

