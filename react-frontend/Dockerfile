FROM node:18-alpine AS development

WORKDIR /app

COPY package.json yarn.lock* package-lock.json* ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY --from=development /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
