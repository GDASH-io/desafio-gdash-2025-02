FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV RABBITMQ_HOST=rabbitmq

CMD ["python", "-u", "main.py"]