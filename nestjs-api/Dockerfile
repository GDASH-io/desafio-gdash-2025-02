# --- STAGE 1: BUILD (Instala dependências e compila) ---
FROM node:20-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas o package.json e instala as dependências
# A principal correção é COPIAR SOMENTE O package.json para que o lock file seja gerado no container.
COPY package*.json ./
RUN npm install

# Copia o restante do código fonte
COPY . .

# Compila o NestJS (Assumindo que o comando de build gera a pasta 'dist')
RUN npx tsc --project tsconfig.json

# --- STAGE 2: PRODUCTION (Ambiente de execução mais leve) ---
FROM node:20-alpine AS production

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Copia as dependências de produção do estágio de build
COPY --from=builder /app/node_modules ./node_modules

# Copia o código compilado (a pasta 'dist')
COPY --from=builder /app/dist ./dist

# Copia o package.json (apenas para referência na execução)
COPY --from=builder /app/package.json ./package.json

# Define a porta que a aplicação irá escutar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD [ "npm", "run", "start:prod" ]