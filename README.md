# ClimaTempo — Sistema de Observação Climática

Este repositório contém um sistema completo para coleta, processamento e visualização de dados climáticos em tempo real usando Docker Compose.

Resumo das alterações recentes
- Padrão de localização atualizado para Campinas (LATITUDE/LONGITUDE).
- Coletor Python (`data-collector/app.py`) corrigido para: ler `GEMINI_API_KEY` via variável de ambiente, remover chave embutida e parsing de resposta Gemini mais resiliente.
- Backend NestJS (`nestjs-api`) agora recebe `GEMINI_API_KEY` via `docker-compose.yml` e gera insights de IA quando a chave está configurada.
- Criado `scripts/up.sh` e `Makefile` (`make up`) que removem containers órfãos antes de subir os serviços — evita o erro "ContainerConfig" do docker-compose.
- Adicionado `.env.example` e atualizado `.gitignore` para proteger o arquivo `.env` (não commitar).

Índice
- Instalação rápida
- Variáveis de ambiente importantes
- Como rodar (recomendado)
- Debug / verificações
- Criar repositório no GitHub e subir o projeto (seguro)

---

## Instalação rápida

Pré-requisitos
- Docker Engine
- Docker Compose (ou `docker compose`) 
- Git

1) Copie o exemplo de ambiente e coloque sua chave Gemini (não commite este arquivo):

```bash
cp .env.example .env
# editar .env e colocar sua chave na linha GEMINI_API_KEY
```

2) Subir o ambiente (recomendado — usa script que remove órfãos automaticamente):

```bash
make up
```

Isso executa `scripts/up.sh` que roda `docker-compose down --remove-orphans` antes de `docker-compose up -d --build`.

Serviços principais
- Frontend: `http://localhost` (porta 80)
- API NestJS: `http://localhost:3000/api`

---

## Variáveis de ambiente (principais)

Coloque estas variáveis no seu `.env` (copie de `.env.example`).

- `GEMINI_API_KEY` — Chave da Google Generative Language (Gemini). Necessária para gerar *insights* de IA no backend.
- `REDIS_HOST`, `REDIS_PORT` — Conexão Redis (padrão para Compose: `redis:6379`).
- `MONGO_URI` — URL do MongoDB (padrão no Compose: `mongodb://mongodb:27017/clima-tempo-db`).
- `LATITUDE`, `LONGITUDE` — Coordenadas usadas pelo coletor (padrão: Campinas).

Observação: o `.env.example` foi adicionado para facilitar a configuração; não comite `.env`.

---

## Como o fluxo funciona

1. `data-collector` (Python) coleta dados da Open-Meteo e publica na fila Redis (`weather_data_queue`).
2. `go-worker` consome a fila Redis e envia cada payload para o endpoint `POST /api/weather/process` do NestJS.
3. `nestjs-api` salva o registro no MongoDB e, se `GEMINI_API_KEY` estiver configurada, gera um insight via Gemini e atualiza o registro.
4. `frontend` consome a API para exibir o dashboard e histórico.

---

## Debug / verificações úteis

- Verificar containers e status:

```bash
docker ps -a
```

- Logs dos serviços:

```bash
docker-compose logs -f nestjs-api
docker-compose logs -f data-collector
docker-compose logs -f go-worker
```

- Verificar se `GEMINI_API_KEY` está definida no container do NestJS:

```bash
docker exec -it nestjs-api printenv | grep GEMINI_API_KEY || true
```

- Verificar se `.env` está ignorado pelo Git antes de commitar:

```bash
git status --porcelain
git check-ignore -v .env
```

Se `.env` estiver sendo ignorado, `git check-ignore -v .env` mostra a regra do `.gitignore` responsável.

---

## Criar repositório GitHub e subir (comandos seguros)

Opção A — usando GH CLI (recomendado se você tiver `gh` configurado):

1. Faça login no GitHub (se necessário):

```bash
gh auth login
```

2. Criar o repositório remoto e dar push (substitua `USERNAME` e `REPO` se desejar):

