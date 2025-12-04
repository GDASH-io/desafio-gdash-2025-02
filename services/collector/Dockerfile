FROM python:3.13.9-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

RUN mkdir -p /app/logs && chown -R appuser:appuser /app

USER appuser

HEALTHCHECK --interval=60s --timeout=5s --start-period=10s --retries=3 \ 
    CMD ps aux | grep -q "[p]ython.*main.py" || exit 1

CMD ["python", "-u", "src/main.py"]