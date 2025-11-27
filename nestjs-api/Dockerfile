# Usa uma imagem leve do Node.js
FROM node:18-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependências primeiro (cache layer)
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia todo o resto do código fonte
COPY . .

# Cria a versão de produção (build)
RUN npm run build

# Expõe a porta 3000
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "run", "start:prod"]