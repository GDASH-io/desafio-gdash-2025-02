# 🌦 GDASH Challenge 2025/02

link para o video: https://youtu.be/3yjwC2T2EME

Pipeline completo: **Python → RabbitMQ → Go → NestJS → MongoDB → React**

------------------------------------------------------------------------

##  **Visão Geral**

Este projeto implementa um pipeline distribuído para coleta,
processamento e visualização de dados climáticos.

**Fluxo do sistema:**

    Python Collector → RabbitMQ → Go Worker → NestJS API → MongoDB → React Dashboard

O coletor obtém clima da **API Open-Meteo**, envia para o **RabbitMQ**,
o **worker em Go** processa as mensagens e persiste na **API em
NestJS**, que armazena tudo no **MongoDB**.\
O **frontend em React** exibe dashboards, CRUD de usuários, métricas e
exportações CSV/XLSX.

------------------------------------------------------------------------

#  **Tecnologias Utilizadas**

  Componente   Tecnologia
  ------------ ----------------------------------
  Frontend     React, Vite, Tailwind, shadcn/ui
  Backend      NestJS (TypeScript)
  Banco        MongoDB
  Fila         RabbitMQ
  Worker       Go
  Coletor      Python
  Infra        Docker, Docker Compose

------------------------------------------------------------------------

#  **Como Rodar o Projeto**

## 1️⃣ Criar o arquivo `.env` na raiz do projeto

Crie:

    gdash-challenge/.env

Cole:

``` env
MONGO_URI=mongodb://mongo:27017/gdash

JWT_SECRET=supersecret
JWT_EXPIRES_IN=3600
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=123456
ADMIN_NAME=Administrador

WEATHER_API_URL=https://api.open-meteo.com/v1/forecast
LAT=-23.5505
LON=-46.6333
TIMEZONE=America/Sao_Paulo

RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
RABBITMQ_QUEUE=weather_logs

WORKER_RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
WORKER_QUEUE=weather_logs
WORKER_API_URL=http://api:3000/api

VITE_API_URL=http://localhost:3000/api
```

------------------------------------------------------------------------

## 2️⃣ Subir todos os serviços com Docker

Na raiz:

``` bash
docker compose up --build -d
```

Isso sobe automaticamente:

-   NestJS API\
-   React Frontend\
-   MongoDB\
-   RabbitMQ\
-   Python Collector\
-   Go Worker

------------------------------------------------------------------------

##  **URLs Principais**

  Serviço       URL
  ------------- ---------------------------
  Frontend      http://localhost:5173
  API           http://localhost:3000/api
  RabbitMQ UI   http://localhost:15672
  MongoDB       mongodb://localhost:27017

 **RabbitMQ login:**

    guest / guest

------------------------------------------------------------------------

#  **Usuário Inicial**

O backend cria automaticamente:

    Email: admin@example.com
    Senha: 123456

------------------------------------------------------------------------

#  **Funcionalidades Implementadas**

## ✔ Backend (NestJS)

-   Autenticação JWT\
-   CRUD completo de usuários\
-   Registro de logs climáticos\
-   Insights (média, tendência, alertas)\
-   Exportações:
    -   `/api/weather/export/csv`
    -   `/api/weather/export/xlsx`

## ✔ Frontend (React)

-   Login\
-   Dashboard com métricas climáticas\
-   Gráficos e cards\
-   Exportação CSV/XLSX\
-   CRUD de usuários\
-   Interface moderna com shadcn/ui

## ✔ Python Collector

-   Coleta clima a cada 60s\
-   Envia JSON para RabbitMQ

## ✔ Worker Go

-   Consumo da fila\
-   Processamento dos dados\
-   Envio para NestJS\
-   ACK/NACK automático

------------------------------------------------------------------------

#  **Testes Manuais**

###  MongoDB

``` bash
docker exec -it gdash-mongo mongosh
use gdash
db.weatherlogs.find().pretty()
```

###  RabbitMQ

Acesse:

http://localhost:15672\
Fila usada pelo sistema:

    weather_logs

###  Logs em tempo real

Coletor:

``` bash
docker compose logs -f collector-python
```

Worker:

``` bash
docker compose logs -f worker-go
```

------------------------------------------------------------------------

#  **Containers do Projeto**

Use para verificar se tudo está ativo:

``` bash
docker compose ps
```

------------------------------------------------------------------------

#  **Arquitetura (diagrama)**

> *(coloque aqui sua imagem do diagrama ou use um placeholder)*

------------------------------------------------------------------------

#  **Vídeo Explicativo**

(Adicione aqui o link do YouTube --- modo não listado)

------------------------------------------------------------------------

#  **Entrega**

Submeta via Pull Request em uma branch com seu nome:

    carlos-andre-behrends

------------------------------------------------------------------------

# ✅ **Checklist GDASH**

-   [x] Coletor Python\
-   [x] Fila RabbitMQ\
-   [x] Worker Go\
-   [x] API NestJS completa\
-   [x] MongoDB\
-   [x] Frontend React\
-   [x] Exportação CSV / XLSX\
-   [x] CRUD de usuários\
-   [x] Dashboard com métricas\
-   [x] Docker Compose\
-   [x] README completo\
-   [x] Vídeo explicativo
