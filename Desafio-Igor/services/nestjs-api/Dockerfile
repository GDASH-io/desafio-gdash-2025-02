FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar TODAS as dependências (incluindo dev)
RUN npm install

# Copiar arquivos de configuração TypeScript
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Copiar código fonte
COPY . .

# Build
RUN npm run build

# Imagem de produção
FROM node:20-alpine

# Instalar curl para healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm install --omit=dev

# Copiar build do builder
COPY --from=builder /app/dist ./dist

# Copiar node_modules do builder (para garantir)
COPY --from=builder /app/node_modules ./node_modules

# Criar diretório de exports
RUN mkdir -p /app/exports

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Executar
CMD ["node", "dist/main.js"]
