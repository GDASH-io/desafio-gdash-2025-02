# Desafio para o processo seletivo GDASH 2025/02

Repositório destinado aos interessados em participar do processo seletivo GDASH 2025/02.
Sistema full-stack de coleta, processamento e visualização de dados climáticos com insights de IA.

## 🛠️ Stack Tecnológica

- **Frontend:** React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** NestJS + TypeScript + MongoDB
- **Worker:** Go + RabbitMQ
- **Collector:** Python
- **Infraestrutura:** Docker Compose

## 🚀 Como Rodar

### Pré-requisitos

- Docker e Docker Compose
- Node.js 18+
- Python 3.9+
- Go 1.20+

### Executar com Docker Compose
```bash
# Copiar variáveis de ambiente
cp .env.example .env

# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### Acessar Aplicação

- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001
- **API Docs (Swagger):** http://localhost:3001/api
- **RabbitMQ Management:** http://localhost:15672 (guest/guest)

### Credenciais Padrão

- **Email:** admin@example.com
- **Senha:** 123456

## 📹 Vídeo Explicativo

_Link será adicionado após finalização_