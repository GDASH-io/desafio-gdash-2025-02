# Vercel + Railway Deployment Guide

## Overview
Deploy Frontend on Vercel and Backend services on Railway/Render.

## Architecture
```
Vercel (Frontend) → Railway/Render (Backend, Worker, Collector)
                     ↓
                   MongoDB Atlas + CloudAMQP
```

---

## Part 1: Frontend on Vercel

### Prerequisites
- Vercel account
- GitHub repository

### Step 1: Prepare Frontend

Update `vite.config.ts` for production:
```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
```

### Step 2: Deploy to Vercel

#### Via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Production deployment
vercel --prod
```

#### Via GitHub Integration
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Step 3: Environment Variables

Add in Vercel dashboard:
```
VITE_API_URL=https://your-backend.railway.app
```

### Step 4: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

---

## Part 2: Backend on Railway

### Prerequisites
- Railway account
- GitHub repository

### Step 1: Create MongoDB Atlas Database

1. Go to https://mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Whitelist all IPs (0.0.0.0/0) for Railway
5. Get connection string

### Step 2: Create CloudAMQP Instance

1. Go to https://cloudamqp.com
2. Create free "Little Lemur" plan
3. Get AMQP URL

### Step 3: Deploy Backend to Railway

#### Via GitHub Integration
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add service: Backend
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`

#### Environment Variables
```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/weather
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
RABBITMQ_URI=amqps://user:pass@cloudamqp.com/vhost
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=secure_password
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Step 4: Deploy Worker to Railway

1. Add new service: Worker
   - **Root Directory:** `worker`
   - **Build Command:** `go build -o worker`
   - **Start Command:** `./worker`

#### Environment Variables
```
RABBITMQ_URI=amqps://user:pass@cloudamqp.com/vhost
BACKEND_URL=https://your-backend.railway.app/weather/logs
```

### Step 5: Deploy Collector to Railway

1. Add new service: Collector
   - **Root Directory:** `collector`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python main.py`

#### Environment Variables
```
RABBITMQ_URI=amqps://user:pass@cloudamqp.com/vhost
LATITUDE=-23.5505
LONGITUDE=-46.6333
CITY_NAME=Sao Paulo
```

### Step 6: Configure Networking

Railway automatically assigns URLs. Update:
1. Backend URL in Vercel env vars
2. Backend URL in Worker env vars

---

## Alternative: Render.com

### Backend Deployment

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - **Name:** weather-backend
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`
   - **Plan:** Free

#### Environment Variables
Same as Railway above

### Worker Deployment

1. New → Background Worker
2. Configure:
   - **Name:** weather-worker
   - **Root Directory:** `worker`
   - **Build Command:** `go build -o worker`
   - **Start Command:** `./worker`

### Collector Deployment

1. New → Background Worker
2. Configure:
   - **Name:** weather-collector
   - **Root Directory:** `collector`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python main.py`

---

## Monitoring

### Vercel
- Analytics: Vercel Dashboard → Analytics
- Logs: Vercel Dashboard → Deployments → View Logs

### Railway
- Logs: Railway Dashboard → Service → Logs
- Metrics: Railway Dashboard → Service → Metrics

### Render
- Logs: Render Dashboard → Service → Logs
- Metrics: Render Dashboard → Service → Metrics

---

## Cost Estimation

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Vercel | Hobby | Free |
| Railway | Hobby | $5 (500h) |
| MongoDB Atlas | M0 | Free |
| CloudAMQP | Little Lemur | Free |
| **Total** | | **$5/month** |

---

## Troubleshooting

### Frontend not connecting to Backend
- Check `VITE_API_URL` in Vercel
- Verify CORS settings in Backend
- Check Backend is running

### Worker not processing messages
- Check RabbitMQ connection
- Verify `BACKEND_URL` is correct
- Check Railway logs

### Database connection failed
- Verify MongoDB Atlas IP whitelist
- Check connection string format
- Ensure database user has permissions
