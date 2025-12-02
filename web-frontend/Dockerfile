FROM node:20-alpine

WORKDIR /app

# Copia apenas package.json e package-lock.json
COPY package*.json ./

# Instala dependências dentro do container
RUN npm install --legacy-peer-deps

# Copia o restante do código
COPY . .

# Expõe a porta do Vite
EXPOSE 5173

# Rodar Vite no host 0.0.0.0
CMD ["npm", "run", "dev", "--", "--host"]
