#!/bin/bash
# Script para executar o collector localmente

cd "$(dirname "$0")"

# Ativar ambiente virtual se existir
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Executar o collector
python3 src/main.py

