# 1. Imagem base do Node (versão leve)
FROM node:20-alpine

# 2. Define o diretório de trabalho dentro do container
WORKDIR /app

# 3. Copia os arquivos de dependências primeiro
# Isso aproveita o cache do Docker se nada mudar nas dependências
COPY package*.json ./

# 4. Instala as dependências
RUN npm install

# 5. Copia o restante do código fonte do projeto
COPY . .

# 6. Compila o projeto (Build do NestJS)
RUN npm run build

# 7. Expõe a porta que a aplicação usa
EXPOSE 3000

# 8. Comando para iniciar a aplicação compilada
CMD ["npm", "run", "start:prod"]