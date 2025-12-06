# AWS Deployment Guide

## Overview
Deploy the full-stack weather application on AWS using ECS Fargate, RDS, and Amazon MQ.

## Architecture
```
CloudFront → ALB → ECS Fargate (Frontend, Backend, Worker, Collector)
                    ↓
                  RDS (MongoDB) + Amazon MQ (RabbitMQ)
```

## Prerequisites
- AWS Account
- AWS CLI installed and configured
- Docker installed locally
- ECR repositories created

## Step 1: Create ECR Repositories

```bash
# Create repositories for each service
aws ecr create-repository --repository-name weather-backend
aws ecr create-repository --repository-name weather-frontend
aws ecr create-repository --repository-name weather-collector
aws ecr create-repository --repository-name weather-worker
```

## Step 2: Build and Push Docker Images

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push backend
cd backend
docker build -t weather-backend .
docker tag weather-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/weather-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/weather-backend:latest

# Repeat for other services
```

## Step 3: Create MongoDB on DocumentDB

```bash
# Create DocumentDB cluster
aws docdb create-db-cluster \
  --db-cluster-identifier weather-db-cluster \
  --engine docdb \
  --master-username admin \
  --master-user-password <secure-password> \
  --vpc-security-group-ids sg-xxxxxxxx

# Create instance
aws docdb create-db-instance \
  --db-instance-identifier weather-db-instance \
  --db-instance-class db.t3.medium \
  --engine docdb \
  --db-cluster-identifier weather-db-cluster
```

## Step 4: Create Amazon MQ (RabbitMQ)

```bash
# Create broker
aws mq create-broker \
  --broker-name weather-rabbitmq \
  --engine-type RABBITMQ \
  --engine-version 3.11 \
  --host-instance-type mq.t3.micro \
  --deployment-mode SINGLE_INSTANCE \
  --users Username=admin,Password=<secure-password>
```

## Step 5: Create ECS Cluster

```bash
# Create cluster
aws ecs create-cluster --cluster-name weather-cluster

# Create task execution role
aws iam create-role --role-name ecsTaskExecutionRole --assume-role-policy-document file://trust-policy.json
aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

## Step 6: Create Task Definitions

Create `backend-task-definition.json`:
```json
{
  "family": "weather-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/weather-backend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "MONGO_URI",
          "value": "mongodb://admin:<password>@weather-db-cluster.cluster-xxxxxx.us-east-1.docdb.amazonaws.com:27017"
        },
        {
          "name": "JWT_SECRET",
          "value": "<your-jwt-secret>"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/weather-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

Register task definition:
```bash
aws ecs register-task-definition --cli-input-json file://backend-task-definition.json
```

## Step 7: Create ECS Services

```bash
# Create backend service
aws ecs create-service \
  --cluster weather-cluster \
  --service-name weather-backend-service \
  --task-definition weather-backend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}"
```

## Step 8: Create Application Load Balancer

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name weather-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx

# Create target group
aws elbv2 create-target-group \
  --name weather-backend-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxxxx \
  --target-type ip

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn <alb-arn> \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=<target-group-arn>
```

## Step 9: Deploy Frontend to S3 + CloudFront

```bash
# Build frontend
cd frontend
npm run build

# Create S3 bucket
aws s3 mb s3://weather-frontend-bucket

# Upload build
aws s3 sync dist/ s3://weather-frontend-bucket --acl public-read

# Create CloudFront distribution
aws cloudfront create-distribution --origin-domain-name weather-frontend-bucket.s3.amazonaws.com
```

## Environment Variables

Store secrets in AWS Secrets Manager:
```bash
aws secretsmanager create-secret \
  --name weather-app-secrets \
  --secret-string '{"MONGO_PASSWORD":"xxx","JWT_SECRET":"xxx","RABBITMQ_PASSWORD":"xxx"}'
```

## Monitoring

### CloudWatch Logs
- All ECS tasks log to CloudWatch
- Log groups: `/ecs/weather-backend`, `/ecs/weather-worker`, etc.

### CloudWatch Alarms
```bash
# Create CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name weather-backend-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

## Cost Estimation

| Service | Configuration | Monthly Cost (USD) |
|---------|--------------|-------------------|
| ECS Fargate | 4 tasks × 0.25 vCPU | ~$30 |
| DocumentDB | db.t3.medium | ~$70 |
| Amazon MQ | mq.t3.micro | ~$18 |
| ALB | Standard | ~$20 |
| CloudFront | 1GB transfer | ~$1 |
| **Total** | | **~$139/month** |

## Scaling

### Auto Scaling
```bash
# Create scaling policy
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/weather-cluster/weather-backend-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 1 \
  --max-capacity 10
```

## Security

1. **VPC:** Use private subnets for databases
2. **Security Groups:** Restrict inbound traffic
3. **IAM:** Use least privilege policies
4. **Secrets:** Store in Secrets Manager
5. **HTTPS:** Use ACM certificates with ALB

## Troubleshooting

### Check ECS Task Logs
```bash
aws logs tail /ecs/weather-backend --follow
```

### Check Service Status
```bash
aws ecs describe-services --cluster weather-cluster --services weather-backend-service
```
