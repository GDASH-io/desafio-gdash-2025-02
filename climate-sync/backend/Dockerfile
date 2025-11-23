FROM node:24-alpine

WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json ./
COPY tsconfig*.json ./

# Instalar dependências
RUN npm ci

# Instalar NestJS CLI globalmente
RUN npm install -g @nestjs/cli

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["node", "dist/main"]