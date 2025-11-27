# Desafio Full-Stack – Weather Insights ☁️

## Link do desafio
https://github.com/GDASH-io/desafio-gdash-2025-02

Backend em **Django REST + Celery + RabbitMQ** que:

- Coleta dados de clima na API **OpenWeather**;
- Salva os registros em `WeatherLog`;
- Gera **insights de IA** em `WeatherInsight`;
- Disponibiliza endpoints para um dashboard (React, etc).

---

## 1. Como clonar e subir com Docker

```bash
# 1. Clonar o repositório
git clone https://github.com/sergiohscl/Desafio_GDASH-2025
cd desafio_gdash_2025/backend

    # 1.1 Criar virtual venv.

        python3 -m venv venv
        . venv/Scripts/activate

    # 1.2 Instalar as dependências no projeto.

        pip install -r requirements.txt

    # 1.3 Roda o banco de dados e cria super usuario.

        python manage.py migrate
        python manage.py createsuperuser

    # 1.4 Rodar o sistema e acessar o admin.

        python manage.py runserver (`http://localhost:8000/admin`)

    #  1.5 Documentação das API's (swagger).

      (`http://localhost:8000/swagger/`)

# 2. Criar o arquivo de variáveis de ambiente
cp .env.example .env
# editar .env e preencher:
# - DB (se necessário)
# - RABBITMQ (CELERY_BROKER_URL)
# - OPENWEATHER_API_KEY
# - OPENAI_API_KEY (opcional, para IA)

# 3. Subir tudo com Docker Compose
docker compose up -d --build
```

Serviços principais:

- `web`   → Django + DRF (`http://localhost:8000/`)
- `rabbitmq` → Broker de mensagens (painel em `http://localhost:15672/`)
- `celery` → Worker que processa tasks
- `beat`  → Scheduler (dispara as tasks periódicas)

### Comandos úteis

```bash
# Parar tudo
docker compose down

# Ver logs gerais
docker compose logs -f

# Ver logs só do worker Celery
docker compose logs -f celery

# Ver logs só do beat
docker compose logs -f beat

# (Opcional) aplicar migrações manualmente dentro do container web
docker compose exec web python manage.py migrate

# Criar superusuário
docker compose exec web python manage.py createsuperuser
```

---

## 2. Fluxo simples de dados

1. **Coleta periódica (Celery Beat → Celery Worker)**  
   - A cada **1 hora** o `beat` dispara a task `collect_weather_task`.
   - A task chama a API do clima (OpenWeather) com latitude/longitude configuradas.
   - O resultado é normalizado e salvo em `WeatherLog` (incluindo campo `raw` com o JSON original).

2. **Geração de insights (IA + resumo numérico)**  
   - A cada **2 horas** o `beat` dispara `generate_insights_task`.
   - A task lê os últimos registros (ex.: últimas 24h), calcula médias/máx/mín
     e gera um texto:
     - primeiro usando uma regra numérica;
     - depois, opcionalmente, refinando o texto via OpenAI (`OPENAI_API_KEY`).
   - O resultado é salvo em `WeatherInsight`.

3. **Consumo pela API**  
   - O frontend (React) consome os endpoints:
     - lista de registros;
     - exportações CSV/XLSX;
     - último insight;
     - geração sob demanda de novo insight;
     - coleta de clima para outra cidade.

---

## 3. Endpoints principais

Base: `http://localhost:8000/api/v1`

### Logs de clima

- `GET  /weather/logs/`  
  Lista registros (`WeatherLog`) com paginação.

- `POST /weather/logs/`  
  Cria um registro manualmente (caso outro serviço queira publicar dados de clima).

- `GET  /weather/logs/export.csv/`  
  Exporta todos os logs em CSV.

- `GET  /weather/logs/export.xlsx/`  
  Exporta todos os logs em XLSX.

- `POST /weather/logs/fetch-city/`  
  Coleta clima **em tempo real** de uma cidade informada e salva em `WeatherLog`.  
  Exemplo de corpo:

  ```json
  {
    "city_name": "São Paulo"
  }
  ```

### Insights

- `GET  /weather/logs/insights/`  
  Lista todos os insights (`WeatherInsight`).

- `GET  /weather/logs/insights/latest/`  
  Retorna o insight mais recente.

- `POST /weather/logs/insights/`  
  Gera insight sob demanda (usa Celery) a partir dos últimos `hours`:

  ```json
  {
    "hours": 24,
    "city": "Brasília"   // opcional, para focar em uma cidade
  }
  ```

Resposta (202 Accepted) inclui o `task_id` da task Celery.

---

## 4. Resumo rápido da arquitetura

- **Django + DRF**  
  - Modelos `WeatherLog` e `WeatherInsight`;
  - ViewSets com endpoints REST;
  - Exportação CSV/XLSX.

- **Celery + RabbitMQ**  
  - `collect_weather_task` → busca clima e grava log;
  - `generate_insights_task` → gera texto de insight;
  - **Beat** agenda essas tasks (coleta 1h / insight 2h).

- **APIs externas**  
  - **OpenWeather** → clima atual (usando lat/lon ou nome da cidade);
  - **OpenAI** (opcional) → deixa o texto dos insights mais natural.

Com isso, você tem um pipeline completo:  
**dados reais de clima → fila → banco → IA → endpoints para o dashboard.**
