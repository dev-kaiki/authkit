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

# --wait usa o healthcheck do compose: retorna só quando o Postgres aceita
# conexão, e falha se ele não ficar saudável.
docker compose up -d --wait

pnpm --filter api exec prisma migrate deploy
pnpm --filter api exec prisma generate
pnpm dev
