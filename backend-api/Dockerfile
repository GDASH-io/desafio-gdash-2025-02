# Usa uma imagem Node.js
FROM node:22-alpine

# Define o diretório de trabalho
WORKDIR /app

COPY package*.json ./

# Instala dependências na construção da imagem
RUN npm install

COPY . .

EXPOSE 3000

# Usa 'sh -c' para garantir que o install rode antes do start se a pasta estiver vazia
CMD ["sh", "-c", "npm install && npm run start:dev"]