FROM node:20-alpine

WORKDIR /app

# Copia arquivos de dependência primeiro
COPY package*.json ./

# Instala todas as dependências
RUN npm install -g npm && npm install @google/generative-ai@latest && npm install

# Copia o restante do código
COPY . .

# Build da aplicação
RUN npm run build

# Comando final: roda o JS compilado
CMD ["node", "dist/main.js"]
