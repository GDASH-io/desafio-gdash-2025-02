FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
# Instala as dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código da aplicação
COPY app.py .

# Comando para rodar a aplicação
CMD ["python", "app.py"]