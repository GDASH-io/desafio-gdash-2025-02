# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

EXPOSE 3000

# SEM HEALTHCHECK TEMPORARIAMENTE PARA DEBUG
# HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
#   CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/weather || exit 1

CMD ["node", "dist/main"]
