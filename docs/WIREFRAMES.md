## Beacon – Wireframes

This document describes text-based wireframes for the Beacon Engagement Discovery Portal, aligned with the PRD. Each section focuses on layout and key UI elements rather than visual styling.

---

## 1. Global Layout & Navigation
- **Header (persistent on all authenticated pages):**
  - Left: Beacon logo + product name `Beacon`
  - Center (desktop): Global search bar (placeholder: “Search engagements, people, Signals…”)
  - Right: Icons/links – Notifications bell (unread count), Help, User avatar (profile dropdown)
- **Primary Nav (below header on desktop, hamburger on mobile):**
  - `Home`, `Engagements`, `Signals`, `People`, `Leaderboard`, `Admin` (visible only for Admins)
- **Footer (all pages):**
  - Left: “AppHelix Technologies – Internal”
  - Right: Links: `Privacy`, `Security`, `Support`

---

## 2. Home / Dashboard (Beacon Board + Spotlight + Pulse)
- **Top section – Spotlight & Stats:**
  - Left: **Beacon Spotlight card**
    - Engagement name, client, short summary
    - Tech tags, status pill (Active/Ramping/Completed)
    - CTA button: “View Engagement”
  - Right: **Key metrics cards (4 cards)**
    - Total engagements
    - Open Signals
    - Active contributors (this month)
    - Your open Signals
- **Middle section – Activity & Signals:**
  - Left: **Recent Signals feed**
    - List of cards with: title, engagement name, urgency badge, required skills tags, time commitment, responses count
    - CTA: “View Signal”
  - Right: **Your Activity**
    - List of recent contributions (Signals you created, responses, badges earned)
- **Bottom section – Quick access:**
  - Buttons: “Create Engagement” (for Curators/Admins), “Post a Signal”, “Open Beacon AI Chat”
  - Small panel: “Beacon Pulse” preview – snapshot of today’s digest (new Signals, featured engagement, leaderboard snippet)

---

## 3. Engagement Catalog (Beacon Board)
- **Header:**
  - Title: “Engagements”
  - Right: Button `+ New Engagement` (visible to Curators/Admins only)
- **Search & Filters row:**
  - Full-width search input (placeholder: “Search by name, client, technology, domain…”)
  - Filter chips or dropdowns:
    - Status (Active, Ramping Up, Winding Down, On Hold, Completed)
    - Technology stack (multi-select)
    - Domain / Industry
    - Help-needed status (Has open Signals / None)
- **Main content – Engagement cards grid:**
  - Each card shows:
    - Engagement name, client name
    - Status badge, domain tags
    - Technology tags (first 3–5, with “+N more”)
    - Team size, delivery lead avatar/name
    - Help-needed indicator (e.g., “2 open Signals”)
  - Cards are clickable to Engagement Detail.
- **Pagination / infinite scroll:**
  - Simple pagination controls at bottom (page number, next/prev).

---

## 4. Engagement Detail Page
- **Top bar:**
  - Breadcrumb: `Home > Engagements > [Engagement Name]`
  - Right: Buttons (based on role):
    - `Edit Engagement` (Curator/Admin)
    - `Follow`/`Unfollow` (for updates and digests)
- **Header section:**
  - Left:
    - Engagement name, client name
    - Status pill, domain tags
    - Delivery lead name/avatar, contact button (Teams/email)
  - Right:
    - Metrics summary: Team size, number of Signals, last updated date
- **Tabbed content (3–4 tabs):**
  - **Overview (default):**
    - Description (rich text)
    - Technology stack tags (full list)
    - Key Achievements list
    - Current Challenges list
    - Links: Repository links, Documentation links, Architecture diagram thumbnail (opens modal)
  - **Team:**
    - Table / grid of team members: avatar, name, role, allocation %, primary skills, contact button
  - **Signals:**
    - List of Signals scoped to this engagement
    - Button: `Post a Signal` (pre-fills engagement)
  - **Activity Log:**
    - Timeline of recent updates (profile edits, Signals, status changes)

---

## 5. Signal Board (Beacon Signals)
- **Header:**
  - Title: “Beacon Signals”
  - Right: `+ Post a Signal` button
- **View toggle:**
  - Tabs or toggle between `List` and `Kanban` views.
- **Filter & search bar:**
  - Text search (title/description)
  - Filters:
    - Engagement
    - Required skills/technologies
    - Urgency (Critical/High/Medium/Low)
    - Time commitment
    - Status (Open, In Progress, Resolved, Closed)
- **List view:**
  - Vertical list of Signal cards:
    - Title, engagement, status badge, urgency badge
    - Required skills tags
    - Time commitment pill
    - Created by, created date, response count
- **Kanban view:**
  - 4 columns: Open, In Progress, Resolved, Closed
  - Each card shows: title, engagement name, urgency, required skills chips, assignee (if any)

---

