FROM node:18-alpine AS development

WORKDIR /app

COPY package.json yarn.lock* package-lock.json* tsconfig*.json ./ 
RUN npm install --include=dev

COPY . . 
RUN npm run build

FROM node:18-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package.json yarn.lock* package-lock.json* ./ 
COPY --from=development /app/node_modules ./node_modules
COPY --from=development /app/dist ./dist

CMD ["node", "dist/main"]
