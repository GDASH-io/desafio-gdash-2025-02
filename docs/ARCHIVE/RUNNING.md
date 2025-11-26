# Guia de Execução do Sistema GDASH

Este documento contém instruções detalhadas sobre como executar o sistema GDASH e quais serviços serão iniciados.

## Pré-requisitos

Antes de executar o sistema, certifique-se de ter instalado:

- **Docker** (versão 20.10 ou superior)
- **Docker Compose** (versão 2.0 ou superior)
- **Git** (para clonar o repositório)

Para verificar as versões instaladas:

```bash
docker --version
docker compose version
git --version
```

## Iniciando o Docker Daemon

**IMPORTANTE:** Antes de executar os serviços, você precisa garantir que o Docker daemon está rodando.

### Verificar se o Docker está rodando

```bash
docker ps
```

Se você receber o erro:
```
Cannot connect to the Docker daemon at unix:///home/dir/.docker/desktop/docker.sock. 
Is the docker daemon running?
```

### Como iniciar o Docker

#### Linux (Docker Desktop)
1. Abra o Docker Desktop
2. Aguarde até que o ícone do Docker apareça na barra de tarefas
3. Verifique se está rodando: `docker ps`

#### Linux (Docker Engine - systemd)
```bash
# Iniciar o serviço Docker
sudo systemctl start docker

# Habilitar para iniciar automaticamente
sudo systemctl enable docker

# Verificar status
sudo systemctl status docker
```

#### Windows/Mac
- Abra o Docker Desktop
- Aguarde a inicialização completa
- Verifique se está rodando: `docker ps`

### Verificar se o Docker está funcionando

```bash
# Deve retornar informações sobre o Docker
docker info

# Deve listar containers (pode estar vazio)
docker ps
```

## Executando o Sistema

### ⚠️ IMPORTANTE: Por que demora na primeira vez?

Na **primeira execução**, o Docker precisa:

1. **Baixar imagens grandes** (pode levar 5-15 minutos):
   - Zookeeper (~200MB)
   - Kafka (~500MB)
   - MongoDB (~200MB)
   - RabbitMQ (~100MB)
   - Node.js base (~150MB)
   - Nginx (~50MB)

2. **Buildar os serviços** (pode levar 3-10 minutos):
   - API NestJS (instalar dependências + build)
   - Frontend React (instalar dependências + build)
   - Collector Python (instalar dependências)
   - Worker Go (compilar)

**Total estimado na primeira vez: 10-25 minutos** dependendo da sua conexão e hardware.

**Nas próximas vezes será muito mais rápido** (30 segundos - 2 minutos) porque as imagens já estão em cache.

### Opção 1: Executar Todos os Serviços (Recomendado)

**Passo a passo:**

1. **Certifique-se de estar na raiz do projeto:**
   ```bash
   cd /caminho/para/desafio-gdash-2025-02
   ```

2. **Verifique se o Docker está rodando:**
   ```bash
   docker ps
   ```
   
   Se der erro, **inicie o Docker Desktop** primeiro!

3. **Execute o Docker Compose:**
   ```bash
   docker compose up -d
   ```

Este comando irá:
- Construir as imagens dos serviços (se necessário)
- Iniciar todos os containers em modo detached (background)
- Criar a rede Docker necessária
- Configurar volumes e dependências
- **Executar seed automático** do usuário admin

**Aguarde 1-2 minutos** para todos os serviços iniciarem completamente.

**Dica:** Para ver o progresso em tempo real:
```bash
docker compose up
```
(Isso mostra os logs e você pode ver o que está acontecendo)

### Opção 2: Executar com Build Forçado

Se você fez alterações no código e precisa reconstruir as imagens:

```bash
docker compose up --build -d
```

### Opção 3: Executar e Ver Logs

Para ver os logs em tempo real:

```bash
docker compose up
```

Pressione `Ctrl+C` para parar os serviços.

### Opção 4: Executar Serviços Específicos

Você pode iniciar apenas os serviços que precisa:

