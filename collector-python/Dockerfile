FROM python:3.11-slim

WORKDIR /app

RUN pip install requests pika schedule google-generativeai

COPY . .

CMD ["python", "-u", "main.py"]