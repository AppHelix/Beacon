## Beacon – Contribution & Development Workflow

This document describes how to contribute to the Beacon codebase, including branching, testing, and deployment practices.

---

## 1. High-Level Development Flow

1. **Plan**: Align work with the PRD, `Features.md`, and `ProjectPlan.md` (phase and milestone). Confirm which persona/use case (Explorer, Seeker, Curator, etc.) you are improving.
2. **Design**: Consult or update `Wireframes.md`, API contracts, and data models.
3. **Implement**: Make changes on a feature branch with appropriate tests.
4. **Review**: Open a pull request and address review feedback.
5. **Test**: Run automated tests and verify critical flows (including AI/RAG and RBAC).
6. **Deploy**: Merge to `main`; CI/CD handles build and deployment.
7. **Monitor**: Check logs, metrics, and user feedback; hotfix if needed.

---

## 2. Issue & Task Management

- Track work as tickets (e.g., Jira, GitHub Issues, Azure Boards).
- Each ticket should include:
  - Problem statement and acceptance criteria.
  - Links to relevant PRD sections, wireframes, and features.
  - Phase tag (P1–P4) and type (feature, bug, tech debt, spike).

---

## 3. Branching & Pull Requests

- Create one branch per ticket:
  - Naming: `feature/<short-name>`, `fix/<short-name>`, `chore/<short-name>`.
- Keep branches small and focused.
- When ready:
  - Open a PR into `main` (or release branch).
  - Reference the ticket and include screenshots for UI changes.
  - Ensure linting and tests pass before requesting review.
- Require at least one peer review before merge.

---

## 4. Local Development Environment

- **Setup**
  - Run PostgreSQL (local or Docker) with `pgvector` enabled.
  - Apply Drizzle ORM migrations to the local DB.
  - Configure `.env` for Next.js, DB connection, Azure AD test tenant, and AI provider.
- **Running the app**
  - Start the Next.js dev server.
  - Start any background workers (e.g., notifications, Beacon Pulse generator) as needed.
- **Local testing**
  - Run unit and integration tests (Vitest) frequently.
  - Run Playwright for affected flows: login, engagement CRUD, Signals, Beacon AI, RBAC.
  - For AI features, add tests to verify RAG-only behavior and source citations.

---

## 5. Environments & CI/CD

- **Environments**
  - Local: developer machine; may use test Azure AD and mocked AI.
  - Dev/Sandbox: integration/QA environment with shared test data.
  - Staging: pre-production, close to production config and data.
  - Production: live Beacon instance for AppHelix employees.
- **CI/CD**
  - On PR: run type-check, lint, unit/integration tests, and a smoke E2E suite.
  - On merge to `main`: run full test suite (including E2E and visual regression), build, and deploy to Dev/Staging; promote to Production after sign-off.
  - Avoid manual deployments except for emergency hotfixes.

---

## 6. Testing Expectations

- **Before opening a PR**
  - Run `lint`, `type-check`, and `test` locally.
  - Manually verify key user flows touched by the change (Signals lifecycle, engagement edits, search, AI queries).
- **Before merge**
  - Ensure Playwright E2E tests for affected flows pass in CI.
  - For accessibility-impacting changes, run automated checks (axe + Playwright) on Home, Engagement Detail, and Signal Board at desktop/tablet/mobile breakpoints.
- **After deploy**
  - Smoke test: login, engagement catalog, Signal Board, Beacon AI query.
  - Check monitoring dashboards for errors, performance regressions, and AI failures.

---

## 7. Operations, Data & Security

- **Monitoring**
  - Track uptime, response times, DB performance, and AI request errors.
  - Configure alerts for auth failures, DB issues, AI outages, and unusual error spikes.
- **Incident response**
  - Follow a simple runbook: identify → mitigate → communicate → root-cause → follow-up tasks.
- **Data management**
  - Ensure daily PostgreSQL backups and a documented restore procedure.
  - Apply retention and deletion policies for PII and logs.
  - Respect RBAC and least-privilege principles in all code changes.

---

## 8. Intern & Mentorship Rhythm

- Interns or junior developers should:
  - Have weekly check-ins with a mentor/tech lead to review progress against `ProjectPlan.md`.
  - Demo completed work at the end of each phase, mapped to PRD sections and personas.
- Mentors should:
  - Provide guidance on architecture, testing, and quality.
  - Help adjust scope when risks or blockers appear, keeping phases shippable.

