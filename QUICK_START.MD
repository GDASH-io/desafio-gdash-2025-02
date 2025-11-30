# 🚀 Quick Start Guide - GDASH Weather App

Este guia fornece instruções rápidas para executar a aplicação completa de monitoramento climático com integração de IA.

## 📋 Pré-requisitos

- **Docker** e **Docker Compose** instalados
- **Git** para clonar o repositório

---

## 🐳 Como rodar tudo via Docker Compose

A maneira mais simples de executar toda a aplicação é usando Docker Compose, que orquestra todos os serviços automaticamente.

### 1. Configure as variáveis de ambiente (opcional)

Edite o arquivo `docker-compose.yml` para configurar:

**API Keys de IA (para geração de insights):**
```yaml
# No serviço 'api'
environment:
  OPENAI_API_KEY: your_openai_api_key_here
  FALLBACK_GEMINI_API_KEY: your_gemini_api_key_here
  JWT_SECRET: sua_chave_jwt_aqui
```

**Localização e intervalo de coleta de dados climáticos:**
```yaml
# No serviço 'producer'
environment:
  LONG: -46.53632098751176  # Longitude da sua cidade
  LAT: -22.970198162589284  # Latitude da sua cidade
  INTERVAL_SECONDS: 60      # Intervalo de coleta em segundos (padrão: 60s = 1 minuto)
  TIMEZONE: America/Sao_Paulo # Configuração do Timezone que será utilizado pela API
```

> 📊 **Pipeline de Dados**: Por padrão, a pipeline está configurada para coletar dados climáticos a cada **1 minuto** (`INTERVAL_SECONDS: 60`). Você pode modificar esse intervalo alterando a variável `INTERVAL_SECONDS` no `docker-compose.yml` de acordo com suas necessidades (ex: 120 para 2 minutos, 300 para 5 minutos, etc.).

### 2. Configure os volumes do MongoDB (opcional, mas recomendado)

Para iniciar o aplicativo com dados pré-configurados (usuário ADMIN e dados climáticos), siga os passos abaixo:

