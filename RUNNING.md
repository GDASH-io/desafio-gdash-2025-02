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

## Executando o Sistema

### Opção 1: Executar Todos os Serviços (Recomendado)

Na raiz do projeto, execute:

```bash
docker compose up -d
```

Este comando irá:
- Construir as imagens dos serviços (se necessário)
- Iniciar todos os containers em modo detached (background)
- Criar a rede Docker necessária
- Configurar volumes e dependências

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

### API REST
- **Base URL**: http://localhost:3000/api/v1
- **Documentação**: http://localhost:3000/api/v1
- **Healthcheck**: http://localhost:3000/api/v1/weather/health

### RabbitMQ Management
- **URL**: http://localhost:15672
- **Usuário padrão**: `guest`
- **Senha padrão**: `guest`

## Solução de Problemas

### Serviços não iniciam

1. Verifique se as portas estão disponíveis:
```bash
netstat -tuln | grep -E "(3000|5173|8080|8081|9092|27017)"
```

2. Verifique os logs:
```bash
docker compose logs
```

3. Reconstrua as imagens:
```bash
docker compose down
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

---

**Última atualização**: Novembro 2025

