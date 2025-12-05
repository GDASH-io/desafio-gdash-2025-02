FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm install
COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist

COPY package*.json ./

RUN npm install --omit=dev

EXPOSE 3000

CMD ["node", "dist/main.js"]