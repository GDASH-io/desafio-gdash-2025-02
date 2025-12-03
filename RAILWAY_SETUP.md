# 🚂 Guia Rápido - Deploy no Railway

Este é um guia rápido de referência. Para instruções detalhadas, veja [DEPLOY.md](./DEPLOY.md).

## ⚡ Setup Rápido (5 minutos)

### 1. Criar Projeto
1. Acesse [Railway](https://railway.app)
2. **New Project** > **Deploy from GitHub repo**
3. Selecione seu repositório

### 2. MongoDB
- **Opção A**: Railway addon → **New** > **Database** > **MongoDB**
- **Opção B**: MongoDB Atlas → Crie cluster gratuito e copie connection string

### 3. Backend
1. **New** > **GitHub Repo** (mesmo repo)
2. **Settings** > **Root Directory**: `backend`
3. **Settings** > **Deploy** > **Start Command**: `npm run start:prod`
4. **Variables** > Adicione variáveis (veja abaixo)

### 4. Frontend
1. **New** > **GitHub Repo** (mesmo repo)
2. **Settings** > **Root Directory**: `frontend`
3. **Variables** > Adicione `VITE_API_URL` (URL do backend)

## 🔑 Variáveis de Ambiente Essenciais

### Backend (Obrigatórias)

```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/gdash
JWT_SECRET=gerar-com-openssl-rand-base64-32
FRONTEND_URL=https://seu-frontend.up.railway.app
NODE_ENV=production
PORT=3000
```

### Frontend (Obrigatória)

```env
VITE_API_URL=https://seu-backend.up.railway.app
```

## 📋 Checklist Mínimo

- [ ] MongoDB configurado e `MONGO_URI` copiada
- [ ] Backend deployado com variáveis obrigatórias
- [ ] Frontend deployado com `VITE_API_URL`
- [ ] Health check funcionando: `/health`
- [ ] Frontend carregando dados do backend

## 🔗 Links Úteis

- [Guia Completo](./DEPLOY.md)
- [Railway Docs](https://docs.railway.app)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

**💡 Dica**: Comece com Backend + Frontend + MongoDB. Collector e Worker podem ser adicionados depois.

