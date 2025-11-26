FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build
RUN npm run build

# Stage de produção
FROM node:20-alpine

WORKDIR /app

# Copiar apenas arquivos necessários
COPY package*.json ./
RUN npm ci --only=production

# Copiar build e database/seed
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/database ./database

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/weather/health || exit 1

# Executar
CMD ["node", "dist/src/main.js"]

