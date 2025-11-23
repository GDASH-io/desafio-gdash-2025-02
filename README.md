# 🌦️ GDASH - Sistema de Monitoramento Climático Inteligente

Uma solução Full-Stack moderna e distribuída para ingestão, processamento e visualização de dados climáticos em tempo real, com insights gerados por Inteligência Artificial.

## 🚀 Visão Geral da Arquitetura

Este projeto adota uma arquitetura de microsserviços orientada a eventos:

1.  **Coletor (Python):** Busca dados da Open-Meteo a cada 10s e publica no RabbitMQ.
2.  **Fila (RabbitMQ):** Garante o desacoplamento e resiliência na entrega das mensagens.
3.  **Worker (Go):** Consome a fila com alta performance e envia para a API via HTTP.
4.  **Backend (NestJS):** API REST que gerencia Auth (JWT), Regras de Negócio, Integração com IA (Google Gemini) e Persistência (MongoDB).
5.  **Frontend (React + Vite):** Dashboard responsivo com _Dark Mode_, gráficos em tempo real e UI moderna (Shadcn/ui).

## 📹 Demonstração em Vídeo

> **[https://youtu.be/8uu-SBEqSwo]** > _Assista ao vídeo de 5 minutos explicando a arquitetura e o funcionamento do sistema._

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Recharts, Shadcn/ui, Axios
- **Backend:** NestJS, Mongoose, Passport (JWT), Google Generative AI, ExcelJS
- **Worker:** Golang (AMQP, Net/HTTP)
- **Coletor:** Python (Pika, Schedule)
- **Infra:** Docker, Docker Compose, MongoDB, RabbitMQ

## 📂 Estrutura do Projeto

```bash
├── backend/           # API NestJS (Core, Auth, IA, Logs)
├── frontend/          # Dashboard React (Vite + Shadcn)
├── worker-go/         # Consumidor da Fila (Golang)
├── collector-python/  # Coletor de Dados (Python)
└── docker-compose.yml # Orquestração dos serviços
```
