FROM python:3.11-slim

WORKDIR /app

# Instalar dependências
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código fonte
COPY src/ ./src/

# Definir PYTHONPATH
ENV PYTHONPATH=/app

# Comando para executar o collector
CMD ["python", "src/main.py"]
