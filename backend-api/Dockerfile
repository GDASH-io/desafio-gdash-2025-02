FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV DATABASE_URL="mongodb://localhost:27017/gdash?authSource=admin&directConnection=true&replicaSet=rs0"

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD sh -c "npx prisma db push && npm run start:prod"