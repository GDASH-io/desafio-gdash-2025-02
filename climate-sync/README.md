# Climate Sync 🌦️

Solução de monitoramento climático distribuído com Inteligência Artificial.

---

## 🚀 Como rodar tudo via Docker Compose

A maneira mais simples de rodar a aplicação completa é utilizando o Docker Compose. Isso subirá todos os serviços (Frontend, Backend, Worker Go, Producer Python, RabbitMQ e MongoDB).

1.  **Configure as variáveis de ambiente:**
    ```bash
    cp .env.example .env
    ```
    *Opcional: Adicione sua `GEMINI_API_KEY` no arquivo `.env` para insights reais de IA.*

2.  **Suba os containers:**
    ```bash
    docker compose up --build
    ```

3.  **Acesse a aplicação:**
    *   **Frontend:** [http://localhost:80](http://localhost:80)
    *   **API:** [http://localhost:3000](http://localhost:3000)

---

## 🐍 Como rodar o serviço Python (Producer)

Se você deseja rodar ou reiniciar apenas o serviço Python:

```bash
docker compose up -d --build python-producer
```

Para ver os logs:
```bash
docker compose logs -f python-producer
```

---

## 🐹 Como rodar o worker Go

Se você deseja rodar ou reiniciar apenas o worker em Go:

```bash
docker compose up -d --build go-worker
```

Para ver os logs:
```bash
docker compose logs -f go-worker
```

---

## � Como rodar a API (NestJS)

Se você deseja rodar ou reiniciar apenas o backend:

```bash
docker compose up -d --build nestjs-api
```

Para ver os logs:
```bash
docker compose logs -f nestjs-api
```

---

## ⚛️ Como rodar o Frontend

Se você deseja rodar ou reiniciar apenas o frontend:

```bash
docker compose up -d --build frontend
```

Para ver os logs:
```bash
docker compose logs -f frontend
```

---

## �🔗 URLs Principais

*   **Frontend (Dashboard):** [http://localhost:80](http://localhost:80)
*   **API (Backend):** [http://localhost:3000](http://localhost:3000)
*   **Swagger API Docs:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs) (se habilitado)
*   **RabbitMQ Management:** [http://localhost:15672](http://localhost:15672)

---

## 🔐 Acesso Inicial (Usuário Padrão)

Para acessar o Dashboard, utilize as seguintes credenciais criadas automaticamente:

*   **Email:** `admin@example.com`
*   **Senha:** `123456`

---

## 🛠️ Estrutura do Projeto

*   `frontend/`: Aplicação React + Vite.
*   `backend/`: API NestJS.
*   `python_producer/`: Script de coleta de dados.
*   `go-worker/`: Worker de processamento de fila.
*   `docker-compose.yml`: Orquestração dos containers.
