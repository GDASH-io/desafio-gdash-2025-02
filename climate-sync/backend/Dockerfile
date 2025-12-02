FROM node:24-alpine

WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json ./
COPY tsconfig*.json ./

# Instalar dependências
RUN npm install --legacy-peer-deps

# Copiar código fonte
COPY . .

# Instalar NestJS CLI globalmente para garantir o build
RUN npm install -g @nestjs/cli

# Build da aplicação
RUN npm run build

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["node", "dist/main"]