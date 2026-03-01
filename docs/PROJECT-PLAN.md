## Beacon – Project Plan

This plan outlines the phased delivery of the Beacon Engagement Discovery Portal.
It is based on a 12‑week timeline with four major phases.

---

## 1. Goals & Success Criteria

- **Primary goals**
  - Eliminate engagement information silos across AppHelix.
  - Enable talent‑to‑need matching through Signals and discovery.
  - Foster cross‑team collaboration and reuse of solutions.
  - Provide leadership with visibility into technology footprint and collaboration health.
- **Key success metrics & KPIs**
  - Engagement Coverage: 100% of active engagements profiled within 30 days (profiles vs known active projects).
  - Monthly Active Users: 70%+ of all employees within 3 months (unique Azure AD logins/month).
  - Signal Response Time: first response within 4 business hours (Signal create → first response).
  - Signal Resolution Rate: 80%+ resolved within 5 business days (status transition tracking).
  - Cross‑Team Contributions: 20%+ contributors outside primary engagement within 6 months (contribution logs).
  - Chatbot Usage: 50+ queries/day within 2 months (chat session/message counts).
  - Chatbot Accuracy: 90%+ “helpful” rating (in‑chat thumbs up/down).
  - Digest Engagement: 40%+ open rate on daily Beacon Pulse (email tracking).
  - Search Effectiveness: relevant results within 2 searches on average (search session analysis).
  - User Satisfaction: NPS 50+ after 3 months (quarterly in‑app survey).

---

## 2. Phased Timeline (12 Weeks)

Each phase produces a shippable increment; later phases build on earlier ones.

### Phase 1 (Weeks 1–3): Foundation

- **Goal**: Get the core infrastructure running and the basic engagement catalog live.
- **Scope**
  1. Project scaffolding: Next.js 14+ with TypeScript, Tailwind CSS, shadcn/ui, ESLint, Prettier.
  2. PostgreSQL database setup with Drizzle ORM. Core schema migration for users, engagements, `tech_tags`.
  3. Azure AD SSO integration via NextAuth.js. Login/logout flow and session management.
  4. Engagement CRUD: create, read, update engagement profiles with all required fields.
  5. Engagement Catalog page with card grid, basic search (pg_trgm), and status filtering.
  6. Engagement Detail page with tabbed layout.
  7. Responsive layout skeleton for all major pages.
  8. Unit and integration test setup with Vitest. Playwright setup with first login E2E test.
  9. CI/CD pipeline with GitHub Actions: lint, test, build.
- **Deliverables**
  - Running app with secure login and engagement catalog.
  - Baseline automated tests and CI pipeline.

### Phase 2 (Weeks 4–6): Collaboration Engine

- **Goal**: Enable the core collaboration loop: ask for help, offer help, track it.
- **Scope**
  1. Signal (help request) CRUD with all fields from the PRD.
  2. Signal Board page with filters, sort, and Kanban view.
  3. Signal Detail page with response thread.
  4. Hand‑raise and suggestion response mechanisms.
  5. Signal lifecycle: Open → In Progress → Resolved → Closed.
  6. People Directory with search and skill filtering.
  7. Team membership management on engagement profiles.
  8. Notification system: in‑app notifications for Signal responses and hand‑raises.
  9. RBAC implementation: Admin, Curator, Member, Viewer roles.
  10. Expanded E2E test suite covering full Signal lifecycle.
- **Deliverables**
  - Usable collaboration platform for help requests and responses.
  - People Directory and team visibility integrated with engagements.

### Phase 3 (Weeks 7–9): Intelligence & Recognition

- **Goal**: Add AI‑powered discovery and gamification.
- **Scope**
  1. pgvector setup and embedding pipeline for engagement profiles and Signals.
  2. Beacon AI chatbot with RAG: natural language queries, source citations, session history.
  3. Chatbot UI: slide‑out panel with conversation interface.
  4. Advanced search with faceted filtering, synonym support, and typeahead.
  5. Contribution tracking system: log all collaborative actions.
  6. Leaderboard page with monthly/quarterly views.
  7. Badge system with milestone‑based awards.
  8. Featured Project Spotlight on homepage.
  9. Chatbot E2E tests and contribution tracking tests.
- **Deliverables**
  - AI‑backed discovery experience and visible recognition mechanisms.
  - Stable search and RAG pipeline ready for production use.

### Phase 4 (Weeks 10–12): Polish & Launch

- **Goal**: Daily digests, analytics, and production readiness.
- **Scope**
  1. Daily email digest (Beacon Pulse) with personalized content compilation and sending.
  2. Admin dashboard with analytics: technology heatmap, collaboration metrics, user activity.
  3. Exportable contribution reports (e.g., PDF) for performance reviews.
  4. Full accessibility audit and WCAG 2.1 AA compliance fixes.
  5. Visual regression test suite with Playwright screenshots.
  6. Performance optimization: database query tuning, caching strategy, lazy loading.
  7. Security audit: OWASP Top 10 check, penetration testing basics, input sanitization review.
  8. User documentation and deployment runbook.
  9. Production deployment and monitoring setup.
  10. Organization‑wide launch communication and onboarding.
- **Deliverables**
  - Production‑ready Beacon deployment.
  - Launch communications and onboarding for AppHelix users.

---

## 3. Roles & Responsibilities

- **Product Owner / Sponsor**
  - Owns PRD, priorities, and success metrics.
  - Approves phase scope and sign‑off for releases.
- **Tech Lead / Architect**
  - Owns architecture decisions, quality bar, and technical roadmap.
  - Reviews critical changes and ensures consistency with guidelines.
- **Developers**
  - Implement features, tests, and fixes according to `DeveloperGuidelines.md` and `Workflow.md`.
  - Participate in design discussions and code reviews.
- **QA / Test Engineer (or shared responsibility)**
  - Designs and maintains automated and manual test plans.
  - Validates feature completeness per phase.
- **Ops / DevOps**
  - Owns CI/CD, environments, monitoring, and backup strategies.

---

## 4. Risk Management (High-Level)

- **Low adoption / stale data**
  - Mitigate via leadership sponsorship, onboarding, and gamification incentives.
  - Add reminders for stale engagement profiles and unresolved Signals.
- **AI hallucinations or inaccuracies**
  - Enforce strict RAG with source citations and safe “I don’t know” fallback.
  - Regularly review AI responses and adjust prompts and retrieval.
- **Security & PII issues**
  - Apply encryption at rest/in transit, RBAC, audit logging.
  - Periodic reviews of PII fields and access patterns.
- **Scope creep**
  - Keep strict phase boundaries; defer nice‑to‑have items to later cycles.

---

## 5. Artifacts & Traceability

- **PRD**: source of truth for requirements and goals.
- **Features.md**: concise feature catalog; updated as scope evolves.
- **Wireframes.md**: structural UI blueprint; used for design and implementation.
- **DeveloperGuidelines.md** and **Workflow.md**: implementation and delivery practices.
- **ProjectPlan.md** (this document): roadmap and phase-level planning.

These documents should be kept in sync and revised as the project and organization’s needs evolve.