```bash
# na raiz do projeto
git init
git add .
# remova .env do índice caso tenha sido adicionado por engano
git rm --cached -f .env || true
git commit -m "chore: initial commit"

# cria o repo no GitHub (substitua --public/--private conforme desejar)
gh repo create USERNAME/REPO --public --source=. --remote=origin --push
```

Opção B — sem GH CLI (manual):

1. Criar repo no GitHub via website e copie a URL `git@github.com:USERNAME/REPO.git` ou `https://github.com/USERNAME/REPO.git`.

2. Executar localmente:

```bash
git init
git add .
# garantir que .env não seja commitado
git rm --cached -f .env || true
git commit -m "chore: initial commit"
git remote add origin git@github.com:USERNAME/REPO.git
git branch -M main
git push -u origin main
```

Checagens de segurança antes do push

- Certifique-se de que `.gitignore` inclui `.env`:

```bash
grep -E "^\\.env" .gitignore || echo ".env not found in .gitignore"
```

- Verifique que `.env` não está staged:

```bash
git status --porcelain | grep ".env" || echo ".env not staged"
```

---

## Notas e recomendações

- Use `make up` sempre que for rebuildar o projeto para evitar o erro de metadados "ContainerConfig".
- Para produção, mantenha as chaves em um gerenciador de segredos (Docker secrets, AWS Secrets Manager, etc.).
- Se preferir, posso adicionar suporte para `docker compose` (v2) e checagens automáticas no script `scripts/up.sh`.

---

Se quiser, eu posso executar os passos para criar o repositório remoto usando `gh` (se estiver instalado) ou gerar um arquivo `push.sh` com os comandos prontos — diga qual opção prefere e eu preparo.

---

Desenvolvido em Dezembro de 2025
# ClimaTempo - Sistema Completo de Monitoramento Climático

Sistema integrado para coleta, processamento e visualização de dados climáticos em tempo real usando Docker Compose.

## 📋 Estrutura do Projeto

- **`nestjs-api/`** - Backend em NestJS com autenticação JWT, MongoDB e integração com Gemini AI
- **`frontend/`** - Interface React com Vite, Tailwind CSS e integração com a API
- **`data-collector/`** - Microsserviço Python que coleta dados de Open-Meteo e publica em Redis
- **`go-worker/`** - Microsserviço Go que consome dados do Redis e envia para a API
- **`docker-compose.yml`** - Orquestração de todos os serviços

## 🚀 Como Executar

### 1. Opção A: Com Docker Compose (Recomendado)

```bash
cd /home/jordao/Downloads/ClimaTempo
	# Recommended: use the safe helper to avoid stale/orphan container metadata errors
	# This runs `docker-compose down --remove-orphans` before `up --build`.
	make up
```

	If you prefer the direct command, run:

	```bash
	docker-compose up -d --build
	```

Serviços estarão disponíveis em:
- **Frontend**: http://localhost:80
- **API Backend**: http://localhost:3000/api
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

### 2. Opção B: Desenvolvimento Local

#### Backend (NestJS)
```bash
cd nestjs-api
npm install
npm run dev  # Inicia com ts-node-dev para hot reload
# ou
npm run build && npm run start:prod
```

API rodará em http://localhost:3000/api

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend rodará em http://localhost:5173

### 3. Credenciais Padrão

- **Usuário**: `admin`
- **Senha**: `password123`

## 📊 Funcionalidades

### Dashboard
- Visualização em tempo real de temperatura, velocidade do vento, latitude, código climático
- Gráfico de histórico de leituras com insights gerados por IA (Gemini)
- Exportação de dados em CSV

### Gerenciamento de Usuários
- CRUD completo (Criar, Ler, Atualizar, Deletar)
- Autenticação JWT
- Controle de roles (admin/user)
- Protegido por autenticação

### Integração PokeAPI
- Lista de Pokémon com paginação
- Protegido por autenticação JWT

## 🔧 Variáveis de Ambiente

### NestJS API
```env
MONGO_URI=mongodb://mongodb:27017/clima-tempo-db
JWT_SECRET=your-secret-key
GEMINI_API_KEY=sua-chave-api-gemini  # Opcional para insights de IA
LOG_LEVEL=info
NODE_ENV=production
PORT=3000
```

