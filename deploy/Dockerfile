# syntax=docker/dockerfile:1

FROM oven/bun:1.3.2-alpine AS deps
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
RUN bun add --exact @prisma/adapter-pg@7.6.0 pg@8.14.1

FROM oven/bun:1.3.2-alpine AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV TZ=Asia/Shanghai
ENV PGTZ=Asia/Shanghai
ENV DATABASE_URL=postgresql://czedu:czedu@localhost:5432/czedu?schema=public

COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY deploy/prisma/schema ./prisma/schema
COPY deploy/overrides/lib/prisma.ts.template ./lib/prisma.ts

RUN ./node_modules/.bin/prisma generate --schema prisma/schema
RUN bun run build

FROM oven/bun:1.3.2-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV TZ=Asia/Shanghai
ENV PGTZ=Asia/Shanghai
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV PRISMA_DB_PUSH=true

RUN addgroup -S nextjs -g 1001 \
  && adduser -S nextjs -u 1001 -G nextjs

COPY --from=builder /app ./
RUN mkdir -p /app/public/uploads \
  && chown -R nextjs:nextjs /app/public/uploads /app/.next \
  && chmod +x /app/deploy/entrypoint.sh

USER nextjs

EXPOSE 3000
ENTRYPOINT ["/app/deploy/entrypoint.sh"]
