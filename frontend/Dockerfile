FROM node:20-alpine

# Definir diretório de trabalho dentro do container
WORKDIR /app

# Copiar apenas os arquivos de dependência primeiro (para aproveitar o cache do Docker)
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm install

# Copiar o restante do código para dentro do container
COPY . .

# Expor a porta padrão do Vite
EXPOSE 5173

# Comando para rodar o servidor de desenvolvimento
# O --host é CRUCIAL para o Docker expor a porta para fora do container
CMD ["npm", "run", "dev", "--", "--host"]