# Acquit.ai Dockerfile

FROM node:20.15.1-bookworm-slim AS base
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-venv \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ---------- Dependencies ----------
FROM base AS deps
COPY package.json package-lock.json ./
COPY artifacts/mockup-sandbox/package.json artifacts/mockup-sandbox/
COPY artifacts/api-server/package.json artifacts/api-server/
COPY lib/db/package.json lib/db/
COPY scripts/package.json scripts/
RUN npm ci

# ---------- Builder ----------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
# Note: we need to build mockup-sandbox for the frontend, and api-server for the backend
RUN npm run build --workspace=artifacts/mockup-sandbox
RUN npm run build --workspace=artifacts/api-server

# ---------- Runner ----------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules

# Copy built frontend
COPY --from=builder /app/artifacts/mockup-sandbox/dist ./artifacts/mockup-sandbox/dist

# Copy built backend
COPY --from=builder /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=builder /app/artifacts/api-server/package.json ./artifacts/api-server/package.json

RUN useradd -m aquit && chown -R aquit:aquit /app
USER aquit

EXPOSE 3000
ENV PORT=3000

CMD ["node", "artifacts/api-server/dist/index.mjs"]
