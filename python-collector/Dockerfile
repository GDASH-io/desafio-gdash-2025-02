FROM python:3.11-alpine

WORKDIR /app


RUN apk add --no-cache gcc musl-dev linux-headers


COPY requirements.txt .


RUN pip install --no-cache-dir -r requirements.txt


COPY . .


RUN adduser -D pythonuser && chown -R pythonuser:pythonuser /app
USER pythonuser


CMD ["python", "main.py"]