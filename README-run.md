# Como executar o desafio (passo a passo em Português)

## 0) Pré-requisitos (o que instalar)
- Docker (https://docs.docker.com/get-docker/)
- Docker Compose (incluso nas versões recentes do Docker Desktop)
- Node.js 18+ (para frontend e backend)
- pnpm ou npm (recomendado: pnpm)
- Go 1.20+ (para o worker)
- Python 3.10+ e pip
- (Opcional) MongoDB Compass para inspecionar o banco localmente

## 1) Preparar ambiente
1. Extraia o zip em uma pasta local.
2. Copie `.env.example` para `.env` na raiz:
   ```
   cp .env.example .env
   ```
   Abra `.env` e verifique variáveis como `MONGO_INITDB_ROOT_USERNAME`, `RABBITMQ_DEFAULT_USER`, etc.

## 2) Subir infraestrutura com Docker Compose
Na raiz do projeto:
```
docker compose up --build
```
Serviços que o `docker-compose.yml` inicia:
- mongo (porta 27017)
- rabbitmq (porta 5672, management 15672)
- api (placeholder, porta 3000)
- frontend (placeholder, porta 5173)
- python-producer (opcional, pode rodar localmente ou dentro do container)
- go-worker (opcional, pode rodar localmente ou dentro do container)

## 3) Rodar o coletor Python (produtor)
Exemplo local:
```
cd python-producer
python -m venv .venv
source .venv/bin/activate   # Linux/Mac
.venv\Scripts\activate    # Windows
pip install -r requirements.txt
python producer.py
```
O `producer.py` é um exemplo que busca dados do Open-Meteo e publica mensagens JSON na fila RabbitMQ.

## 4) Rodar o worker Go
Exemplo local:
```
cd go-worker
go run main.go
```
O worker consome da fila, faz validações básicas e faz POST para a API NestJS (`/api/weather/logs`).

## 5) Backend NestJS (instruções rápidas)
- Entre em `backend/` e siga as instruções locais (instalar deps, rodar `npm run start:dev`).
- Implemente endpoints:
  - POST `/api/weather/logs`
  - GET `/api/weather/logs`
  - GET `/api/weather/export.csv`
  - GET `/api/weather/export.xlsx`
  - Auth e CRUD de usuários

## 6) Frontend (React + Vite)
- Entre em `frontend/`
- `pnpm install` (ou npm install)
- `pnpm dev` para rodar localmente
- Implementar Dashboard, login, CRUD de usuários e botões de exportação.

## 7) Variáveis importantes
Veja `.env.example`.

## 8) Dicas de desenvolvimento
- Desenvolva cada serviço separadamente (Docker Compose facilita montar infra).
- Use MongoDB Atlas se preferir não rodar localmente.
- Para IA: pode ser um endpoint que consome dados históricos e gera resumo com OpenAI/transformers/local model.
- Faça a autenticação com JWT e crie usuário padrão ao iniciar a API.

## 9) Checklist de entrega
- Código no GitHub em branch com seu nome
- Vídeo explicativo (<=5 minutos) no YouTube não listado
- README detalhado + .env.example
- docker-compose funcional

## Problemas comuns
- Erro de conexão com RabbitMQ: verifique usuário/senha e host/porta no `.env`.
- Permissões do Docker: rode com sudo quando necessário (Linux).

