# PromptBridge Roadmap

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

## Phase 1: BASIC wizard (no AI yet)

Goal: a non-technical user answers simple questions and ends up with a
structured "website brief" saved in the database.

- [ ] Wizard engine: step definitions as data (question, type, options, validation)
- [ ] Steps: site type → pages → template/layout → color palette → fonts →
      content/tone → features (contact form, gallery, ...) → review
- [ ] Visual pickers (color swatches, template thumbnails, UI style previews)
- [ ] Autosave each step to `Project.requirements` (`PATCH /projects/:id/requirements`)
- [ ] Resume an unfinished wizard
- [ ] Brief summary page

## Phase 2: LLM provider adapters

- [ ] Adapters implementing `LlmProvider`: OpenAI, Gemini, Anthropic (official SDKs)
- [ ] Provider registry + per-project planner selection
- [ ] Retries with backoff, timeouts, token/cost tracking per call
- [ ] Secrets: server-side env first, then encrypted per-user keys (later phase)
- [ ] Contract tests with mocked HTTP

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
