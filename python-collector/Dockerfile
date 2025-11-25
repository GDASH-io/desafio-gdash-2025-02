FROM python:3.12-slim
WORKDIR /app

# Dependências básicas para evitar problemas SSL e timezone
RUN apt-get update && apt-get install -y tzdata ca-certificates && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py ./

ENV FETCH_INTERVAL_SECONDS=3600
CMD ["python", "main.py"]