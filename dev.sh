#!/usr/bin/env bash
# Sobe a infra, aplica as migrations e roda api + web.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

corepack enable 2>/dev/null || true
pnpm install

# .env não é versionado (tem segredo dentro). Num clone novo, parte do exemplo.
if [ ! -f apps/api/.env ]; then
  sed "s|^JWT_SECRET=$|JWT_SECRET=$(openssl rand -hex 32)|" \
    apps/api/.env.example > apps/api/.env
  echo "apps/api/.env criado a partir do exemplo, com um JWT_SECRET novo."
fi

# Só o Postgres: o compose ainda declara redis e minio, que esta API não usa.
pnpm exec docker compose up -d postgres

echo "Aguardando o Postgres..."
until docker compose exec -T postgres pg_isready -U app >/dev/null 2>&1; do sleep 1; done

pnpm --filter api exec prisma migrate deploy
pnpm --filter api exec prisma generate
pnpm dev
