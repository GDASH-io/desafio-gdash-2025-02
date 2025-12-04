#!/usr/bin/env bash
set -euo pipefail

# Script seguro para subir o ambiente do docker-compose
# - roda down com remove-orphans para evitar containers órfãos
# - sobe com build

HERE=$(cd "$(dirname "$0")" && pwd)
cd "$HERE/.."

echo "Parando e removendo containers antigos (se houver)..."
docker-compose down --remove-orphans

echo "Construindo e subindo containers..."
docker-compose up -d --build

echo "Pronto. Use 'docker-compose ps' para verificar os serviços." 
