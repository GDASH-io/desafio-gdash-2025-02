# Desafio Full-Stack GDash

Este projeto é uma solução completa para o desafio de coleta e visualização de dados climáticos.

## Arquitetura

- **Collector (Python)**: Coleta dados do Open-Meteo e envia para RabbitMQ.
- **Worker (Go)**: Consome dados do RabbitMQ e envia para a API.
- **Backend (NestJS)**: API REST para armazenar logs, gerenciar usuários e gerar insights.
- **Frontend (React + Vite)**: Dashboard para visualização de dados e gerenciamento de usuários.
- **Banco de Dados**: MongoDB.
- **Mensageria**: RabbitMQ.

## Como Rodar

1. Certifique-se de ter o Docker e Docker Compose instalados.
2. Clone o repositório.
3. Crie o arquivo `.env` baseado no `.env.example` (já criado por padrão).
4. Execute:

```bash
docker compose up --build
```

5. Acesse:
    - Frontend: http://localhost:5173
    - Backend API: http://localhost:3000
    - RabbitMQ Management: http://localhost:15672 (guest/guest)

## Usuário Padrão

- **Email**: admin@example.com
- **Senha**: 123456

## Funcionalidades

- **Dashboard**: Visualização de temperatura, umidade, vento e gráficos.
- **Insights**: Análise simples dos dados coletados.
- **Usuários**: CRUD completo de usuários.
- **Exportação**: Download de dados em CSV/XLSX.

## Documentação Técnica 📚

Para entender a fundo cada parte do projeto, consulte nossos guias educativos:

- [Guia de Apresentação Geral](docs/presentation_guide.md)
- [Backend (NestJS) - Guia de Aprendizado](docs/learning/BACKEND_LEARNING_GUIDE.md)
- [Frontend (React) - Guia de Aprendizado](docs/learning/FRONTEND_LEARNING_GUIDE.md)
- [Collector (Python) - Guia de Aprendizado](docs/learning/COLLECTOR_LEARNING_GUIDE.md)
- [Worker (Go) - Guia de Aprendizado](docs/learning/WORKER_LEARNING_GUIDE.md)

## Desenvolvimento

- **Backend**: `cd backend && npm run start:dev`
- **Frontend**: `cd frontend && npm run dev`
- **Collector**: `cd collector && python main.py`
- **Worker**: `cd worker && go run main.go`

## Vídeo Explicativo

[Assista ao vídeo de apresentação](https://youtu.be/lsJYrzuBF9I)