1. **Acesse a pasta ROOT** do projeto
2. **Baixe os volumes do MongoDB** neste link: [Download MongoDB Volumes](https://drive.google.com/drive/folders/1c1OtP8h-B-q4Gf6i4jDWzW845AgE6Rp2?usp=sharing)
3. **Após baixar**, cole a pasta do volume na raiz do projeto
       - Ficará assim a estrutura de pastas:
              - api
              - consumer
              - fe
              - producer
              - temp_data
4. Com o volume do MongoDB configurado, você pode iniciar o aplicativo normalmente

**⚠️ Observação importante:**

O download dos volumes do MongoDB **NÃO É OBRIGATÓRIO**. Você pode iniciar o projeto sem eles, mas:
- O app iniciará sem nenhum dado no banco de dados
- Você precisará aguardar a pipeline de dados popular o DB automaticamente
- Levará algum tempo até que dados climáticos sejam coletados e exibidos

### 3. Inicie todos os serviços

```bash
docker-compose up --build -d
```

Este comando irá:
- ✅ Criar e iniciar o **MongoDB**
- ✅ Criar e iniciar o **RabbitMQ**
- ✅ Criar e iniciar o **Producer** (Python)
- ✅ Criar e iniciar a **API** (NestJS)
- ✅ Criar e iniciar o **Consumer** (Go)
- ✅ Criar e iniciar o **Frontend** (React + Vite)

### 4. Acompanhe os logs

```bash
# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f api
docker-compose logs -f producer
docker-compose logs -f consumer
docker-compose logs -f frontend
```

### 5. Parar todos os serviços

```bash
# Parar sem remover containers
docker-compose stop

# Parar e remover containers
docker-compose down

# Parar, remover containers e volumes (limpa dados do banco)
docker-compose down -v
```

---

## 🐍 Como rodar o serviço Python (Producer)

O **Producer** é responsável por coletar dados climáticos da API Open-Meteo e enviar para o RabbitMQ.

### Executando via Docker (recomendado)

```bash
cd producer
docker build -t weather-producer .
docker run --rm \
  -e INTERVAL_SECONDS=60 \
  -e RABBITMQ_HOST=rabbitmq \
  -e RABBITMQ_PORT=5672 \
  -e RABBITMQ_USER=admin \
  -e RABBITMQ_PASS=admin123 \
  -e QUEUE_NAME=weather_data \
  -e LONG=-46.53632098751176 \
  -e LAT=-22.970198162589284 \
  --network desafio-gdash-2025-02_app-network \
  weather-producer
```

Ou

```bash
docker compose up producer -d
```


**Variáveis de ambiente disponíveis:**
- `INTERVAL_SECONDS`: Intervalo entre coletas (padrão: 60s)
- `RABBITMQ_HOST`: Host do RabbitMQ
- `RABBITMQ_PORT`: Porta do RabbitMQ (padrão: 5672)
- `RABBITMQ_USER`: Usuário do RabbitMQ
- `RABBITMQ_PASS`: Senha do RabbitMQ
- `QUEUE_NAME`: Nome da fila (padrão: weather_data)
- `LONG`: Longitude da localização
- `LAT`: Latitude da localização
- `OPENWEATHER_API_URL`: URL da API de clima

---

## 🐹 Como rodar o worker Go (Consumer)

O **Consumer** processa mensagens da fila RabbitMQ e envia os dados para a API NestJS.

### Executando via Docker (recomendado)

```bash
cd consumer
docker build -t weather-consumer .
docker run --rm \
  -e RABBITMQ_URL=amqp://admin:admin123@rabbitmq:5672/ \
  -e NESTJS_API=http://api:3000/weather \
  -e QUEUE_NAME=weather_data \
  --network desafio-gdash-2025-02_app-network \
  weather-consumer
```

Ou

```bash
docker compose up consumer -d
```


**Variáveis de ambiente disponíveis:**
- `RABBITMQ_URL`: URL de conexão do RabbitMQ (formato: `amqp://user:pass@host:port/`)
- `NESTJS_API`: URL da API NestJS para enviar dados
- `QUEUE_NAME`: Nome da fila para consumir (padrão: weather_data)


---

## 🌐 URLs principais

Após iniciar todos os serviços com Docker Compose, acesse:

### 🎨 Frontend (React + Vite)
- **URL**: http://localhost:4173
- **Descrição**: Dashboard principal com visualizações de dados climáticos, insights de IA, gestão de usuários e integração com API pública

**Credenciais padrão:**
- Email: `admin@gmail.com`
- Senha: `admin123`

### 🚀 API Backend (NestJS)
- **URL Base**: http://localhost:3000
- **Health Check**: http://localhost:3000/health


### 🐰 RabbitMQ Management
- **URL**: http://localhost:15672
- **Usuário**: `admin`
- **Senha**: `admin123`
- **Descrição**: Interface de gerenciamento do RabbitMQ para monitorar filas, conexões e mensagens

### 🍃 MongoDB
- **Host**: localhost
- **Porta**: 27017
- **Usuário**: `admin`
- **Senha**: `admin123`
- **Database**: `gdash`
- **Connection String**: `mongodb://admin:admin123@localhost:27017/gdash?authSource=admin`

---

## 🏗️ Arquitetura da aplicação

```
┌─────────────┐
│  Frontend   │ (React + Vite + Tailwind)
│  :4173      │ http://localhost:4173
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  API NestJS │ (Backend + MongoDB)
│  :3000      │ http://localhost:3000
└──────▲──────┘
       │
       │ HTTP POST /weather
       │
┌──────┴──────┐
│  Consumer   │ (Go Worker)
│   (Go)      │
└──────|──────┘
       │
       │ Consume messages
       │
┌──────▼──────┐
│  RabbitMQ   │ (Message Broker)
│  :5672      │ amqp://localhost:5672
│  :15672     │ http://localhost:15672 (UI)
└──────▲──────┘
       │
       │ Publish messages
       │
┌──────┴──────┐
│  Producer   │ (Python)
│  (Python)   │ Coleta dados da API Open-Meteo
└─────────────┘
       │
       ▼
┌─────────────┐
│ Open-Meteo  │ (API Externa)
│  API        │ https://open-meteo.com
└─────────────┘
```

**Fluxo de dados:**
1. 🐍 **Producer** (Python) coleta dados climáticos da API Open-Meteo a cada 60 segundos
2. 📨 Publica mensagem na fila `weather_data` do **RabbitMQ**
3. 🐹 **Consumer** (Go) consome mensagem da fila
4. 📤 Envia dados via HTTP POST para a **API NestJS**
5. 💾 **API** armazena no **MongoDB** e processa com IA (OpenAI/Gemini)
6. 🎨 **Frontend** consulta API e exibe dashboard com gráficos e insights

---

## 🧪 Executando testes

### Testes da API (NestJS)

```bash
cd api

# Instalar dependências
npm install

# Executar todos os testes
npm test
```

---

## 🔒 Segurança da API

A API implementa múltiplas camadas de segurança para proteger os dados e garantir comunicação segura:

### Headers de Segurança (Helmet)
A API utiliza o **Helmet** para configurar automaticamente headers de segurança HTTP que protegem contra vulnerabilidades comuns:
- **X-Content-Type-Options**: Previne MIME-sniffing attacks
- **X-Frame-Options**: Protege contra clickjacking
- **Strict-Transport-Security**: Força comunicação HTTPS
- **X-XSS-Protection**: Proteção adicional contra ataques XSS
- **Content-Security-Policy**: Controla recursos que podem ser carregados

### Autenticação JWT
- Tokens **JWT (JSON Web Tokens)** para autenticação stateless
- Tokens assinados com chave secreta configurável via `JWT_SECRET`
- Expiração configurável para renovação periódica
- Guards personalizados protegem rotas sensíveis

### CORS Configurado
- CORS habilitado com controle de origens permitidas
- Headers de segurança incluídos na lista de headers permitidos
- Controle de métodos HTTP permitidos (GET, POST, PUT, DELETE, PATCH)
- Credentials habilitados para autenticação cross-origin

### Validação de Entrada
- **ValidationPipe** global para validação automática de DTOs
- Validações com `class-validator` em todos os endpoints
- Sanitização automática de dados de entrada
- Transformação de tipos para garantir integridade

### Tratamento de Erros
- Filtros de exceção personalizados
- Mensagens de erro sanitizadas (não expõem detalhes internos)
- Logging estruturado de erros para auditoria

### Rate Limiting
- Rate limiting pode ser adicionado via `@nestjs/throttler`
- Evita ataques de força bruta na API.
- Configurando alguns endpoints para aceitar menos requisições por minuto.

---

## 📚 Tecnologias utilizadas

**Backend:**
- NestJS
- MongoDB 8
- Mongoose
- JWT Authentication
- OpenAI SDK
- Gemini AI SDK
- Go
- Python

**Frontend:**
- React 19
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Recharts
- Axios

**Infraestrutura:**
- Docker & Docker Compose
- RabbitMQ
- MongoDB 8

**Message Broker:**
- RabbitMQ (AMQP)

**APIs Externas:**
- Open-Meteo API (dados climáticos)
- OpenAI API (insights de IA)
- Google Gemini API (insights de IA - fallback)

---

## 📝 Notas importantes

1. **Primeira execução**: O primeiro build pode demorar alguns minutos
2. **API Keys**: Configure as chaves da OpenAI/Gemini para habilitar insights de IA
3. **Dados persistentes**: Os dados do MongoDB ficam em `./temp_data/mongo/` e podem ser baixados via GOOGLE DRIVE , nesse link
4. **Logs do RabbitMQ**: Configurado para mostrar apenas erros
5. **Healthchecks**: Todos os serviços têm healthcheck configurado
6. **Multi-stage build**: Docker usa multi-stage para otimizar tamanho das imagens

---

**Desenvolvido para o desafio GDASH 2025/02** 🚀
