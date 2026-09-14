# AuthKit

Autenticação em NestJS: senha com argon2, JWT de acesso curto, refresh token
rotativo com detecção de reuso, RBAC por papel e rate limit no login.

Monorepo pnpm: `apps/api` (NestJS + Prisma + PostgreSQL) e `apps/web` (Next.js).

## O que está implementado

| | |
|---|---|
| Senha | argon2id. O hash nunca sai do banco — as respostas são montadas com `select` explícito, não removendo o campo depois. |
| Access token | JWT assinado, 15 minutos. A API se recusa a subir sem `JWT_SECRET`. |
| Refresh token | 7 dias, aleatório, guardado só como SHA-256. Cada uso rotaciona. |
| Detecção de reuso | Apresentar um refresh já usado revoga **todos** os tokens do usuário — é a assinatura de um token roubado sendo replicado. |
| RBAC | `USER` e `ADMIN`. Guard global: rota nova nasce protegida, e sai disso só com `@Public()`. |
| Rate limit | 100 req/min geral; 5/min no login. |
| Enumeração de conta | Login verifica contra um hash-chamariz quando o e-mail não existe, para que errar o e-mail e errar a senha levem o mesmo tempo. |

## Rotas

| método | rota | acesso |
|---|---|---|
| `POST` | `/auth/register` | público — cria conta como `USER` |
| `POST` | `/auth/login` | público |
| `POST` | `/auth/refresh` | público (o próprio token é a credencial) |
| `POST` | `/auth/logout` | público — revoga o refresh |
| `GET` | `/auth/me` | autenticado |
| `GET` `POST` | `/users` | `ADMIN` |
| `GET` | `/health` | público |

Swagger em `/docs`, com botão de bearer token.

## Rodando local

Precisa de Node 20+, pnpm e Docker.

**macOS / Linux**

```bash
./dev.sh
```

**Windows**

```powershell
powershell -ExecutionPolicy Bypass -File .\dev.ps1
```

Sobe Postgres, aplica as migrations e deixa a API em `localhost:3001` e o web em
`localhost:3000`.

### O primeiro ADMIN

`/auth/register` só cria `USER`, e `/users` exige `ADMIN` — então um banco novo
precisa de um admin semeado:

```bash
ADMIN_EMAIL=voce@exemplo.com ADMIN_PASSWORD=uma-senha-longa pnpm --filter api prisma:seed
```

Idempotente: rodar de novo promove e redefine a senha do mesmo e-mail.

## Variáveis de ambiente

`apps/api/.env` não é versionado. O `dev.sh` cria a partir de
`apps/api/.env.example` no primeiro uso, já sorteando um `JWT_SECRET`.

| variável | |
|---|---|
| `DATABASE_URL` | PostgreSQL |
| `JWT_SECRET` | **obrigatória** — sem ela a API não sobe |
| `PORT` | padrão 3001 |

`apps/web/.env.local`

| variável | |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL da API |

## Deploy

Ainda não está no ar. Os arquivos estão prontos: `render.yaml` (API) e
`apps/web/vercel.json` (web, com root `apps/web`).

API — Render Blueprint:
https://render.com/deploy?repo=https://github.com/dev-kaiki/authkit

WEB — Vercel:
https://vercel.com/new/clone?repository-url=https://github.com/dev-kaiki/authkit&project-name=dev-kaiki-authkit&repository-name=authkit&root-directory=apps/web

No Render é preciso definir `DATABASE_URL`, `JWT_SECRET` e `CORS_ORIGIN`; na
Vercel, `NEXT_PUBLIC_API_URL` apontando para a API.
