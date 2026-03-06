## Beacon – End User Workflow

This document is the **mandatory UX workflow contract** for Beacon.
It defines exactly how navigation, page layout, user guidance, and interaction patterns must work so end users can operate the platform without support dependency.

---

## AI Policy Reference

AI execution governance is maintained in `docs/AI-GUIDELINE.md` as the single source of truth.

---

## 1. Workflow Goals (Non-Negotiable)

- A first-time user must understand the product purpose within 10 seconds of landing on Home.
- A user must reach any core area (Engagements, Signals, People, Admin) in one click from primary navigation.
- Every page must answer: **Where am I? What can I do here? What should I do next?**
- Critical actions must be obvious and consistent across pages.
- Empty states must guide users to the next meaningful action.
- Navigation and interaction behavior must be predictable and repeatable.

---

## 2. Information Architecture

Primary sections:
1. Home
2. Engagements
3. Signals
4. People
5. Admin

Global utility actions:
- Search
- Notifications
- Help/Guided Tour
- Profile menu (account, preferences, sign out)

Rules:
- No hidden core navigation behind nested menus.
- Primary nav labels must stay stable (no frequent renaming).
- Back navigation must always return to the previous logical parent page.

---

## 3. Global Navigation Contract

Header must include:
- Product identity (`Beacon`)
- Primary nav tabs (Home, Engagements, Signals, People, Admin)
- User context (signed-in user)
- Sign-out action

Left-side rail (optional on desktop, collapsed on smaller screens):
- Shortcuts to recent engagements/signals
- Saved filters
- Quick create actions

Navigation behavior:
- Active page must be visually highlighted.
- Hover and focus states must be clear and accessible.
- Keyboard navigation must support tab order and visible focus ring.
- Route transitions must preserve context where possible (filters, search terms).

---

## 4. Page Layout Contract (Every Core Page)

Each page must follow this structure in order:
1. **Page header**: Title + one-line purpose text
2. **Primary actions row**: Most important action first (e.g., Create, Post Signal)
3. **Filters/search row**: concise and task-relevant
4. **Main content region**: cards/table/list/kanban
5. **Context help**: empty state guidance or inline help

Rules:
- Do not place critical actions below the fold by default.
- Keep max 1 primary CTA per region.
- Avoid mixed visual hierarchy where secondary buttons look primary.
- Use consistent spacing scale and card alignment across pages.

---

## 5. Visual and Interaction Standards

Professional UI baseline:
- Consistent color system for background, surface, text, borders, status, and action states.
- Clear typography hierarchy: page title, section title, body, helper text.
- Card grid alignment must be consistent in height, spacing, and action placement.
- Status badges must be semantic and consistent (`Open`, `In Progress`, `Resolved`, `Closed`).

Interaction quality:
- Every click target must have clear feedback (hover, active, disabled, loading).
- Long-running actions must show loading states.
- Error states must be actionable, not generic.
- Success states must confirm outcome and suggest next action.

---

## 6. First-Time User Guidance (Layman Friendly)

Beacon must provide onboarding without requiring support staff.

Required guidance:
- Home page “What is Beacon?” section in plain language.
- “Start here” quick actions for new users.
- Optional guided walkthrough for first login:
   1. What each main section does
   2. How to find work/help requests
   3. How to contribute or ask for help
   4. Where to track personal activity
- Inline helper text on forms for non-obvious fields.
- Empty states must include direct CTA (not dead-end messages).

---

## 7. Persona-Based Core Journeys

### 7.1 Explorer (Find where to help)
- Home → Signals or Engagements
- Apply search/filter
- Open detail
- Raise hand / add suggestion
- Track contribution status

### 7.2 Seeker (Ask for help)
- Engagement detail or Signals board
- Post Signal with required context
- Track responses
- Move lifecycle state
- Add resolution summary

### 7.3 Curator (Maintain engagement health)
- Open engagement profile
- Update metadata/team/challenges
- Verify linked signals
- Keep status/freshness updated

### 7.4 Newcomer (Onboard quickly)
- Home guidance
- Browse Engagements + People
- Save/follow relevant areas
- Ask Beacon AI for discovery questions

### 7.5 Strategist/Admin (Operate and govern)
- Review dashboard KPIs
- Manage access and taxonomy
- Monitor audit/security/usage signals

---

## 8. Page-Specific UX Rules

## Home
- Must communicate product value and top actions immediately.
- Must surface recent activity and key shortcuts.

## Engagements
- Must support quick scan (name, client, status, key tags).
- Must provide clear path to details and linked signals.

## Engagement Detail
- Tabs must be clear and purpose-based (Overview, Signals, Details).
- Signals area must support quick triage and action.

