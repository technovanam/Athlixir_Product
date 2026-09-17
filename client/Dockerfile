# Stage 1: Install dependencies and build client
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat

# Copy dependency configuration files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build-time argument for API URL (required by Next.js static optimizations)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm build

# Stage 2: Minimal Standalone Production Runner (~150MB)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy standalone server and static assets only (zero unneeded node_modules or build tools)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
