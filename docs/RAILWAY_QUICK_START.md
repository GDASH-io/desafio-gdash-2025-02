# ⚡ Quick Deploy Guide - Railway

## 🎯 Deploy em 10 Minutos

### 1. Preparação Local (2 min)

```powershell
# Execute o script de preparação
.\prepare-railway-deploy.ps1

# Commit e push
git add .
git commit -m "Preparar para deploy Railway"
git push origin main
```

### 2. Configurar Railway (3 min)

1. Acesse https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. Selecione `desafio_gdash`

### 3. Adicionar Serviços (5 min)

#### MongoDB
```
+ New → Database → MongoDB
```
Copie o `MONGO_URL` gerado

#### RabbitMQ
```
+ New → Empty Service
Settings → Docker Image: rabbitmq:3-management
Variables:
  RABBITMQ_DEFAULT_USER=admin
  RABBITMQ_DEFAULT_PASS=<gerar-senha-forte>
```

#### Python Collector
```
+ New → GitHub Repo
Settings → Root Directory: /python-weather-collector
Variables:
  RABBITMQ_HOST=rabbitmq.railway.internal
  RABBITMQ_PORT=5672
  RABBITMQ_USER=admin
  RABBITMQ_PASSWORD=<senha-rabbitmq>
  RABBITMQ_QUEUE=weather_data
  COLLECTION_INTERVAL=300
  LATITUDE=-23.5505
  LONGITUDE=-46.6333
```

#### Go Worker
```
+ New → GitHub Repo
Settings → Root Directory: /go-weather-worker
Variables:
  RABBITMQ_URL=amqp://admin:<senha>@rabbitmq.railway.internal:5672/
  RABBITMQ_QUEUE=weather_data
  API_BASE_URL=http://nestjs-api.railway.internal:3000
  API_ENDPOINT=/api/weather/logs
```

#### NestJS API
```
+ New → GitHub Repo
Settings → Root Directory: /nestjs-api
Variables:
  NODE_ENV=production
  PORT=3000
  MONGODB_URI=<copiar-mongo-url>
  JWT_SECRET=<gerar-64-chars>
  DEFAULT_USER_EMAIL=admin@example.com
  DEFAULT_USER_PASSWORD=<senha-forte>
  TOGETHER_API_KEY=<sua-chave> (opcional)
Networking → Generate Domain (anotar URL)
```

#### Frontend
```
+ New → GitHub Repo  
Settings → Root Directory: /desafio_gdash
Variables:
  VITE_API_URL=<url-nestjs-api>
Networking → Generate Domain
```

### 4. Verificar Deploy

```bash
# Health check API
curl https://<sua-api>.railway.app/health

# Acessar frontend
https://<seu-frontend>.railway.app
```

## 🔑 Gerar Senhas Seguras

```powershell
# No PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

## 📋 Checklist Rápido

- [ ] 6 serviços criados
- [ ] Variáveis configuradas
- [ ] Domínios gerados (API + Frontend)
- [ ] Logs sem erro
- [ ] Frontend acessível
- [ ] Login funcionando

## 🐛 Problemas Comuns

**Frontend não carrega:**
- Verifique `VITE_API_URL` no serviço frontend
- Rebuild: Settings → Redeploy

**API não conecta ao MongoDB:**
- Use `MONGO_URL` completo da Railway
- Formato: `mongodb://user:pass@host:port/db?authSource=admin`

**Serviços não se comunicam:**
- Use `.railway.internal` para conexões internas
- Exemplo: `rabbitmq.railway.internal:5672`

## 💰 Custos Estimados

- **$5/mês grátis** (créditos Railway)
- **~$15-25/mês** após créditos (6 serviços)

---

📖 **Guia Completo:** Veja `RAILWAY_DEPLOY.md` para instruções detalhadas
