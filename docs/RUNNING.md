# Guia de Execução (Running)

Este guia detalha como executar o sistema GDASH em ambientes Linux e Windows.

## Pré-requisitos

*   **Docker** (Engine ou Desktop)
*   **Docker Compose** (v2.0+)
*   **Git**

## Configuração Inicial

1.  Certifique-se de ter o arquivo `.env` na raiz do projeto.
    *   Se não existir, o script de inicialização tentará criá-lo a partir de `env.example`.
    *   Para criar manualmente: `cp env.example .env`

## 🐧 Linux / MacOS

A maneira recomendada de executar o projeto é utilizando o script de automação `start.sh`.

### Iniciar o Sistema
Execute no terminal:

```bash
chmod +x start.sh
./start.sh
```

Este script realiza automaticamente:
1.  Limpeza de containers antigos.
2.  Inicialização da infraestrutura (Kafka, Mongo).
3.  Inicialização das aplicações.
4.  Seed (população) do banco de dados com usuário padrão.
5.  Testes de saúde (Healthchecks).

### Execução Manual (Docker Compose)
Se preferir não usar o script:

```bash
docker compose up -d
```

*Nota: Ao iniciar manualmente pela primeira vez, pode ser necessário rodar o seed de usuários:*
```bash
docker compose exec api node dist/database/seed/users.seed.js
```

## 🪟 Windows

### Opção 1: Git Bash (Recomendada)
Se você tem o Git Bash instalado, pode rodar o script shell diretamente:

1.  Abra o **Git Bash** na pasta do projeto.
2.  Execute:
    ```bash
    ./start.sh
    ```

### Opção 2: PowerShell / Docker Desktop
1.  Garanta que o Docker Desktop está rodando.
2.  Abra o PowerShell na raiz do projeto.
3.  Suba os serviços:
    ```powershell
    docker compose up -d
    ```
4.  **Importante:** Execute o seed manualmente para criar o usuário admin:
    ```powershell
    docker compose exec api node dist/database/seed/users.seed.js
    ```

## Acessando o Sistema

Após a inicialização, os serviços estarão disponíveis em:

*   **Frontend (Dashboard):** [http://localhost:5173](http://localhost:5173)
*   **API (Backend):** [http://localhost:3000/api/v1](http://localhost:3000/api/v1)

### Credenciais Padrão
*   **Email:** `admin@example.com`
*   **Senha:** `123456`

## Parando o Sistema

Para parar e remover todos os containers e volumes (reset completo):

```bash
docker compose down -v
```
