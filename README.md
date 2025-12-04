# GDASH 2025/02 - Starter scaffold
Este repositório é um *starter* para o desafio GDASH 2025/02. Ele contém uma estrutura mínima com os serviços esperados e instruções passo-a-passo para rodar o desafio localmente.

## Conteúdo do ZIP
- `docker-compose.yml` - compose com MongoDB, RabbitMQ e placeholders para API, frontend, producer Python e worker Go.
- `backend/` - esqueleto NestJS (placeholder).
- `frontend/` - esqueleto React + Vite (placeholder).
- `python-producer/` - script Python de exemplo para coletar clima e enviar para fila.
- `go-worker/` - esqueleto do worker em Go que consome a fila.
- `.env.example` - variáveis de ambiente de exemplo.
- `README-run.md` - instruções detalhadas de instalação e execução (PT-BR).

## Passo a passo rápido
1. Instale Docker e Docker Compose.
2. Extraia o zip e abra um terminal na pasta.
3. Copie `.env.example` para `.env` e ajuste valores se necessário.
4. Rode `docker compose up --build` para subir os containers.
5. Acesse a API no `http://localhost:3000` (quando implementada) e o frontend no `http://localhost:5173`.
6. Execute os serviços de coleta (Python) e worker (Go) conforme descrito em `README-run.md`.

Boa sorte! 🚀
