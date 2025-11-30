FROM python:3.14-slim

WORKDIR /app

COPY main.py .

RUN pip install --no-cache-dir requests pika python-dotenv

CMD ["python", "main.py"]
