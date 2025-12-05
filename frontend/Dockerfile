# Usa a imagem Node.js LTS (v22) com Alpine (leve)
FROM node:22-slim

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia o package.json e package-lock.json (se existir)
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código fonte para o container
COPY . .

# Expõe a porta do Vite
EXPOSE 5173

# Comando para iniciar em modo de desenvolvimento
CMD ["npm", "run", "dev", "--", "--host"]