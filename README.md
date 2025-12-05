# GDASH Weather + IA

Esse projeto começou como um teste de um processo seletivo. A ideia inicial era bem simples, mas eu acabei levando além: quis deixar mais autoral, criativo e ainda assim totalmente dentro do escopo pedido. 

Monitorei clima, gerei alertas, indiquei filmes e até inventei uma área de saúde bem-estar – tudo em um app só. No começo era “apenas um teste”, mas acabou virando uma plataforma completa para brincar com dados meteorológicos.

---

## O que ele faz

- Mostra o clima atual da sua cidade (ou de qualquer cidade pré-configurada).
- Gera resumo inteligente do dia, alertas e dicas usando Groq (LLM).
- Recomenda atividades, roupas, filmes e faz análise rápida de humor.
- Guarda logs em MongoDB e deixa exportar em CSV/XLSX.
- Traz uma página só para filmes (TMDB) com busca e paginação.
- Tem login, cadastro e uma área de gerenciamento de usuários.

---

## Bastidores e escolhas

- **Coleta:** script Python chamando Open-Meteo, hora a hora.
- **Fila:** RabbitMQ para segurar as mensagens.
- **Processamento:** worker em Go para consumir a fila e enviar para o backend.
- **Backend:** NestJS cuidando de autenticação, IA, TMDB e MongoDB.
- **Frontend:** React + Vite + Tailwind + shadcn/ui para o dashboard.
- **IA:** Groq API para gerar textos mais interessantes que “vai chover, leve guarda-chuva”.

Tudo roda em containers via Docker Compose.

---

## Como rodar

### Rodando com Docker (caminho mais fácil)

1. Copie o exemplo de compose:  
   `cp docker-compose.example.yml docker-compose.yml`
2. Abra o `docker-compose.yml` e ajuste as variáveis principais:

   ```env
   # MongoDB
   MONGO_INITDB_ROOT_USERNAME=root
   MONGO_INITDB_ROOT_PASSWORD=rootpassword
   MONGODB_URI=mongodb://root:rootpassword@mongodb:27017/weather_db?authSource=admin

   # RabbitMQ
   RABBITMQ_DEFAULT_USER=guest
   RABBITMQ_DEFAULT_PASS=guest

   # NestJS
   JWT_SECRET=supersecretjwtkey
   DEFAULT_ADMIN_EMAIL=admin@example.com
   DEFAULT_ADMIN_PASSWORD=123456
   TMDB_API_KEY=sua-chave-tmdb
   GROQ_API_KEY=sua-chave-groq

   # Python Collector
   OPEN_METEO_API_URL=https://api.open-meteo.com/v1/forecast
   LATITUDE=-12.9714
   LONGITUDE=-38.5014
   COLLECTION_INTERVAL=3600

   # Frontend
   VITE_API_BASE_URL=http://nestjs-api:3000
   ```

3. Suba tudo:  
   `docker-compose up -d --build`
4. Acesse:
   - Frontend: http://localhost:5173  
   - API + Swagger: http://localhost:3000/api/docs  
   - RabbitMQ: http://localhost:15672 (guest/guest)

### Rodando local (sem Docker)

Você também pode rodar tudo “na mão”, útil para desenvolvimento:

- **Backend (NestJS)**

  ```bash
  cd nestjs-api
  npm install
  npm run start:dev
  ```

- **Frontend (React)**  

  ```bash
  cd react-frontend
  npm install
  npm run dev
  ```

- **Python Collector**

  ```bash
  cd python-collector
  pip install -r requirements.txt
  python collector.py
  ```

- **Go Worker**

  ```bash
  cd go-worker
  go mod download
  go run main.go
  ```

Nesse modo, você precisa ter MongoDB e RabbitMQ rodando por fora (local ou em containers separados) e apontar as variáveis de ambiente para eles.

---

## Estrutura

```
├─ nestjs-api        # Backend (autenticação, clima, IA, TMDB)
├─ react-frontend    # Dashboard e páginas protegidas
├─ python-collector  # Busca clima no Open-Meteo e publica na fila
├─ go-worker         # Consome a fila e posta em /api/weather/logs
└─ docker-compose.*  # Orquestra tudo
```

---

## Fluxo do sistema

Esse é o desenho geral de como as peças conversam.

