# Clima Logs

Vídeo: [https://youtu.be/fEtU6efqZxk](https://youtu.be/fEtU6efqZxk)

> [!TIP]
> ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) ![Go](https://img.shields.io/badge/go-%2300ADD8.svg?style=for-the-badge&logo=go&logoColor=white) ![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white) ![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)

> [!TIP]
> ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) ![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white) ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![React Query](https://img.shields.io/badge/-React%20Query-FF4154?style=for-the-badge&logo=react%20query&logoColor=white) ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white) ![Shadcn/ui](https://img.shields.io/badge/shadcn/ui-%23000000?style=for-the-badge&logo=shadcnui&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens) ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

O projeto "Clima Logs" é uma aplicação fullstack sobre coleta e visualização de dados climáticos. O backend da aplicação possui um fluxo dividido entre três linguagens: Python, Redis (message broker),  Go e Typescript (em NodeJS). O Python é responsável por puxar dados climáticos na API Open-Meteor e publicar no Redis Streams. O Go consome  esses dados, filtra e organiza, enviando para a API. A API NestJS é responsável por salvar esses dados no banco de dados, bem como administrar um CRUD de usuários e expor Endpoints para consumo no frontend.

O frontend por sua vez foi desenvolvido com React com TypeScript e bibliotecas de apoio, como Axios e TanStack Query para requisições e cache, ShadCn e Tailwind para UI, entre outras.

As rotas da aplicação incluem:

- `/` (raiz): página para entrar na conta
- `/signup`: página para criar uma conta
- `/dashboard`: página principal do dashboard
  - `/dashboard/graphics`: página com gráficos de algumas informações do clima
  - `/dashboard/users` (admin): página com uma lista de todos os usuários que possuem conta na aplicação
  - `/dashboard/account`: página para gerenciamento da própria conta

O projeto pode ser inicializado via Docker Compose. A seguir estão os passos para configurar e inicializar de forma correta mas antes de tudo faça clone do projeto:

```bash

git clone https://github.com/juliocesar249/weather-logs.git

```

---

## Configurando backend

### Variáveis compartilhadas

Na raiz do projeto, faça uma cópia do arquivo `.env.example` e crie as credenciais para o MongoDB e Redis.

```bash
MONGO_ROOT_USERNAME=admin_mongo  # <--
MONGO_ROOT_PASSWORD=senha_admin # <--

REDIS_HOST=redis
REDIS_PASSWORD=senha_do_redis # <--
REDIS_PORT=6379
REDIS_DB=0
```

Acesse a pasta `backend`, faça uma cópia do arquivo `.env.shared.example` e coloque a mesma senha que escolheu em `.env` anteriormente.
>[!IMPORTANT]
> Caso tenha alterado os dados de criação do redis, não se esqueça de alterá-los aqui também.

```bash
REDIS_HOST=redis
REDIS_PASSWORD=senha_do_redis # <--
REDIS_PORT=6379
REDIS_DB=0
```

>[!WARNING]
> É necessário que haja a variável `REDIS_PASSWORD` em `.env` (na raiz do projeto) e em `.env.shared` (na pasta **backend**), ambas com o MESMO VALOR. O primeiro serve apenas para a criação do serviço, o segundo será usado pelos containers para fazer login.

### Configurando serviço do Python🐍

Antes de iniciar configuração de fato do serviço, é necessário que possua uma chave da [API Geocoding](https://openweathermap.org/api/geocoding-api). Clicando no link, realize o cadastro e após o login, clique no nome do seu usuário na barra de navegação do topo da página > `My API Keys` e gere uma nova chave.

Após isso, acesse a pasta `backend/python-service` e crie uma cópia do arquivo `.env.example` e cole em `API_KEY` a chave gerada e em `CITY` digite o nome da cidade de onde serão buscados os dados do clima.

```bash
API_KEY=chave_api_geo_code

CITY=nome_da_cidade
```

### Configurando serviço do Go 🐿️

Acesse a pasta `backend/go-service` e crie uma cópia do arquivo `.env.example`. Crie uma senha para o worker logar na API em NestJS e poder enviar os logs do clima posteriormente.

```bash
API_URL=http://nest:3000/api/v1

SERVICE_NAME=go-worker
SERVICE_EMAIL=go@email.com
SERVICE_API_PASSWORD=senha_do_servico # <--
```

>[!WARNING]
> A senha precisa ter no minimo 6 caracteres, com maiúscula, minúscula, número e símbolo

### Configurando serviço do NestJS 🐺

Antes de iniciar a configuração de fato do serviço, é necessário que possua uma chave para a API do [Groq](https://console.groq.com/keys). Ela irá prover os insights de IA da aplicação. Após criar uma conta clique em `API Keys` na barra de navegação no canto superior direito da página e em `Create API Key`, escolha um nome e copie a chave gerada.

Após isso, acesse a pasta `backend/nest-service` e crie uma cópia do arquivo `.env.example`. Nele há algumas coisas a serem feitas:

```bash

MONGO_URL=mongodb://usuario:senha@mongo:27017/gdash?authSource=admin

JWT_SECRET=chave_secreta_para_jwt

ADMIN_NAME=admin_do_sistema
ADMIN_EMAIL=email_admin_do_sistema
ADMIN_PASSWORD=senha_do_admin_do_sistema

GROQ_API_KEY=chave_da_api_do_groq
```

1. `MONGO_URL`: substitua `usuario` e `senha` pelos valores de `MONGO_ROOT_USERNAME` e `MONGO_ROOT_PASSWORD`, configurados anteriormente no `.env` da raiz do projeto;
   > `usuario` e `senha` devem estar separados por `:`, assim como na URL modelo.
2. `JWT_SECRET`: crie uma chave secreta para ser usada na assinatura e autenticação de tokens JWT;
3. `ADMIN`:
   1. `NAME`: nome do admin do sistema;
   2. `EMAIL`: email do admin do sistema (será usado para logar no frontend);
   3. `PASSWORD`: senha do admin do sistema (será usada para logar no frontend);
4. `GROQ_API_KEY`: aqui cole a chave da API do GROQ gerada, como explicado anteriormente

>[!Note]
> A princípio não é necessária nenhuma configuração para rodar o serviço de Frontend da aplicação, contudo, caso tenha alterado a porta do serviço da API (NestJS), vá em `frontend`, nos arquivos `.env.development` e `.env.production` e altere a porta na rota da API na variável `VITE_API_URL`.

---

## Iniciando a aplicação 💻

Para iniciar a aplicação, acesse a pasta raiz do projeto pelo terminal e rode o comando

```bash
docker-compose up -d
```

Aguarde o build de todas as imagens e inicialização dos serviços. Por fim, abra a url [http://localhost:5173](http//:localhost:5173) (ou outra porta, caso tenha trocado). Crie uma nova conta ou faça login na aplicação com as credenciais de administrador criadas anteriormente na configuração da API.
