FROM node:20-alpine

WORKDIR /usr/src/app

# Instalar wget para healthcheck e dependências para compilar módulos nativos
RUN apk add --no-cache wget python3 make g++

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte (será sobrescrito pelo bind-mount em dev)
COPY . .

# Fazer build do TypeScript para produção
RUN npm run build

# Copiar e tornar executável o script de entrada
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expor porta
EXPOSE 3000

# Usar script de entrada
ENTRYPOINT ["docker-entrypoint.sh"]

# Comando padrão (será sobrescrito pelo docker-compose em dev)
CMD ["npm", "run", "start:dev"]