```text
┌──────────────────────────────────────────────────────────────────┐
│                         REACT FRONTEND                           │
│              (Dashboard, Autenticação, Filmes)                   │
└───────────────────────────────┬──────────────────────────────────┘
                                │  HTTP / REST
                                │
┌───────────────────────────────▼──────────────────────────────────┐
│                            NESTJS API                            │
│        (Autenticação, CRUD, IA, TMDB, Weather Service)           │
└───────────────────┬───────────────────────────────┬──────────────┘
                    │                               │
                    │                               │
        ┌───────────▼──────────┐        ┌───────────▼────────────┐
        │       MONGODB         │        │        TMDB API        │
        │    (Armazenamento)    │        │       (Filmes)         │
        └────────────────────────┘        └────────────────────────┘
                    │
                    │
┌───────────────────▼──────────────────────────────────────────────┐
│                            RABBITMQ                               │
│                        (Message Broker)                           │
└───────────────────┬───────────────────────────────┬──────────────┘
                    │                               │
                    │                               │
        ┌───────────▼──────────┐        ┌───────────▼────────────┐
        │   PYTHON COLLECTOR    │        │       GO WORKER         │
        │    (Coleta de dados)  │        │     (Processamento)     │
        │                       │        │                         │
        │   ┌────────────────┐  │        │  Consome mensagens      │
        │   │ Open-Meteo API │  │        │  Envia para NestJS      │
        │   └────────────────┘  │        │                         │
        └────────────────────────┘        └────────────────────────┘
                    │
                    │
┌───────────────────▼──────────────────────────────────────────────┐
│                            GROQ API                               │
│                  (Inteligência Artificial)                        │
└───────────────────────────────────────────────────────────────────┘
```
---

## Tecnologias

- **Backend:** NestJS + TypeScript + MongoDB + JWT.
- **Frontend:** React 18 + Vite + Tailwind + shadcn/ui.
- **Coleta/Worker:** Python (requests/pika) e Go (amqp091).
- **Infra:** Docker Compose, RabbitMQ, Nginx.
- **IA / Dados externos:** Groq API + TMDB + Open-Meteo.

---

## Sobre o processo

Quis fugir daquele dashboard genérico que só mostra “temperatura e chance de chuva”. Vários projetos de clima já fazem isso. A diferença aqui foi misturar:

1. Dados reais chegando em fila (sem depender só do frontend).
2. IA respondendo em português e com contexto do dia.
3. UX mais caprichada, inclusive em mobile.
4. Recomendações de saúde e atividades diárias geradas por IA, incluindo sugestões de filmes e lugares para sair.

Esse mix deixou o Código bem mais divertido de desenvolver.

---

## Contribuir ou adaptar

Fique à vontade para testar outras APIs de clima, trocar o modelo de IA ou plugar alertas reais. Se fizer algo legal, abre um PR ou me chama no LinkedIn; curto ver melhorias em projetos.

---

## Preview do Projeto

Aqui estão algumas telas reais do sistema em funcionamento, mostrando interface, inteligência ambiental e recursos do GDASH.

### Dashboard e Indicadores
<p align="center">
  <img src="./assets/preview-01.jpg" width="900" alt="Dashboard principal com métricas, cartões de clima e gráficos gerais">
</p>

### Resumo Inteligente e Alertas
<p align="center">
  <img src="./assets/preview-02.jpg" width="900" alt="Resumo climático com alertas automáticos e interpretação do clima">
</p>

### Condições de Saúde, Roupas e Índice UV
<p align="center">
  <img src="./assets/preview-03.jpg" width="900" alt="Tela exibindo recomendações de saúde, roupas ideais e índice UV">
</p>

### Atividades Recomendadas e Humor
<p align="center">
  <img src="./assets/preview-04.jpg" width="900" alt="Sugestões de atividades com base no clima e análise de humor contextual">
</p>

### Recomendações de Filmes
<p align="center">
  <img src="./assets/preview-05.jpg" width="900" alt="Tela de sugestões de filmes alinhados ao clima e momento do dia">
</p>

### Insight da IA
<p align="center">
  <img src="./assets/preview-06.jpg" width="900" alt="Insight interpretativo da IA com análise comportamental do clima">
</p>

---

## Autor

**William D. Barreto da Conceição**
- GitHub: [@willtenisom](https://github.com/willtenisom)  
- Email: wil_barretto@hotmail.com  
- LinkedIn: [William D. Barreto da Conceição](https://www.linkedin.com/in/william-douglas-barreto-da-conceição/)

Desenvolvido por William D. Barreto da Conceição. Se esse projeto te ajudou, manda uma estrela e compartilha a ideia. Obrigado!


