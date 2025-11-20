FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# Para desenvolvimento, use start:dev
# Para produção, descomente as linhas abaixo e use start:prod
# RUN npm run build
# CMD ["npm", "run", "start:prod"]

CMD ["npm", "run", "start:dev"]

