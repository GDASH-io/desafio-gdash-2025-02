FROM node:22-slim

WORKDIR /app

RUN apt-get update && apt-get install -y procps curl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

CMD ["npm", "run", "start:dev"]