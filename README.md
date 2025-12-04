# Weather Insights System

Sistema completo de coleta, processamento e visualização de dados meteorológicos com integração de múltiplos serviços e suporte a Docker.

## Estrutura do Projeto
```.
├── nestapi # Backend em NestJS
│ ├── src
│ │ ├── auth # Autenticação JWT e usuários
│ │ ├── users # CRUD de usuários
│ │ ├── weather # Logs de clima
│ │ └── insights # Geração de insights e estatísticas
│ ├── Dockerfile
│ └── tsconfig.json
├── frontend # Frontend em React/TypeScript + TailwindCSS
│ ├── src
│ │ ├── features/auth
│ │ ├── features/dashboard
│ │ └── features/forecast
│ └── vite.config.ts
├── collector-python # Coletor de dados meteorológicos em Python
│ └── Dockerfile
├── queue-worker-go # Worker em Go para processar mensagens
│ └── Dockerfile
└── docker-compose.yaml
```


## Funcionalidades

- **Backend (NestJS)**
  - Autenticação JWT
  - CRUD de usuários
  - Registro e consulta de logs de clima
  - Geração de insights e estatísticas
  - Exportação de dados em CSV/XLSX

- **Frontend (React + Tailwind)**
  - Dashboard de visualização do clima
  - Histórico e previsão meteorológica
  - Insights e gráficos

- **Collector Python**
  - Coleta de dados da API Open-Meteo
  - Envio via RabbitMQ para processamento
  - Atualização automática de dados (ex.: a cada 5h)
  - Recebe latitude/longitude dos usuários via RabbitMQ

- **Queue Worker Go**
  - Processamento de mensagens do RabbitMQ
  - Envio de dados para o backend
  - Manipulação de dados geográficos e de usuários

## Arquitetura & Fluxo de Dados
```
[Collector Python]
|
v
RabbitMQ
|
v
[Queue Worker Go]
|
v
[NestJS API] ---> [MongoDB]
^
|
Frontend (React)
```

## Configuração e Execução com Docker

### Variáveis de Ambiente

Crie um `.env` na raiz do projeto com:

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority
RABBIT_URL=amqp://user:pass@rabbitmq:5672/
JWT_SECRET=seu_segredo_jwt
GROQ_API_KEY=seu_groq_key
```

Crie um `docker-compose.yaml` na raiz do projeto com:

```
version: "3.9"
services:
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"

  collector:
    build:
      context: ./collector-python
      dockerfile: Dockerfile
    env_file:
      - .env 
    command: python -u collector.py
    depends_on:
      - rabbitmq

  worker:
    build:
      context: ./queue-worker-go
      dockerfile: Dockerfile
    env_file:
      - .env
    depends_on:
      - rabbitmq
    ports:
      - "8080:8080"
    command: sh -c "sleep 10 && ./worker"

  api:
    build:
      context: ./nestapi
      dockerfile: Dockerfile
    env_file:
      - .env
    ports:
      - "3000:3000"
    depends_on:
      - rabbitmq

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
```

Comando para subir todos os serviços
`docker-compose up --build`


Acesso aos Serviços

    Frontend: http://localhost:5173/

    Backend (NestJS API): http://localhost:3000/

    RabbitMQ Management: http://localhost:15672/

    Queue Worker Go: acessível via porta 8080

Observações

    Todos os logs de clima são validados e armazenados automaticamente pelo backend.

    Múltiplos usuários são suportados, com dados separados por userId.

    Insights podem ser gerados para análise histórica e previsões.

    O sistema foi projetado para rodar totalmente em Docker, com todos os serviços orquestrados via docker-compose.

[**Video**](https://www.youtube.com/watch?v=R0S2FkTced8)
