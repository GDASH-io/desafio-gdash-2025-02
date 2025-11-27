FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Ensure local binaries are available in PATH (fixes 'nest: not found' with bind mounts)
ENV PATH=/app/node_modules/.bin:$PATH

# Make sure the NestJS CLI is available globally so dev start scripts find it even when volumes are mounted
RUN npm install -g @nestjs/cli

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "run", "start:dev"]