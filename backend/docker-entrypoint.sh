#!/bin/sh
set -e

# Sempre reinstalar bcrypt para garantir compatibilidade com Linux
echo "Verificando e reinstalando bcrypt se necessário..."
if [ -d "node_modules/bcrypt" ]; then
  rm -rf node_modules/bcrypt
fi
npm install bcrypt --build-from-source --no-save || npm install bcrypt --no-save

# Executar comando passado
exec "$@"