```bash
# Apenas infraestrutura (Zookeeper, Kafka, MongoDB, RabbitMQ)
docker compose up -d zookeeper kafka mongodb rabbitmq

# Apenas API e Frontend
docker compose up -d api frontend

# Apenas Collector e Worker
docker compose up -d collector worker
```

## Executando Serviços Individualmente

Se você precisar rodar apenas um serviço específico, você pode usar os seguintes comandos:

### 1. Zookeeper

```bash
docker compose up -d zookeeper
```

### 2. Kafka (requer Zookeeper)

```bash
# Primeiro inicie o Zookeeper
docker compose up -d zookeeper

# Depois inicie o Kafka
docker compose up -d kafka
```

### 3. MongoDB

```bash
docker compose up -d mongodb
```

### 4. RabbitMQ

```bash
docker compose up -d rabbitmq
```

### 5. API (NestJS) - Requer MongoDB

```bash
# Primeiro inicie o MongoDB
docker compose up -d mongodb

# Depois inicie a API
docker compose up -d api
```

### 6. Collector (Python) - Requer Kafka

```bash
# Primeiro inicie Zookeeper e Kafka
docker compose up -d zookeeper kafka

# Depois inicie o Collector
docker compose up -d collector
```

### 7. Worker (Go) - Requer Kafka e API

```bash
# Primeiro inicie Zookeeper, Kafka e API
docker compose up -d zookeeper kafka mongodb api

# Depois inicie o Worker
docker compose up -d worker
```

### 8. Frontend (React) - Requer API

```bash
# Primeiro inicie MongoDB e API
docker compose up -d mongodb api

# Depois inicie o Frontend
docker compose up -d frontend
```

### Ordem Recomendada para Iniciar Serviços Individualmente

Se você quiser iniciar tudo manualmente, siga esta ordem:

```bash
# 1. Infraestrutura base
docker compose up -d zookeeper
docker compose up -d kafka
docker compose up -d mongodb
docker compose up -d rabbitmq

# 2. Aguarde alguns segundos para os serviços iniciarem
sleep 5

# 3. API (depende de MongoDB)
docker compose up -d api

# 4. Aguarde a API iniciar
sleep 3

# 5. Collector e Worker (dependem de Kafka)
docker compose up -d collector worker

# 6. Frontend (depende de API)
docker compose up -d frontend
```

## Serviços Executados

O sistema GDASH é composto pelos seguintes serviços:

### 1. **Zookeeper**
- **Container**: `gdash-zookeeper`
- **Porta**: `2181`
- **Imagem**: `confluentinc/cp-zookeeper:7.5.0`
- **Descrição**: Serviço de coordenação distribuída necessário para o Kafka
- **Status**: Serviço de infraestrutura (não acessível diretamente)

### 2. **Kafka**
- **Container**: `gdash-kafka`
- **Portas**: `9092` (externo), `9093` (interno)
- **Imagem**: `confluentinc/cp-kafka:7.5.0`
- **Descrição**: Message broker para comunicação assíncrona entre serviços
- **Tópicos**:
  - `ana.raw.readings` - Leituras brutas do collector
  - `ana.processed.readings` - Leituras processadas pelo worker
- **Status**: Serviço de infraestrutura

### 3. **MongoDB**
- **Container**: `gdash-mongodb`
- **Porta**: `27017`
- **Imagem**: `mongo:6`
- **Descrição**: Banco de dados NoSQL para armazenar logs de clima e insights
- **Credenciais**:
  - Usuário: `root`
  - Senha: `root`
  - Database: `gdash`
- **Status**: Serviço de infraestrutura

### 4. **RabbitMQ**
- **Container**: `gdash-rabbitmq`
- **Portas**: `5672` (AMQP), `15672` (Management UI)
- **Imagem**: `rabbitmq:3-management`
- **Descrição**: Message broker alternativo (não utilizado atualmente)
- **Management UI**: http://localhost:15672
- **Status**: Serviço de infraestrutura (opcional)

