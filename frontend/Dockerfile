FROM node:20-alpine
WORKDIR /app

# Copia apenas manifests para instalar deps (melhor cache)
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps || npm install

# Copiamos o resto só para build de produção; em dev usaremos volume.
COPY . .

EXPOSE 5173
CMD ["npm","run","dev","--","--host"]