## Beacon – Feature Overview

This document summarizes the core product features for the Beacon Engagement Discovery Portal, based on the Product Requirements Document.

---

## 1. Engagement Catalog (Beacon Board)

- **Engagement Profiles**
  - Rich, structured profile for every active customer engagement.
  - Key fields: engagement name, client name, status, dates, description, technology stack, domain/industry, team size, delivery lead, team members, repository links, documentation links, architecture diagram, key achievements, current challenges, help needed.
  - Profiles support draft and published states, with full edit history (audit log).
- **Engagement Catalog View**
  - Card/grid view of all engagements with search and filters.
  - Visual indicators: status badges, tech tags, domain tags, help-needed indicator, team size.
  - Sorting options (e.g., most recently updated, alphabetical, most active).
- **Engagement Detail View**
  - Tabbed layout for Overview, Team, Signals, and Activity Log.
  - Quick access to code repositories, documentation, and architecture diagram.
  - Follow/unfollow engagement for personalized digests and notifications.

---

## 2. Intelligent Search & Discovery

- **Global Search**
  - Search across engagements, Signals, team members, and other core entities.
  - Full-text search on descriptions, challenges, help requests, and names.
  - Fuzzy matching, synonyms (e.g., “JS” ↔ “JavaScript”), partial matches.
  - Typeahead suggestions and highlighted matches in results.
- **Faceted Filtering**
  - Filters by: technology stack, domain/industry, engagement status, team size, client name, help-needed status, and more.
  - Combinable filters (AND logic) with facet counts.
  - Saved filter presets for frequently used combinations (e.g., “Active Azure projects needing help”).
- **Browse & Explore**
  - Technology tag cloud to visualize technology distribution across engagements.
  - Client directory with engagement counts.
  - People directory with skill matrices and cross-engagement visibility.
  - Organization-wide technology heatmap for leadership and strategy.

---

## 3. Gen AI Chatbot (Beacon AI)

- **Natural Language Querying**
  - Users ask questions in plain language (e.g., “Who is using Playwright and can help?”).
  - Supports queries like skill-based discovery, technology exploration, problem matching, availability matching, engagement summarization, and trend analysis.
- **RAG-Based Answers**
  - Uses Retrieval-Augmented Generation over engagement data, Signals, and solutions.
  - Data stored in PostgreSQL with pgvector for semantic search.
  - Responses grounded in real data with explicit citations linking to source records.
  - Maintains conversation context within a session for follow-up questions.
  - Explicit “I don’t know” behavior when no relevant data is available; avoids hallucinations.
- **UI Features**
  - Chat interface with conversation history and suggested follow-up questions.
  - Side panel or inline section for source cards (engagements, Signals) referenced in each answer.

---

## 4. Help Request System (Beacon Signals)

- **Creating Signals (Help Requests)**
  - Structured help requests tied to a specific engagement.
  - Fields: title, detailed description, related engagement, required skills/technologies, urgency, time commitment, status.
  - Clear framing of the problem, what’s been tried, and needed assistance.
- **Signal Lifecycle**
  - Status workflow: Open → In Progress → Resolved → Closed.
  - Requesters can accept hand-raises to move a Signal to In Progress.
  - Resolution summary captured when marking as Resolved.
- **Responding & Collaboration**
  - “Raise Hand” to volunteer help, visible to requester and optionally to managers.
  - Post “Suggestions” with guidance, links, and references to similar solved problems.
  - Responses and resolution summaries become part of the searchable knowledge base.
- **Signal Board**
  - Central board showing Signals across all engagements.
  - List and Kanban views with filters by engagement, tech, urgency, status, and time commitment.

---

## 5. Recognition & Gamification (Beacon Stars)

- **Contribution Tracking**
  - Tracks collaborative actions: hand-raises, suggestions, Signals resolved, engagement profiles created/updated.
  - Contribution history visible on each user’s profile.
- **Leaderboards & Awards**
  - Monthly and quarterly leaderboards highlighting top contributors.
  - Awards such as “Most Helpful Team Member” and “Team of the Month”.
  - Category-based rankings (e.g., Signals Resolved, Suggestions Given).
- **Badges & Milestones**
  - Badges for key milestones (e.g., first Signal resolved, 10 suggestions, cross-domain helper).
  - Badges and contribution scores surfaced in profiles and leaderboards.
- **Reporting**
  - Individual contribution reports exportable for performance reviews.
  - Team collaboration reports and organization-wide collaboration health metrics.

---

## 6. Notifications & Digests (Beacon Pulse)

