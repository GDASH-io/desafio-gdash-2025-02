# Projeto Full Stack com Frontend, Backend e Worker

Este projeto utiliza **Docker**, **Docker Compose**, e uma arquitetura
com três serviços principais:

-   **Frontend** (provavelmente React/Next.js + Nginx)
-   **Backend** (Node.js/Express)
-   **Worker** (Node.js para processamento assíncrono)
-   **Banco Redis ou RabbitMQ** (dependendo da sua configuração --
    ajuste conforme necessário)

------------------------------------------------------------------------

## 🚀 Como Rodar o Projeto

### **1. Certifique-se de ter instalado:**

-   Docker\
-   Docker Compose V2 (`docker compose` ao invés de `docker-compose`)

### **2. Suba todos os serviços:**

``` sh
docker compose up -d --build
```

### **3. Verifique os contêineres ativos:**

``` sh
docker compose ps
```

### **4. Acesse os serviços:**

-   **Frontend:** http://localhost:5173
-   **Backend:** http://localhost:3000
-   **Worker:** roda em background, sem porta exposta

------------------------------------------------------------------------

## 🧪 Checkpoints

Use estes checkpoints para validar se tudo está funcionando:

### ✔ **1. Construção das imagens**

Execute:

``` sh
docker compose build
```

-   Deve compilar o frontend sem erros e gerar `/dist`
-   O backend deve rodar `npm run build`
-   O worker deve instalar dependências sem falhas

### ✔ **2. Subida dos contêineres**

``` sh
docker compose up -d
```

Todos devem aparecer com status **running**.

### ✔ **3. Logs**

Frontend:

``` sh
docker compose logs frontend -f
```

Backend:

``` sh
docker compose logs backend -f
```

Worker:

``` sh
docker compose logs worker -f
```

------------------------------------------------------------------------

## 🗂 Estrutura Geral (exemplo)

    /
    ├── frontend/
    │   ├── Dockerfile
    │   └── src/
    ├── backend/
    │   ├── Dockerfile
    │   └── src/
    ├── worker/
    │   ├── Dockerfile
    │   └── src/
    ├── docker-compose.yml
    └── README.md

------------------------------------------------------------------------

## 🧹 Como Derrubar os Contêineres

``` sh
docker compose down
```

Remover volumes:

``` sh
docker compose down -v
```

------------------------------------------------------------------------
