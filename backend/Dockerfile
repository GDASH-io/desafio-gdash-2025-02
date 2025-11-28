FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm install

COPY tsconfig*.json ./
COPY src ./src

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]