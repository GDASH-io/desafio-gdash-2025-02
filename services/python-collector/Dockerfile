FROM python:3.11-slim

# essas variáveis evitam criação de .pyc e forçam flush do stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /worker-python

# instala dependências do sistema
RUN apt-get update && apt-get install -y ca-certificates --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copia o manifesto de dependências primeiro para aproveitar o cache da camada
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código da aplicação
COPY . .

# Comando padrão: roda o scheduler que coleta e envia mensagens
# Comando padrão: roda o scheduler como um módulo para que as importações relativas funcionem
# Executar a partir da raiz do projeto com o pacote `src`, para que `from .collector` funcione
CMD ["python", "-m", "src.scheduler"]