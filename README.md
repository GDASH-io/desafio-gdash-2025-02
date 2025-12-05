# 🌦️ Weather Challenge

Uma solução Full Stack robusta de monitoramento climático baseada em microsserviços, filas de mensagens e inteligência artificial generativa.

## 📋 Sobre o Projeto

Este sistema tem o objetivo de simular um ambiente de monitoramento para usinas fotovoltaicas, coletando dados climáticos em tempo real e utilizando IA para gerar insights sobre a produção de energia.

A aplicação segue uma **Arquitetura de Microsserviços**, garantindo que cada componente seja independente, escalável e resiliente.

---

## 🏗️ Arquitetura e Fluxo de Dados

O sistema é orquestrado via Docker Compose e composto por 5 containers que se comunicam entre si:

1.  **Coletor (Python):** Busca dados na API externa (Open-Meteo) a cada minuto ou hora. Envia os dados brutos para a fila de mensagens.
2.  **Message Broker (RabbitMQ):** Recebe os dados do Python e os armazena na fila `weather_data`. Garante que nenhum dado seja perdido caso a API esteja fora do ar (Resiliência).
3.  **Worker (Go):** Consome as mensagens da fila com alta performance. Envia os dados processados para a API via HTTP POST.
4.  **API Backend (NestJS):** Recebe os dados do Worker e os salva no MongoDB. Gerencia Autenticação (Login/Registro) com JWT.
5.  **Integra com a IA (Google Gemini)** para gerar análises climáticas. Fornece endpoints para o Frontend.
6.  **Frontend (React + Vite):** Interface visual para o usuário. Exibe dados em tempo real, gráficos e insights de IA. Possui rotas protegidas e exportação de CSV.

---

## 📂 Estrutura do Projeto

Para desenvolvedores que darão manutenção, esta é a organização das pastas:

```text
desafio-gdash/
├── 📁 api-nestjs/             # O Backend
│   ├── src/auth/              # Lógica de Login e JWT
│   ├── src/users/             # CRUD de Usuários
│   ├── src/weather/           # Lógica de Clima e Integração com IA
│   └── src/ai/                # Serviço de conexão com Gemini API
│
├── 📁 frontend-react/         # O Frontend
│   ├── src/pages/             # Telas (Login, Register, Dashboard)
│   ├── src/components/        # Componentes reutilizáveis (PrivateRoute)
│   └── src/App.tsx            # Roteamento
│
├── 📁 weather-collector-python/ # O "Coletor"
│   └── main.py                # Script de busca e envio para fila
│
├── 📁 queue-worker-go/        # O "Operário"
│   └── main.go                # Consumo da fila e envio para API
│
└── docker-compose.yml         # Orquestração de todos os serviços
````

-----

## 🚀 Como Rodar o Projeto

### 1\. Pré-requisitos

Certifique-se de ter instalado **Docker** e **Docker Compose**.

### 2\. Configuração de Ambiente (.env)

Crie um arquivo `.env` na raiz do projeto (`~/desafio-gdash/.env`) com as seguintes chaves e não compartilhe este arquivo:

```env
# Credenciais do Banco e Fila
MONGO_USER=
MONGO_PASSWORD=
RABBITMQ_USER=
RABBITMQ_PASSWORD=

# Chave da API de IA (Google AI Studio)
GEMINI_API_KEY=SUA_CHAVE_AQUI
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent
RABBITMQ_HOST=
QUEUE_NAME=
CITY_LAT=
CITY_LON=
```

### 3\. Comandos de Execução

Abra o terminal na pasta raiz do projeto e execute:

```bash
# 1. Limpar containers antigos (Garante uma instalação limpa)
docker compose down
```
```bash
# 2. Subir a aplicação (Constrói as imagens e inicia em background)
docker compose up -d --build
```
```bash
# 3. Verificar se tudo subiu corretamente
docker ps
```



-----

## 🖥️ Acesso e Links Úteis

Após subir os containers, você pode acessar os serviços:

  * **Frontend:** http://localhost:5173 (Dashboard principal)
  * **API (Logs):** http://localhost:3000/weather/logs (Dados brutos JSON)
  * **RabbitMQ:** http://localhost:15672 (Painel Admin - User e password123)

### 🔐 Acesso ao Sistema

O sistema possui login. Se não tiver usuário, clique em "Cadastre-se" na tela de login.

## 🛠️ Guia de Manutenção e Depuração

Se precisar investigar erros ou rodar serviços individualmente, use os comandos abaixo.

**Ver logs:**

```bash
# Ver logs de TODOS os serviços ao mesmo tempo
docker compose logs -f

# Logs específicos
docker logs -f gdash-frontend  # Frontend
docker logs -f gdash-api       # Backend NestJS
docker logs -f gdash-worker    # Worker Go
docker logs -f gdash-python    # Coletor Python
docker logs -f gdash-mongo     # mongoDB
docker logs -f gdash-rabbitmq  # RabbitMQ
```

**Reiniciar Apenas um Serviço:**
Se você alterou código apenas no Frontend, não precisa reiniciar tudo:

```bash
# Reconstrói e reinicia apenas o frontend
docker compose up -d --build frontend

# Reconstrói e reinicia apenas a API
docker compose up -d --build api-nestjs

# Reconstrói e reinicia apenas a python
docker compose up -d --build weather-collector

# Reconstrói e reinicia apenas o GO
docker compose up -d --build queue-worker
```

-----

## ✅ Funcionalidades Entregues

  - [x] Pipeline de Dados Completo: Python -\> RabbitMQ -\> Go -\> NestJS -\> Mongo.
  - [x] Autenticação: Login e Registro com JWT e Senha Criptografada (bcrypt).
  - [x] Dashboard: Exibição de dados em tempo real.
  - [x] IA Generativa: Insights climáticos gerados pelo Google Gemini.
  - [x] Exportação: Download de dados em CSV.
  - [x] Infraestrutura: Dockerização completa.

-----

## ✅ Link do video do projeto no youtube:

[Clique aqui para o link do Youtube.](https://youtu.be/rysV5z\_S0nc)
