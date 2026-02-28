## Beacon – MVC & Architecture Overview

Beacon is built on Next.js, which doesn’t use a strict classic MVC framework, but the concepts still apply.
This document maps Beacon’s architecture to MVC-style responsibilities.

---

## 1. Conceptual MVC Mapping

- **Model**
  - Data models and persistence (PostgreSQL + pgvector via Drizzle ORM).
  - Business rules and invariants around engagements, Signals, users, contributions, and notifications.
- **View**
  - React components and pages (Next.js App Router).
  - UI for engagement catalog, detail pages, Signal Board, Beacon AI chat, leaderboards, admin screens, etc.
- **Controller**
  - Next.js Route Handlers / API routes (and/or tRPC routers).
  - Server actions and services orchestrating requests between views, models, and external systems (Azure AD, AI provider, email).

---

## 2. Model Layer

- **Technologies**
  - PostgreSQL 16+ with `pgvector` for embeddings.
  - Drizzle ORM for schema, migrations, and type-safe queries.
- **Core Entities**
  - `User`: identity, skills, department, titles, contribution stats.
  - `Engagement`: core profile data (client, status, tech stack, challenges, help needed).
  - `Signal`: help requests, lifecycle state, urgency, time commitment.
  - `SignalResponse`: hand-raises and suggestions.
  - `Contribution`: denormalized record of collaborative actions.
  - `Notification`: in-app notifications and email digest references.
  - `Embedding` tables for engagements and Signals (RAG context).
- **Responsibilities**
  - Enforce relational integrity and constraints.
  - Encapsulate queries for common operations (search, filters, leaderboard aggregation).
  - Provide a clear boundary between application logic and raw SQL.

---

## 3. View Layer

- **Technologies**
  - Next.js 14+ App Router with React 18 server and client components.
  - Tailwind CSS + shadcn/ui for styling and components.
- **Key View Modules**
  - **Home/Dashboard**: Spotlight, stats, recent Signals, user activity, AI entry point.
  - **Engagement Catalog & Detail**: list/grid, filters, and detail tabs (Overview, Team, Signals, Activity).
  - **Signal Board & Detail**: list/Kanban, Signal creation, responses, and resolution views.
  - **Beacon AI Chat**: conversational interface with citations and source details.
  - **People Directory & Profile**: skill-based search and contribution history.
  - **Leaderboard & Stars**: rankings, badges, and highlights.
  - **Admin Panel**: user roles, taxonomy management, analytics, and spotlight configuration.
- **Responsibilities**
  - Render data passed from controllers in a user-friendly way.
  - Handle local UI state, interactions, and validations.
  - Trigger server actions / API calls but avoid direct DB or external-service access.

---

## 4. Controller Layer

- **Technologies**
  - Next.js Route Handlers (REST-style endpoints) or tRPC routers for strongly typed APIs.
  - Server actions for simple mutations tightly coupled to specific pages.
- **Responsibilities**
  - Accept HTTP (or RPC) requests from the UI or integrations.
  - Validate input, enforce RBAC and security checks.
  - Call Model-layer operations (DB queries) and external services (AI, email, Azure AD).
  - Shape responses for consumption by the View layer.
- **Examples**
  - `POST /api/engagements`: validate payload, create engagement, log audit entry.
  - `GET /api/signals`: apply filters, fetch Signals and metadata, return paginated list.
  - `POST /api/chat`: run RAG pipeline, retrieve embeddings, call AI provider, return structured answer with citations.

---

## 5. Cross-Cutting Concerns

- **Authentication & Authorization**
  - NextAuth.js handles sessions and Azure AD sign-in.
  - Middleware protects routes by role (Admin, Curator, Member, Viewer).
- **Logging & Monitoring**
  - Centralized logging for API calls, DB errors, AI errors, and background jobs.
  - Health endpoints and performance metrics for key flows.
- **Background Jobs**
  - Worker processes (e.g., using BullMQ or cron) for daily digests (Beacon Pulse), analytics aggregation, and cleanup tasks.
- **AI Integration**
  - Dedicated service module for embedding generation, storage, retrieval, and LLM calls.
  - Ensures RAG constraints and PII protections are respected.

---

## 6. Directory Structure (Example)

An example structure that reflects the MVC separation:

- `app/`
  - Route segments (Views + Controllers entry points)
  - `app/(dashboard)/`, `app/engagements/`, `app/signals/`, `app/api/…`
- `db/`
  - Drizzle schema and migrations (Models)
- `features/`
  - Feature-centric modules combining Views, hooks, and controller glue.
- `lib/`
  - Shared utilities (auth, validation, logging, AI helpers).
- `workers/`
  - Background job definitions and schedulers.


