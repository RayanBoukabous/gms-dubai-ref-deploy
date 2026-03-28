# ── Stage 1: install deps ─────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ── Stage 2: build ────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# BACKEND_URL is needed at build time for next.config.js rewrites
ARG BACKEND_URL=http://askbook-backend:8000
ENV BACKEND_URL=$BACKEND_URL

# Browser must call the host-mapped API URL for SSE (avoid Next proxy / empty body on some setups)
ARG NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── Stage 3: runtime ──────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Keep BACKEND_URL available at runtime (for dynamic rewrites if needed)
ARG BACKEND_URL=http://askbook-backend:8000
ENV BACKEND_URL=$BACKEND_URL

COPY --from=builder /app/.next        ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["npm", "start"]
