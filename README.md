# GDASH Painel Climático

Resumo do que foi implementado no desafio full-stack e como executar cada parte da solucao.

## Visao geral
- Pipeline de clima com quatro servicos: coletor Python -> fila RabbitMQ -> worker Go -> API NestJS -> MongoDB -> frontend React.
- Exportacao de dados em CSV/XLSX, filtro por cidade e ranking de conforto.
- Insights de IA usando OpenAI (opcional; se `OPENAI_API_KEY` nao estiver definida o backend devolve somente o sumario basico).
- CRUD de usuarios com JWT, gestao de locais monitorados, intervalo global de coleta e pagina opcional que consome a PokeAPI via backend.

## Estrutura das pastas
- `backend/`: API NestJS. Modulos de auth, usuarios, logs de clima, locais, configuracao do coletor, insights de IA, exportacao e integracao com PokeAPI.
- `python/`: coletor que busca clima em Open-Meteo (ou OpenWeather) e publica mensagens na fila RabbitMQ.
- `go/`: worker que consome a fila, aplica retry e envia o payload para `POST /api/weather/logs`.
- `frontend/`: dashboard React (Vite + Tailwind + shadcn/ui) com login, tabela de logs, exportacao, insights, gerenciador de locais, configuracoes e CRUD de usuarios.
- `docker-compose.yml`: orquestra MongoDB, RabbitMQ, API, coletor Python, worker Go e frontend.
- `README-DESAFIO.md`: referencia do desafio original.

## Fluxo de dados
1. Python coleta dados de clima (lat/long do .env ou lista dinamica em `/api/locations/active`) e publica JSON na fila `RABBITMQ_QUEUE` no RabbitMQ.
2. Worker Go consome a fila com prefetch e reenvia o corpo bruto para `NESTJS_API_URL` com retry configuravel (cabecalho `x-retry-attempt`).
3. API NestJS valida e salva o log na colecao `weather_logs` (MongoDB).
4. Frontend consome `/api/weather/logs`, exporta CSV/XLSX e dispara `/api/weather/insights` para gerar resumo de IA das ultimas 24h; resultados ficam em `ai_insights`.
5. Opcional: o modulo `backend/src/collector` tambem faz coleta direta via Open-Meteo para garantir dados mesmo sem o pipeline Python/Go (respeita intervalo global).

## Principais funcionalidades por servico
### Backend (NestJS)
- Auth JWT (`/api/auth/login`) com usuario padrao criado em `AppService` usando variaveis `DEFAULT_USER_*`.
- Usuarios (`/api/users`): listar/criar/editar/remover, alterar senha em `/api/users/me/password`.
- Clima (`/api/weather`): grava log (endpoint publico para o worker), lista paginada com filtro por cidade, `export/csv`, `export/xlsx`, gera/consulta insights de IA.
- Locais (`/api/locations`): CRUD autenticado e listagem publica de locais ativos para o coletor.
- Config do coletor (`/api/config/collector`): GET publico, PATCH autenticado atualiza intervalo global e sincroniza todos os locais.
- Explorer (`/api/explorer/pokemon` e `/api/explorer/pokemon/:name`): proxy paginado para a PokeAPI.

### Coletor Python
- Providers: Open-Meteo padrao; OpenWeather habilitado com `OPENWEATHER_API_KEY`.
- Sincroniza intervalo global opcionalmente via `COLLECTOR_CONFIG_URL`; lista dinamica de locais via `COLLECTOR_LOCATIONS_URL`.
- Publica mensagens persistentes na fila declarada com credenciais `RABBITMQ_*`.

### Worker Go
- Conexao AMQP configuravel (`RABBITMQ_HOST`, `RABBITMQ_PORT`, `RABBITMQ_VHOST`, etc.).
- QoS com `WORKER_PREFETCH_COUNT`, retry com limite/delay (`WORKER_RETRY_LIMIT`, `WORKER_RETRY_DELAY_SECONDS`).
- HTTP POST para a API; descarta apos exceder o limite de tentativas.

