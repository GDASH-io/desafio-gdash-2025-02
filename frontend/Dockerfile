FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Expor porta do Vite
EXPOSE 5173

# Comando para desenvolvimento (hot reload)
CMD ["npm", "run", "dev"]

