## Beacon – Contribution & Development Workflow

This document describes how to contribute to the Beacon codebase, including branching, testing, and deployment practices.

This is the production delivery playbook. It prioritizes reliability, security, auditability, and maintainability over speed-only delivery.

For this pre-start phase, controls are applied in stages:
- **Weeks 1–4 (Bootstrap)**: lightweight checks, fast iteration.
- **Weeks 5–9 (Stabilization)**: stronger CI/security/RBAC gates.
- **Weeks 10–12+ (Release)**: full production enforcement.

---

## 1. High-Level Development Flow

1. **Plan**: Align work with the PRD, `FEATURES.md`, and `PROJECT-PLAN.md` (phase and milestone). Confirm which persona/use case (Explorer, Seeker, Curator, etc.) you are improving.
2. **Design**: Consult or update `WIREFRAMES.md`, API contracts, and data models.
3. **Threat & Risk Review**: Identify data sensitivity, RBAC impact, migration risk, and rollback approach.
4. **Implement**: Make changes on a feature branch with tests and observability.
5. **Review**: Open a pull request with required evidence and address review feedback.
6. **Verify**: Run quality/security/performance gates for affected scope.
7. **Deploy**: Merge and release using controlled rollout.
8. **Operate**: Monitor telemetry, handle incidents, and close with learnings.

---

## 2. Ticket Quality Standard (Entry Criteria)

- Every ticket must include:
  - Problem statement and business impact.
  - Acceptance criteria (functional + non-functional).
  - Security/RBAC impact statement.
  - Data impact statement (schema/index/migration/backfill).
  - Observability requirements (logs/metrics/alerts).
  - Rollback strategy for risky changes.
- Tickets without these fields are not ready for implementation.

---

## 3. Branching, Commits, and Pull Requests

- Create one branch per ticket:
  - Naming: `feature/<short-name>`, `fix/<short-name>`, `chore/<short-name>`.
- Keep branches small and focused.
- Commit quality:
  - Use clear, imperative messages.
  - Follow Conventional Commits format.
  - Separate refactor from behavior changes where possible.
- Required PR contents:
  - Scope summary and linked ticket.
  - Test evidence (unit/integration/E2E as applicable).
  - Security and RBAC checklist.
  - DB change evidence (`EXPLAIN`, migration plan, index rationale where relevant).
  - UI evidence (screenshots/video for UX changes).
  - Rollout + rollback plan for risky features.

PR approvals (minimum):
- Standard changes: 1 reviewer.
- Sensitive changes (auth, RBAC, migrations, security): 2 reviewers (recommended in Bootstrap, required from Stabilization onward).

---

## 4. Issue & Task Management

- Track work as tickets (e.g., Jira, GitHub Issues, Azure Boards).
- Each ticket should include:
  - Links to relevant PRD sections, wireframes, and features.
  - Phase tag (Week 01–12) and type (feature, bug, tech debt, spike).
  - Required evidence artifacts for phase showcase.

---

## 5. Local Development Environment

- **Setup**
  - Run PostgreSQL (local or Docker) with `pgvector` enabled.
  - Apply Drizzle ORM migrations to the local DB.
  - Configure `.env` for Next.js, DB connection, Azure AD test tenant, and AI provider.
  - Seed realistic representative data for performance and query-plan testing.
- **Running the app**
  - Start the Next.js dev server.
  - Start any background workers (e.g., notifications, Beacon Pulse generator) as needed.
- **Local testing**
  - Run unit and integration tests (Vitest) frequently.
  - Run Playwright for affected flows: login, engagement CRUD, Signals, Beacon AI, RBAC.
  - For AI features, add tests to verify RAG-only behavior and source citations.
  - For DB-heavy changes, run `EXPLAIN ANALYZE` on key queries.

---

## 6. Environments & CI/CD

- **Environments**
  - Local: developer machine; may use test Azure AD and mocked AI.
  - Dev/Sandbox: integration/QA environment with shared test data.
  - Staging: pre-production, close to production config and data.
  - Production: live Beacon instance for AppHelix employees.
- **CI/CD**
  - On PR (Bootstrap): run `commitlint` + lint/type-check + targeted tests for changed scope.
  - On PR (Stabilization/Release): run `commitlint`, type-check, lint, unit/integration tests, SAST, dependency scanning, and smoke E2E.
  - On merge to `main`: run full test suite (including E2E, accessibility, and visual checks), build artifact, and deploy to Dev/Staging.
  - Production promotion requires explicit approval, release notes, and rollback verification.
  - Avoid manual deployments except for emergency hotfixes.

---

## 7. Production Checks and Balances

- **Quality gate**
  - Bootstrap: commit lint advisory, plus lint/type-check and targeted tests for changed scope.
  - Stabilization/Release: commit lint + lint/type-check/tests pass; no critical regression in key journeys.
- **Security gate**
  - RBAC checks pass; no critical/high unresolved security findings.
- **Data gate**
  - Migrations reviewed; indexes/constraints validated; rollback path tested.
- **Operational gate**
  - Logs/metrics/alerts present for new capabilities.
- **Business gate**
  - Acceptance criteria and demo evidence approved by product owner.

---

## 8. Testing Expectations

- **Before opening a PR**
  - Run `lint`, `type-check`, and `test` locally.
  - Manually verify key user flows touched by the change (Signals lifecycle, engagement edits, search, AI queries).
- **Before merge**
  - Ensure Playwright E2E tests for affected flows pass in CI.
  - For accessibility-impacting changes, run automated checks (axe + Playwright) on Home, Engagement Detail, and Signal Board at desktop/tablet/mobile breakpoints.
- **After deploy**
  - Smoke test: login, engagement catalog, Signal Board, Beacon AI query.
  - Check monitoring dashboards for errors, performance regressions, and AI failures.

Performance/reliability expectations:
- P95 API latency and error rate must remain within agreed SLO envelope.
- Any release exceeding error budget triggers release freeze or rollback decision.

---

## 9. Operations, Data & Security

- **Monitoring**
  - Track uptime, response times, DB performance, and AI request errors.
  - Configure alerts for auth failures, DB issues, AI outages, and unusual error spikes.
- **Incident response**
  - Follow runbook: identify → mitigate → communicate → root-cause → follow-up tasks.
  - Run blameless postmortem for Sev-1/Sev-2 incidents.
- **Data management**
  - Ensure daily PostgreSQL backups and a documented restore procedure.
  - Apply retention and deletion policies for PII and logs.
  - Respect RBAC and least-privilege principles in all code changes.

---

## 10. RBAC Change Management (Admin Control)

- Any role/permission model change must include:
  - Updated permission matrix.
  - Migration/backfill plan if data model changes.
  - Audit log verification for privileged actions.
  - Negative tests proving unauthorized access is blocked.
- Production RBAC changes require maker-checker approval.

---

## 11. Phase Showcase Requirements (Weekly)

At the end of each weekly phase, present a short evidence pack:

- Delivered scope vs planned scope.
- Demo recording or live walkthrough.
- Test summary and quality gate status.
- Security and RBAC validation status.
- Performance/operability snapshot (key dashboards).
- Risks, carry-overs, and next-phase plan.

---

## 12. Mentorship and Team Quality Bar

- Less experienced developers should:
  - Work from clearly scoped tickets with explicit acceptance and non-functional criteria.
  - Pair with a mentor for architecture/security-sensitive changes.
- Tech leads should:
  - Enforce standards in this document and `DEVELOPER-GUIDELINES.md`.
  - Block merges that fail production readiness expectations.

