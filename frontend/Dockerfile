# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci && npm cache clean --force

# Copiar TODOS os arquivos necessários para o build
COPY . .

# VERIFICAR: Certifique-se que public/assets existe
RUN ls -la public/assets || echo "ERRO: public/assets não encontrado!"

# Build da aplicação
RUN npm run build

# VERIFICAR: Ver se as imagens foram copiadas para dist
RUN ls -la dist/assets || echo "AVISO: dist/assets não encontrado!"

# Production stage - Nginx
FROM nginx:alpine

# Copiar build do React
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
