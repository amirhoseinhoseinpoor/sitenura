# Sitenura Roadmap

Each phase ends in something that runs. We go one phase at a time and close
each one with a PR before starting the next.

**Pipeline:** user intent → **Planner LLM** (ChatGPT / Gemini / Claude, chosen by
the user) writes expert prompts → prompts are split into ordered **chunks** →
**Executor (Claude)** runs each chunk → the user sees the result step by step.

---

## Phase 0: Foundation ✅

- [x] pnpm + Turborepo monorepo (`apps/web`, `apps/api`, `packages/shared`)
- [x] NestJS 12 API: env validation (Zod), Pino logging, Helmet, CORS, rate limiting,
      URI versioning (`/api/v1`), Swagger (`/api/docs`), global error filter
- [x] Prisma 7 + PostgreSQL 17 (Docker Compose), `Project` and `PromptChunk` models
- [x] Layered modules (domain / application / infrastructure / presentation)
- [x] `LlmProvider` port (contract only)
- [x] Next.js 16 web app: English UI (Geist font), Tailwind 4 design tokens, React Query,
      typed and Zod-validated API client, BASIC/ADVANCED mode picker
- [x] Shared Zod contracts used by both API and web
- [x] GitHub Actions CI (lint, typecheck, test, build)

## Phase 1: BASIC wizard (no AI yet) ✅

Goal: a non-technical user answers simple questions and ends up with a
structured "website brief" saved in the database.

- [x] Wizard engine: steps and option catalogs as data in `@sitenura/shared`
- [x] Steps: details → site type → pages → style → color palette → fonts →
      tone → features → review
- [x] Visual pickers (palette swatches, layout mini-mockups, font and tone samples)
- [x] Save each step to `Project.requirements` (`PATCH /projects/:id/requirements`)
- [x] Resume an unfinished wizard (`Project.wizardStep`)
- [x] Review screen with per-answer Edit
- [ ] Later: custom brand colors and logo upload

## Phase 2: LLM provider adapters

- [x] Adapters implementing `LlmProvider`: OpenAI, Gemini, Anthropic (official SDKs)
- [x] Provider registry (`GET /api/v1/llm/providers`); projects already store their planner
- [x] Retries with backoff, timeouts, token tracking per call (`llm_calls` table)
- [ ] Cost estimates per call (needs a price table per model)
- [x] Secrets: server-side env keys
- [ ] Encrypted per-user keys (with auth, Phase 5)
- [x] Adapter tests with fake SDK clients, plus `pnpm --filter @sitenura/api llm:smoke` for live keys

## Phase 3: Planner pipeline (brief → chunked prompts)

- [ ] Planner system prompt that turns the brief into an ordered build plan
- [ ] Structured output (JSON schema) → `PromptChunk` rows
- [ ] Background jobs with BullMQ + Redis (long-running, retryable)
- [ ] ADVANCED mode: free-text intent → same planner pipeline

## Phase 4: Executor (Claude) + live progress

- [ ] Executor service: run chunks in order through Claude, feeding prior outputs as context
- [ ] Streaming progress to the UI (Server-Sent Events)
- [ ] Per-chunk review: approve, edit prompt, re-run
- [ ] Generated files stored per project (filesystem/S3 abstraction)

## Phase 5: Preview & export

- [ ] Live preview of the generated site (sandboxed iframe)
- [ ] Download as ZIP / push to the user's GitHub repo
- [ ] One-click deploy (Vercel) as an option

## Phase 6: Accounts & production hardening

- [ ] Auth (email + OAuth), project ownership
- [ ] Usage limits and billing hooks
- [ ] i18n (additional languages, including RTL), accessibility pass
- [ ] Observability (OpenTelemetry), Dockerfiles, staging environment
- [ ] E2E tests with Playwright
