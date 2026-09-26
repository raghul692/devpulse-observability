# Multi-Stage Production Dockerfile for DevPulse
# Stage 1: Build & Dependency Pruning
FROM node:22-alpine AS builder

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Minimal Distroless / Hardened Runner
FROM node:22-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=3000

# Copy pruned dependencies and app source
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
COPY public ./public

# Use non-root unprivileged node user
USER node

EXPOSE 3000

# Healthcheck probe for container orchestrators (K8s/Docker Swarm/AWS ECS)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/healthz || exit 1

CMD ["node", "src/server.js"]
