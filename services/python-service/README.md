# python-collector

Serviço Python responsável por coletar previsões do tempo, normalizar e enviar para a fila RabbitMQ.

Run locally:

1. Create virtualenv and install deps:

```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

2. Run scheduler (sends messages to RabbitMQ):

```bash
python -m src.scheduler
```

Docker (build image):

```bash
docker build -t python-collector ./services/python-collector
```

Config: edit `config/settings.yaml` or set environment variables described in `.env.example`.
