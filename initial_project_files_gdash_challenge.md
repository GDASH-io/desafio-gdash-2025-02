# Arquivos iniciais para o desafio GDASH — Estrutura Clean Architecture

Este documento contém os arquivos iniciais (skeletons) para os serviços do projeto: **colletor-python**, **worker-go**, **api-nest** e **frontend-react**, além de arquivos raiz (docker-compose, .gitignore, README inicial e .env.example). Copie/cole os arquivos para o seu repositório e ajuste conforme necessário.

---

## Estrutura (resumo)
```
desafio-gdash-2025-02/
├── .gitignore
├── README.md
├── docker-compose.yml
├── .env.example
├── colletor-python/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── src/
│       └── main.py
├── worker-go/
│   ├── Dockerfile
│   └── cmd/worker/main.go
├── api-nest/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── main.ts
│       └── app.module.ts
└── frontend-react/
    ├── Dockerfile
    ├── package.json
    └── src/
        └── App.tsx
```

---

> **Importante:** não coloque segredos no repositório. Use `.env` localmente; apenas comite `.env.example`.

---

## Arquivos raiz

### `.gitignore`
```gitignore
node_modules/
dist/
.env
.env.local
.vscode/
__pycache__/
venv/
.DS_Store
.idea/
/*.log
```

### `README.md` (inicial)
```md
# Desafio GDASH — Estrutura inicial

Este repositório contém a estrutura inicial do desafio GDASH. Conteúdo mínimo de cada serviço foi incluído como skeleton para acelerar o desenvolvimento.

Siga o README completo do desafio para implementar as funcionalidades.
```

### `.env.example`
```env
# Docker / Infra
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=root
KAFKA_BOOTSTRAP_SERVERS=kafka:9092
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/

# Collector (OpenWeather)
OPENWEATHER_API_KEY=YOUR_OPENWEATHER_API_KEY
LATITUDE=-19.5186
LONGITUDE=-42.6289
TIMEZONE=America/Sao_Paulo
COLLECT_INTERVAL_SECONDS=3600
KAFKA_TOPIC_RAW=ana.raw.readings

# NestJS
MONGO_URL=mongodb://root:root@mongodb:27017/gdash?authSource=admin
JWT_SECRET=changeme
```

### `docker-compose.yml` (mínimo para desenvolvimento)
```yaml
version: "3.9"

services:
  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  zookeeper:
    image: bitnami/zookeeper:latest
    environment:
      - ALLOW_ANONYMOUS_LOGIN=yes

  kafka:
    image: bitnami/kafka:latest
    environment:
      - KAFKA_BROKER_ID=1
      - KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181
      - KAFKA_LISTENERS=PLAINTEXT://:9092
      - KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092
    depends_on:
      - zookeeper

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "15672:15672"
      - "5672:5672"

  collector:
    build: ./colletor-python
    depends_on:
      - kafka
    environment:
      - KAFKA_BOOTSTRAP_SERVERS=kafka:9092
    volumes:
      - ./colletor-python:/app

  worker:
    build: ./worker-go
    depends_on:
      - kafka
      - mongodb
    volumes:
      - ./worker-go:/app

  api:
    build: ./api-nest
    ports:
      - "3000:3000"
    depends_on:
      - mongodb
    volumes:
      - ./api-nest:/app

  frontend:
    build: ./frontend-react
    ports:
      - "5173:5173"
    depends_on:
      - api
    volumes:
      - ./frontend-react:/app

volumes:
  mongo_data:
```

---

## `colletor-python` (OpenWeather collector)

### `colletor-python/Dockerfile`
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY src/ ./src
CMD ["python", "src/main.py"]
```

### `colletor-python/requirements.txt`
```
requests
kafka-python
pytz
python-dotenv
```

### `colletor-python/src/main.py` (skeleton)
```python
import os
import time
import json
import requests
from datetime import datetime
from kafka import KafkaProducer
from dotenv import load_dotenv

load_dotenv()

OPENWEATHER_KEY = os.getenv("OPENWEATHER_API_KEY")
LAT = os.getenv("LATITUDE")
LON = os.getenv("LONGITUDE")
INTERVAL = int(os.getenv("COLLECT_INTERVAL_SECONDS", "3600"))
KAFKA_BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")
TOPIC = os.getenv("KAFKA_TOPIC_RAW", "ana.raw.readings")

producer = KafkaProducer(
    bootstrap_servers=KAFKA_BOOTSTRAP.split(","),
    value_serializer=lambda v: json.dumps(v, default=str).encode("utf-8"),
    retries=5
)

def fetch_openweather():
    url = "https://api.openweathermap.org/data/2.5/onecall"
    params = {
        "lat": LAT,
        "lon": LON,
        "appid": OPENWEATHER_KEY,
        "units": "metric",
        "exclude": "minutely"
    }
    r = requests.get(url, params=params, timeout=15)
    r.raise_for_status()
    return r.json()