### Data Collector (Python)
```env
REDIS_HOST=redis
REDIS_PORT=6379
LATITUDE=52.52
LONGITUDE=13.40
```

### Go Worker
```env
REDIS_HOST=redis
REDIS_PORT=6379
NESTJS_API_URL=http://nestjs-api:3000/api/weather/process
```

## 📦 Dependências Principais

### NestJS API
- `@nestjs/*` - Framework NestJS
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - Autenticação JWT
- `bcrypt` - Hashing de senhas
- `axios` - Cliente HTTP para chamadas de API
- `log4js` - Logging

### Frontend
- `react` - UI library
- `tailwindcss` - CSS utilities
- `lucide-react` - Icons

### Data Collector
- `requests` - HTTP client
- `redis` - Client Redis

### Go Worker
- `github.com/go-redis/redis/v8` - Client Redis

## 🐳 Estrutura do Docker Compose

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| MongoDB | 27017 | Banco de dados |
| Redis | 6379 | Broker de mensagens |
| data-collector | N/A | Coleta de dados climáticos |
| go-worker | N/A | Processamento de dados |
| nestjs-api | 3000 | API Backend |
| frontend | 80 | Interface web |

## ✅ Verificações Realizadas

- ✅ TypeScript compilando corretamente
- ✅ Todas as dependências NPM instaladas
- ✅ Frontend built com sucesso via Vite
- ✅ Dockerfile optimizados com multi-stage builds
- ✅ Configuração de CORS habilitada
- ✅ Healthcheck configurado para a API
- ✅ Variáveis de ambiente configuradas
- ✅ Retry logic implementado para conexões

## 🔍 Troubleshooting

### Erro: "Cannot connect to MongoDB"
- Verifique se MongoDB está rodando
- Confirme a URL em `docker-compose.yml`: `mongodb://mongodb:27017/clima-tempo-db`
- Em desenvolvimento local, ajuste para: `mongodb://localhost:27017/climatempodb`

### Erro: "Redis connection refused"
- Verifique se o serviço Redis está rodando
- Confirme portas: 6379

### Erro: "Falha no login"
- Aguarde a criação automática do usuário admin (levará alguns segundos no primeiro boot)
- Verifique logs do container NestJS: `docker-compose logs nestjs-api`

### Dados não aparecem no dashboard
- Verifique se `data-collector` está coletando dados: `docker-compose logs data-collector`
- Verifique se `go-worker` está processando: `docker-compose logs go-worker`
- Confirme fila Redis: use Redis CLI para verificar `LLEN weather_data_queue`

## 📝 Logs

Ver logs de um serviço específico:
```bash
docker-compose logs -f nestjs-api   # API
docker-compose logs -f data-collector  # Coletor
docker-compose logs -f go-worker       # Worker
docker-compose logs -f frontend        # Frontend
```

## 🛑 Parar os Serviços

```bash
docker-compose down
```

Para remover volumes (dados persistentes):
```bash
docker-compose down -v
```

## 📚 Documentação das APIs

### Autenticação
```
POST /api/auth/login
Body: { "username": "admin", "password": "password123" }
Response: { "access_token": "eyJhbGciOiJIUzI1NiIs..." }
```

### Clima
```
POST /api/weather/process (PUBLIC)
GET /api/weather (PROTEGIDO)
GET /api/weather/export (PROTEGIDO)
```

### Usuários
```
POST /api/users (ADMIN)
GET /api/users (ADMIN)
PUT /api/users/:id (ADMIN)
DELETE /api/users/:id (ADMIN)
```

### PokeAPI
```
GET /api/pokeapi?limit=20&offset=0 (PROTEGIDO)
```

### Health Check
```
GET /health
```

## 🤝 Contribuindo

Sinta-se livre para fazer fork e enviar pull requests.

## 📄 Licença

Este projeto é de código aberto e pode ser usado livremente.

---

**Desenvolvido em December 2025** com ❤️
