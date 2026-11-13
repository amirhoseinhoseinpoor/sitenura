# PromptBridge

Build a website without knowing how to code.

PromptBridge sits between the user and AI models. The user describes what they
want (or, in **Basic mode**, answers a guided step-by-step wizard about colors,
templates and UI style). A **planner model** of their choice (ChatGPT, Gemini, ...)
turns that into expert prompts, splits them into small ordered chunks, and
**Claude** executes them one by one.

## Stack

| Area     | Tech                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------- |
| Frontend | Next.js 16, React 19, Tailwind CSS 4, TanStack Query, React Hook Form                             |
| Backend  | NestJS 12, Prisma 7, Pino, Swagger, Helmet, Throttler, Terminus                                   |
| Database | PostgreSQL 17 (Docker)                                                                            |
| Shared   | Zod 4 schemas as the single API contract                                                          |
| Tooling  | pnpm workspaces, Turborepo, TypeScript (strict), Vitest, ESLint, oxlint, Prettier, GitHub Actions |

## Getting started

Requirements: Node 22+, pnpm 10+, Docker.

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
pnpm db:up          # start PostgreSQL
pnpm db:migrate     # create tables
pnpm dev            # web on :3000, API on :4000
```

- Web: http://localhost:3000
- API docs (Swagger): http://localhost:4000/api/docs
- Health: http://localhost:4000/api/v1/health

## Scripts

| Command          | What it does                 |
| ---------------- | ---------------------------- |
| `pnpm dev`       | Run everything in watch mode |
| `pnpm build`     | Build all packages           |
| `pnpm lint`      | Lint all packages            |
| `pnpm typecheck` | Type-check all packages      |
| `pnpm test`      | Unit tests                   |
| `pnpm db:studio` | Open Prisma Studio           |

## Docs

- [Architecture](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
