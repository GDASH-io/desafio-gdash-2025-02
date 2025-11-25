# GDASH - Deployment Guide

## Quick Start

```bash
docker-compose up -d --build
docker-compose ps
```

## Services Status

### Infrastructure

- Redis (port 6379)
- MongoDB (port 27017)

### Application

- Python Collector - Collecting weather data every 5 minutes
- Go Worker - Processing queue and sending to API
- NestJS API (port 3000) - REST API + AI
- React Frontend (port 5173) - Web interface

## Troubleshooting

### 1. **npm ci sem package-lock.json**

- **Problema:** Dockerfiles usavam `npm ci` mas não havia `package-lock.json`
- **Solução:** Alterado para `npm install` em todos os Dockerfiles

### 2. **Go checksum mismatch**

- **Problema:** `go.sum` tinha checksum incorreto para `github.com/cespare/xxhash/v2`
- **Solução:** Corrigido o hash no arquivo `go.sum`

### 3. **NestJS "Cannot find module '/app/dist/main.js'"**

- **Problema:** Volume mount do docker-compose sobrescrevia o código compilado
- **Solução:**
  - Removido volume mount de código fonte (mantido apenas `/app/exports`)
  - Adicionado `.js` na extensão do arquivo no CMD
  - Adicionado TypeScript configs no build
  - Copiado `node_modules` do builder para produção

### 4. **NestJS healthcheck falhando**

- **Problema:** Imagem `node:20-alpine` não tem `curl` instalado
- **Solução:** Adicionado `apk add --no-cache curl` no Dockerfile

### 5. **Go Worker com erro de autenticação Redis**

### Common Issues

1. **npm ci failing** - Changed to `npm install` in Dockerfiles
2. **Go checksum mismatch** - Fixed hash in go.sum file
3. **NestJS module not found** - Removed volume mounts overwriting compiled code
4. **Redis auth error** - Removed password from .env (Redis has no auth in dev)

## Endpoints

### API

- Base URL: http://localhost:3000
- Health: http://localhost:3000/health
- Docs: http://localhost:3000/api/docs

### Frontend

- URL: http://localhost:5173

### MongoDB

- Connection: `mongodb://admin:admin123@localhost:27017/gdash?authSource=admin`

### Redis

- Host: localhost:6379

## Commands

### Iniciar todos os serviços

```bash
docker-compose up -d
```

### Ver status

```bash
docker-compose ps
```

### Ver logs

```bash
# Todos os serviços
docker-compose logs -f

# Serviço específico
docker-compose logs -f nestjs-api
docker-compose logs -f python-collector
docker-compose logs -f go-worker
docker-compose logs -f react-frontend
```

```bash
docker-compose down
```

Rebuild:

```bash
docker-compose build --no-cache
docker-compose up -d
```

Logs:

```bash
docker-compose logs -f
docker-compose logs -f nestjs-api
```

## Credentials

MongoDB:

- Username: admin
- Password: admin123
- Database: gdash

JWT Secret: Change in production!
