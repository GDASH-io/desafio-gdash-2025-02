# 1. Build stage
FROM node:18-alpine as builder

WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY . .

# Variável de ambiente para a API (usada no App.jsx)
ENV VITE_API_URL /api
# Constrói o aplicativo React/Vite
RUN npm run build

# 2. Production stage
FROM nginx:stable-alpine as production

# Copia a configuração do Nginx (para roteamento e proxy da API)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos de build estáticos
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]