## Beacon – Developer Guidelines

These guidelines describe how we build and maintain the Beacon Engagement Discovery Portal.
They define a production-grade standard for enterprise delivery, reliability, and security.

---

## 1. Tech Stack & Architecture

- **Frontend**: Next.js 14+ (App Router), React 18+, TypeScript, Tailwind CSS, shadcn/ui.
- **Backend**: Next.js Route Handlers (tRPC or REST), running in the same monorepo.
- **Database**: PostgreSQL 16+ with `pgvector` extension, accessed via Drizzle ORM.
- **Auth**: Azure AD SSO via NextAuth.js (Auth.js).
- **AI**: Anthropic Claude or Azure OpenAI using a RAG pattern over PostgreSQL/pgvector.
- **Testing**: Vitest (unit + integration), Playwright (E2E, visual regression, accessibility).
- **CI/CD**: GitHub Actions for lint, test, build, and deploy.

Design decisions should align with the Product Requirements Document (PRD), `FEATURES.md`, and `WIREFRAMES.md`.

---

## 2. Production Engineering Principles

- **Production-first mindset**
  - Every feature is designed for operability, security, and long-term maintainability.
  - No feature is considered complete without observability, tests, and rollback strategy.
- **Simple where possible, explicit where needed**
  - Start with clean modular design; introduce CQRS/read models only when read/write scale or complexity justifies it.
  - Prefer explicit contracts over implicit framework behavior.
- **12-factor alignment**
  - Config in environment variables.
  - Strict build/release/run separation.
  - Dev/stage/prod parity to reduce deployment drift.
  - Logs treated as event streams (structured, centralized).
- **SRE operating model**
  - Define SLI/SLO for critical journeys (login, catalog query, Signal create, AI response).
  - Use error budgets to decide release pace when reliability degrades.

---

## 3. Coding Standards

- **TypeScript**
  - Prefer explicit types for function signatures, API responses, and DB models.
  - Use `strict` TypeScript settings; avoid `any` unless absolutely necessary and justified.
- **React / Next.js**
  - Use functional components and hooks.
  - Place complex logic in hooks/utilities, not in JSX.
  - Prefer server components for data-fetch-heavy views; use client components for interactivity.
- **Styling**
  - Use Tailwind CSS utility classes for layout and spacing.
  - Use shadcn/ui components for consistent, accessible UI primitives.
  - Avoid custom design systems unless approved in architecture review.
  - UI must be consistent, accessible, and production-ready; avoid one-off or inconsistent visual patterns.
- **API & Data Access**
  - Centralize DB access in Drizzle-based repositories or services.
  - Validate inputs at the API boundary (e.g., Zod schemas).
  - Do not access the database directly from client components.

---

## 4. Architecture & Service Boundaries

- **Layering rules**
  - UI → application service → domain/data access; no direct UI → DB path.
  - External provider calls (LLM, email, identity) must pass through dedicated adapters.
- **Read/write separation (when needed)**
  - For high read load, create dedicated read models/materialized views.
  - Keep write side transactional and invariant-driven.
  - Document consistency model (strong vs eventual) per feature.
- **Idempotency and retries**
  - All externally retried operations must be idempotent (webhooks, async jobs, queue consumers).
  - Use deterministic idempotency keys for mutating endpoints.

---

## 5. Code Organization

- Group by **feature/domain** where possible (`engagements`, `signals`, `search`, `chatbot`, `admin`).
- Use clear folders for:
  - `app/` – route segments and layout (Next.js App Router).
  - `app/api/` – API route handlers (REST or tRPC routers).
  - `lib/` – shared utilities (auth, validation, logging).
  - `db/` – Drizzle schema, migrations, and DB helpers.
  - `components/` – shared UI components.
  - `features/*` – feature-specific components, hooks, and services.

Keep files focused and small; extract shared logic aggressively when reused.

---

## 6. Database Engineering Standards

- **Schema quality and normalization**
  - Model OLTP entities in at least 3NF unless a denormalized read model is explicitly approved.
  - Every table must have a primary key and clear ownership semantics.
  - Use `NOT NULL`, `CHECK`, `UNIQUE`, and `FOREIGN KEY` constraints to enforce invariants in DB, not only in code.
- **Migration safety**
  - Migrations must be forward-only, reviewed, and tested on realistic data volumes.
  - Avoid destructive changes without a two-step migration plan (backfill + cutover + cleanup).
- **Indexing strategy**
  - Add indexes only for observed query patterns.
  - Prefer composite indexes aligned with common filter + sort paths.
  - Use partial/expression indexes for selective predicates when justified.
  - On production systems, create large indexes with `CREATE INDEX CONCURRENTLY`.
  - Reassess index utility periodically; remove low-value indexes to reduce write overhead.
- **Views and materialized views**
  - Use standard views for reusable query semantics.
  - Use materialized views for expensive read paths where slightly stale data is acceptable.
  - Define refresh cadence, ownership, and failure handling for each materialized view.
- **Stored procedures/triggers**
  - Use procedures/functions for transactional consistency and audited admin operations where app-side orchestration is unsafe.
  - Use triggers sparingly and only for cross-cutting invariants/audit events that cannot be reliably enforced elsewhere.

---

## 7. Logging, Metrics, Tracing, and Auditability

- **Structured logging**
  - Emit JSON logs with timestamp, level, service, environment, request ID, user ID (when allowed), and event name.
  - Never log secrets, tokens, or raw PII.
- **Metrics and alerts**
  - Track latency, throughput, error rate, saturation, queue depth, and DB slow queries.
  - Alert on SLO burn rate, auth failures, AI provider degradation, and job failures.
