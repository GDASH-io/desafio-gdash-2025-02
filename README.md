# Desafio GDASH 2025/02

Aplicação full-stack para coleta, processamento e visualização de dados meteorológicos.

## Arquitetura

- **Coletor de Clima (Python)**: Busca dados meteorológicos do Open-Meteo e publica no RabbitMQ.
- **Message Broker (RabbitMQ)**: Enfileira dados meteorológicos.
- **Worker (Go)**: Consome dados do RabbitMQ e os envia para a API.
- **API (NestJS)**: Armazena dados no MongoDB, gerencia usuários e gera insights de IA.
- **Frontend (React + Vite)**: Exibe dashboard com dados em tempo real e insights.
- **Banco de Dados (MongoDB)**: Armazena registros meteorológicos e usuários.

## Pré-requisitos

- Docker & Docker Compose

## Como Executar

1. **Clone o repositório** (se ainda não o fez).
2. **Crie o arquivo .env**:
   ```bash
   cp .env.example .env
   ```
3. **Inicie com Docker Compose**:
   ```bash
   docker-compose up --build
   ```

## Pontos de Acesso

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **API Backend**: [http://localhost:3000](http://localhost:3000)
- **Gerenciamento RabbitMQ**: [http://localhost:15672](http://localhost:15672) (Usuário: guest, Senha: guest)

## Credenciais Padrão

- **E-mail**: `admin@example.com`
- **Senha**: `adminpassword`

## Funcionalidades

- **Clima em Tempo Real**: Dados coletados a cada hora (configurável).
- **Insights de IA**: Análise baseada em regras das condições meteorológicas.
- **Gerenciamento de Usuários**: Criar, listar e excluir usuários.
- **Exportação**: Baixar registros meteorológicos como CSV ou XLSX.

## Desenvolvimento

- **Serviço Python**: Localizado em `weather-collector/`
- **Worker Go**: Localizado em `weather-worker/`
- **Backend**: Localizado em `backend/`
- **Frontend**: Localizado em `frontend/`

## Demonstração em Vídeo

[Link para o Vídeo no YouTube] (A ser adicionado)
