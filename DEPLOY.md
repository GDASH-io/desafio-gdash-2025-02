# Guia de Deploy - Railway

Este documento contém instruções **completas e detalhadas** para fazer deploy do projeto Desafio GDASH no Railway.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Pré-requisitos](#pré-requisitos)
- [Passo a Passo Completo](#passo-a-passo-completo)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Configuração de Serviços](#configuração-de-serviços)
- [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

O Railway é uma plataforma de deploy que facilita o processo. Você precisará criar os seguintes serviços:

1. **MongoDB** - Banco de dados (addon Railway ou MongoDB Atlas)
2. **RabbitMQ** - Message broker (CloudAMQP gratuito ou serviço externo)
3. **Backend** - API NestJS
4. **Frontend** - Interface React (opcional, pode usar Vercel/Netlify)
5. **Collector** - Serviço Python (opcional, pode rodar localmente)
6. **Worker** - Serviço Go (opcional, apenas se usar modo RabbitMQ)

> **💡 Dica**: Para começar rápido, você pode deployar apenas Backend + Frontend + MongoDB. O Collector e Worker podem rodar localmente ou serem adicionados depois.

## 📦 Pré-requisitos

- Conta no [Railway](https://railway.app) (plano gratuito disponível)
- Repositório GitHub com o código
- (Opcional) Conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) se preferir usar Atlas em vez do addon Railway
- (Opcional) Conta no [CloudAMQP](https://www.cloudamqp.com) se quiser usar RabbitMQ (plano gratuito disponível)

## 🚀 Passo a Passo Completo

### 1. Criar Projeto no Railway

1. Acesse [Railway](https://railway.app)
2. Faça login com GitHub
3. Clique em **"New Project"**
4. Selecione **"Deploy from GitHub repo"**
5. Escolha seu repositório `desafio-gdash`
6. Railway criará um projeto vazio

### 2. Configurar MongoDB

Você tem duas opções:

#### Opção A: MongoDB Addon do Railway (Recomendado)

1. No projeto Railway, clique em **"New"** > **"Database"** > **"MongoDB"**
2. Railway criará automaticamente e fornecerá a `MONGO_URI`
3. **Copie a `MONGO_URI`** - você precisará dela para o backend

#### Opção B: MongoDB Atlas (Gratuito)

1. Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crie uma conta gratuita
3. Crie um novo cluster (plano gratuito M0)
4. Configure acesso de rede:
   - Clique em **"Network Access"**
   - Adicione `0.0.0.0/0` para permitir de qualquer lugar (ou IPs específicos)
5. Crie um usuário de banco de dados:
   - Clique em **"Database Access"**
   - Crie um usuário com senha forte
   - Anote o usuário e senha
6. Obtenha a connection string:
   - Clique em **"Connect"** > **"Connect your application"**
   - Copie a connection string
   - Substitua `<password>` pela senha do usuário criado
   - Exemplo: `mongodb+srv://usuario:senha@cluster.mongodb.net/gdash?retryWrites=true&w=majority`

### 3. Configurar RabbitMQ (Opcional)

Se você vai usar o modo `rabbit` do collector, precisa de RabbitMQ:

#### Opção A: CloudAMQP (Gratuito - Recomendado)

1. Acesse [CloudAMQP](https://www.cloudamqp.com)
2. Crie uma conta gratuita (plano "Little Lemur")
3. Crie uma nova instância
4. Copie a **AMQP URL** do painel
5. Formato: `amqp://usuario:senha@host.cloudamqp.com/vhost`

#### Opção B: RabbitMQ no Railway (Pago)

Railway não oferece RabbitMQ como addon gratuito. Você precisaria criar um serviço Docker, mas isso consome créditos.

> **💡 Recomendação**: Use CloudAMQP gratuito ou configure o collector em modo `direct` (sem RabbitMQ).

### 4. Deploy do Backend

1. No projeto Railway, clique em **"New"** > **"GitHub Repo"**
2. Selecione o mesmo repositório
3. Railway detectará automaticamente o código
4. **Configure o Root Directory**:
   - Vá em **Settings** > **Root Directory**
   - Defina como: `backend`
5. **Configure o Build Command** (se necessário):
   - Railway geralmente detecta automaticamente
   - Se não funcionar, adicione: `npm install && npm run build`
6. **Configure o Start Command**:
   - Vá em **Settings** > **Deploy**
   - Start Command: `npm run start:prod`
7. **Configure as Variáveis de Ambiente** (veja seção abaixo)
8. Railway fará o deploy automaticamente

### 5. Deploy do Frontend

1. No mesmo projeto Railway, clique em **"New"** > **"GitHub Repo"**
2. Selecione o mesmo repositório
3. **Configure o Root Directory**:
   - Vá em **Settings** > **Root Directory**
   - Defina como: `frontend`
4. **Configure o Build Command**:
   - Vá em **Settings** > **Deploy**
   - Build Command: `npm install && npm run build`
5. **Configure o Start Command**:
   - Start Command: `npm run preview` (para servir o build)
   - OU use um servidor estático (Railway pode detectar automaticamente)
6. **Configure as Variáveis de Ambiente**:
   - `VITE_API_URL`: URL do backend (ex: `https://seu-backend.up.railway.app`)
7. Railway fará o deploy automaticamente

> **💡 Alternativa**: Você pode deployar o frontend no Vercel ou Netlify (gratuito e mais fácil para sites estáticos).

### 6. (Opcional) Deploy do Collector

Se quiser que o collector rode no Railway:

1. Crie um novo serviço no mesmo projeto
2. **Root Directory**: `collector-python`
3. **Build Command**: (Railway detecta automaticamente Python)
4. **Start Command**: `python collector.py`
5. Configure as variáveis de ambiente (veja seção abaixo)

> **💡 Nota**: O collector pode rodar localmente também. Não é obrigatório no Railway.

### 7. (Opcional) Deploy do Worker

Apenas se estiver usando modo `rabbit`:

1. Crie um novo serviço no mesmo projeto
2. **Root Directory**: `worker-go`
3. Railway detectará Go automaticamente
4. **Start Command**: `go run main.go` ou use o binário compilado
5. Configure as variáveis de ambiente

## 🔧 Variáveis de Ambiente

### Backend - Variáveis Obrigatórias

Configure estas variáveis no serviço Backend do Railway:

```env
# MongoDB (OBRIGATÓRIO)
MONGO_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/gdash?retryWrites=true&w=majority
# OU se usar Railway MongoDB addon, use a URI fornecida pelo Railway

# JWT (OBRIGATÓRIO)
JWT_SECRET=sua-chave-secreta-aleatoria-aqui
# Gere uma chave segura: openssl rand -base64 32

# Porta (Railway define automaticamente via PORT)
PORT=3000

# Frontend URL (OBRIGATÓRIO para CORS)
FRONTEND_URL=https://seu-frontend.up.railway.app
# OU se usar Vercel/Netlify: https://seu-frontend.vercel.app

# Ambiente
NODE_ENV=production
```

### Backend - Variáveis Opcionais

```env
# RabbitMQ (apenas se usar modo rabbit)
RABBITMQ_URL=amqp://usuario:senha@host.cloudamqp.com/vhost

# Backend URL (para comunicação interna)
BACKEND_URL=https://seu-backend.up.railway.app

# APIs Externas (opcional)
OPENWEATHER_KEY=sua-chave-openweather
RAWG_KEY=sua-chave-rawg
```

### Frontend - Variáveis Obrigatórias

```env
# URL do Backend (OBRIGATÓRIO)
VITE_API_URL=https://seu-backend.up.railway.app
```

### Collector - Variáveis (se deployar)

```env
# Modo de operação (padrão recomendado: rabbit)
COLLECTOR_MODE=rabbit

# URL do Backend
BACKEND_URL=https://seu-backend.up.railway.app

# RabbitMQ (se usar modo rabbit)
RABBITMQ_URL=amqp://usuario:senha@host.cloudamqp.com/vhost

# Intervalo de coleta (segundos)
COLLECT_INTERVAL=60

# API Keys (opcional)
OPENWEATHER_KEY=sua-chave-openweather
```

### Worker - Variáveis (se deployar)

```env
# RabbitMQ URL
RABBITMQ_URL=amqp://usuario:senha@host.cloudamqp.com/vhost

# Backend URL
BACKEND_URL=https://seu-backend.up.railway.app
```

## 📝 Configuração Detalhada por Serviço

### Backend - Configurações Adicionais

1. **Health Check**:
   - Railway verifica automaticamente a porta
   - Certifique-se de que `/health` está funcionando

2. **Domínio Customizado** (Opcional):
   - Vá em **Settings** > **Networking**
   - Clique em **"Generate Domain"** para obter URL pública
   - Ou configure um domínio customizado

3. **Logs**:
   - Acesse **"Deployments"** > **"View Logs"** para ver logs em tempo real

### Frontend - Configurações Adicionais

1. **Build Settings**:
   - Certifique-se de que `VITE_API_URL` está configurado ANTES do build
   - O Vite injeta variáveis de ambiente no build time

2. **Servir Arquivos Estáticos**:
   - Railway pode servir automaticamente a pasta `dist`
   - Ou use `npm run preview` no start command

## ✅ Checklist de Deploy

Use este checklist para garantir que tudo está configurado:

### MongoDB
- [ ] MongoDB configurado (Railway addon ou Atlas)
- [ ] `MONGO_URI` copiada e testada
- [ ] Whitelist de IPs configurada (se Atlas)

### Backend
- [ ] Serviço criado no Railway
- [ ] Root Directory: `backend`
- [ ] Variáveis de ambiente configuradas:
  - [ ] `MONGO_URI`
  - [ ] `JWT_SECRET`
  - [ ] `FRONTEND_URL`
  - [ ] `NODE_ENV=production`
- [ ] Deploy concluído com sucesso
- [ ] Health check funcionando: `https://seu-backend.up.railway.app/health`
- [ ] Swagger acessível: `https://seu-backend.up.railway.app/api`

### Frontend
- [ ] Serviço criado no Railway
- [ ] Root Directory: `frontend`
- [ ] Variável `VITE_API_URL` configurada com URL do backend
- [ ] Build concluído com sucesso
- [ ] Frontend acessível e carregando dados

### RabbitMQ (se usar)
- [ ] CloudAMQP configurado ou serviço RabbitMQ criado
- [ ] `RABBITMQ_URL` configurada
- [ ] Credenciais testadas

### Collector (opcional)
- [ ] Serviço criado (ou rodando localmente)
- [ ] Variáveis configuradas
- [ ] Coletando dados

### Worker (opcional, apenas se usar RabbitMQ)
- [ ] Serviço criado
- [ ] Variáveis configuradas
- [ ] Processando mensagens

## 🔍 Troubleshooting

### Backend não inicia

**Problema**: Backend falha ao iniciar

**Soluções**:
1. Verifique os logs: **Deployments** > **View Logs**
2. Verifique se todas as variáveis obrigatórias estão configuradas:
   - `MONGO_URI` está presente e válida?
   - `JWT_SECRET` está configurado?
3. Verifique se o MongoDB está acessível:
   - Teste a connection string localmente
   - Verifique whitelist de IPs (se Atlas)
4. Verifique se o build foi bem-sucedido:
   - Veja os logs de build
   - Certifique-se de que `npm run build` funcionou

### Frontend não conecta ao backend

**Problema**: Frontend mostra erro ao buscar dados

**Soluções**:
1. Verifique se `VITE_API_URL` está correto:
   - Deve ser a URL completa do backend (com `https://`)
   - Exemplo: `https://seu-backend.up.railway.app`
2. Verifique CORS no backend:
   - Certifique-se de que `FRONTEND_URL` está configurado corretamente
   - Deve ser a URL do frontend (com `https://`)
3. Verifique console do navegador (F12):
   - Veja erros de CORS
   - Veja erros de rede
4. Teste o backend diretamente:
   - Acesse `https://seu-backend.up.railway.app/health`
   - Deve retornar `{"status":"ok"}`

### Erro de conexão MongoDB

**Problema**: Backend não conecta ao MongoDB

**Soluções**:
1. Verifique a `MONGO_URI`:
   - Está completa e correta?
   - Senha está correta?
   - Database name está correto?
2. Se usar MongoDB Atlas:
   - Verifique whitelist de IPs (adicione `0.0.0.0/0` temporariamente)
   - Verifique se o usuário tem permissões
3. Teste a connection string:
   - Use MongoDB Compass ou `mongosh` para testar
4. Verifique logs do backend para erros específicos

### Build do Frontend falha

**Problema**: Frontend não faz build

**Soluções**:
1. Verifique se `VITE_API_URL` está configurado ANTES do build
2. Verifique logs de build
3. Teste build localmente: `cd frontend && npm run build`
4. Verifique se todas as dependências estão no `package.json`

### Variáveis de ambiente não funcionam

**Problema**: Variáveis não são lidas corretamente

**Soluções**:
1. Certifique-se de que as variáveis estão no serviço correto
2. Reinicie o serviço após adicionar variáveis
3. Para Vite (frontend): variáveis devem começar com `VITE_`
4. Verifique se não há espaços extras nos valores

### CORS bloqueando requisições

**Problema**: Erro de CORS no navegador

**Soluções**:
1. Configure `FRONTEND_URL` no backend com a URL exata do frontend
2. Certifique-se de que a URL não tem barra no final
3. Verifique se o backend está permitindo a origem correta
4. Teste com `curl` para ver se o problema é CORS ou outro:
   ```bash
   curl -H "Origin: https://seu-frontend.up.railway.app" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        https://seu-backend.up.railway.app/health
   ```

## 🌐 URLs de Exemplo

Após o deploy, você terá URLs como:

- **Backend**: `https://desafio-gdash-backend-production.up.railway.app`
- **Frontend**: `https://desafio-gdash-frontend-production.up.railway.app`
- **Swagger**: `https://desafio-gdash-backend-production.up.railway.app/api`
- **Health Check**: `https://desafio-gdash-backend-production.up.railway.app/health`

> **💡 Nota**: Railway gera URLs aleatórias. Você pode configurar domínios customizados em **Settings** > **Networking**.

## 📚 Recursos Adicionais

- [Documentação Railway](https://docs.railway.app)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)
- [CloudAMQP Documentation](https://www.cloudamqp.com/docs/index.html)

## 🎯 Próximos Passos

Após o deploy bem-sucedido:

1. Teste todos os endpoints via Swagger
2. Configure domínios customizados (opcional)
3. Configure monitoramento (opcional)
4. Configure backups do MongoDB
5. Revise configurações de segurança

---

**Desenvolvido com ❤️ para o Desafio GDASH**