## 6. Signal Detail Page
- **Top section:**
  - Title of Signal
  - Engagement badge (clickable)
  - Status dropdown (for owner: Open/In Progress/Resolved/Closed)
  - Urgency badge, time commitment badge
  - “Post a similar Signal” secondary action (duplicates structure)
- **Main content (two-column desktop, stacked on mobile):**
  - Left: **Problem details**
    - Rich-text description (what’s needed, what’s been tried)
    - Required skills tags
    - Metadata: created by, created date, last updated
  - Right: **Actions & metadata**
    - Primary CTA button: `Raise Hand` (if not yet raised)
    - Secondary CTA: `Add Suggestion`
    - List of current hand-raises (names, avatars, availability note)
- **Discussion thread:**
  - Responses list (suggestions and status updates)
  - Each entry shows: responder avatar, name, type (Suggestion / Hand Raise accepted), timestamp, content
  - When Resolved: resolution summary block pinned at top of thread.

---

## 7. Beacon AI Chat Interface
- **Entry points:**
  - Global “Ask Beacon AI” button in header
  - Prominent button on Home and Engagement Catalog
- **Layout (slide-out on desktop, full-screen on mobile):**
  - Left/top: Conversation history area:
    - Chat bubbles for user and assistant
    - Each assistant response includes inline citations (e.g., numbered links) referencing engagements/Signals.
  - Bottom: Input bar
    - Textarea with placeholder (e.g., “Ask about engagements, skills, or Signals…”)
    - Send button, shortcut hints (Enter to send)
  - Right (desktop) or collapsible panel (mobile):
    - “Sources” list for the last response:
      - Cards with engagement name, type (Engagement/Signal), brief snippet, “Open” link.
    - Suggested follow‑up questions chips.

---

## 8. People Directory
- **Header:**
  - Title: “People”
- **Search & filters:**
  - Search by name, email, skill, technology
  - Filters: Department, role, current engagement, availability (if tracked)
- **Main content – People grid/list:**
  - Each card shows:
    - Avatar, name, title
    - Primary skills tags
    - Current engagement(s)
    - Contribution score / badge summary
    - Contact buttons (Email, Teams)

---

## 9. Leaderboard (Beacon Stars)
- **Header:**
  - Title: “Leaderboard”
  - Time range selector: This month / Last month / Quarter / Custom
- **Tabs:**
  - `All Contributors`, `By Team`, `By Category`
- **Main content:**
  - Ranked table:
    - Rank, user avatar/name, team/department
    - Contribution score
    - Breakdown: Signals Resolved, Suggestions, Hand Raises, Profiles Updated
  - Right sidebar (desktop):
    - Featured badges (e.g., “Most Helpful Team Member”)
    - Highlights: “Team of the Month” card.

---

## 10. User Profile
- **Header:**
  - Large avatar, name, title, department
  - Buttons: `Edit Profile`, `Notification Settings`
- **Sections (stacked):**
  - **Overview:**
    - Current engagements and roles
    - Primary skills and technologies
  - **Contributions:**
    - Contribution score, badges earned
    - Recent Signals resolved, suggestions, hand‑raises
  - **Settings:**
    - Notification preferences (email vs in‑app, categories)
    - Option to manage followed engagements

---

## 11. Admin Panel
- **Navigation (left sidebar inside Admin):**
  - `Users`, `Taxonomies`, `Analytics`, `Featured Projects`, `System Settings`
- **Example screens:**
  - **Users:** table with filters, role dropdowns, activation toggles
  - **Taxonomies:** list of technology tags with add/edit/remove actions
  - **Analytics:** charts for technology heatmaps, collaboration metrics, usage stats
  - **Featured Projects:** list of candidate engagements with “Set as Spotlight” action

---

## 12. Authentication (Azure AD SSO)
- **Login screen:**
  - Centered card with Beacon logo and short tagline
  - Single primary button: “Sign in with Microsoft” (Azure AD)
  - Small text: “Internal use only – AppHelix employees”

---

## General UI/UX Notes
- **Responsiveness:** All layouts adapt to desktop (1440px+), tablet (768–1439px), and mobile (320–767px). Use a responsive grid system; navigation collapses to a hamburger menu on smaller screens.
- **Touch targets:** All interactive elements (buttons, icons, cards, filters) should have a minimum 44px tap area on touch devices.
- **Visual design:** Clean, modern aesthetic with generous whitespace and clear visual hierarchy on every page (lists show summaries; detail pages show full information).
- **Status & priority indicators:** Consistent color coding for engagement status, Signal urgency, and time commitment (e.g., green = active, yellow = ramping, red = critical, gray = completed).
- **Accessibility:** WCAG 2.1 AA compliant with sufficient contrast, keyboard navigation, focus states, and ARIA labels for critical components.
- **Performance hints:** Use skeleton loaders and optimistic UI where appropriate (e.g., Engagement Detail, Signal Detail, AI chat) to improve perceived speed.

*These are textual wireframes. Visual designs can be created in tools like Figma using this as the structural blueprint.*
