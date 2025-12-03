FROM python:3.11-slim

WORKDIR /app

# Copiar requirements e instalar dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código do collector
COPY collector.py .

# Criar usuário não-root para segurança
RUN useradd -m -u 1000 collector && \
    chown -R collector:collector /app

USER collector

# Variáveis de ambiente padrão (podem ser sobrescritas)
ENV COLLECTOR_MODE=rabbit
ENV COLLECT_INTERVAL=60
ENV BACKEND_URL=http://backend:3000
ENV RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/

# Executar collector
CMD ["python", "collector.py"]

