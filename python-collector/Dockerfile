FROM python:3.11-slim

# Diretorio de trabalho
WORKDIR /usr/src/app

ENV PYTHONUNBUFFERED=1

# Copia o arquivo de dependências e instala as bibliotecas
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código da aplicação
COPY . .

# Comando de execução
CMD [ "python", "collector.py" ]