- **Daily Email Digest**
  - Personalized “Beacon Pulse” email for each active user.
  - Sections: new Signals matching user skills/interests, recently resolved Signals and solutions, new engagements, featured project spotlight, leaderboard snippet, user’s own activity summary.
- **In-App Notifications**
  - Notification center with unread count.
  - Real-time alerts for: responses to a user’s Signals, hand-raises, mentions, and updates to followed engagements.
- **Notification Preferences**
  - Per-category configuration (email, in-app, both, or muted).
  - Users can tailor noise level to their role and collaboration style.

---

## 7. People & Teams

- **People Directory**
  - Searchable list of all users with skill tags, titles, departments, and current engagements.
  - Filters by skill, technology, department, and engagement.
- **User Profiles**
  - Show engagements, roles, primary skills, contribution score, badges, and collaboration history.
  - Direct contact options (email/Teams).
- **Engagement Team Management**
  - Maintain a team roster per engagement with roles and allocation percentages.
  - Track join/leave dates for accurate historical context.

---

## 8. Admin & Configuration

- **Role-Based Access Control (RBAC)**
  - **Roles:** Admin, Engagement Curator, Member, Viewer.
  - **Admin:** Full system management, analytics, taxonomy management, spotlight control, user management, and access to admin dashboard.
  - **Curator:** Manage engagement profiles, add/remove team members, create and manage Signals within their engagements.
  - **Member:** Full collaboration abilities (create Signals, respond to hand-raises, add suggestions, use chatbot, edit profile).
  - **Viewer:** Read-only access for limited-access users (e.g., contractors, stakeholders).
  
  - **Implementation:**
    - Backend API routes enforce role-based permissions (403 Forbidden for unauthorized access).
    - Session logic fetches user role from database and validates on every request.
    - UI restrictions: Admin/Curator-only actions are hidden or disabled for Member/Viewer users.
    - Navigation links (e.g., Admin dashboard) are conditionally rendered based on user role.
    - Comprehensive Playwright tests validate role-based access and negative authorization scenarios.
  
  - **Access Matrix:**
    | Feature | Admin | Curator | Member | Viewer |
    |---------|-------|---------|--------|--------|
    | View Engagements | ✓ | ✓ | ✓ | ✓ |
    | Edit Engagements | ✓ | ✓ | ✗ | ✗ |
    | Manage Team Members | ✓ | ✓ | ✗ | ✗ |
    | Create Signals | ✓ | ✓ | ✓ | ✗ |
    | Respond to Signals | ✓ | ✓ | ✓ | ✗ |
    | Access Admin Dashboard | ✓ | ✓ | ✗ | ✗ |
    | User Management | ✓ | ✗ | ✗ | ✗ |
    | Analytics Dashboard | ✓ | ✗ | ✗ | ✗ |

- **Taxonomy Management**
  - Admin-managed lists for technology tags, domains, and other controlled vocabularies.
  - Ensures consistent tagging for search, analytics, and AI retrieval.
- **Analytics & Dashboards**
  - Leadership dashboards for technology footprint, collaboration patterns, engagement coverage, and Signal metrics.
  - Technology heatmaps, cross-team collaboration views, and adoption indicators.
- **Featured Projects (Beacon Spotlight)**
  - Admins or leadership can nominate and feature engagements on the homepage.
  - Expanded narrative view with achievements and calls to action.

---

## 9. Authentication, Security & Compliance

- **Authentication**
  - Azure AD SSO integration via NextAuth.js/Auth.js.
  - Automatic user provisioning on first login with Azure AD profile sync.
- **Security**
  - Encryption in transit (TLS) and at rest (database-level encryption).
  - OWASP-aligned protections (input sanitization, CSRF, rate limiting, CSP, etc.).
  - Fine-grained DB access roles (least privilege) and audit logs for data mutations.
- **PII & Compliance**
  - Explicit handling of PII (names, emails, avatars, department, allocation data).
  - Data export and deletion workflows to support GDPR/DPDPA-style requirements.
  - Chatbot guardrails to avoid inappropriate PII exposure.

---

## 10. Non-Functional Features

- **Performance & Scalability**
  - Fast page load, search, and chatbot responses under defined SLAs.
  - Support for hundreds of concurrent users and thousands of engagements.
- **Reliability & Monitoring**
  - High availability targets with graceful degradation when AI services are down.
  - Logging, error tracking, health checks, and uptime monitoring.
- **Testing & Quality**
  - Comprehensive test pyramid: unit, integration, E2E, visual regression, and accessibility tests.
  - Critical user journeys covered by automated Playwright tests.

---

This feature list is intended as a living document to guide design, implementation, and prioritization. It should be kept in sync with the PRD and updated as the product evolves.

