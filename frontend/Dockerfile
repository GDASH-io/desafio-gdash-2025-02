# --- Etapa 1: Build (Usando Node 20) ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copia e instala dependências
COPY package*.json ./
RUN npm install

# Copia o código e gera a build de produção (pasta /dist)
COPY . .
RUN npm run build

# --- Etapa 2: Servidor de Produção (Nginx) ---
FROM nginx:alpine

# Remove a config padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos gerados na etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia a nossa configuração customizada (criaremos no próximo passo)
COPY nginx-custom.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]