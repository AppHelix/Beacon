## Beacon – Phase Progress Checklist

Use this document to track implementation progress across phases. Mark items as complete with `[x]` once they are delivered and usable.

---

### Phase 1: Foundation (Weeks 1–3)

- [ ] Project scaffolding: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui, ESLint, Prettier.
- [ ] PostgreSQL + Drizzle ORM setup with core schema (users, engagements, `tech_tags`).
- [ ] Azure AD SSO via NextAuth.js with working login/logout and session management.
- [ ] Engagement CRUD: create, read, update engagement profiles with all required fields.
- [ ] Engagement Catalog page with card grid, basic search (pg_trgm), and status filtering.
- [ ] Engagement Detail page with tabbed layout (Overview, Team placeholder, Signals placeholder, Activity).
- [ ] Responsive layout skeleton for all major pages (Home, Engagements, Signals, People, Admin).
- [ ] Unit and integration test setup with Vitest.
- [ ] Playwright setup with first E2E test (Azure AD login + basic catalog view).
- [ ] CI/CD pipeline with GitHub Actions: lint, test, build.

---

### Phase 2: Collaboration Engine (Weeks 4–6)

- [ ] Signal (help request) CRUD with all fields from the PRD.
- [ ] Signal Board page with filters, sort, and Kanban view grouped by status.
- [ ] Signal Detail page with full description and response thread.
- [ ] Hand‑raise and suggestion response mechanisms wired to notifications.
- [ ] Signal lifecycle: Open → In Progress → Resolved → Closed with resolution summary.
- [ ] People Directory with search and skill-based filtering.
- [ ] Team membership management on engagement profiles (roles, allocation %, join/leave dates).
- [ ] In‑app notification system for Signal responses and hand‑raises.
- [ ] RBAC implementation: Admin, Curator, Member, Viewer roles enforced in UI and API.
- [ ] Expanded E2E tests covering full Signal lifecycle and People Directory flows.

---

### Phase 3: Intelligence & Recognition (Weeks 7–9)

- [ ] pgvector setup and embedding pipeline for engagement profiles and Signals.
- [ ] Beacon AI chatbot with RAG: natural language queries, source citations, and session history.
- [ ] Chatbot UI: slide‑out panel or full-page interface with conversation history and sources.
- [ ] Advanced search with faceted filtering, synonym support, and typeahead suggestions.
- [ ] Contribution tracking system: log all collaborative actions (Signals, suggestions, hand‑raises, profile updates).
- [ ] Leaderboard page with monthly/quarterly views and contribution breakdown.
- [ ] Badge system (Beacon Stars) with milestone-based awards.
- [ ] Featured Project Spotlight section on the homepage.
- [ ] Chatbot E2E tests and contribution tracking tests.

---

### Phase 4: Polish & Launch (Weeks 10–12)

- [ ] Daily email digest (Beacon Pulse) with personalized content compilation and sending.
- [ ] Admin analytics dashboard with technology heatmap, collaboration metrics, and user activity.
- [ ] Exportable contribution reports (e.g., PDF) for performance reviews.
- [ ] Full accessibility audit and WCAG 2.1 AA fixes on key flows (Home, Engagement Detail, Signal Board, AI chat).
- [ ] Visual regression test suite with Playwright screenshots for critical journeys.
- [ ] Performance optimization: DB query tuning, caching strategy, and lazy loading where appropriate.
- [ ] Security audit: OWASP Top 10 review, penetration testing basics, input sanitization review.
- [ ] User documentation and deployment runbook completed.
- [ ] Production deployment and monitoring setup (alerts, dashboards).
- [ ] Organization‑wide launch communication and onboarding materials.

