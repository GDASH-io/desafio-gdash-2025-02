# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Argumento de build para API URL
ARG VITE_API_URL=http://localhost:3001/api
ENV VITE_API_URL=${VITE_API_URL}

# Copiar package files
COPY package*.json ./
RUN npm ci

# Copiar código
COPY . .

# Build da aplicação
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine

# Copiar build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]