## Signals
- Must support list + lifecycle visibility.
- Filters must prioritize urgency/status/skills.
- Empty state must encourage creating a signal.

## People
- Must support find-by-name, role, and skill.
- User cards must expose enough context to initiate collaboration.

## Admin
- Must separate governance actions from analytics.
- Risky actions must include confirmation and audit trail cues.

---

## 9. Content and Copy Standards

- Use plain language; avoid internal jargon where possible.
- Button labels must be action-oriented (`Create Signal`, `View Details`, `Assign Role`).
- Helper text must explain why information is needed.
- Error messages must state what failed and what the user should do next.

---

## 10. Accessibility and Usability Baseline

- Color contrast must satisfy WCAG 2.1 AA.
- Keyboard-only navigation must be fully usable for core journeys.
- Focus states must always be visible.
- Forms must include labels, validation feedback, and accessible errors.
- Layout must remain usable on standard laptop and mobile widths.

---

## 11. Definition of Workflow Done

A page or journey is workflow-complete only when all are true:

- Navigation path is unambiguous.
- Primary action is obvious.
- Empty, loading, success, and error states are implemented.
- New user can complete the journey without external guidance.
- Copy is clear for non-technical users.
- Accessibility baseline is met.

---

## 12. UX Review Checklist (Mandatory Before Marking Complete)

- [ ] Is the page purpose obvious in one glance?
- [ ] Can user identify next action in under 5 seconds?
- [ ] Are controls aligned and visually consistent?
- [ ] Are status colors and labels consistent across pages?
- [ ] Are empty states actionable?
- [ ] Is guided onboarding/support text present where needed?
- [ ] Can a first-time user complete the intended journey unaided?

---

## 13. Governance

- Any implementation that violates this workflow contract must be treated as incomplete.
- UI implementation must follow this document alongside `FEATURES.md` and `WIREFRAMES.md`.
- If design intent is unclear, prefer the simplest and clearest user path.

- **Explorer** (engineer on bench/partial allocation): wants to discover relevant engagements and volunteer to help.
- **Seeker** (team lead/engineer facing a blocker): wants to post a help request and find someone with the right expertise.
- **Curator** (project manager/delivery lead): owns an engagement profile and keeps it accurate and visible.
- **Strategist** (engineering manager/VP): needs visibility into technology footprint, collaboration, and staffing.
- **Newcomer** (new hire or newly moved employee): wants to quickly understand the engagement landscape and where to plug in.
- **Contributor** (any employee with expertise): wants to respond to Signals and share solutions without formally joining a project.

Each workflow below is written from the perspective of these personas.

---

## 2. Explorer Flow – Find Engagements to Help

1. **Sign in**
   - Open Beacon and sign in via **“Sign in with Microsoft”** (Azure AD SSO).
2. **Scan the Home / Dashboard**
   - Review the **Beacon Spotlight** (featured engagement) and **quick stats** (total engagements, open Signals, active contributors).
   - Glance at the **Recent Signals** feed to see who needs help.
3. **Search & filter for matches**
   - Use the **global search bar** to search by skills/technologies (e.g., “Playwright”, “Azure DevOps”).
   - Apply filters on the **Engagement Catalog** (technology stack, domain, status, help-needed) to narrow down relevant work.
4. **Drill into an engagement**
   - Open an **Engagement Detail** page to read the Overview, see the Team, and review Current Challenges and Help Needed.
5. **Offer help**
   - From the engagement’s **Signals tab** or the **Signal Board**, open a relevant Signal and click **“Raise Hand”**.
   - Optionally, add a **Suggestion** with advice or links if you don’t have time to fully engage.
6. **Track your activity**
   - View your **User Profile** to see contributions, badges (Beacon Stars), and open/closed Signals you’ve participated in.

---

## 3. Seeker Flow – Request Help via Signals

1. **Locate your engagement**
   - From Home, click your engagement card or find it via the **Engagement Catalog**.
2. **Create a Signal (help request)**
   - From the engagement’s **Signals** tab or the **Signal Board**, click **“Post a Signal”**.
   - Fill in:
     - **Title** (clear headline describing the need).
     - **Description** (what you’re trying to do, what you’ve tried, what kind of help you need).
     - **Related Engagement** (pre-filled if starting from the engagement).
     - **Required Skills** (tags like “Playwright”, “Azure DevOps”, “OAuth”).
     - **Urgency** (Critical/High/Medium/Low) and **Time Commitment** (Quick Question, Short Task, Sprint Help, Extended Support).
3. **Monitor responses**
   - Watch the **Signal Detail** page for **hand‑raises** and **suggestions**.
   - Accept a hand‑raise to move the Signal to **In Progress**.