### 5. **Collector (Python)**
- **Container**: `gdash-collector`
- **Porta**: `8080` (healthcheck)
- **Build**: `./colletor-python`
- **Descrição**: Coleta dados climáticos da API Open-Meteo e publica no Kafka
- **Healthcheck**: http://localhost:8080/healthz
- **Variáveis de Ambiente**:
  - `KAFKA_BOOTSTRAP_SERVERS`: `kafka:9093`
  - `LATITUDE`: `-19.5186` (Coronel Fabriciano)
  - `LONGITUDE`: `-42.6289`
  - `COLLECT_INTERVAL_SECONDS`: `3600` (1 hora)
- **Status**: Serviço ativo

### 6. **Worker (Go)**
- **Container**: `gdash-worker`
- **Porta**: `8081` (healthcheck)
- **Build**: `./worker-go`
- **Descrição**: Processa mensagens do Kafka, calcula métricas PV e envia para a API
- **Healthcheck**: http://localhost:8081/healthz
- **Variáveis de Ambiente**:
  - `KAFKA_BOOTSTRAP_SERVERS`: `kafka:9093`
  - `API_URL`: `http://api:3000`
  - `KAFKA_TOPIC_RAW`: `ana.raw.readings`
  - `KAFKA_TOPIC_PROCESSED`: `ana.processed.readings`
- **Status**: Serviço ativo

### 7. **API (NestJS)**
- **Container**: `gdash-api`
- **Porta**: `3000`
- **Build**: `./api-nest`
- **Descrição**: API REST para gerenciar dados climáticos, usuários e insights de IA
- **Base URL**: http://localhost:3000/api/v1
- **Healthcheck**: http://localhost:3000/api/v1/weather/health
- **Variáveis de Ambiente**:
  - `MONGO_URL`: `mongodb://root:root@mongodb:27017/gdash?authSource=admin`
  - `JWT_SECRET`: `changeme` (alterar em produção)
  - `PORT`: `3000`
- **Status**: Serviço ativo

### 8. **Frontend (React)**
- **Container**: `gdash-frontend`
- **Porta**: `5173`
- **Build**: `./frontend-react`
- **Descrição**: Interface web do dashboard com gráficos e visualizações
- **URL**: http://localhost:5173
- **Credenciais Padrão**:
  - Email: `admin@example.com`
  - Senha: `123456`
- **Status**: Serviço ativo

## Verificando o Status dos Serviços

### Ver Status de Todos os Containers

```bash
docker compose ps
```

### Ver Logs de um Serviço Específico

```bash
# Logs do collector
docker compose logs collector

# Logs do worker
docker compose logs worker

# Logs da API
docker compose logs api

# Logs do frontend
docker compose logs frontend

# Seguir logs em tempo real
docker compose logs -f collector
```

### Verificar Healthchecks

```bash
# Collector
curl http://localhost:8080/healthz

# Worker
curl http://localhost:8081/healthz

# API
curl http://localhost:3000/api/v1/weather/health
```

## Executar Seed de Usuários

Se você não conseguir fazer login, o usuário admin pode não ter sido criado. Execute o seed manualmente:

```bash
# Com os serviços rodando
docker compose exec api node dist/database/seed/users.seed.js
```

Isso criará o usuário admin com as credenciais:
- Email: `admin@example.com`
- Senha: `123456`

**Nota:** O seed é idempotente - pode ser executado várias vezes sem problemas. Se o usuário já existir, ele apenas mostrará uma mensagem informando.

## Executando Testes

O projeto inclui um script de teste completo que verifica todos os serviços:

```bash
./test-system-complete.sh
```

Este script testa:
- Healthchecks de todos os serviços
- Autenticação (login)
- Endpoints de weather logs
- Novos endpoints (precipitação 24h)
- Insights de IA
- Usuários
- Exportação (CSV/XLSX)
- Verificação de dados

## Parando o Sistema

### Parar Todos os Serviços

```bash
docker compose down
```

### Parar e Remover Volumes

```bash
docker compose down -v
```

**Atenção**: Isso remove todos os dados do MongoDB!

### Parar um Serviço Específico

```bash
docker compose stop collector
docker compose stop worker
```

## Reiniciando Serviços

### Reiniciar Todos os Serviços

```bash
docker compose restart
```

