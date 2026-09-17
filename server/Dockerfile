# Stage 1: Build NestJS application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency configuration files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source files and build
COPY . .
RUN pnpm build

# Prune devDependencies in place (takes 1 second, zero duplicate download)
RUN pnpm prune --prod

# Stage 2: Clean, minimal production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy only production node_modules and built dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main"]
