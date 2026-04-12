#!/bin/sh
set -eu

: "${DATABASE_URL:?DATABASE_URL is required. Set it in deploy/.env.}"

mkdir -p /app/public/uploads

if [ "${PRISMA_DB_PUSH:-true}" = "true" ]; then
  ./node_modules/.bin/prisma db push --schema prisma/schema
fi

exec ./node_modules/.bin/next start -H "${HOSTNAME:-0.0.0.0}" -p "${PORT:-3000}"
