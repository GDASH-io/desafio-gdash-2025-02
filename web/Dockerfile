FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Ensure local binaries are available in PATH (fixes 'vite: not found' with bind mounts)
ENV PATH=/app/node_modules/.bin:$PATH

# Start in development mode for debugging
# Install vite globally so the 'vite' CLI is available even when node_modules is mounted from a volume
RUN npm install -g vite

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]