# Stage 1: Build NestJS application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency configuration files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source files and build
COPY . .
RUN pnpm build

# Stage 2: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN npm install -g pnpm

# Copy package and lockfiles for installation
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["pnpm", "start:prod"]
