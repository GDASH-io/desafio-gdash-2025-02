#!/usr/bin/env bash
set -euo pipefail

HERE=$(cd "$(dirname "$0")" && pwd)
cd "$HERE/.."

docker-compose down --remove-orphans
docker-compose up -d --build
echo "Serviços iniciados."
