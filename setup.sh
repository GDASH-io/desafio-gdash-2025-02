#!/bin/bash

# Script de Setup Inicial - G-Dash 2025/02
# Uso: ./setup.sh

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🌤️  G-DASH 2025/02 Setup Script   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"

# Função de verificação
check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${RED}✗ $1 não encontrado${NC}"
        return 1
    fi
    echo -e "${GREEN}✓ $1 encontrado${NC}"
    return 0
}

# 1. Verificar pré-requisitos
echo -e "\n${BLUE}1️⃣  Verificando pré-requisitos...${NC}\n"

has_errors=0
check_command "git" || has_errors=1
check_command "docker" || has_errors=1
check_command "node" || has_errors=1
check_command "npm" || has_errors=1
check_command "python3" || has_errors=1

if [ $has_errors -eq 1 ]; then
    echo -e "\n${RED}❌ Alguns pré-requisitos não foram encontrados.${NC}"
    echo -e "${YELLOW}Instale todos antes de continuar:${NC}"
    echo "  - Git: https://git-scm.com/downloads"
    echo "  - Docker: https://www.docker.com/products/docker-desktop"
    echo "  - Node.js 18+: https://nodejs.org/"
    echo "  - Python 3.10+: https://www.python.org/downloads/"
    exit 1
fi

# 2. Criar arquivo .env se não existir
echo -e "\n${BLUE}2️⃣  Configurando ambiente...${NC}\n"

ENV_FILE="$PROJECT_DIR/backend/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}ℹ  Criando .env a partir de .env.example${NC}"
    cp "$PROJECT_DIR/backend/.env.example" "$ENV_FILE"
    echo -e "${GREEN}✓ .env criado${NC}"
else
    echo -e "${GREEN}✓ .env já existe${NC}"
fi

# 3. Instalar dependências Backend
echo -e "\n${BLUE}3️⃣  Instalando dependências Backend...${NC}\n"

if [ -f "$PROJECT_DIR/backend/package.json" ]; then
    cd "$PROJECT_DIR/backend"
    npm install
    echo -e "${GREEN}✓ Dependências Backend instaladas${NC}"
else
    echo -e "${RED}✗ package.json não encontrado em backend${NC}"
    exit 1
fi

# 4. Instalar dependências Frontend
echo -e "\n${BLUE}4️⃣  Instalando dependências Frontend...${NC}\n"

if [ -f "$PROJECT_DIR/frontend/package.json" ]; then
    cd "$PROJECT_DIR/frontend"
    npm install
    echo -e "${GREEN}✓ Dependências Frontend instaladas${NC}"
else
    echo -e "${RED}✗ package.json não encontrado em frontend${NC}"
    exit 1
fi

# 5. Criar diretório de logs
echo -e "\n${BLUE}5️⃣  Preparando diretórios...${NC}\n"

mkdir -p "$PROJECT_DIR/logs"
chmod 755 "$PROJECT_DIR/logs"
echo -e "${GREEN}✓ Diretório de logs criado${NC}"

# 6. Tornar scripts executáveis
chmod +x "$PROJECT_DIR/start-all.sh" 2>/dev/null || true
chmod +x "$PROJECT_DIR/start-all" 2>/dev/null || true
echo -e "${GREEN}✓ Scripts executáveis${NC}"

# 9. Resumo final
echo -e "\n${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Setup concluído com sucesso!${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}Próximos passos:${NC}\n"

if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    echo "1. Inicie o sistema:"
    echo -e "   ${BLUE}./start-all.sh start${NC}\n"
    echo "2. Acesse http://localhost:5173\n"
    echo "3. Login com:"
    echo -e "   ${BLUE}Email:  admin@gdash.com${NC}"
    echo -e "   ${BLUE}Senha:  ChangeMe123!@#_strong_password${NC}\n"
else
    echo "1. Inicie o sistema:"
    echo -e "   ${BLUE}powershell -ExecutionPolicy Bypass -File .\\start-all.ps1 start${NC}\n"
    echo "2. Acesse http://localhost:5173\n"
    echo "3. Login com:"
    echo -e "   ${BLUE}Email:  admin@gdash.com${NC}"
    echo -e "   ${BLUE}Senha:  ChangeMe123!@#_strong_password${NC}\n"
fi

echo -e "${YELLOW}Documentação:${NC}"
echo -e "  • README.md - Descrição do projeto"
echo -e "  • WINDOWS_SETUP.md - Setup específico para Windows"
echo -e "  • TECHNICAL_REFERENCE.md - Referência técnica\n"

echo -e "${GREEN}Boa sorte! 🚀${NC}\n"
