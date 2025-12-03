#!/bin/bash

# Script de Verificação Rápida do ClimaTempo

echo "🔍 Verificação do Projeto ClimaTempo"
echo "===================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificações
echo "📦 Verificando Estrutura..."
echo ""

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
        return 0
    else
        echo -e "${RED}❌${NC} $1"
        return 1
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} $1/"
        return 0
    else
        echo -e "${RED}❌${NC} $1/"
        return 1
    fi
}

# Verificar pastas
echo "Pastas:"
check_dir "nestjs-api"
check_dir "frontend"
check_dir "data-collector"
check_dir "go-worker"

echo ""
echo "Arquivos Raiz:"
check_file "docker-compose.yml"
check_file "README.md"
check_file "VERIFICACAO.md"
check_file ".gitignore"

echo ""
echo "NestJS-API:"
check_file "nestjs-api/package.json"
check_file "nestjs-api/tsconfig.json"
check_file "nestjs-api/Dockerfile"
check_file "nestjs-api/src/app.module.ts"
check_file "nestjs-api/src/main.ts"
check_file "nestjs-api/src/auth/auth.controller.ts"
check_file "nestjs-api/src/users/users.service.ts"
check_file "nestjs-api/src/weather/weather.service.ts"

echo ""
echo "Frontend:"
check_file "frontend/package.json"
check_file "frontend/vite.config.js"
check_file "frontend/Dockerfile"
check_file "frontend/src/App.jsx"
check_file "frontend/src/main.jsx"
check_file "frontend/index.html"

echo ""
echo "Data-Collector:"
check_file "data-collector/requirements.txt"
check_file "data-collector/app.py"
check_file "data-collector/Dockerfile"

echo ""
echo "Go-Worker:"
check_file "go-worker/main.go"
check_file "go-worker/Dockerfile"

echo ""
echo "===================================="
echo "✅ Verificação Concluída!"
echo ""
echo "Para rodar o projeto:"
echo "  docker-compose up --build"
echo ""
echo "Acessar em:"
echo "  - Frontend: http://localhost"
echo "  - API: http://localhost:3000/api"
echo "  - Credenciais: admin/password123"
echo ""
