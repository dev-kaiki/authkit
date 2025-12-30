# AuthKit — NestJS Auth Starter (JWT/Refresh + RBAC)

[![CI](https://github.com/dev-kaiki/authkit/actions/workflows/ci.yml/badge.svg)](https://github.com/dev-kaiki/authkit/actions/workflows/ci.yml)
![Node](https://img.shields.io/badge/node-20%2B-222?logo=node.js)
![NestJS](https://img.shields.io/badge/nestjs-10-222?logo=nestjs)
![Postgres](https://img.shields.io/badge/postgres-16-222?logo=postgresql)
![Docker](https://img.shields.io/badge/docker-ready-222?logo=docker)

Base profissional para autenticação e autorização em produção: **JWT + Refresh Token + RBAC**, com documentação (Swagger), validações e padrão de projeto.

> **Status atual:** repo criado a partir do template (API + Web + Postgres).  
> Endpoints prontos: `/health`, `/users` e Swagger em `/docs`.  
> As rotas de Auth/RBAC estão no roadmap abaixo.

---

## ✨ Objetivo do projeto
Entregar um backend reutilizável e sólido, para você plugar em qualquer app, com:
- autenticação confiável (login/refresh/logout)
- controle de acesso (roles/permissions)
- boas práticas: validação, swagger, logs, rate limit, etc.

---

## ✅ Roadmap (pra virar demo “nível produção”)
- [ ] `POST /auth/register` (opcional)
- [ ] `POST /auth/login` (JWT + refresh)
- [ ] `POST /auth/refresh`
- [ ] `POST /auth/logout`
- [ ] RBAC: roles/permissions + decorator `@Roles()`
- [ ] Rate limiting + brute force protection
- [ ] Auditoria (ex.: login attempts)
- [ ] Testes (unit/e2e)

---

## 🧱 Stack
- **API:** NestJS + Prisma
- **DB:** PostgreSQL (Docker)
- **Docs:** Swagger (`/docs`)
- **Web (placeholder):** Next.js (pode ser removido se quiser backend-only)

---

## ▶️ Rodar local (Windows)
### 1) Dependências e containers
```powershell
corepack enable
corepack prepare pnpm@latest --activate

pnpm install
docker compose up -d
