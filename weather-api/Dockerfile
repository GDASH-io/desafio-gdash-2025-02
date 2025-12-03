FROM node:22-alpine

WORKDIR /app


COPY package*.json ./

RUN npm install


COPY prisma ./prisma


RUN npx prisma generate


COPY . .


RUN npm run build

CMD ["npm", "run", "start:prod"]