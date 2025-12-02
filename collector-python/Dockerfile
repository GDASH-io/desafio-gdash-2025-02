FROM python:3.11-slim

# Fazer o Python não bufferizar a saída — para logs aparecerem imediatamente
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py /app/

CMD ["python", "-u", "app.py"]
