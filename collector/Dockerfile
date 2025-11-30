FROM python:3.10-slim

# Variáveis para otimizar o Python no Docker
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# ⚠️ CORREÇÃO DE IMPORT: Define a raiz do projeto para evitar erro "ModuleNotFoundError"
ENV PYTHONPATH=/app

WORKDIR /app

# 1. Instala o tzdata para corrigir o horário (Timezone)
# Como é uma imagem Debian (slim), usamos apt-get
RUN apt-get update && \
    apt-get install -y tzdata && \
    rm -rf /var/lib/apt/lists/*

# 2. Instala as dependências do projeto
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 3. Copia todo o código fonte
COPY . .

# 4. Comando de execução
# Apontando para src/main.py conforme sua estrutura de pastas
CMD ["python", "src/main.py"]