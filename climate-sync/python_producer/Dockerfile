FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN apt-get update && apt-get install -y tzdata && rm -rf /var/lib/apt/lists/*

COPY . .

RUN mkdir -p /logs

CMD ["python", "-u", "main.py"]