def build_message(api_json):
    now = datetime.utcnow().isoformat() + "Z"
    payload = []
    # exemplo: hourly
    hourly = api_json.get("hourly", [])
    for entry in hourly:
        payload.append({
            "timestamp": datetime.utcfromtimestamp(entry.get("dt")).isoformat() + "Z",
            "temperature_c": entry.get("temp"),
            "relative_humidity": entry.get("humidity"),
            "precipitation_mm": entry.get("rain", {}).get("1h", 0) if isinstance(entry.get("rain", {}), dict) else 0,
            "wind_speed_m_s": entry.get("wind_speed"),
            "weather_code": entry.get("weather", [{}])[0].get("id")
        })

    return {
        "source": "openweather",
        "city": "Coronel Fabriciano",
        "country": "BR",
        "coords": {"lat": float(LAT), "lon": float(LON)},
        "fetched_at": now,
        "interval": "hourly",
        "payload": payload
    }


def main_loop():
    while True:
        try:
            data = fetch_openweather()
            msg = build_message(data)
            producer.send(TOPIC, msg)
            producer.flush()
            print("Published", msg.get("fetched_at"))
        except Exception as e:
            print("Error in collector:", e)
        time.sleep(INTERVAL)

if __name__ == '__main__':
    main_loop()
```

---

## `worker-go` (skeleton consumer)

### `worker-go/Dockerfile`
```dockerfile
FROM golang:1.20-alpine
WORKDIR /app
COPY . .
RUN go build -o worker ./cmd/worker
CMD ["./worker"]
```

### `worker-go/cmd/worker/main.go`
```go
package main

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "os"

    amqp "github.com/rabbitmq/amqp091-go"
)

func failOnError(err error, msg string) {
    if err != nil {
        log.Fatalf("%s: %s", msg, err)
    }
}

func main() {
    // Exemplo simples com RabbitMQ — adapte para Kafka se precisar
    rabbitURL := os.Getenv("RABBITMQ_URL")
    conn, err := amqp.Dial(rabbitURL)
    failOnError(err, "Failed to connect to RabbitMQ")
    defer conn.Close()

    ch, err := conn.Channel()
    failOnError(err, "Failed to open a channel")
    defer ch.Close()

    q, err := ch.QueueDeclare(
        "weather_queue",
        true,
        false,
        false,
        false,
        nil,
    )
    failOnError(err, "Failed to declare a queue")

    msgs, err := ch.Consume(
        q.Name,
        "",
        true,
        false,
        false,
        false,
        nil,
    )
    failOnError(err, "Failed to register a consumer")

    forever := make(chan bool)

    go func() {
        for d := range msgs {
            // process message
            var payload map[string]interface{}
            if err := json.Unmarshal(d.Body, &payload); err != nil {
                log.Println("invalid message", err)
                continue
            }

            // send to API (example)
            go func(p map[string]interface{}) {
                body, _ := json.Marshal(p)
                resp, err := http.Post("http://api:3000/api/v1/weather/logs", "application/json",
                    bytes.NewReader(body))
                if err != nil {
                    log.Println("error posting to api", err)
                    return
                }
                defer resp.Body.Close()
                fmt.Println("Posted to API, status", resp.StatusCode)
            }(payload)
        }
    }()

    fmt.Println("Worker running. Waiting for messages.")
    <-forever
}
```

> Nota: o exemplo acima usa RabbitMQ e `amqp091-go`. Se escolher Kafka, substitua o consumer por `segmentio/kafka-go` ou `confluent-kafka-go`.

---

## `api-nest` (skeleton mínimo)

### `api-nest/Dockerfile`
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["node", "dist/main.js"]
```

### `api-nest/package.json`
```json
{
  "name": "api-nest",
  "version": "0.0.1",
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "build": "nest build"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "mongoose": "^7.0.0",
    "@nestjs/mongoose": "^10.0.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "typescript": "^5.0.0"
  }
}
```

### `api-nest/src/main.ts`
```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  await app.listen(3000);
  console.log('API running on http://localhost:3000/api/v1');
}
bootstrap();
```

### `api-nest/src/app.module.ts`
```ts
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

---

## `frontend-react` (skeleton mínimo)

### `frontend-react/Dockerfile`
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]
```

### `frontend-react/package.json`
```json
{
  "name": "frontend-react",
  "version": "0.0.1",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "typescript": "^5.0.0"
  }
}
```

### `frontend-react/src/App.tsx`
```tsx
import React from 'react';

export function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>GDASH - Dashboard (skeleton)</h1>
      <p>Frontend inicial. Integre com /api/v1 endpoints.</p>
    </div>
  );
}

export default App;
```

---

## Próximos passos sugeridos
1. Copiar os arquivos do canvas para o seu workspace.
2. Criar branch `feature/initial-structure` e commitar.
3. Ajustar `docker-compose.yml` e variáveis `.env` locais (coloque sua chave OpenWeather em `.env`).
4. Subir stack `docker compose up --build` e testar o collector com intervalo reduzido (`COLLECT_INTERVAL_SECONDS=60`).
5. Implementar o worker para enviar para a API NestJS e criar um endpoint `POST /api/v1/weather/logs` que persista em MongoDB.

---

Se quiser, eu também posso:
- Gerar comandos `git` prontos para criar a branch e commitar tudo.
- Gerar o código completo do endpoint NestJS `POST /api/v1/weather/logs` com Mongoose schema.
- Gerar um worker Kafka (em Go) em vez do exemplo RabbitMQ.

Diga qual desses você prefere a seguir.

