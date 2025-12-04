FROM node:18
WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install
CMD ["pnpm", "dev"]
