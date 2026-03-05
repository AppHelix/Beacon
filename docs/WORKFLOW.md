## Beacon – End User Workflow

This document describes how different users (personas) use the Beacon Engagement Discovery Portal day to day.

---

## AI Policy Reference

AI execution governance is maintained in `docs/AI-GUIDELINE.md` as the single source of truth.

---

## 1. Personas Overview

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

