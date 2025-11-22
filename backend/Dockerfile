FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm","run","start:dev"]