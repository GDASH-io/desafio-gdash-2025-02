# 🚀 Desafio Full-Stack GDASH 2025/02: Sistema de Monitoramento Climático Distribuído

Este repositório contém a solução desenvolvida para o processo seletivo GDASH 2025/02. O projeto é uma aplicação *full-stack* moderna que integra múltiplas linguagens e serviços para monitorar dados climáticos e gerar *insights* baseados em IA.

## 📋 Sumário

- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Stack Tecnológica](#️-stack-tecnológica)
- [Pré-requisitos](#-pré-requisitos)
- [Configuração Inicial](#️-configuração-inicial)
- [URLs e Acesso](#-urls-e-acesso)
- [Funcionalidades Implementadas](#-funcionalidades-implementadas)
- [Apresentação](#-apresentação)

---

## 🌟 Visão Geral

O objetivo central é demonstrar a capacidade de integrar diferentes sistemas e linguagens de programação (**Python**, **Go**, **TypeScript**) em um ambiente containerizado (**Docker Compose**), criando um *pipeline* de dados resiliente e uma interface de usuário rica.

O sistema simula um serviço de coleta e processamento de dados climáticos para otimizar o setor de energias renováveis, alinhado à visão da GDASH. Inclui uma integração com a API pública da **SpaceX** e gera *insights* avançados focados em eficiência solar.

---

## 🏗️ Arquitetura

O fluxo de dados segue a arquitetura:

```
Produtor (Python) 
    ↓
Fila (RabbitMQ/Redis) 
    ↓
Consumidor (Go) 
    ↓
API (NestJS) 
    ↓
Banco de Dados (MongoDB) 
    ↓
Frontend (React)
```

### Serviços do Sistema

| Serviço | Tecnologia | Função |
|---------|-----------|--------|
| **`collector`** | Python | Coleta dados climáticos da API **Open-Meteo** e envia para a fila (produtor) |
| **`worker`** | Go | Consome mensagens da fila, valida e envia dados normalizados para a API NestJS (consumidor) |
| **`api`** | NestJS (TypeScript) | Núcleo do sistema: gerencia usuários, armazena logs de clima, gera *insights* e integra com a API da **SpaceX** |
| **`frontend`** | React + Vite (TypeScript) | Dashboard principal com dados de clima, *insights* de IA, gestão de usuários e página de lançamentos SpaceX |
| **`database`** | MongoDB | Armazenamento persistente de logs climáticos e informações de usuários |
| **`queue`** | RabbitMQ / Redis | Mensageria assíncrona entre `collector` e `worker` |

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologias |
|--------|------------|
| **Frontend** | React, Vite, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend (API)** | NestJS, TypeScript |
| **Banco de Dados** | MongoDB |
| **Fila/Worker** | Go, Message Broker (RabbitMQ/Redis) |
| **Coleta** | Python |
| **APIs Externas** | Open-Meteo (Clima), SpaceX API (Integração) |
| **Infraestrutura** | Docker, Docker Compose |

---

## 📋 Pré-requisitos

Para executar a solução, você deve ter instalado em seu ambiente:

- **Docker** (v20+)
- **Docker Compose** (v2+)

---

## ⚙️ Configuração Inicial

### 1. Variáveis de Ambiente

Crie um arquivo **`.env`** na raiz do projeto, baseado no arquivo `.env.example`:

```env
# .env file

# --- API (NestJS) CONFIG ---
PORT=3000
MONGO_URI=mongodb://mongodb:27017/gdash_challenge
JWT_SECRET=sua_chave_secreta_jwt_aqui

# Usuário Padrão (Criado na inicialização da API)
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=123456

# --- QUEUE (RabbitMQ/Redis) CONFIG ---
RABBITMQ_URI=amqp://guest:guest@rabbitmq:5672/
WEATHER_QUEUE_NAME=weather_logs_queue

# --- COLLECTOR (Python) CONFIG ---
# Localização para coleta de dados climáticos (Open-Meteo)
LATITUDE=-23.5505       # Exemplo: Sorocaba
LONGITUDE=-46.6333     # Exemplo: Sorocaba
COLLECTION_INTERVAL_MINUTES=60
```

### 2. Execução com Docker Compose

Suba todos os serviços:

```bash
docker-compose up --build -d
```

### 3. Verificação

Verifique se todos os containers estão em execução:

```bash
docker-compose ps
```

---

## 🌐 URLs e Acesso

| Serviço | URL | Credenciais Padrão |
|---------|-----|-------------------|
| **Frontend / Dashboard** | `http://localhost:5173` | Usuário: `admin@example.com` / Senha: `123456` |
| **API (NestJS)** | `http://localhost:3000` | N/A |
| **Swagger/Documentação API** | `http://localhost:3000/api-docs` | N/A |

---

## ✅ Funcionalidades Implementadas

### 1. Dashboard de Clima

- ✨ Visualização de dados climáticos em tempo real
- 📊 Funcionalidades de exportação (CSV/XLSX)
- 📈 Gráficos interativos de tendências

### 2. Insights de IA (Foco em Geração Solar)

O endpoint `GET /api/weather/insights` fornece análises avançadas:

- 📅 Previsão para os próximos 7 dias
- ☀️ Índice de Eficiência Solar (0-100)
- 🔋 Radiação Total
- 💡 Recomendações Solares (Ex: "Bom dia para geração solar")
- 🔬 Índice UV
- 📉 Gráfico de Tendência de Temperatura
- 📊 Gráfico de Radiação e Geração Solar

### 3. Gestão de Usuários

- 🔐 Tela de Login com autenticação JWT
- 🔒 Rotas protegidas por tokens
- 👥 CRUD completo no frontend e backend

### 4. Integração com API Pública (SpaceX 🚀)

- **API Externa Utilizada:** SpaceX API (Lançamentos de Foguetes)
- **Endpoint:** `GET /api/external/spacex/launches`
- **Frontend:** Página dedicada com lista paginada de lançamentos

---

## 📹 Apresentação

O vídeo de apresentação do projeto, com duração máxima de 5 minutos, está disponível no link abaixo.

**Link do Vídeo (YouTube Não Listado):** https://youtu.be/g6Efqtsx81E