4. **Close the loop**
   - Once the issue is resolved, update the **Status** to **Resolved** and add a **resolution summary** so others can find and reuse it later.

---

## 4. Curator Flow – Maintain Engagement Profiles

1. **Create or update an engagement profile**
   - From the **Engagement Catalog**, click **“+ New Engagement”** or open an existing one and click **“Edit Engagement”**.
   - Fill in or update required fields: engagement name, client name, status, dates, description, technology stack, domain, team size, delivery lead, team members, links, architecture diagram, key achievements, challenges, and help needed.
2. **Manage team membership**
   - On the **Team** tab, add or remove members, update roles and allocation percentages.
3. **Highlight help needed and wins**
   - Keep **Current Challenges** and **Help Needed** up to date so Explorers and Contributors can find where to help.
   - Update **Key Achievements** to make Spotlight nominations more compelling.
4. **Monitor Signals related to your engagement**
   - Use the engagement’s **Signals** tab to track open requests, hand‑raises, and resolutions.
5. **Keep data fresh**
   - Periodically review profile data (or respond to automated reminders) to ensure status, team, and stack are accurate.

---

## 5. Newcomer Flow – Onboard and Explore

1. **First login**
   - Sign in with Azure AD and land on the **Home / Dashboard**.
2. **Understand the landscape**
   - Use **Engagement Catalog** filters (domain, technology, status) to see what kinds of work are happening across AppHelix.
   - Browse **Beacon Spotlight** and featured engagements to see strategic projects.
3. **Find where to plug in**
   - Look at **People Directory** to find colleagues by skills or tech you’re interested in.
   - Use **Beacon AI** to ask questions like “Which teams are using Playwright?” or “What projects are in EdTech?”
4. **Follow interesting engagements**
   - Open Engagement Detail pages and click **“Follow”** to receive updates and see them in your Beacon Pulse digest.

---

## 6. Contributor Flow – Respond and Build Reputation

1. **Discover who needs help**
   - From Home, scan the **Recent Signals** feed.
   - Use the **Signal Board** with filters (skills, urgency, time commitment) to find help requests that match your expertise and availability.
2. **Respond to Signals**
   - Open a Signal and choose to:
     - **Raise Hand** if you can actively help, or
     - Add a **Suggestion** with concrete steps, links, or code snippets.
3. **Collaborate and close**
   - Coordinate with the requester via the Signal discussion thread or direct contact.
   - Help ensure the Signal is marked **Resolved** with a clear summary so others can reuse the solution.
4. **Track recognition**
   - View your **Leaderboards** and **User Profile** to see contributions, badges, and your Beacon Stars score.

---

## 7. Strategist / Leadership Flow – Insight & Decisions

1. **Get a bird’s‑eye view**
   - Use the **Home / Dashboard** and **Admin analytics dashboards** to see:
     - Technology heatmaps.
     - Engagement distribution and status.
     - Collaboration and Signal activity across teams.
2. **Monitor collaboration health**
   - Review **Leaderboards** and contribution reports for individuals and teams.
   - Look at **cross‑team contributions** and Signals resolved to identify high-impact collaborators.
3. **Guide staffing and skills**
   - Use **Beacon AI** and search to see which technologies are most common and where skill gaps exist.
   - Use insights from Beacon to inform staffing decisions, training, and hiring.

---

## 8. Admin Flow – Configure, Govern, and Spotlight

1. **Manage users and roles**
   - In the **Admin Panel**, assign roles (Admin, Curator, Member, Viewer) and manage access for employees and contractors.
2. **Maintain taxonomies**
   - Keep **technology tags**, domains, and other controlled vocabularies up to date so search and AI work well.
3. **Monitor system health and security**
   - Review analytics dashboards, error logs, and usage patterns to ensure Beacon is reliable and secure.
4. **Feature key engagements**
   - Use **Beacon Spotlight** tools in Admin to select or approve featured projects for the homepage.
5. **Oversee Pulse and digests**
   - Configure Beacon Pulse behavior and review digest content patterns to ensure relevance.

---

## 9. Beacon AI Workflow – Asking Questions Safely

1. **Start a conversation**
   - Click **“Ask Beacon AI”** from the header or Home.
2. **Ask a question**
   - Use natural language to ask about engagements, technologies, or Signals (e.g., “Who is dealing with OAuth token refresh issues?”).
3. **Review cited answers**
   - Read the response and inspect **citations** pointing to specific engagements or Signals.
4. **Refine and follow up**
   - Ask follow-up questions within the same chat to refine results.
5. **Escalate to human collaboration**
   - Use linked engagements or Signals to contact teams, raise a new Signal, or volunteer help as needed.

