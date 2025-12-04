# 🚀 Guia de Deploy na Railway

Este guia mostra como fazer deploy do Weather Dashboard completo na Railway.

## 📋 Pré-requisitos

- Conta na Railway (https://railway.app)
- Git configurado
- Projeto commitado no GitHub

## 🏗️ Arquitetura de Deploy

O projeto será dividido em **5 serviços** na Railway:

1. **MongoDB** - Banco de dados
2. **RabbitMQ** - Fila de mensagens
3. **Python Weather Collector** - Coletor de dados
4. **Go Weather Worker** - Processador de fila
5. **NestJS API** - API REST
6. **Frontend** (Vite/React) - Interface web

---

## 📦 Passo a Passo

### 1️⃣ Criar Novo Projeto na Railway

1. Acesse https://railway.app
2. Clique em **"New Project"**
3. Escolha **"Empty Project"**
4. Dê um nome: `weather-dashboard`

### 2️⃣ Configurar MongoDB

1. No projeto Railway, clique em **"+ New"**
2. Selecione **"Database" → "MongoDB"**
3. Anote as credenciais geradas:
   - `MONGO_URL` (URL completa de conexão)
   - `MONGOHOST`
   - `MONGOPORT`
   - `MONGOUSER`
   - `MONGOPASSWORD`

### 3️⃣ Configurar RabbitMQ

1. Clique em **"+ New" → "Empty Service"**
2. Nome: `rabbitmq`
3. **Settings → Docker Image:**
   - Image: `rabbitmq:3-management`
   - Port: `5672`
4. **Variables:**
   ```
   RABBITMQ_DEFAULT_USER=admin
   RABBITMQ_DEFAULT_PASS=<gerar-senha-forte>
   ```
5. **Networking:**
   - Adicionar porta `15672` (Management UI)

### 4️⃣ Configurar Python Weather Collector

1. Clique em **"+ New" → "GitHub Repo"**
2. Selecione o repositório `desafio_gdash`
3. **Settings:**
   - Root Directory: `python-weather-collector` ⚠️ (SEM barra no início!)
   - Watch Paths: `python-weather-collector/**`
   - Start Command: `python -m src.main`
4. **Variables:**
   ```
   RABBITMQ_HOST=rabbitmq.railway.internal
   RABBITMQ_PORT=5672
   RABBITMQ_USER=admin
   RABBITMQ_PASSWORD=<senha-rabbitmq>
   RABBITMQ_QUEUE=weather_data
   COLLECTION_INTERVAL=300
   LATITUDE=-23.5505
   LONGITUDE=-46.6333
   ```

### 5️⃣ Configurar Go Weather Worker

1. Clique em **"+ New" → "GitHub Repo"**
2. Selecione o repositório `desafio_gdash`
3. **Settings:**
   - Root Directory: `go-weather-worker` ⚠️ (SEM barra!)
   - Watch Paths: `go-weather-worker/**`
4. **Variables:**
   ```
   RABBITMQ_URL=amqp://admin:<senha>@rabbitmq.railway.internal:5672/
   RABBITMQ_QUEUE=weather_data
   API_BASE_URL=http://nestjs-api.railway.internal:3000
   API_ENDPOINT=/api/weather/logs
   WORKER_CONCURRENCY=5
   RETRY_ATTEMPTS=3
   RETRY_DELAY=2s
   ```

### 6️⃣ Configurar NestJS API

1. Clique em **"+ New" → "GitHub Repo"**
2. Selecione o repositório `desafio_gdash`
3. **Settings:**
   - Root Directory: `nestjs-api` ⚠️ (SEM barra!)
   - Watch Paths: `nestjs-api/**`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
4. **Variables:**
   ```
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=<copiar-do-mongodb-railway>
   JWT_SECRET=<gerar-chave-segura-64-chars>
   TOGETHER_API_KEY=<sua-chave-together-ai>
   DEFAULT_USER_EMAIL=admin@example.com
   DEFAULT_USER_PASSWORD=<senha-forte>
   DEFAULT_USER_NAME=Admin
   ```
5. **Networking:**
   - Gerar domínio público (para API)

### 7️⃣ Configurar Frontend (Vite/React)

1. Clique em **"+ New" → "GitHub Repo"**
2. Selecione o repositório `desafio_gdash`
3. **Settings:**
   - Root Directory: `desafio_gdash` ⚠️ (SEM barra!)
   - Watch Paths: `desafio_gdash/**`
   - Build Command: `npm install && npm run build`
   - Start Command: `npx serve -s dist -l 8080`
4. **Variables:**
   ```
   VITE_API_URL=<url-publica-nestjs-api>
   ```
5. **Networking:**
   - Gerar domínio público (este será seu site)

---

## 🔐 Variáveis de Ambiente Importantes

### Segurança - GERAR VALORES ÚNICOS:

```bash
# JWT Secret (64 caracteres aleatórios)
JWT_SECRET=$(openssl rand -hex 32)

# Senha RabbitMQ
RABBITMQ_PASS=$(openssl rand -hex 16)

# Senha Admin
DEFAULT_USER_PASSWORD=$(openssl rand -hex 12)
```

### Conexões Internas Railway:

- MongoDB: Use o `MONGO_URL` fornecido pela Railway
- RabbitMQ: `rabbitmq.railway.internal:5672`
- NestJS API: `nestjs-api.railway.internal:3000`

---

## ✅ Verificação Pós-Deploy

### 1. Verificar Logs de Cada Serviço:

```bash
# Na Railway, clique em cada serviço → "View Logs"
```

**O que verificar:**
- ✅ MongoDB: "Waiting for connections"
- ✅ RabbitMQ: "Server startup complete"
- ✅ Python Collector: "Conectado ao RabbitMQ"
- ✅ Go Worker: "Worker iniciado! Aguardando mensagens"
- ✅ NestJS API: "NestJS API rodando em http://localhost:3000"
- ✅ Frontend: "Serving on http://0.0.0.0:8080"

### 2. Testar Endpoints:

```bash
# Health Check da API
curl https://<sua-api>.railway.app/health

# Stats
curl https://<sua-api>.railway.app/api/weather/stats

# Login
curl -X POST https://<sua-api>.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"<sua-senha>"}'
```

### 3. Acessar Frontend:

```
https://<seu-frontend>.railway.app
```

---

## 🐛 Troubleshooting

### Serviço não inicia:

1. Verifique logs: Railway Dashboard → Service → Logs
2. Confirme variáveis de ambiente
3. Verifique se as portas estão corretas

### Erro de conexão entre serviços:

- Use `.railway.internal` para comunicação interna
- Confirme que os serviços estão no mesmo projeto

### Frontend não conecta à API:

- Verifique se `VITE_API_URL` aponta para o domínio público da API
- Rebuild do frontend após atualizar variáveis

### MongoDB Authentication Failed:

- Use o `MONGO_URL` completo fornecido pela Railway
- Não tente conectar usando variáveis separadas

---

## 📊 Monitoramento

Railway fornece:
- ✅ Logs em tempo real
- ✅ Métricas de CPU/RAM
- ✅ Network traffic
- ✅ Deploy history
- ✅ Rollback automático

---

## 💰 Custos

Railway oferece:
- **$5/mês grátis** (créditos)
- **Pay-as-you-go** depois
- ~$10-20/mês para este projeto (estimativa)

### Otimizar custos:
- Use a **menor configuração possível** inicialmente
- Monitore uso no Dashboard
- Ajuste `COLLECTION_INTERVAL` (maior = menos requests)

---

## 🔄 Deploy Automático (CI/CD)

Railway detecta automaticamente commits no GitHub:

1. Push para `main` → Deploy automático
2. Railway rebuilda e redeploya automaticamente
3. Rollback manual disponível se necessário

---

## 📚 Referências

- [Railway Docs](https://docs.railway.app)
- [Railway Templates](https://railway.app/templates)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (alternativa)
- [Together AI](https://api.together.xyz/) (para insights IA)

---

## 🎯 Checklist Final

- [ ] Todos os 6 serviços deployados
- [ ] Variáveis de ambiente configuradas
- [ ] Domínios públicos gerados (API + Frontend)
- [ ] Health checks passando
- [ ] Login funcionando no frontend
- [ ] Dados sendo coletados (verificar logs)
- [ ] Gráficos exibindo dados
- [ ] Insights IA funcionando (se configurado)

---

**🎉 Parabéns! Seu Weather Dashboard está no ar!**

## 📝 Notas Importantes

1. **Primeira coleta leva 5 minutos** - O collector trabalha em intervalos
2. **Cache de insights IA** - Atualiza a cada 6 horas
3. **Auto-scaling** - Railway escala automaticamente se necessário
4. **HTTPS automático** - Railway fornece certificados SSL gratuitos
