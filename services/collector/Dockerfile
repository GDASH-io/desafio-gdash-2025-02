FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY src ./src
ENV PYTHONPATH=/app/src
ENV PYTHONUNBUFFERED=1
CMD ["python", "-u", "-m", "src"]


