# Google Cloud Platform Deployment Guide

## Overview
Deploy on GCP using Cloud Run, Cloud SQL (MongoDB), and Pub/Sub.

## Architecture
```
Cloud Load Balancer → Cloud Run (Frontend, Backend, Worker, Collector)
                       ↓
                     Cloud SQL + Cloud Pub/Sub
```

## Prerequisites
- GCP Account with billing enabled
- `gcloud` CLI installed
- Docker installed

## Step 1: Setup GCP Project

```bash
# Create project
gcloud projects create weather-app-project --name="Weather App"

# Set project
gcloud config set project weather-app-project

# Enable APIs
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable pubsub.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## Step 2: Create Cloud SQL Instance (MongoDB)

**Note:** Cloud SQL doesn't support MongoDB. Use MongoDB Atlas or deploy MongoDB on GCE.

### Option A: MongoDB Atlas (Recommended)
1. Create cluster at https://mongodb.com/cloud/atlas
2. Whitelist GCP IP ranges
3. Get connection string

### Option B: MongoDB on Compute Engine
```bash
# Create VM
gcloud compute instances create mongodb-instance \
  --machine-type=e2-medium \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB

# SSH and install MongoDB
gcloud compute ssh mongodb-instance
sudo apt-get update
sudo apt-get install -y mongodb
```

## Step 3: Create Pub/Sub Topic (Alternative to RabbitMQ)

```bash
# Create topic
gcloud pubsub topics create weather-data

# Create subscription
gcloud pubsub subscriptions create weather-data-sub \
  --topic=weather-data
```

**Note:** You'll need to modify Worker to use Pub/Sub instead of RabbitMQ, or use CloudAMQP.

## Step 4: Build and Push Docker Images

```bash
# Configure Docker for GCR
gcloud auth configure-docker

# Build and push backend
cd backend
docker build -t gcr.io/weather-app-project/backend:latest .
docker push gcr.io/weather-app-project/backend:latest

# Repeat for other services
cd ../frontend
docker build -t gcr.io/weather-app-project/frontend:latest .
docker push gcr.io/weather-app-project/frontend:latest

cd ../worker
docker build -t gcr.io/weather-app-project/worker:latest .
docker push gcr.io/weather-app-project/worker:latest

cd ../collector
docker build -t gcr.io/weather-app-project/collector:latest .
docker push gcr.io/weather-app-project/collector:latest
```

## Step 5: Deploy Backend to Cloud Run

```bash
# Deploy backend
gcloud run deploy weather-backend \
  --image gcr.io/weather-app-project/backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/weather,JWT_SECRET=your-secret,RABBITMQ_URI=amqps://cloudamqp-url
```

## Step 6: Deploy Frontend to Cloud Run

```bash
# Deploy frontend
gcloud run deploy weather-frontend \
  --image gcr.io/weather-app-project/frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars VITE_API_URL=https://weather-backend-xxxxx-uc.a.run.app
```

## Step 7: Deploy Worker to Cloud Run

```bash
# Deploy worker (as background service)
gcloud run deploy weather-worker \
  --image gcr.io/weather-app-project/worker:latest \
  --platform managed \
  --region us-central1 \
  --no-allow-unauthenticated \
  --set-env-vars RABBITMQ_URI=amqps://cloudamqp-url,BACKEND_URL=https://weather-backend-xxxxx-uc.a.run.app/weather/logs
```

## Step 8: Deploy Collector to Cloud Run

```bash
# Deploy collector (as background service)
gcloud run deploy weather-collector \
  --image gcr.io/weather-app-project/collector:latest \
  --platform managed \
  --region us-central1 \
  --no-allow-unauthenticated \
  --set-env-vars RABBITMQ_URI=amqps://cloudamqp-url
```

## Step 9: Setup Cloud Scheduler (for Collector)

```bash
# Create job to trigger collector every hour
gcloud scheduler jobs create http collector-trigger \
  --schedule="0 * * * *" \
  --uri="https://weather-collector-xxxxx-uc.a.run.app" \
  --http-method=POST \
  --oidc-service-account-email=<service-account>@weather-app-project.iam.gserviceaccount.com
```

## Step 10: Configure Custom Domain (Optional)

```bash
# Map domain to Cloud Run service
gcloud run domain-mappings create \
  --service weather-frontend \
  --domain www.your-domain.com \
  --region us-central1
```

## Environment Variables

Store secrets in Secret Manager:
```bash
# Create secret
echo -n "your-jwt-secret" | gcloud secrets create jwt-secret --data-file=-

# Grant access to Cloud Run
gcloud secrets add-iam-policy-binding jwt-secret \
  --member=serviceAccount:<service-account>@weather-app-project.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor

# Use in Cloud Run
gcloud run deploy weather-backend \
  --update-secrets=JWT_SECRET=jwt-secret:latest
```

## Monitoring

### Cloud Logging
```bash
# View logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=weather-backend" --limit 50
```

### Cloud Monitoring
1. Go to Cloud Console → Monitoring
2. Create dashboard for Cloud Run services
3. Add metrics: Request count, Latency, Error rate

### Alerts
```bash
# Create alert policy
gcloud alpha monitoring policies create \
  --notification-channels=<channel-id> \
  --display-name="High Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=0.05
```

## Cost Estimation

| Service | Configuration | Monthly Cost (USD) |
|---------|--------------|-------------------|
| Cloud Run | 4 services, minimal traffic | ~$10 |
| MongoDB Atlas | M0 Free Tier | Free |
| CloudAMQP | Free Tier | Free |
| Cloud Scheduler | 3 jobs | ~$0.30 |
| **Total** | | **~$10/month** |

## Auto Scaling

Cloud Run auto-scales by default:
- **Min instances:** 0 (scales to zero)
- **Max instances:** 100 (configurable)
- **Concurrency:** 80 requests per instance

Configure:
```bash
gcloud run services update weather-backend \
  --min-instances=1 \
  --max-instances=10 \
  --concurrency=80
```

## Security

1. **IAM:** Use service accounts with least privilege
2. **VPC:** Use VPC Connector for private resources
3. **Secrets:** Store in Secret Manager
4. **HTTPS:** Automatic with Cloud Run
5. **Authentication:** Use Cloud IAM for internal services

## CI/CD with Cloud Build

Create `cloudbuild.yaml`:
```yaml
steps:
  # Build
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/backend:$COMMIT_SHA', './backend']
  
  # Push
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/backend:$COMMIT_SHA']
  
  # Deploy
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'weather-backend'
      - '--image=gcr.io/$PROJECT_ID/backend:$COMMIT_SHA'
      - '--region=us-central1'
      - '--platform=managed'
```

Trigger build:
```bash
gcloud builds submit --config cloudbuild.yaml
```

## Troubleshooting

### Check Cloud Run logs
```bash
gcloud run services logs read weather-backend --limit=50
```

### Check service status
```bash
gcloud run services describe weather-backend --region=us-central1
```

### Test service locally
```bash
docker run -p 3000:3000 gcr.io/weather-app-project/backend:latest
```
