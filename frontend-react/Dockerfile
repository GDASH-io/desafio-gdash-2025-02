FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

# O --host permite acessar o site de fora do container
CMD ["npm", "run", "dev", "--", "--host"]