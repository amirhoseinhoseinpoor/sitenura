# Architecture

## Monorepo

```
sitenura/
├── apps/
│   ├── api/        NestJS 12 REST API (port 4000)
│   └── web/        Next.js 16 App Router (port 3000)
├── packages/
│   └── shared/     Zod schemas + TS types: the API contract
├── docs/
└── docker-compose.yml   PostgreSQL 17
```

Turborepo runs tasks in dependency order (`shared` builds before `api`/`web`)
and caches results.

## Shared contract

`@sitenura/shared` holds Zod schemas (`createProjectSchema`, `projectSchema`, ...).

- The **API** validates incoming bodies with them (`ZodValidationPipe`).
- The **web** validates API responses with them (`apiRequest({ schema })`).

One schema, so the two sides can't silently drift apart.

## API: modular + hexagonal

Each feature lives in `src/modules/<feature>/` with four layers:

| Layer            | Responsibility                                     | Depends on  |
| ---------------- | -------------------------------------------------- | ----------- |
| `domain`         | Ports (abstract repositories, provider interfaces) | nothing     |
| `application`    | Use cases / services                               | domain      |
| `infrastructure` | Adapters (Prisma repositories, LLM SDKs)           | domain      |
| `presentation`   | HTTP controllers                                   | application |

Bindings happen in the module (`{ provide: ProjectRepository, useClass: PrismaProjectRepository }`),
so services can be unit-tested with in-memory fakes (see `projects.service.spec.ts`).

Cross-cutting pieces:

- `config/`: Zod-validated env, typed `AppConfigService`; the app won't boot with bad config
- `infrastructure/database/`: `PrismaService` (Prisma 7 + `pg` driver adapter)
- `common/`: global exception filter, validation pipe
- Global: Pino logging (secrets redacted), Helmet, CORS, throttling, `/api/v1` versioning,
  Swagger at `/api/docs` (non-production)

### LLM abstraction

`modules/llm/domain/llm-provider.port.ts` defines `LlmProvider`. Every model
(OpenAI, Gemini, Anthropic) is an adapter behind it. The planner and the executor
depend only on the port, so adding a provider never touches the pipeline.

## Web: feature-sliced

```
src/
├── app/            routes, layout, providers (React Query)
├── components/ui/  design-system primitives (shadcn-style, CVA variants)
├── features/<x>/   api/ (fetchers + query keys), hooks/, components/
└── lib/            api-client, env validation, utils
```

- English UI with the Geist font; logical CSS properties keep it RTL-ready
- Semantic design tokens in `globals.css` (light/dark)
- Server state via TanStack Query; validation via the shared Zod schemas

## BASIC wizard

The wizard is data-driven. `packages/shared/src/wizard/` holds:

- `catalog.ts`: option lists (site types, pages, styles, palettes, fonts, tones, features)
- `steps.ts`: the ordered steps and which brief fields each one answers
- `brief.schema.ts`: `websiteBriefSchema` (complete brief) and `draftBriefSchema` (in progress)

Flow: the web validates the current step with `websiteBriefSchema.pick(fields)`, then
`PATCH /projects/:id/requirements` sends only that step's answers plus the next step id.
The API merges them into the stored draft, re-validates, and keeps the project name in
sync with the business name. Reopening `/projects/:id/wizard` resumes at `wizardStep`.

Adding a step: add the field to the brief schema, a catalog if needed, an entry in
`WIZARD_STEPS`, and a `case` in `features/wizard/components/step-content.tsx`.

## Data model

- `Project`: name, mode (BASIC/ADVANCED), planner provider, status, `requirements`
  (wizard answers as JSON), `wizardStep` (resume point)
- `PromptChunk`: ordered unit of work: `userIntent` → `plannedPrompt` (planner) → `executorOutput` (Claude)
