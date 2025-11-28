FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

# Em produção seria npm run build && npm run start:prod
CMD ["npm", "run", "start:dev"]