### Reiniciar um Serviço Específico

```bash
docker compose restart collector
docker compose restart worker
docker compose restart api
```

### Reconstruir e Reiniciar um Serviço

```bash
docker compose up -d --build collector
docker compose up -d --build worker
docker compose up -d --build api
docker compose up -d --build frontend
```

## Acessando os Serviços

### Frontend Dashboard
- **URL**: http://localhost:5173
- **Login**: `admin@example.com` / `123456`
- **Nota:** Se o login não funcionar, execute o seed manualmente (veja seção "Executar Seed de Usuários")

### API REST
- **Base URL**: http://localhost:3000/api/v1
- **Documentação**: http://localhost:3000/api/v1
- **Healthcheck**: http://localhost:3000/api/v1/weather/health

### RabbitMQ Management
- **URL**: http://localhost:15672
- **Usuário padrão**: `guest`
- **Senha padrão**: `guest`

## Solução de Problemas

### Erro: "Cannot connect to the Docker daemon"

**Sintoma:**
```
Cannot connect to the Docker daemon at unix:///home/wilker/.docker/desktop/docker.sock. 
Is the docker daemon running?
```

**Solução:**

1. **Verifique se o Docker está instalado:**
   ```bash
   docker --version
   ```

2. **Inicie o Docker Desktop** (Linux/Windows/Mac):
   - Abra o Docker Desktop
   - Aguarde a inicialização completa (pode levar 30-60 segundos)
   - Verifique o ícone na barra de tarefas (deve estar verde/ativo)
   - **IMPORTANTE:** O Docker Desktop DEVE estar rodando antes de executar `docker compose`

3. **Ou inicie o serviço Docker** (Linux com systemd):
   ```bash
   sudo systemctl start docker
   sudo systemctl status docker
   ```

4. **Verifique se está funcionando:**
   ```bash
   docker ps
   ```

5. **Se ainda não funcionar, verifique permissões** (Linux):
   ```bash
   # Adicione seu usuário ao grupo docker
   sudo usermod -aG docker $USER
   
   # Faça logout e login novamente, ou execute:
   newgrp docker
   ```

### Erro no Login: "Usuário não encontrado" ou "Credenciais inválidas"

**Causa:** O seed de usuários não foi executado automaticamente.

**Solução:**

1. **Verifique se o seed foi executado:**
   ```bash
   docker compose logs api | grep -i seed
   ```
   
   Você deve ver: `Usuário admin@example.com criado com sucesso!` ou `Usuário admin@example.com já existe`

2. **Se não aparecer, execute o seed manualmente:**
   ```bash
   docker compose exec api node dist/database/seed/users.seed.js
   ```

3. **Ou recrie o container da API:**
   ```bash
   docker compose restart api
   docker compose logs -f api
   ```
   
   Aguarde ver a mensagem de seed executado.

4. **Credenciais padrão:**
   - Email: `admin@example.com`
   - Senha: `123456`

### Por que demora na primeira vez?

**Na primeira execução**, o Docker precisa:

1. **Baixar imagens grandes** (5-15 minutos):
   - Zookeeper (~200MB)
   - Kafka (~500MB)
   - MongoDB (~200MB)
   - RabbitMQ (~100MB)
   - Node.js base (~150MB)
   - Nginx (~50MB)

2. **Buildar os serviços** (3-10 minutos):
   - API NestJS (instalar dependências + build)
   - Frontend React (instalar dependências + build)
   - Collector Python (instalar dependências)
   - Worker Go (compilar)

**Total estimado na primeira vez: 10-25 minutos** dependendo da sua conexão e hardware.

**Nas próximas vezes será muito mais rápido** (30 segundos - 2 minutos) porque as imagens já estão em cache.

**Dica:** Para ver o progresso em tempo real:
```bash
docker compose up
```
Isso mostra todos os logs e você pode ver exatamente onde está travando.

### Serviços não iniciam

1. **Verifique se o Docker está rodando:**
   ```bash
   docker ps
   ```

