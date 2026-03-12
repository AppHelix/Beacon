> LOCKED FORMAT POLICY: This file is status-only. Allowed status markers are `[x]` (black check/complete), `[-]` (partial), and `[ ]` (not started).
> AI must not rewrite task text, reorder sections, alter headings, or modify any content except status markers.

## Beacon – 12-Week / 12-Phase Execution Checklist

---

## Phase 01 (Week 1) — Project Foundation

- [x] Initialize Next.js 14+ app (App Router) with TypeScript.
- [x] Configure Tailwind CSS, shadcn/ui, ESLint, and Prettier.
- [x] Set up base folder structure (`app`, `features`, `lib`, `db`, `components`).
- [x] Add environment variable template and local setup instructions.
- [x] Define baseline CI workflow skeleton (lint/test/build jobs scaffolded).
- [x] Week 1 exit check: repository boots locally with lint passing.

## Phase 02 (Week 2) — Data + Auth Core

- [x] Provision PostgreSQL and enable required extensions (`pg_trgm`, prep for `pgvector`).
- [x] Add Drizzle ORM and create core schema (users, engagements, tech tags).
- [x] Run initial migrations and validate schema in local/dev DB.
- [x] Integrate Azure AD SSO via NextAuth.js (login/logout/session).
- [x] Add auth guards for protected routes and API boundaries.
- [x] Week 2 exit check: authenticated user can sign in and persist session.

## Phase 03 (Week 3) — Engagement MVP + Baseline Quality


 [x] Build Engagement CRUD (create, read, update).
 [x] Implement Engagement Catalog with card grid, basic search, and status filter.
 [x] Implement Engagement Detail page with core tabbed layout.
 [x] Deliver responsive layout skeleton for Home, Engagements, Signals, People, Admin.
 [x] Add Vitest unit/integration baseline and first Playwright login/catalog E2E.
 [x] Activate CI checks for lint, tests, and build.
 [x] Week 3 exit check: Foundation phase shippable increment is complete.


## Phase 04 (Week 4) — Signals Creation + Lifecycle Start

- [x] Implement Signal entity and full create/read/update APIs.
- [x] Add Signal creation UX from both global board and engagement context.
- [x] Implement initial statuses (`Open`, `In Progress`, `Resolved`, `Closed`).
- [x] Add Signal Detail page with problem statement and metadata.
- [x] Week 4 exit check: users can create and track Signals end to end.

## Phase 05 (Week 5) — Collaboration Workflows

- [x] Implement Signal Board list + Kanban views with filter/sort.
- [x] Add hand-raise workflow and suggestion responses.
- [x] Add resolution summary capture on `Resolved` transition.
- [x] Add in-app notifications for Signal responses and hand-raises.
- [x] Week 5 exit check: seeker/contributor loop works without manual DB edits.

## Phase 06 (Week 6) — People + RBAC Hardening

- [x] Build People Directory with search and skill filtering.
- [ ] Add team membership management on engagement profiles.
- [ ] Enforce RBAC roles across UI + API (Admin, Curator, Member, Viewer).
- [ ] Expand Playwright coverage for full Signal lifecycle and role-sensitive flows.
- [ ] Week 6 exit check: Collaboration Engine phase meets access and workflow goals.

---


## Phase 07 (Week 7) — AI Data Layer

- [ ] Enable `pgvector` and define embedding storage schema.
- [ ] Implement embedding generation pipeline for engagements and Signals.
- [ ] Build retrieval layer for semantic query context.
- [ ] Validate retrieval quality on seeded project data.
- [ ] Week 7 exit check: RAG data pipeline is operational.


## Phase 08 (Week 8) — Beacon AI Assistant

- [ ] Implement Beacon AI chat backend with RAG grounding.
- [ ] Add citation mapping to source engagements/Signals.
- [ ] Implement session history handling for follow-up questions.
- [ ] Enforce safe fallback behavior (`I don’t know` when context is weak).
- [ ] Week 8 exit check: chatbot returns grounded answers with citations.

## Phase 09 (Week 9) — Discovery + Recognition

- [ ] Implement advanced search (facets, synonym support, typeahead).
- [ ] Build contribution event tracking across collaboration actions.
- [ ] Add leaderboard views (monthly/quarterly breakdowns).
- [ ] Add badge milestones and Featured Project Spotlight.
- [ ] Add chatbot + contribution E2E coverage.
- [ ] Week 9 exit check: Intelligence/Recognition phase is release-ready.

---

## Phase 10 (Week 10) — Pulse + Analytics

- [ ] Implement Beacon Pulse daily digest pipeline and content assembly.
- [ ] Add admin analytics dashboard (heatmaps, collaboration, activity).
- [ ] Implement exportable contribution reporting (e.g., PDF).
- [ ] Week 10 exit check: leadership visibility and digest workflows are functional.

## Phase 11 (Week 11) — Quality, Security, Performance

- [ ] Run full accessibility audit and remediate WCAG 2.1 AA issues.
- [ ] Add/refresh visual regression suite for critical user journeys.
- [ ] Perform DB/query optimization, caching, and lazy-loading improvements.
- [ ] Conduct OWASP-focused security review and input sanitization checks.
- [ ] Week 11 exit check: non-functional quality bar is met.

## Phase 12 (Week 12) — Launch Readiness + Go-Live

- [ ] Complete user documentation and deployment runbook.
- [ ] Finalize production deployment configuration and monitoring alerts.
- [ ] Execute pre-launch smoke tests across critical paths.
- [ ] Deliver launch communication and onboarding materials.
- [ ] Perform go-live and monitor first-week stability.
- [ ] Week 12 exit check: production launch complete with active monitoring.

---

## Cross-Phase Gates (Track Weekly)

- [ ] Scope gate: changes mapped to `PROJECT-PLAN.md` and approved.
- [ ] Quality gate: Bootstrap (commit lint advisory + lint/tests for changed scope), Stabilization/Release (commit lint + lint + tests required in CI).
- [ ] Security gate: RBAC + PII-safe behavior validated for new features.
- [ ] Documentation gate: relevant docs updated (`FEATURES.md`, `WIREFRAMES.md`, implementation notes).
- [ ] Demo gate: weekly walkthrough recorded/shared with stakeholders.

---

## Weekly Showcase Evidence Pack (Required Every Phase)

For each Week/Phase (01–12), publish evidence with links:

- [ ] Scope delivered vs planned (completed checklist + deferred items).
- [ ] Demo artifact (recording/slides/live demo notes).
- [ ] Test report summary (unit/integration/E2E/accessibility as applicable).
- [ ] Commit quality report (`commitlint` status + notable exceptions if any).
- [ ] Security and RBAC verification notes (including negative authorization tests).
- [ ] Data changes log (migrations, constraints, index updates, view/procedure updates).
- [ ] Observability snapshot (logs, metrics, alerts, incident notes if any).
- [ ] Deployment status and rollback readiness.

---

## Data & Platform Hardening Milestones

- [x] Week 02: Core schema constraints enforced (`NOT NULL`, PK/FK, required uniques).
- [ ] Week 03: Baseline query indexes in place and validated.
- [ ] Week 06: RBAC policy matrix implemented and admin audit events enabled.
- [ ] Week 07: Vector/AI data model hardened with retention and refresh rules.
- [ ] Week 09: Search and leaderboard read paths optimized (indexes/views where needed).
- [ ] Week 10: Admin analytics data paths documented (materialized views refresh ownership if used).
- [ ] Week 11: Query-plan review completed for top N expensive paths.
- [ ] Week 12: Backup/restore and incident runbook dry-run completed.

