FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# Testes
RUN npm run test

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "node dist/main.js || node build/main.js"]