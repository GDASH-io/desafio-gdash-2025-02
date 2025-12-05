# G-Dash Weather System

Bem-vindo ao **G-Dash Weather System**, uma solução full-stack moderna e escalável para monitoramento climático com integração de IA. Este projeto demonstra uma arquitetura distribuída utilizando microsserviços, mensageria e processamento assíncrono.

---

## Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Features](#-features)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Execução](#-instalação-e-execução)
  - [Configuração Inicial](#1-configuração-inicial)
  - [Execução Automática (Recomendado)](#2-execução-automática-recomendado)
  - [Execução Manual](#3-execução-manual-passo-a-passo)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Troubleshooting](#-troubleshooting)
- [Tecnologias](#-tecnologias)

---

## Visão Geral

O sistema coleta dados meteorológicos em tempo real, processa-os através de uma fila de mensagens e os armazena para visualização em um dashboard interativo. Além disso, utiliza Inteligência Artificial (Gemini) para gerar insights climáticos baseados nos dados coletados.

### Fluxo de Dados
1. **Producer (Python)**: Consulta a API Open-Meteo periodicamente e envia dados para o RabbitMQ.
2. **RabbitMQ**: Atua como broker de mensagens, garantindo desacoplamento e resiliência.
3. **Worker (Go)**: Consome as mensagens da fila, processa e envia para a API.
4. **Backend (NestJS)**: Recebe os dados, armazena no MongoDB e gerencia a lógica de negócios e autenticação.
5. **Frontend (React/Vite)**: Exibe os dados em tempo real e insights de IA para o usuário.

---

## Arquitetura

O projeto segue uma arquitetura baseada em eventos e microsserviços:

```mermaid
graph LR
    A[Producer (Python)] -->|JSON| B(RabbitMQ)
    B -->|Consome| C[Worker (Go)]
    C -->|HTTP POST| D[Backend API (NestJS)]
    D <-->|Leitura/Escrita| E[(MongoDB)]
    D -->|Gera Insights| F[Google Gemini AI]
    G[Frontend (React)] <-->|REST API| D
```

---

## Features

- **Monitoramento em Tempo Real**: Dados de temperatura, umidade, vento e probabilidade de chuva.
- **Insights de IA**: Análises inteligentes geradas pelo Google Gemini sobre as condições climáticas.
- **Autenticação Segura**: Sistema de login com JWT.
- **Gráficos Interativos**: Visualização de tendências climáticas.
- **Exportação de Dados**: Download de relatórios em CSV e XLSX.
- **Integração Externa**: Página dedicada para consulta de Pokémons (PokéAPI).
- **Resiliência**: Sistema de retry e filas persistentes para garantir entrega de dados.

---

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

Antes de começar, certifique-se de ter instalado:

- **Docker** e **Docker Compose** (para RabbitMQ e MongoDB)
  - [Instalar Docker](https://docs.docker.com/get-docker/)
  - [Instalar Docker Compose](https://docs.docker.com/compose/install/)
- **Node.js** (v18+) e **npm**
  - [Instalar Node.js](https://nodejs.org/) (Recomendado versão LTS)
- **Python** (3.8+)
  - [Instalar Python](https://www.python.org/downloads/)
  - Certifique-se de instalar o `pip` também.
- **Go** (1.20+)
  - [Instalar Go](https://go.dev/doc/install)
- **Git**
  - [Instalar Git](https://git-scm.com/downloads)

### Instalação das Ferramentas (Linux/Ubuntu)

```bash
# Docker
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Node.js (via NVM recomendado)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts

# Python
sudo apt install python3 python3-pip python3-venv

# Go
wget https://go.dev/dl/go1.21.6.linux-amd64.tar.gz
sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.21.6.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin
### 🪟 Instalação e Execução (Windows)

#### 1. Pré-requisitos
No Windows, recomendamos usar o **PowerShell** como administrador.
Instale as ferramentas listadas acima (Docker Desktop, Node.js, Python, Go, Git).

#### 2. Setup Automático
Execute o script de setup para verificar o ambiente e instalar dependências:

```powershell
powershell -ExecutionPolicy Bypass -File .\setup.ps1
```

#### 3. Execução
Para iniciar todo o sistema:

```powershell
powershell -ExecutionPolicy Bypass -File .\start-all.ps1 start
```

Outros comandos:
```powershell
# Verificar status
powershell -ExecutionPolicy Bypass -File .\start-all.ps1 status

# Parar sistema
powershell -ExecutionPolicy Bypass -File .\start-all.ps1 stop
```

---

## Instalação e Execução

### 1. Configuração Inicial

Clone o repositório e configure as variáveis de ambiente:

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/desafio-gdash-2025-02.git
cd desafio-gdash-2025-02

# Configure o backend
cp backend/.env.example backend/.env
# EDITE o arquivo backend/.env e adicione sua GEMINI_API_KEY
```

### 2. Execução Automática (Recomendado)

Utilize o script `start-all.sh` para gerenciar todo o ciclo de vida da aplicação.

```bash
# Iniciar todos os serviços
./start-all.sh start

# Verificar status
./start-all.sh status

# Parar tudo
./start-all.sh stop
```

> **Nota**: O script irá verificar dependências, subir containers Docker (RabbitMQ, MongoDB), criar ambiente virtual Python, instalar dependências e iniciar todos os serviços.

### 3. Execução Manual (Passo a Passo)

Caso prefira rodar cada serviço individualmente:

#### Infraestrutura (Docker)
```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
docker run -d --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=gdash_user -e MONGO_INITDB_ROOT_PASSWORD=gdash_password_secure mongo:latest
```

#### Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
```

#### Worker (Go)
```bash
cd worker
go run worker.go
```

#### Producer (Python)
**Importante**: Utilize um ambiente virtual (`venv`).

```bash
# Na raiz do projeto
python3 -m venv venv
source venv/bin/activate
pip install requests pika

cd producer
python producer.py
```

#### Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

---

## Estrutura do Projeto

```
.
├── backend/          # API NestJS (Porta 3000)
├── frontend/         # React + Vite (Porta 5173)
├── producer/         # Script Python de coleta de dados
├── worker/           # Consumidor Go
├── logs/             # Logs de execução dos serviços
├── start-all.sh      # Script de orquestração
└── docker-compose.yml # Definição de containers
```

---

## Troubleshooting

### Portas em Uso
Se o script falhar ao iniciar devido a portas em uso, ele tentará alocar novas portas automaticamente. Verifique o output do terminal para ver as portas atribuídas.

### Erro de Conexão com RabbitMQ/MongoDB
Certifique-se de que os containers Docker estão rodando:
```bash
docker ps
```
Se necessário, reinicie os containers ou o script `./start-all.sh restart`.

### Logs
Verifique os logs individuais que estão na pasta logs para diagnósticos detalhados:
- Backend: `tail -f logs/backend.log`
- Worker: `tail -f logs/worker.log`
- Producer: `tail -f logs/producer.log`

### Permissões
Se tiver problemas de permissão com o script:
```bash
chmod +x start-all.sh
```

---

## Tecnologias

- **Backend**: NestJS, Mongoose, JWT
- **Frontend**: React, Vite, TailwindCSS, Shadcn/UI, Recharts
- **Dados**: MongoDB, RabbitMQ
- **Microservices**: Python (Producer), Go (Worker)
- **AI**: Google Gemini API
- **DevOps**: Docker, Shell Scripting

---

Desenvolvido para o Desafio GDASH 2025/02.
