# GDASH Challenge 2025/02 - Documentação de Implementação

Este documento contém as instruções completas para executar a aplicação desenvolvida para o desafio GDASH 2025/02.

## 📋 Visão Geral

Sistema full-stack desenvolvido para coletar, processar e exibir dados climáticos em tempo real, com integração de múltiplas tecnologias:

- **Python**: Coleta de dados climáticos da API Open-Meteo e envio para RabbitMQ
- **Go**: Worker que consome mensagens do RabbitMQ e envia para a API NestJS
- **NestJS**: API REST com MongoDB para armazenamento e processamento
- **React + Vite**: Frontend moderno com Tailwind CSS e shadcn/ui

## 🎥 Vídeo Explicativo

**Link do vídeo:** [clique aqui](https://youtu.be/ynks-AOpCho)

> 📝 **Roteiro completo do vídeo:** Consulte o arquivo [`VIDEO_ROTEIRO.md`](./VIDEO_ROTEIRO.md) para o roteiro detalhado de até 5 minutos.

---

## 📚 Documentação Adicional

Este projeto inclui documentação detalhada sobre a arquitetura e fluxos:

- **[ARQUITETURA.md](./ARQUITETURA.md)** - Descrição completa da arquitetura do sistema
- **[FLUXOGRAMA_ARQUITETURA.md](./FLUXOGRAMA_ARQUITETURA.md)** - Fluxogramas em texto da arquitetura
- **[DIAGRAMAS.md](./DIAGRAMAS.md)** - Diagramas visuais em Mermaid (renderizáveis no GitHub)
- **[VIDEO_ROTEIRO.md](./VIDEO_ROTEIRO.md)** - Roteiro completo para o vídeo explicativo

---

# 📋 Documentação da Implementação

## 🏗️ Arquitetura

Este projeto implementa um pipeline completo de dados climáticos:

```
Python (Collector) → RabbitMQ → Go (Worker) → NestJS (API) → MongoDB → React (Frontend)
```

### Componentes

1. **Collector Python** (`/collector-python`): Coleta dados climáticos periodicamente e publica no RabbitMQ
2. **Worker Go** (`/worker-go`): Consome mensagens do RabbitMQ e envia para a API NestJS
3. **Backend NestJS** (`/backend`): API REST com autenticação JWT, CRUD de usuários, armazenamento de dados climáticos, geração de insights e exportação
4. **Frontend React** (`/frontend`): Dashboard com visualizações, CRUD de usuários e integração com API externa
5. **MongoDB**: Banco de dados NoSQL
6. **RabbitMQ**: Fila de mensagens

## 🚀 Como Executar

### Pré-requisitos

- Docker e Docker Compose instalados
- Git

### Passo a Passo

1. **Clone o repositório** (se ainda não tiver feito):
```bash
git clone <url-do-repositorio>
cd desafio-gdash-2025-02
```

2. **Crie o arquivo `.env`** na raiz do projeto:
```bash
cp .env.example .env
```

Edite o arquivo `.env` e ajuste as variáveis conforme necessário (veja seção de variáveis abaixo).

3. **Suba todos os serviços com Docker Compose**:
```bash
docker compose up --build
```

Este comando irá:
- Construir todas as imagens Docker
- Subir MongoDB, RabbitMQ, API NestJS, Frontend, Collector Python e Worker Go
- Criar automaticamente o usuário admin padrão

4. **Aguarde alguns segundos** para todos os serviços iniciarem completamente.

5. **Acesse a aplicação**:
   - Frontend: http://localhost:5173
   - API Swagger: http://localhost:3000/api/docs
   - RabbitMQ Management: http://localhost:15672 (admin/admin123)

### Credenciais Padrão

- **Email**: `admin@gdash.io`
- **Senha**: `admin123`

> ⚠️ **Nota**: As credenciais podem ser alteradas no arquivo `.env` através das variáveis `ADMIN_EMAIL` e `ADMIN_PASSWORD`.

## 📁 Estrutura do Projeto

```
desafio-gdash-2025-02/
├── backend/              # API NestJS
│   ├── src/
│   │   ├── auth/        # Módulo de autenticação
│   │   ├── users/       # CRUD de usuários
│   │   ├── weather/     # Dados climáticos e exportação
│   │   ├── insights/    # Geração de insights de IA
│   │   └── external-api/# Integração com PokéAPI
│   └── Dockerfile
├── frontend/            # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/  # Componentes UI (shadcn/ui)
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── services/    # Serviços de API
│   │   └── lib/         # Utilitários
│   └── Dockerfile
├── collector-python/    # Serviço de coleta de dados
│   ├── main.py
│   └── Dockerfile
├── worker-go/           # Worker que processa fila
│   ├── main.go
│   └── Dockerfile
├── docker-compose.yml   # Orquestração de todos os serviços
├── .env.example         # Exemplo de variáveis de ambiente
└── README.md
```

## ⚙️ Variáveis de Ambiente

### MongoDB
- `MONGO_ROOT_USERNAME`: Usuário root do MongoDB (padrão: `admin`)
- `MONGO_ROOT_PASSWORD`: Senha root do MongoDB (padrão: `admin123`)
- `MONGO_DATABASE`: Nome do banco de dados (padrão: `gdash`)

### RabbitMQ
- `RABBITMQ_USER`: Usuário do RabbitMQ (padrão: `admin`)
- `RABBITMQ_PASSWORD`: Senha do RabbitMQ (padrão: `admin123`)

### Backend NestJS
- `JWT_SECRET`: Chave secreta para JWT (altere em produção!)
- `JWT_EXPIRES_IN`: Tempo de expiração do token (padrão: `24h`)
- `ADMIN_EMAIL`: Email do usuário admin padrão (padrão: `admin@gdash.io`)
- `ADMIN_PASSWORD`: Senha do usuário admin padrão (padrão: `admin123`)
- `OPENAI_API_KEY`: (Opcional) Chave da API OpenAI para insights avançados

### Frontend
- `VITE_API_URL`: URL base da API (padrão: `http://localhost:3000/api`)

### Collector Python
- `WEATHER_API_PROVIDER`: Provedor de clima (`open-meteo` ou `openweather`)
- `WEATHER_API_KEY`: Chave da API (necessário apenas para OpenWeather)
- `CITY_NAME`: Nome da cidade (padrão: `Maceió, BR`)
- `LATITUDE`: Latitude da cidade (padrão: `-9.5713`)
- `LONGITUDE`: Longitude da cidade (padrão: `-36.7820`)
- `RABBITMQ_QUEUE`: Nome da fila (padrão: `weather.readings`)
- `PULL_INTERVAL_SECONDS`: Intervalo de coleta em segundos (padrão: `3600` = 1 hora)

### Worker Go
- `API_BASE_URL`: URL base da API NestJS (padrão: `http://api:3000`)
- `API_WEATHER_INGEST_PATH`: Endpoint de ingestão (padrão: `/api/weather/logs`)
- `MAX_RETRIES`: Número máximo de tentativas (padrão: `3`)

## 🔧 Executando Serviços Individualmente

> ⚠️ **Importante**: Esta seção é **apenas para execução manual dos serviços sem Docker Compose**.  
> Se você optou por usar `docker compose up --build` (recomendado), **não é necessário** executar os serviços individualmente, pois o Docker Compose já cuida de tudo automaticamente.  
> Use esta seção apenas se precisar rodar algum serviço isoladamente para desenvolvimento ou debug.

### Backend NestJS

```bash
cd backend
npm install
npm run start:dev
```

### Frontend React

```bash
cd frontend
npm install
npm run dev
```

### Collector Python

```bash
cd collector-python
pip install -r requirements.txt
python main.py
```

### Worker Go

```bash
cd worker-go
go mod download
go run main.go
```

## 📡 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Fazer login

### Usuários (requer autenticação)
- `GET /api/users` - Listar usuários (com paginação)
- `GET /api/users/:id` - Buscar usuário por ID
- `POST /api/users` - Criar usuário (admin only)
- `PATCH /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Remover usuário (admin only)

### Clima (requer autenticação, exceto POST /logs)
- `POST /api/weather/logs` - Criar registro (usado pelo worker)
- `GET /api/weather/logs` - Listar registros (com filtros)
- `GET /api/weather/logs/latest` - Último registro
- `GET /api/weather/export.csv` - Exportar CSV
- `GET /api/weather/export.xlsx` - Exportar XLSX

### Insights (requer autenticação)
- `GET /api/insights/weather` - Gerar insights de clima

### API Externa (requer autenticação)
- `GET /api/external/pokemon` - Listar Pokémons (com paginação)
- `GET /api/external/pokemon/:id` - Detalhes de um Pokémon

## 🎯 Funcionalidades Implementadas

✅ Coleta periódica de dados climáticos (Python → RabbitMQ)  
✅ Worker em Go consumindo fila e enviando para API  
✅ API NestJS com MongoDB  
✅ Autenticação JWT  
✅ CRUD completo de usuários  
✅ Dashboard de clima com gráficos  
✅ Geração de insights de IA  
✅ Exportação CSV e XLSX  
✅ Integração com PokéAPI  
✅ Frontend React com shadcn/ui  
✅ Docker Compose para subir tudo  
✅ Usuário admin criado automaticamente  

## 🐛 Troubleshooting

### Serviços não iniciam
- Verifique se as portas 3000, 5173, 27017, 5672, 15672 estão livres
- Verifique os logs: `docker compose logs [servico]`

### Erro de conexão com MongoDB
- Aguarde alguns segundos após subir os containers
- Verifique se o MongoDB está saudável: `docker compose ps`

### Erro de conexão com RabbitMQ
- Verifique se o RabbitMQ está rodando: `docker compose ps`
- Acesse o management UI: http://localhost:15672

### Frontend não carrega dados
- Verifique se a variável `VITE_API_URL` está correta
- Verifique se você está autenticado (token no localStorage)

### Collector não coleta dados
- Verifique os logs: `docker compose logs collector-python`
- Verifique se as coordenadas (LATITUDE/LONGITUDE) estão corretas
- Para OpenWeather, verifique se `WEATHER_API_KEY` está configurada

## 📝 Notas Adicionais

- O collector Python coleta dados a cada 1 hora por padrão (configurável via `PULL_INTERVAL_SECONDS`)
- Os insights são calculados com base em médias, tendências e fórmulas de conforto climático
- A exportação CSV/XLSX limita a 10.000 registros por padrão
- O usuário admin é criado automaticamente na primeira inicialização da API

## 🎥 Vídeo Explicativo

**Link do vídeo:** [clique aqui](https://youtu.be/ynks-AOpCho)

---

**Desenvolvido para o desafio técnico GDASH 2025/02** 🚀