2. **Verifique se as portas estão disponíveis:**
   ```bash
   # Linux
   netstat -tuln | grep -E "(3000|5173|8080|8081|9092|27017)"
   
   # Ou use ss
   ss -tuln | grep -E "(3000|5173|8080|8081|9092|27017)"
   ```

3. **Verifique os logs:**
   ```bash
   docker compose logs
   ```

4. **Reconstrua as imagens:**
   ```bash
   docker compose down
   docker compose up --build -d
   ```

5. **Limpe tudo e recomece:**
   ```bash
   docker compose down -v
   docker compose up --build -d
   ```

### Kafka não conecta

1. Verifique se Zookeeper está rodando:
```bash
docker compose ps zookeeper
```

2. Aguarde alguns segundos para o Kafka inicializar completamente

3. Verifique os logs:
```bash
docker compose logs kafka
```

### MongoDB não conecta

1. Verifique se o container está rodando:
```bash
docker compose ps mongodb
```

2. Verifique os logs:
```bash
docker compose logs mongodb
```

3. Se necessário, recrie o volume:
```bash
docker compose down -v
docker compose up -d mongodb
```

### Collector/Worker não conectam ao Kafka

Os serviços agora têm retry automático. Se ainda falharem:

1. Verifique se o Kafka está pronto:
```bash
docker compose logs kafka | tail -20
```

2. Reinicie o serviço:
```bash
docker compose restart collector
docker compose restart worker
```

## Variáveis de Ambiente

As variáveis de ambiente podem ser configuradas através de arquivos `.env` em cada serviço ou diretamente no `docker-compose.yml`.

### Variáveis Importantes

- `LATITUDE` / `LONGITUDE`: Coordenadas para coleta de dados
- `COLLECT_INTERVAL_SECONDS`: Intervalo de coleta (padrão: 3600s = 1 hora)
- `JWT_SECRET`: Chave secreta para tokens JWT (alterar em produção!)
- `MONGO_URL`: String de conexão do MongoDB

## Ordem de Inicialização

Os serviços são iniciados na seguinte ordem (devido a dependências):

1. **Zookeeper** → Base para Kafka
2. **Kafka** → Depende de Zookeeper
3. **MongoDB** → Banco de dados
4. **RabbitMQ** → Message broker alternativo
5. **API** → Depende de MongoDB
6. **Collector** → Depende de Kafka
7. **Worker** → Depende de Kafka e API
8. **Frontend** → Depende de API

O Docker Compose gerencia essas dependências automaticamente através do `depends_on`.

## Documentação Adicional

- **README.md**: Visão geral do projeto
- **docs/**: Documentação detalhada de cada fase
- **docs/system-architecture.md**: Arquitetura do sistema
- **docs/Endpoints.md**: Documentação da API

## Suporte

Em caso de problemas:

1. Verifique os logs: `docker compose logs`
2. Execute o script de teste: `./test-system-complete.sh`
3. Consulte a documentação em `docs/`
4. Verifique se todos os pré-requisitos estão instalados

## Comandos Úteis

### Ver todos os containers (rodando e parados)
```bash
docker compose ps -a
```

### Ver logs de todos os serviços
```bash
docker compose logs
```

### Ver logs de um serviço específico
```bash
docker compose logs [nome-do-servico]
```

### Parar todos os serviços
```bash
docker compose down
```

### Parar e remover volumes (apaga dados)
```bash
docker compose down -v
```

### Reconstruir um serviço específico
```bash
docker compose build [nome-do-servico]
docker compose up -d [nome-do-servico]
```

### Limpar tudo (containers, volumes, imagens)
```bash
# CUIDADO: Isso remove TUDO, incluindo dados
docker compose down -v --rmi all
```

### Verificar uso de recursos
```bash
docker stats
```

### Entrar em um container
```bash
docker compose exec [nome-do-servico] sh
# ou
docker compose exec [nome-do-servico] bash
```

### Exemplos de acesso a containers
```bash
# Acessar MongoDB
docker compose exec mongodb mongosh -u root -p root

# Acessar API
docker compose exec api sh

# Acessar Collector
docker compose exec collector sh
```

---

**Última atualização**: Novembro 2025

