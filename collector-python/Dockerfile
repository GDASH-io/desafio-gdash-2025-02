FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Desativa buffering de stdout/stderr
ENV PYTHONUNBUFFERED=1

# -u = modo unbuffered também (dobrada de segurança)
CMD ["python", "-u", "main.py"]
