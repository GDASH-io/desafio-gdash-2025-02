# Desafio GDASH - Sistema de Coleta e Visualização de Dados Climáticos

Sistema completo de coleta, processamento e visualização de dados climáticos utilizando microserviços orquestrados com Docker Compose.

## 📋 Índice

- [🔒 Segurança](#-segurança-importante)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Setup Inicial](#setup-inicial)
- [Configuração](#configuração)
- [Executando o Sistema](#executando-o-sistema)
- [Acessando os Serviços](#acessando-os-serviços)
- [Testando o Sistema](#testando-o-sistema)
- [Modos de Operação do Collector](#modos-de-operação-do-collector)
- [Troubleshooting](#troubleshooting)

## 🔒 Segurança - IMPORTANTE

### ⚠️ Antes de Usar em Produção

Este sistema foi configurado para **desenvolvimento local** com credenciais padrão. Antes de usar em produção ou expor na internet:

1. **Altere TODAS as credenciais padrão**:

   - ✅ RabbitMQ: Altere `guest/guest` para credenciais fortes
   - ✅ JWT_SECRET: Gere uma chave aleatória segura (veja `.env.example`)
   - ✅ MongoDB: Configure autenticação se necessário

2. **URLs e Endereços**:

   - ✅ URLs `localhost` são **apenas para desenvolvimento local**
   - ✅ Em produção, use domínios próprios ou IPs seguros
   - ✅ Configure HTTPS/TLS para todas as conexões
   - ✅ Não exponha portas de banco de dados publicamente

3. **Arquivo `.env`**:

   - ✅ **NUNCA** commite o arquivo `.env` no Git (já está no `.gitignore`)
   - ✅ Use variáveis de ambiente do sistema em produção
   - ✅ Use secrets management (Docker Secrets, Kubernetes Secrets, etc)

4. **Configurações de Segurança**:
   - ✅ CORS configurado adequadamente
   - ✅ Rate limiting ativo
   - ✅ Autenticação JWT obrigatória para endpoints sensíveis
   - ✅ Validação de dados de entrada

### 📝 Sobre Endereços no README

Os endereços `localhost` documentados neste README **não são uma falha de segurança** porque:

- São apenas para desenvolvimento local
- Não expõem informações sensíveis (apenas portas padrão)
- São necessários para que desenvolvedores saibam como acessar os serviços

**Porém**, em produção você deve:

- Usar domínios próprios com HTTPS
- Não expor portas de banco de dados
- Configurar firewall adequadamente
- Usar credenciais fortes

### 🔐 Checklist de Segurança para Produção

- [ ] Alterar credenciais padrão do RabbitMQ
- [ ] Gerar JWT_SECRET seguro e aleatório
- [ ] Configurar autenticação no MongoDB
- [ ] Configurar HTTPS/TLS
- [ ] Usar domínios próprios (não localhost)
- [ ] Configurar firewall adequadamente
- [ ] Não expor portas de banco de dados publicamente
- [ ] Usar secrets management para credenciais
- [ ] Habilitar logs de segurança
- [ ] Configurar backup seguro dos dados

---

## 🏗️ Arquitetura

O sistema é composto pelos seguintes serviços:

- **MongoDB**: Banco de dados para armazenar logs climáticos
- **RabbitMQ**: Message broker para comunicação assíncrona
- **Backend (NestJS)**: API REST para receber e gerenciar dados climáticos
- **Worker (Go)**: Consome mensagens do RabbitMQ e envia para o backend
- **Collector (Python)**: Coleta dados climáticos e envia via modo `direct` ou `rabbit`
- **Frontend (React + Vite)**: Interface web para visualização dos dados

### Fluxo de Dados

```
Collector → [Modo Direct] → Backend → MongoDB
         → [Modo Rabbit] → RabbitMQ → Worker → Backend → MongoDB
```

## 📹 Vídeos Explicativos

### Versão Compacta (Recomendada - Requisito do Desafio)

**🎬 [Assistir Versão Compacta (≤ 5 minutos)](https://youtu.be/Ws1th0XdNow)**

Esta versão atende ao requisito do desafio de **máximo 5 minutos** e cobre:

- ✅ Arquitetura geral da aplicação
- ✅ Pipeline de dados (Python → Message Broker → Go → NestJS → Frontend)
- ✅ Insights de IA e funcionalidades principais
- ✅ Demonstração da aplicação rodando via Docker Compose

### Versão Completa (Detalhada)

**🎬 [Assistir Versão Completa](https://youtu.be/mO5NCcF9wMs)**

Para uma exploração mais detalhada das funcionalidades, assista à versão completa que inclui:

- 🔍 Demonstração aprofundada de cada funcionalidade
- 🔍 Detalhes da implementação dos componentes
- 🔍 Explicação técnica adicional das decisões de arquitetura
- 🔍 Demonstração completa do fluxo de dados e integrações

---

## 📦 Pré-requisitos

### Instalar Docker

#### Windows

1. Baixe o [Docker Desktop para Windows](https://www.docker.com/products/docker-desktop/)
2. Execute o instalador e siga as instruções
3. Reinicie o computador se necessário
4. Verifique a instalação:

```bash
docker --version
docker compose version
```

#### Linux (Ubuntu/Debian)

```bash
# Atualizar pacotes
sudo apt update

# Instalar dependências
sudo apt install -y ca-certificates curl gnupg lsb-release

# Adicionar chave GPG oficial do Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Adicionar repositório
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Adicionar usuário ao grupo docker (para não precisar de sudo)
sudo usermod -aG docker $USER

# Verificar instalação
docker --version
docker compose version
```

#### macOS

1. Baixe o [Docker Desktop para Mac](https://www.docker.com/products/docker-desktop/)
2. Instale arrastando para a pasta Applications
3. Abra Docker Desktop e aguarde a inicialização
4. Verifique a instalação:

```bash
docker --version
docker compose version
```

## 🚀 Setup Inicial

1. **Clone o repositório** (se ainda não tiver):

```bash
git clone <url-do-repositorio>
cd desafio-gdash
```

2. **Crie o arquivo `.env`** a partir do exemplo:

```bash
cp .env.example .env
```

3. **⚠️ IMPORTANTE: Configure o arquivo `.env`**:
   - Abra o arquivo `.env` em um editor de texto
   - Preencha **TODAS** as variáveis marcadas como `[OBRIGATÓRIO]` no `.env.example`
   - Leia os comentários no `.env.example` para entender cada variável
   - Veja a seção [Configuração](#configuração) abaixo para mais detalhes

**⚠️ ATENÇÃO**: O sistema **NÃO funcionará** sem as variáveis obrigatórias configuradas!

## ⚙️ Configuração

### 🔒 Segurança - Leia Antes de Configurar!

**⚠️ CRÍTICO**: Este sistema usa credenciais padrão apenas para desenvolvimento local. Antes de usar em produção ou expor na internet:

1. **Altere TODAS as credenciais padrão**:

   - RabbitMQ: `guest/guest` → Use credenciais fortes
   - JWT_SECRET: Gere uma chave aleatória segura (veja `.env.example`)
   - MongoDB: Configure autenticação se necessário

2. **Nunca commite o arquivo `.env`** (já está no `.gitignore`)

3. **URLs `localhost` são apenas para desenvolvimento local**:

   - Em produção, use domínios próprios ou IPs seguros
   - Configure HTTPS/TLS para todas as conexões

4. **Revise as configurações de segurança**:
   - CORS configurado adequadamente
   - Rate limiting ativo
   - Autenticação JWT obrigatória para endpoints sensíveis

### Estratégia de Configuração

**⚠️ IMPORTANTE**: Todas as variáveis críticas (credenciais, URLs de banco, etc.) **DEVEM** estar no arquivo `.env`. O `docker-compose.yml` não possui fallbacks para valores críticos por questões de segurança.

**Melhor prática**:

- ✅ **SEMPRE** crie o arquivo `.env` a partir do `.env.example` antes de executar
- ✅ O arquivo `.env` não deve ser commitado no Git (já deve estar no `.gitignore`)
- ✅ Use `.env.example` como referência completa - ele contém todas as variáveis com explicações detalhadas
- ✅ Valores no `.env` são obrigatórios para variáveis críticas (sem fallback no docker-compose.yml)
- ⚠️ **NÃO** deixe valores críticos vazios - o sistema não funcionará

### Passo a Passo de Configuração

1. **Copie o arquivo de exemplo**:

```bash
cp .env.example .env
```

2. **Edite o arquivo `.env`** com um editor de texto:

```bash
# Windows
notepad .env

# Linux/Mac
nano .env
# ou
vim .env
```

3. **Preencha TODAS as variáveis marcadas como [OBRIGATÓRIO]** no `.env.example`

4. **Revise as configurações**:
   - URLs internas (Docker): Use nomes de serviços (ex: `http://backend:3000`)
   - URLs externas (Host): Use `localhost` ou IP do host (ex: `http://localhost:3000`)
   - Credenciais: Altere valores padrão para maior segurança

### Variáveis Críticas (Obrigatórias)

As seguintes variáveis **DEVEM** estar configuradas no `.env`:

#### MongoDB

- `MONGO_URI` - URI de conexão com MongoDB (obrigatório)
  - Docker: `mongodb://mongo:27017/gdash`
  - Local: `mongodb://localhost:27017/gdash`

#### RabbitMQ

- `RABBITMQ_URL` - URL de conexão AMQP (obrigatório)
  - Docker: `amqp://guest:guest@rabbitmq:5672/` (⚠️ apenas para desenvolvimento)
  - Local: `amqp://guest:guest@localhost:5672/` (⚠️ apenas para desenvolvimento)
  - **🔒 PRODUÇÃO**: Use credenciais fortes e seguras!
- `RABBITMQ_DEFAULT_USER` - Usuário do RabbitMQ (obrigatório)
  - ⚠️ **Altere o valor padrão `guest` em produção!**
- `RABBITMQ_DEFAULT_PASS` - Senha do RabbitMQ (obrigatório)
  - ⚠️ **Altere o valor padrão `guest` em produção!**

#### Backend

- `BACKEND_URL` - URL do backend para comunicação interna (obrigatório)
  - Docker: `http://backend:3000`
  - Usado por: Worker e Collector (modo direct)

#### Frontend

- `VITE_API_URL` - URL da API acessível do navegador (obrigatório)
  - Docker: `http://localhost:3000`
  - Deve ser acessível do host (não use nomes de serviços Docker)

#### Segurança

- `JWT_SECRET` - Chave secreta para JWT (obrigatório)
  - ⚠️ **CRÍTICO**: Gere uma string aleatória segura para produção
  - **NUNCA** use valores padrão ou simples em produção
  - Veja comandos para gerar no `.env.example`

### Variáveis Opcionais

As seguintes variáveis têm valores padrão, mas podem ser customizadas:

- `MONGO_PORT` - Porta do MongoDB (padrão: 27017)
- `RABBITMQ_PORT` - Porta AMQP (padrão: 5672)
- `RABBITMQ_MANAGEMENT_PORT` - Porta da UI (padrão: 15672)
- `BACKEND_PORT` - Porta do backend (padrão: 3000)
- `FRONTEND_PORT` - Porta do frontend (padrão: 5173)
- `COLLECTOR_MODE` - Modo do collector (padrão: rabbit)
- `COLLECT_INTERVAL` - Intervalo de coleta em segundos (padrão: 60)
- `OPENWEATHER_KEY` - Chave da API OpenWeather (opcional, usa mock se vazio)

### Documentação Completa

O arquivo `.env.example` contém:

- ✅ Todas as variáveis disponíveis
- ✅ Explicações detalhadas de cada variável
- ✅ Exemplos de valores para diferentes cenários
- ✅ Notas sobre URLs internas vs externas
- ✅ Dicas de segurança e produção
- ✅ Comandos para gerar chaves seguras

**Recomendação**: Leia o `.env.example` completo antes de configurar seu `.env`!

## 🐳 Executando o Sistema

### Build e Inicialização

Para construir as imagens e iniciar todos os serviços:

```bash
docker compose up --build
```

Este comando irá:

1. Construir todas as imagens Docker necessárias
2. Criar volumes e redes
3. Iniciar os serviços na ordem correta (respeitando `depends_on`)
4. Exibir logs de todos os serviços

### Executar em Background

Para executar em modo detached (background):

```bash
docker compose up --build -d
```

### Parar os Serviços

```bash
docker compose down
```

Para remover também os volumes (apaga dados do MongoDB):

```bash
docker compose down -v
```

### Ver Logs

Ver logs de todos os serviços:

```bash
docker compose logs -f
```

Ver logs de um serviço específico:

```bash
docker compose logs -f backend
docker compose logs -f collector
docker compose logs -f worker
```

### Reiniciar um Serviço

```bash
docker compose restart backend
docker compose restart collector
```

## 🌐 Acessando os Serviços

> **⚠️ NOTA DE SEGURANÇA**: As URLs abaixo são para desenvolvimento local. Em produção, use domínios próprios com HTTPS configurado.

### Frontend

- **URL**: http://localhost:5173
- Interface web para visualizar dados climáticos coletados
- **🔒 Em produção**: Configure HTTPS e use um domínio próprio

### Backend API

- **URL Base**: http://localhost:3000
- **Health Check**: http://localhost:3000/health (público, não requer autenticação)
- **Swagger/OpenAPI**: http://localhost:3000/api (público, para documentação)
- **Endpoints Públicos**:
  - `GET /health` - Status do serviço (público)
  - `POST /auth/register` - Registrar novo usuário (público)
  - `POST /auth/login` - Fazer login (público)
- **Endpoints Protegidos** (requerem autenticação JWT):
  - **Weather** (dados climáticos):
    - `POST /weather/logs` - Criar log climático (interno, usado por collector/worker)
    - `GET /weather/logs` - Listar logs com paginação (`?page=1&limit=10&city=São Paulo`)
    - `GET /weather/insights` - Obter insights e análises dos dados
    - `GET /weather/export.csv` - Exportar dados em CSV
    - `GET /weather/export.xlsx` - Exportar dados em XLSX
  - **Users** (gerenciamento de usuários - requer admin):
    - `GET /users` - Listar usuários
    - `POST /users` - Criar usuário
    - `GET /users/:id` - Obter usuário por ID
    - `PATCH /users/:id` - Atualizar usuário
    - `DELETE /users/:id` - Deletar usuário
    - `PATCH /users/:id/password` - Alterar senha
  - **Pokemon** (dados de Pokémon):
    - `GET /pokemon` - Listar Pokémon com paginação
    - `GET /pokemon/:id` - Obter detalhes de um Pokémon
  - **StarWars** (dados de Star Wars):
    - `GET /starwars/people` - Listar personagens
    - `GET /starwars/people/:id` - Obter detalhes de personagem
    - `GET /starwars/films` - Listar filmes
    - `GET /starwars/films/:id` - Obter detalhes de filme
  - **Games** (dados de jogos):
    - `GET /games` - Listar jogos com paginação
    - `GET /games/:id` - Obter detalhes de um jogo

> **💡 Dica**: Para ver todos os endpoints com detalhes, exemplos e testá-los interativamente, acesse o Swagger em http://localhost:3000/api

### RabbitMQ Management UI

- **URL**: http://localhost:15672
- **⚠️ SEGURANÇA**: As credenciais padrão (`guest/guest`) são apenas para desenvolvimento local
- **🔒 PRODUÇÃO**: Altere as credenciais no arquivo `.env` antes de usar em produção!

**Configuração de credenciais**:

1. Edite o arquivo `.env` e altere:
   ```env
   RABBITMQ_DEFAULT_USER=seu_usuario_seguro
   RABBITMQ_DEFAULT_PASS=sua_senha_segura
   RABBITMQ_URL=amqp://seu_usuario_seguro:sua_senha_segura@rabbitmq:5672/
   ```
2. Reinicie o serviço RabbitMQ: `docker compose restart rabbitmq`

Na interface do RabbitMQ você pode:

- Ver filas e mensagens
- Monitorar conexões e canais
- Verificar estatísticas de mensagens
- Gerenciar exchanges e bindings

### MongoDB

- **Porta**: 27017 (exposta apenas para desenvolvimento local)
- **URI de conexão**: `mongodb://localhost:27017/gdash`
- **🔒 Em produção**: Configure autenticação e não exponha a porta publicamente

Para acessar via MongoDB Compass ou CLI:

```bash
mongosh mongodb://localhost:27017/gdash
```

**⚠️ Segurança**: Em produção, use autenticação:

```bash
mongosh mongodb://usuario:senha@localhost:27017/gdash?authSource=admin
```

## 🧪 Testando o Sistema

### 1. Verificar Health do Backend

```bash
curl http://localhost:3000/health
```

Resposta esperada:

```json
{ "status": "ok" }
```

### 2. Testar Criação de Log Climático (POST)

```bash
curl -X POST http://localhost:3000/weather/logs \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2025-01-24T10:00:00Z",
    "temperature": 25.5,
    "humidity": 70,
    "city": "São Paulo"
  }'
```

### 3. Listar Logs (GET)

```bash
curl http://localhost:3000/weather/logs
```

Com limite:

```bash
curl http://localhost:3000/weather/logs?limit=10
```

### 4. Testar Collector em Modo Direct

1. **Parar o collector atual** (se estiver rodando):

```bash
docker compose stop collector
```

2. **Atualizar `.env`**:

```env
COLLECTOR_MODE=direct
```

3. **Reiniciar o collector**:

```bash
docker compose up -d collector
```

4. **Verificar logs**:

```bash
docker compose logs -f collector
```

5. **Verificar dados no backend**:

```bash
curl http://localhost:3000/weather/logs
```

### 5. Testar Collector em Modo Rabbit

1. **Atualizar `.env`**:

```env
COLLECTOR_MODE=rabbit
```

2. **Reiniciar collector e worker**:

```bash
docker compose restart collector worker
```

3. **Verificar logs do collector**:

```bash
docker compose logs -f collector
```

4. **Verificar logs do worker**:

```bash
docker compose logs -f worker
```

5. **Acessar RabbitMQ UI** (http://localhost:15672):

   - Verificar fila `weather`
   - Ver mensagens sendo processadas

6. **Verificar dados no backend**:

```bash
curl http://localhost:3000/weather/logs
```

### 6. Testar Fluxo Completo

1. **Iniciar todos os serviços**:

```bash
docker compose up --build -d
```

2. **Aguardar inicialização** (30-60 segundos):

```bash
docker compose ps
```

3. **Verificar health do backend**:

```bash
curl http://localhost:3000/health
```

4. **Acessar frontend**: http://localhost:5173

5. **Aguardar coleta automática** (intervalo configurado em `COLLECT_INTERVAL`)

6. **Verificar dados no frontend** ou via API:

```bash
curl http://localhost:3000/weather/logs
```

### 7. Testar Exportação

```bash
# Exportar CSV
curl http://localhost:3000/weather/export.csv -o weather_data.csv

# Exportar XLSX
curl http://localhost:3000/weather/export.xlsx -o weather_data.xlsx
```

## 🔄 Modos de Operação do Collector

### Modo Direct

O collector envia dados diretamente para o backend via HTTP POST.

**Vantagens**:

- Simples e direto
- Não requer RabbitMQ
- Menor latência

**Desvantagens**:

- Sem retry automático em caso de falha
- Pode sobrecarregar o backend

**Configuração**:

```env
COLLECTOR_MODE=direct
```

### Modo Rabbit

O collector publica mensagens no RabbitMQ, e o worker consome e envia para o backend.

**Vantagens**:

- Desacoplamento entre collector e backend
- Retry automático via worker
- Melhor para alta carga
- Mensagens não são perdidas (persistência)

**Desvantagens**:

- Requer RabbitMQ rodando
- Maior complexidade

**Configuração**:

```env
COLLECTOR_MODE=rabbit
```

**Para alternar entre modos**:

1. Edite `.env` e altere `COLLECTOR_MODE`
2. Reinicie o collector:

```bash
docker compose restart collector
```

## 🔧 Troubleshooting

### Backend não inicia

**Problema**: Backend falha ao conectar no MongoDB

**Solução**:

1. Verifique se MongoDB está rodando:

```bash
docker compose ps mongo
```

2. Verifique a variável `MONGO_URI` no `.env`:

```env
MONGO_URI=mongodb://mongo:27017/gdash
```

3. Verifique logs:

```bash
docker compose logs backend
```

### Worker não processa mensagens

**Problema**: Mensagens ficam na fila do RabbitMQ mas não são processadas

**Solução**:

1. Verifique se worker está rodando:

```bash
docker compose ps worker
```

2. Verifique logs do worker:

```bash
docker compose logs worker
```

3. Verifique se backend está acessível:

```bash
curl http://localhost:3000/health
```

4. Verifique variável `RABBITMQ_URL` no `.env`

### Collector não envia dados

**Problema**: Collector não está coletando ou enviando dados

**Solução**:

1. Verifique logs:

```bash
docker compose logs collector
```

2. Verifique modo de operação:

```bash
docker compose exec collector env | grep COLLECTOR_MODE
```

3. Para modo `direct`, verifique se backend está acessível
4. Para modo `rabbit`, verifique se RabbitMQ está rodando

### Frontend não carrega dados

**Problema**: Frontend mostra erro ao buscar dados

**Solução**:

1. Verifique se backend está rodando:

```bash
curl http://localhost:3000/health
```

2. Verifique variável `VITE_API_URL` no `.env`:

```env
VITE_API_URL=http://localhost:3000
```

3. Verifique console do navegador (F12) para erros CORS
4. Reinicie o frontend:

```bash
docker compose restart frontend
```

### Porta já em uso

**Problema**: Erro ao iniciar serviços (porta já em uso)

**Solução**:

1. Verifique qual processo está usando a porta:

```bash
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000
```

2. Altere a porta no `.env` ou pare o processo que está usando a porta

### Limpar tudo e recomeçar

```bash
# Parar e remover containers, volumes e redes
docker compose down -v

# Remover imagens (opcional)
docker compose down --rmi all

# Limpar cache do Docker (cuidado: remove tudo)
docker system prune -a --volumes
```

## 📝 Estrutura do Projeto

```
desafio-gdash/
├── backend/              # API NestJS
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── frontend/            # Interface React + Vite
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── collector-python/    # Serviço de coleta Python
│   ├── collector.py
│   ├── Dockerfile
│   └── requirements.txt
├── worker-go/           # Worker Go para RabbitMQ
│   ├── main.go
│   ├── Dockerfile
│   └── go.mod
├── docker-compose.yml   # Orquestração dos serviços
├── .env.example         # Exemplo de variáveis de ambiente
└── README.md           # Este arquivo
```

## ✨ Funcionalidades Implementadas

### ✅ Swagger/OpenAPI

- Documentação completa da API disponível em `/api`
- Todos os endpoints documentados com exemplos
- Interface interativa para testar endpoints
- Autenticação JWT integrada na documentação

### ✅ Paginação

- API de weather logs com paginação completa
- Suporte a filtros por cidade
- Metadados de paginação (total, páginas, navegação)
- Frontend com controles de paginação

### ✅ Testes Automatizados

- Testes unitários para controllers e services
- Configuração Jest completa (backend) e Vitest (frontend)
- Cobertura de testes com thresholds mínimos (70%)
- Relatórios de cobertura integrados ao CI/CD
- Upload automático de cobertura para Codecov
- Testes executados automaticamente em cada push

### ✅ CI/CD

- Pipeline GitHub Actions configurado
- Testes automatizados no backend e frontend
- Build de imagens Docker
- Suporte a MongoDB em testes

### ✅ Dashboard Avançado

- Paginação no frontend
- Filtros por cidade
- Gráficos interativos (Chart.js)
- Insights e análises de dados
- Exportação CSV e XLSX
- Interface responsiva e moderna

### ✅ Deploy em Ambiente Gratuito

- Configuração para Railway
- Configuração para Render
- Documentação completa de deploy
- Guia passo a passo

### ✅ Sistema de Tema Claro/Escuro

- Toggle de tema polido e acessível com animações suaves
- Persistência local (localStorage) e no backend (MongoDB)
- Script anti-FOUC para evitar flash de conteúdo não estilizado
- Detecção automática da preferência do sistema (`prefers-color-scheme`)
- API REST para sincronização de preferência entre dispositivos
- Testes unitários completos (frontend e backend)

## 🚀 Deploy

### Railway (Recomendado)

Para deploy rápido no Railway, consulte:

- **[RAILWAY_SETUP.md](./RAILWAY_SETUP.md)** - Guia rápido (5 minutos)
- **[DEPLOY.md](./DEPLOY.md)** - Guia completo e detalhado

### Resumo Rápido

1. Crie projeto no Railway e conecte seu repositório GitHub
2. Adicione MongoDB (addon Railway ou MongoDB Atlas)
3. Deploy Backend: Root Directory `backend`, Start Command `npm run start:prod`
4. Deploy Frontend: Root Directory `frontend`, configure `VITE_API_URL`
5. Configure variáveis de ambiente (veja [DEPLOY.md](./DEPLOY.md))

### Variáveis Essenciais

**Backend**:

- `MONGO_URI` - Connection string do MongoDB
- `JWT_SECRET` - Chave secreta para JWT (gere com `openssl rand -base64 32`)
- `FRONTEND_URL` - URL do frontend para CORS

**Frontend**:

- `VITE_API_URL` - URL do backend

Para instruções completas, veja [DEPLOY.md](./DEPLOY.md).

## 🧪 Testes

### Executar Testes

```bash
# Backend
cd backend
npm test

# Com cobertura
npm run test:cov

# Modo watch
npm run test:watch
```

### Cobertura de Testes

O projeto possui configuração de cobertura de testes com thresholds mínimos:

- **Backend (Jest)**:

  - Threshold mínimo: 70% para branches, functions, lines e statements
  - Relatórios gerados em `backend/coverage/`
  - Visualização HTML disponível após executar `npm run test:cov`

- **Frontend (Vitest)**:

  - Threshold mínimo: 70% para lines, functions, branches e statements
  - Configuração em `frontend/vitest.config.ts`

- **Collector (Python)**:
  - Configuração pytest com cobertura em `collector-python/pytest.ini`
  - Relatórios HTML e terminais disponíveis

### CI/CD

O pipeline CI/CD executa automaticamente:

- Testes do backend com MongoDB
- Testes de cobertura do backend e frontend
- Upload de relatórios de cobertura para Codecov
- Linter do frontend
- Build do frontend
- Build de imagens Docker (apenas em push para main)

## 📚 Documentação da API

A documentação completa da API está disponível via Swagger:

1. Inicie o backend
2. Acesse: http://localhost:3000/api
3. Explore todos os endpoints
4. Teste diretamente na interface

## 🎨 Sistema de Tema Claro/Escuro

O projeto inclui suporte completo a tema claro/escuro com persistência no frontend (localStorage) e backend (MongoDB).

### 📋 Funcionalidades

- **Toggle Visual**: Botão acessível com ícones de sol/lua e animações suaves
- **Persistência Local**: Preferência salva em `localStorage` (chave: `gdash:theme`)
- **Persistência no Backend**: API REST para sincronizar preferência entre dispositivos
- **Anti-FOUC**: Script inline no `index.html` aplica o tema antes do bundle carregar
- **Detecção Automática**: Detecta preferência do sistema operacional se não houver preferência salva
- **Transições Suaves**: Animações CSS para mudanças de cor e background
- **Acessibilidade**: Suporte completo a ARIA labels, roles e navegação por teclado

### 🚀 Como Usar

#### Frontend

1. **Toggle de Tema**: O botão de tema está disponível na barra de navegação (canto superior direito)
2. **Preferência Local**: Ao alternar o tema, a preferência é salva automaticamente no `localStorage`
3. **Persistência**: A preferência persiste entre recarregamentos da página

#### Backend (API)

A API expõe endpoints para gerenciar a preferência de tema do usuário:

**Atualizar Tema do Usuário:**

```http
PUT /users/:id/theme
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "theme": "dark" | "light"
}
```

**Obter Tema do Usuário:**

```http
GET /users/:id/theme
Authorization: Bearer <JWT_TOKEN>
```

**Respostas:**

- `200 OK`: Tema atualizado/retornado com sucesso
- `400 Bad Request`: Dados inválidos (tema deve ser "light" ou "dark")
- `403 Forbidden`: Usuário só pode atualizar/consultar seu próprio tema (exceto admins)
- `404 Not Found`: Usuário não encontrado

### 🧪 Testando Localmente

#### Frontend

1. Inicie o frontend:

```bash
cd frontend
npm install
npm run dev
```

2. Abra o navegador em `http://localhost:5173`
3. Clique no botão de tema na navegação
4. Recarregue a página - o tema deve persistir
5. Abra DevTools → Application → Local Storage → Verifique `gdash:theme`

#### Backend

1. Inicie o backend:

```bash
cd backend
npm install
npm run start:dev
```

2. Teste os endpoints (requer autenticação JWT):

```bash
# Obter token (faça login primeiro)
TOKEN="seu_jwt_token"

# Atualizar tema do usuário
curl -X PUT http://localhost:3000/users/USER_ID/theme \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"theme": "dark"}'

# Obter tema do usuário
curl -X GET http://localhost:3000/users/USER_ID/theme \
  -H "Authorization: Bearer $TOKEN"
```

3. Verifique no MongoDB que o campo `theme` foi atualizado no documento do usuário

### 🧩 Estrutura dos Arquivos

#### Frontend

- `frontend/src/theme/theme.css` - Tokens CSS (custom properties) para cores
- `frontend/src/theme/theme.ts` - Utilitários TypeScript para gerenciar tema
- `frontend/src/context/ThemeProvider.tsx` - Context Provider React
- `frontend/src/components/ThemeToggle/ThemeToggle.tsx` - Componente toggle
- `frontend/src/components/ThemeToggle/ThemeToggle.test.tsx` - Testes unitários
- `frontend/index.html` - Script anti-FOUC inline

#### Backend

- `backend/src/users/schemas/user.schema.ts` - Schema com campo `theme`
- `backend/src/users/dto/update-theme.dto.ts` - DTO de validação
- `backend/src/users/users.controller.ts` - Endpoints PUT e GET `/users/:id/theme`
- `backend/src/users/users.service.ts` - Métodos `updateTheme()` e `getTheme()`
- `backend/scripts/add-theme-field.js` - Script de migração opcional

### 🔧 Configuração e Personalização

#### Customizar Cores do Tema

Edite `frontend/src/theme/theme.css` para ajustar as cores dos temas claro/escuro:

```css
[data-theme='dark'] {
  --background: 222.2 84% 4.9%; /* Ajuste conforme necessário */
  --foreground: 210 40% 98%;
  /* ... outras variáveis */
}
```

#### Desabilitar Sincronização com Sistema

No `ThemeProvider`, defina `syncWithSystem={false}`:

```tsx
<ThemeProvider syncWithSystem={false}>
  <App />
</ThemeProvider>
```

#### Desabilitar Persistência no Backend

Se você quiser usar apenas `localStorage` (sem backend):

1. Não chame os endpoints da API
2. Remova a lógica de sincronização com backend (se implementada)
3. O tema continuará funcionando apenas com `localStorage`

### 🗄️ Migração de Dados (Backend)

Se você já tem usuários no banco de dados antes de adicionar o campo `theme`, execute o script de migração:

```bash
cd backend
node scripts/add-theme-field.js
```

O script:

- Conecta ao MongoDB usando `MONGO_URI` ou `MONGODB_URI`
- Adiciona o campo `theme` (undefined) aos usuários existentes
- Não altera usuários que já possuem o campo definido

**Nota**: O script requer `dotenv` e `mongoose`. Instale se necessário:

```bash
cd backend
npm install dotenv mongoose
```

### 🔐 Segurança e Autenticação

Os endpoints de tema são protegidos com autenticação JWT:

- **PUT `/users/:id/theme`**: Requer JWT + usuário só pode atualizar próprio tema (admins podem atualizar qualquer usuário)
- **GET `/users/:id/theme`**: Requer JWT + usuário só pode consultar próprio tema (admins podem consultar qualquer usuário)

Para testar sem autenticação (apenas desenvolvimento), você precisaria remover os guards, mas **não é recomendado**.

### 📱 SSR e SEO

O script anti-FOUC no `index.html` previne o flash de conteúdo não estilizado:

- Aplica o tema **antes** do bundle React carregar
- Funciona mesmo se o JavaScript estiver desabilitado (tema inicial apenas)
- Compatível com SSR se você adaptar o script para o servidor

**Nota sobre SSR**: Para aplicações SSR completas (ex: Next.js), você precisaria adaptar o script para rodar no servidor também.

### 🧪 Executar Testes

#### Frontend

```bash
cd frontend
npm test                    # Executar testes
npm run test:ui            # Interface visual do Vitest
npm run test:coverage      # Com cobertura
```

#### Backend

```bash
cd backend
npm test                    # Executar testes
npm run test:cov           # Com cobertura
npm run test:watch         # Modo watch
```

### 📝 Notas de Deploy

#### Variáveis de Ambiente

Não são necessárias variáveis adicionais para o sistema de tema. O backend já usa `MONGO_URI` e `JWT_SECRET` existentes.

#### Build

O tema é incluído automaticamente no build:

```bash
# Frontend
cd frontend
npm run build

# O script anti-FOUC já está no index.html e será incluído no build
```

#### Migração em Produção

Se estiver deployando em produção e já há usuários:

1. Execute o script de migração antes ou depois do deploy
2. Ou configure o MongoDB para aceitar documentos sem o campo `theme` (já funciona - campo é opcional)

### 🐛 Troubleshooting

**Tema não persiste após recarregar:**

- Verifique se `localStorage` está habilitado no navegador
- Verifique no DevTools se `gdash:theme` existe no `localStorage`
- Verifique console para erros

**Flash de conteúdo branco (FOUC):**

- Verifique se o script no `index.html` está presente
- Verifique se o script está **antes** do bundle (`<script type="module">`)
- Limpe o cache do navegador (Ctrl+Shift+Delete)

**Tema não sincroniza com backend:**

- Verifique se o token JWT é válido
- Verifique se o `userId` está correto
- Verifique logs do backend para erros
- Verifique CORS se frontend e backend estão em domínios diferentes

**Botão de tema não aparece:**

- Verifique se o `ThemeToggle` está importado no componente de navegação
- Verifique se `ThemeProvider` envolve a aplicação no `main.tsx`
- Verifique console do navegador para erros

### 📚 Referências

- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)
- [ARIA Switch Role](https://www.w3.org/WAI/ARIA/apg/patterns/switch/)

## 🎯 Próximos Passos

- [ ] Adicionar monitoramento (Prometheus/Grafana)
- [ ] Adicionar cache (Redis)
- [ ] Melhorar testes E2E
- [ ] Adicionar métricas e alertas

## 📄 Licença

Este projeto é parte de um desafio técnico.

---

**Desenvolvido com ❤️ usando Docker, NestJS, React, Python e Go**
