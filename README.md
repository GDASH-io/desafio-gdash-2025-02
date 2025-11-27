# 🌦️ Weather Monitor System

Sistema Full Stack de monitoramento climático em tempo real com arquitetura de microsserviços, integração de IA e dados externos.

> **Desenvolvido por:** Gabriel Messias
> **Status:** ✅ Concluído (MVP)

---

## 🧭 Visão Geral da Arquitetura

O sistema segue uma arquitetura orientada a eventos para garantir escalabilidade e desacoplamento:



1.  **Coletor (Python):** Busca dados na Open-Meteo a cada 2 minutos.
2.  **Broker (RabbitMQ):** Fila de mensagens para garantir que nenhum dado seja perdido.
3.  **Worker (Go):** Processamento de alta performance que consome a fila e envia para a API.
4.  **Backend (NestJS):** API REST, Autenticação JWT, Integração com MongoDB e Geração de Insights.
5.  **Frontend (React + Vite):** Dashboard interativo com Shadcn/ui e Tailwind CSS.

---

## 🚀 Tecnologias Utilizadas

* **Frontend:** React, TypeScript, Tailwind CSS, Shadcn/ui, Axios.
* **Backend:** NestJS, Mongoose, JWT, ExcelJS.
* **Microsserviços:** Python (Requests/Schedule), Golang (AMQP).
* **Infraestrutura:** Docker, Docker Compose, RabbitMQ, MongoDB.

---

## ✨ Funcionalidades

### 🌦️ Clima & IA
* Coleta automática de temperatura e vento.
* **Insights de IA:** Geração de alertas automáticos baseados em regras (calor extremo, tempestades, ventos fortes).
* Exportação de histórico em **CSV** e **Excel (XLSX)**.

### 🐉 Integrações Externas
* **Pokédex:** Consumo da PokéAPI com paginação e visualização de imagens e tipos via Proxy no Backend.

### 👥 Gestão
* Sistema de Login (JWT).
* CRUD de Usuários (Criar, Listar, Editar, Remover).
* Proteção de rotas no Frontend e Backend.

---

## 🛠️ Como Rodar o Projeto

### Pré-requisitos
* Docker e Docker Compose instalados.

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone <link-do-seu-repo>
    cd teste_tecnico
    ```

2.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz baseando-se no exemplo:
    ```bash
    cp .env.example .env
    ```

3.  **Suba a aplicação (Comando Único):**
    ```bash
    docker compose up --build
    ```

4.  **Acesse:**
    * **Frontend:** [http://localhost:5173](http://localhost:5173)
    * **API:** [http://localhost:3000](http://localhost:3000)

---

## 👤 Acesso Inicial

Para acessar o sistema pela primeira vez, utilize as credenciais do administrador padrão criado automaticamente:

* **Usuário:** `admin`
* **Senha:** `123456`

---

## 🧪 Decisões Técnicas

* **RabbitMQ:** Escolhido para garantir assincronismo entre a coleta (Python) e o processamento (Go/NestJS).
* **NestJS:** Utilizado pela robustez e facilidade de manutenção com TypeScript.
* **Go Worker:** Escolhido para demonstrar processamento de fila com baixo consumo de memória.
* **Docker Compose:** Orquestração completa para rodar todo o ecossistema com um único comando.

## 📹 Vídeo Demonstrativo

Assista à demonstração completa da arquitetura e funcionalidades:

▶️ **[Clique aqui para ver o Vídeo no YouTube](https://www.youtube.com/watch?v=fdOi3jm2Jfs)**