### Frontend (React + Vite)
- Login com armazenamento de token/email em `localStorage` (`VITE_AUTH_TOKEN_KEY`).
- Dashboard: filtros por cidade, paginacao de logs, cards de resumo, exportacao CSV/XLSX, atualizacao periodica.
- Aba de relatórios: gera e exibe markdown da IA, ranking de conforto e metadados do insight.
- Locais: busca cidades via geocoding do Open-Meteo, adiciona/remove locais consumindo o backend.
- Usuarios: CRUD completo com dialogs e confirmacao de remocao.
- Configuracoes: troca de senha, altera intervalo global de coleta, troca de tema (system/light/dark).
- Explorer: lista paginada da PokeAPI e modal com detalhes/tipos/status.

## Como rodar com Docker Compose
1. Copie `.env.example` para `.env` e preencha as secrets.
2. `docker compose up --build` na raiz.
3. Portas padrao: API `3000` (rota base `/api`), frontend `5173`, RabbitMQ `5672` + console `15672`, Mongo `27017`.
4. Login inicial: use `DEFAULT_USER_EMAIL` / `DEFAULT_USER_PASSWORD` definidos no `.env`.

## Execucao local por servico
- Backend (`backend/`): `npm install`, `npm run start:dev` (requer Mongo e RabbitMQ ativos).
- Frontend (`frontend/`): `npm install`, `npm run dev -- --host` (usar `VITE_API_BASE_URL` apontando para a API).
- Coletor Python (`python/`): criar venv, `pip install -r requirements.txt`, `python main.py` (RabbitMQ e .env configurados).
- Worker Go (`go/`): `go run main.go` (RabbitMQ + API acessiveis).
- Para build/exec em producao, preferir `docker compose` acima.

## Variaveis de ambiente chave
- Mongo: `MONGO_URI`, `MONGO_INITDB_*`.
- Auth: `JWT_SECRET`, `DEFAULT_USER_EMAIL`, `DEFAULT_USER_PASSWORD`, `DEFAULT_USER_NAME`.
- RabbitMQ: `RABBITMQ_HOST`, `RABBITMQ_PORT`, `RABBITMQ_USER`, `RABBITMQ_PASSWORD`, `RABBITMQ_QUEUE`, `RABBITMQ_VHOST`.
- Pipeline: `COLLECT_INTERVAL_MINUTES`, `LOOP_INTERVAL_SECONDS`, `COLLECTOR_LOCATIONS_URL`, `COLLECTOR_CONFIG_URL`, `NESTJS_API_URL`.
- OpenAI: `OPENAI_API_KEY`, `OPENAI_MODEL` (ex.: `gpt-4o-mini`).
- Frontend: `VITE_API_BASE_URL`, `VITE_AUTH_TOKEN_KEY`.

## Endpoints principais
- `POST /api/auth/login`: retorna JWT.
- `GET/POST/PATCH/DELETE /api/users`, `PATCH /api/users/me/password`.
- `POST /api/weather/logs`: ingestao (sem auth; usado pelo worker).
- `GET /api/weather/logs`: paginado, filtro `city`, protegido por JWT.
- `GET /api/weather/cities`: lista para filtros.
- `GET /api/weather/export/csv` e `/xlsx`: download autenticado.
- `GET /api/weather/insights`: ultimo insight; `POST /api/weather/insights`: gera novo insight (usa OpenAI se configurado).
- `GET/POST/PATCH/DELETE /api/locations` (JWT) e `GET /api/locations/active` (publico).
- `GET /api/config/collector` (publico), `PATCH /api/config/collector` (JWT).
- `GET /api/explorer/pokemon` e `GET /api/explorer/pokemon/:name` (publico).

## Exportacao e IA
- CSV/XLSX trazem cidade, timestamp, temperatura, umidade, vento, condicao e fonte.
- Insights usam as ultimas 24h, calculam tendencia de temperatura, indice de conforto, alertas e ranking das 3 melhores cidades; o resumo em markdown vem do OpenAI quando a chave esta presente.

## Vídeo explicativo
- [https://youtu.be/W9TAkCu51w4](https://youtu.be/W9TAkCu51w4)

## Observacoes
- Para trocar o provedor de clima no coletor Python, defina `WEATHER_PROVIDER=openweather` e configure `OPENWEATHER_API_KEY`.