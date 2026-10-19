# Chain of Command Dockerfile

FROM node:22-bookworm-slim AS builder
ENV DEBIAN_FRONTEND=noninteractive
WORKDIR /app

COPY . .

# Placeholder public env so the Next.js production build succeeds in CI.
# Real values are injected at deploy time.
ENV NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321 \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key \
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=placeholder-publishable-key

RUN npm ci --ignore-scripts --no-audit --no-fund
RUN npm run build --workspace=apps/web
RUN npm run build --workspace=apps/api

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000

COPY --from=builder /app .

RUN useradd -m chainofcommand && chown -R chainofcommand:chainofcommand /app
USER chainofcommand

EXPOSE 3000
CMD ["node", "apps/api/dist/src/index.mjs"]
