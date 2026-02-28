## Beacon – Developer Guidelines

These guidelines describe how we build and maintain the Beacon Engagement Discovery Portal.
They are intentionally lightweight and should be refined as the project evolves.

---

## 1. Tech Stack & Architecture

- **Frontend**: Next.js 14+ (App Router), React 18+, TypeScript, Tailwind CSS, shadcn/ui.
- **Backend**: Next.js Route Handlers (tRPC or REST), running in the same monorepo.
- **Database**: PostgreSQL 16+ with `pgvector` extension, accessed via Drizzle ORM.
- **Auth**: Azure AD SSO via NextAuth.js (Auth.js).
- **AI**: Anthropic Claude or Azure OpenAI using a RAG pattern over PostgreSQL/pgvector.
- **Testing**: Vitest (unit + integration), Playwright (E2E, visual regression, accessibility).
- **CI/CD**: GitHub Actions for lint, test, build, and deploy.

Design decisions should align with the Product Requirements Document (PRD), `Features.md`, and `Wireframes.md`.

---

## 2. Coding Standards

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
  - Avoid custom design systems unless a shared pattern emerges.
- **API & Data Access**
  - Centralize DB access in Drizzle-based repositories or services.
  - Validate inputs at the API boundary (e.g., Zod schemas).
  - Do not access the database directly from client components.

---

## 3. Code Organization

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

## 4. Git & Branching

- **Main branch** should always be deployable.
- Use short-lived **feature branches**:
  - Naming: `feature/…`, `fix/…`, `chore/…` (e.g., `feature/engagement-detail`, `fix/signal-status-bug`).
- **Commits**
  - Write clear, imperative messages (e.g., “Add Signal Kanban view”, “Fix AI citation rendering”). 
  - Prefer smaller, focused commits over giant ones.
- Use pull requests for all non-trivial changes; request at least one review.

---

## 5. Testing Expectations

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

All PRs should run the test suite and lint checks before merge; fix failing tests rather than disabling them.

---

## 6. Performance & Security

- **Performance**
  - Use server-side data fetching and caching where appropriate.
  - Only request the data needed for a view; avoid N+1 queries by using joins or batched queries.
  - Add indexes for common search and filter fields (e.g., status, tech tags).
- **Security**
  - Never log secrets or PII in plain text.
  - Enforce authorization checks in all API routes (RBAC-aware).
  - Sanitize user input and protect against XSS/CSRF.
  - Follow the OWASP Top 10 guidelines for web applications.

---

## 7. Beacon-Specific Conventions

- Keep terminology consistent with the PRD:
  - Use `engagement`, `Signal`, `Beacon AI`, `Beacon Pulse`, `Spotlight`, `Stars` in code and UI where applicable.
- When adding or modifying features, update:
  - `Features.md` (if feature-level scope changes).
  - `Wireframes.md` (if user flows or layouts change materially).
- Ensure new features support the primary goals:
  - Eliminate silos, enable talent-to-need matching, promote cross-team collaboration, and reduce duplicate problem solving.

---

## 8. Documentation & Reviews

- Keep code self-explanatory; add comments only for non-obvious decisions or trade-offs.
- Update or add README-style docs for new subsystems (e.g., AI pipeline, notifications worker).
- In reviews:
  - Focus on correctness, clarity, security, performance, and alignment with product goals.
  - Prefer constructive feedback; suggest concrete alternatives when raising concerns.

