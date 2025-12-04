# Frontend Dockerfile for Railway
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Pass build-time envs from Railway/Nixpacks to Vite
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Install dependencies
RUN npm ci

# Copy source files
COPY . ./

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
