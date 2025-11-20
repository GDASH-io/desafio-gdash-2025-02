# ============================
# 1️⃣ Imagem base
# ============================
FROM python:3.12-slim

# ============================
# 2️⃣ Configurações básicas
# ============================
WORKDIR /app

# Evita buffer no print do Python
ENV PYTHONUNBUFFERED=1

# Melhor performance de dependências
ENV PIP_NO_CACHE_DIR=1

# ============================
# 3️⃣ Instalar dependências do sistema
# ============================
# (Necessário para pandas, numpy e libs de rede)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ============================
# 4️⃣ Copiar dependências
# ============================
COPY requirements.txt .

# Instalar pacotes Python
RUN pip install -r requirements.txt

# ============================
# 5️⃣ Copiar tudo do worker
# ============================
COPY . .

# ============================
# 6️⃣ Comando padrão
# ============================
# Troque "main.py" pelo arquivo principal do seu worker
CMD ["python", "main.py"]
