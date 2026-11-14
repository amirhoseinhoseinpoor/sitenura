# CLAUDE.md

Guidance for AI assistants working in this repo.

- Monorepo: pnpm + Turborepo. Run commands from the root (`pnpm build`, `pnpm test`, ...).
- `packages/shared` is the API contract. Change schemas there first, then rebuild it
  (`pnpm --filter @prompt-bridge/shared build`) before touching api/web.
- API (`apps/api`) is ESM (`"type": "module"`): relative imports end in `.js`.
- API features follow `modules/<feature>/{domain,application,infrastructure,presentation}`.
  Services depend on abstract ports in `domain/`, never on Prisma directly.
- Prisma client is generated into `apps/api/src/generated/prisma` (gitignored).
  After editing `schema.prisma`, run `pnpm db:migrate`.
- All product copy, code, comments and docs are in English.
- Web (`apps/web`): use semantic Tailwind tokens (`bg-primary`, `text-muted-foreground`),
  not raw colors. Prefer logical properties (`ms-`, `ps-`, `text-start`) so RTL locales
  can be added later without rework.
- Validate API responses with shared Zod schemas via `apiRequest({ schema })`.
- The roadmap lives in `docs/ROADMAP.md`; tick items off as phases land.
