# ⛅ Full-Stack Climate Dashboard - GDASH Challenge

Este projeto implementa uma aplicação de microsserviços para coleta, processamento e visualização de dados climáticos, utilizando uma arquitetura full-stack robusta e desacoplada.

## ⚙️ I. Arquitetura da Solução

O sistema é construído em um pipeline de processamento assíncrono para garantir estabilidade e escalabilidade na ingestão de dados.

| Componente              | Tecnologia           | Função                                                                                                                               |
| ----------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Coletor de Dados        | Python               | Produtor: Coleta dados climáticos (`Open-Meteo`) e publica na fila.                                                                  |
| Fila de Mensagens       | RabbitMQ             | Broker: Garante o transporte assíncrono das mensagens.                                                                               |
| Worker de Processamento | Go                   | Consumidor: Lê a fila, valida a estrutura, faz retries e envia via HTTP para a API.                                                  |
| API Backend             | NestJS/TypeScript    | Núcleo do sistema. Gerencia o CRUD de Usuários (JWT), gera Insights de IA e gerencia a Exportação (CSV/XLSX).                        |
| Frontend                | React/Vite/shadcn/ui | Dashboard interativo. Responsável por Login/Auth, visualização de dados (Tabela, Gráfico de Tendência) e interface de administração. |
| DB                      | MongoDB              | Persistência dos logs de clima e dados de usuários.                                                                                  |

## 🚀 II. Inicialização e Execução do Sistema

Todo o sistema deve ser iniciado com o Docker Compose.

### 1. Requisitos

- Docker Desktop (ou Engine) instalado e ativo.

### 2. Como Rodar Tudo via Docker Compose

Navegue até a pasta raiz do projeto (onde está o `docker-compose.yml`) e execute:

```bash
# Reconstruir imagens (para garantir o código final) e iniciar todos os serviços
docker compose up --build -d
```

### 3. Como Rodar o Frontend (React)

O Frontend é iniciado separadamente em modo de desenvolvimento para HMR.

Abra uma nova aba do terminal e execute:

```bash
cd frontend
npm run dev
```

## 💻 III. URLs Principais e Acesso Inicial

### URLs de Acesso

| Recurso                               | URL de Acesso                    | Porta |
| ------------------------------------- | -------------------------------- | ----- |
| Frontend (Dashboard)                  | `http://localhost:5173`          | 5173  |
| Documentação da API (Swagger/OpenAPI) | `http://localhost:3000/api/docs` | 3000  |
| API Backend (Base)                    | `http://localhost:3000/api`      | 3000  |
| RabbitMQ Management                   | `http://localhost:15672`         | 15672 |

### Credenciais Padrão (Admin)

As credenciais são lidas do arquivo `.env` localizado na pasta `./api/`.

| Usuário | Email               | Senha    |
| ------- | ------------------- | -------- |
| Admin   | `admin@example.com` | `123456` |

## 💡 IV. Detalhes de Implementação

- **Serviço Python (Coletor):** Roda no contêiner `collector-py`. Ele busca dados da API `Open-Meteo` e envia para a fila a cada 30 segundos (intervalo configurável via variável de ambiente).

- **Worker Go (Processador):** Roda no contêiner `worker-go`. Implementa a lógica de retry e Health Check inicial para garantir que a API NestJS esteja pronta antes do processamento de mensagens.

- **Exportação:** O Backend implementa os endpoints `/export/csv` e `/export/xlsx`, que são protegidos por JWT e acionam a geração completa dos arquivos de logs.

## 📹 V. Vídeo Explicativo (Obrigatório)

**Link do Vídeo (YouTube Não Listado):**
https://www.youtube.com/watch?v=lWZtbJAlHTU
