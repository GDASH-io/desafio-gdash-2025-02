FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# Install all dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/typescript-config/package.json ./packages/typescript-config/
RUN pnpm install --frozen-lockfile

# Build
FROM deps AS builder
COPY apps/api ./apps/api
COPY packages ./packages
COPY turbo.json ./
RUN cd packages/shared && pnpm run build
RUN cd apps/api && pnpm run build

# Production image
FROM deps AS runner
ENV NODE_ENV=production

# Copy built app and source packages
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages ./packages

WORKDIR /app/apps/api

EXPOSE 3333
CMD ["node", "dist/main.js"]