- **Distributed tracing**
  - Propagate correlation IDs from edge to DB and downstream services.
  - Record spans for auth, API handler, DB calls, external providers.
- **Audit trail**
  - Record immutable audit events for privileged actions: role changes, taxonomy edits, data exports, and admin overrides.

---

## 8. Security & Compliance Baseline

- **Security verification**
  - Validate controls against OWASP ASVS (target level selected per release scope).
  - Maintain an explicit security checklist in PRs for auth, access control, injection, and secrets handling.
- **Access control**
  - Deny by default; allow by policy.
  - Enforce authorization both in API and server-side actions.
  - Never rely on UI visibility as a permission control.
- **Data protection**
  - Encrypt data in transit and at rest.
  - Classify sensitive fields and define retention/deletion policies.
  - Minimize PII exposure in analytics and AI prompts.

---

## 9. RBAC Governance (Admin Control)

- **Role model**
  - Maintain explicit permission matrix for Admin, Curator, Member, Viewer.
  - Permissions are capability-based (action + resource), not route-name based.
- **Admin controls**
  - Admin changes to roles/permissions require audit logging and reason metadata.
  - Critical role changes require dual control (maker-checker) in production.
  - Provide periodic access review report (who has what and why).
- **Separation of duties**
  - Deployment, role administration, and security approvals should not be owned by one person in production.

---

## 10. Git, Review, and Release Management

Enforcement mode by project stage:
- **Bootstrap mode (Weeks 1–4)**: lightweight enforcement to maximize delivery speed.
- **Stabilization mode (Weeks 5–9)**: medium enforcement on quality/security-sensitive scope.
- **Release mode (Weeks 10–12+)**: full enforcement for production readiness.

- **Main branch** should always be deployable.
- Use short-lived **feature branches**:
  - Naming: `feature/…`, `fix/…`, `chore/…` (e.g., `feature/engagement-detail`, `fix/signal-status-bug`).
- **Commits**
  - Write clear, imperative messages (e.g., “Add Signal Kanban view”, “Fix AI citation rendering”).
  - Follow Conventional Commits (`feat:`, `fix:`, `docs:`, etc.).
  - Prefer smaller, focused commits over giant ones.
- During Bootstrap mode, `commitlint` is advisory (non-blocking) but still expected.
- From Stabilization onward, `commitlint` is required for merge.
- Use pull requests for all non-trivial changes; require at least one review (and a second reviewer only for sensitive changes).
- Use trunk-based delivery with feature flags for incomplete user-facing capabilities.
- Prefer progressive delivery (canary/controlled rollout) for high-risk changes.

---

## 11. Testing Expectations

- **Unit tests (Vitest)**
  - Cover core business logic, utilities, and hooks.
  - Aim for 80%+ coverage on non-trivial modules.
- **Integration tests**
  - Exercise API routes against a test DB (migrations applied).
  - Validate end-to-end behavior at the API boundary.
- **E2E tests (Playwright)**
  - Cover critical flows: login, engagement creation, Signals lifecycle, AI queries, search, RBAC.
  - Include key visual regression snapshots for major screens.
- **Accessibility tests**
  - Use axe with Playwright to scan key pages for WCAG 2.1 AA issues.
- **Performance tests**
  - Track baseline latency and throughput for high-volume API endpoints.
  - Validate query plans for top DB calls (`EXPLAIN ANALYZE` on representative datasets).
- **Security tests**
  - Include automated dependency scanning, secret scanning, and SAST in CI.
  - Validate authz regression tests for all privileged operations.

All PRs should run tests/lint relevant to changed scope before merge.
`commitlint` is advisory in Bootstrap mode and required from Stabilization onward.

---

## 12. Reliability, Operations, and Maintenance

- **Operational readiness**
  - Every service path has runbook links, dashboards, and alert routes.
  - Define RTO/RPO expectations for production data and recovery process.
- **Incident management**
  - Use severity levels, incident commander role, timeline logging, and postmortems.
  - Action items from postmortems must be tracked and prioritized.
- **Maintenance minimization**
  - Automate repetitive operational tasks (backups, cleanup jobs, index maintenance, stale-data reminders).
  - Keep operational complexity low: fewer moving parts unless measurable value justifies additional components.

---

## 13. Definition of Done (Production)

A story/feature is only done when all are true:

- [ ] Functional acceptance criteria met.
- [ ] Unit, integration, and relevant E2E tests pass.
- [ ] Observability added (logs/metrics/traces) with dashboard references.
- [ ] Security and RBAC checks completed.
- [ ] Data model/migration/index impact reviewed.
- [ ] Documentation updated (feature, workflow, runbook when needed).
- [ ] Rollback strategy documented for risky changes.

---

## 14. Beacon-Specific Conventions

- Keep terminology consistent with the PRD:
  - Use `engagement`, `Signal`, `Beacon AI`, `Beacon Pulse`, `Spotlight`, `Stars` in code and UI where applicable.
- When adding or modifying features, update:
  - `FEATURES.md` (if feature-level scope changes).
  - `WIREFRAMES.md` (if user flows or layouts change materially).
- Ensure new features support the primary goals:
  - Eliminate silos, enable talent-to-need matching, promote cross-team collaboration, and reduce duplicate problem solving.

---

## 15. Documentation & Reviews

- Keep code self-explanatory; add comments only for non-obvious decisions or trade-offs.
- Update or add README-style docs for new subsystems (e.g., AI pipeline, notifications worker).
- In reviews:
  - Focus on correctness, clarity, security, performance, and alignment with product goals.
  - Prefer constructive feedback; suggest concrete alternatives when raising concerns.

