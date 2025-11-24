#!/bin/sh
set -e

# se o binário existir e for executável, executa; caso contrário, mantém o container vivo para debug
if [ -x "/app/go-worker" ]; then
  echo "Executando go-worker..."
  exec /app/go-worker
else
  echo "go-worker binário não encontrado. O container ficará ativo aguardando desenvolvimento."
  # mantem o container vivo (útil para inspecionar logs/volumes). Altere conforme desejar.
  tail -f /dev/null
fi
