# Beacon AI Execution Guideline

## Purpose

This document defines the strict operating protocol for AI-assisted implementation in Beacon.

It ensures work is:
- planned against approved docs,
- executed in small branch-based steps,
- validated through intermittent scans,
- tracked accurately in progress documentation.

---

## Source of Truth and Priority Order

When implementing any task, follow documents in this exact order:

1. `docs/PROJECT-PLAN.md` (phase scope and sequencing)
2. `docs/PROGRESS.md` (current execution state and checklist status)
3. `docs/FEATURES.md` and `docs/WIREFRAMES.md` (functional and UX details)
4. `docs/DEVELOPER-GUIDELINES.md` (engineering standards)
5. `docs/WORKFLOW.md` (delivery process and review behavior)

If two docs conflict, do not assume. Mark a blocker and request clarification before coding.

---

## AI Memorization Directive (Mandatory)

For every implementation task, AI must treat this document as active memory and enforce it continuously.

- AI must re-check this guideline before starting edits, before committing, and before final status updates.
- AI must reject shortcuts that violate this guideline even if they seem faster.
- AI must explicitly report any conflict between request scope and this guideline.

---

## AI-Only Governance Locks

These locks apply to AI behavior (not human maintainers):

- `docs/*` is read-only by default for AI.
- AI may modify docs only when explicit human authorization is provided in the active request.
- `docs/AI-GUIDELINE.md` is immutable for AI after creation unless explicit human override is given.
- `docs/PROGRESS.md` is status-only for AI edits: allowed change is checkbox toggle only (`[ ]` ↔ `[x]`).
- AI must not rewrite `docs/PROGRESS.md` text, headings, ordering, or checklist wording.

---

## Non-Negotiable Rules

- Never mark a checklist item complete unless code, tests, and docs are all aligned.
- Never close multiple checklist items as one bulk action unless each item is independently verified.
- Never combine an entire phase into one commit; commits must map to checklist-item granularity.
- Never skip branch creation for non-trivial work.
- Never move to the next planned item without an intermittent scan.
- Never treat mocked tests alone as implementation proof for server/data logic.
- Never update status docs with optimistic wording (use verified status only).

---

## Mandatory Step-by-Step Execution Flow

## Step 0: Intake and Scope Lock

Before coding:
- Identify active phase and week from `docs/PROGRESS.md`.
- Map requested change to specific checklist item(s).
- Confirm item is in planned scope (or record as out-of-scope).
- Define acceptance criteria in 3 to 7 bullets.

Output required:
- Task ID(s), target phase, and acceptance criteria.

## Step 1: Branch Creation (Required)

Create one branch per focused task.

Branch naming:
- `feature/phase-xx-short-title`
- `fix/phase-xx-short-title`
- `chore/phase-xx-short-title`
- `docs/phase-xx-short-title`

Examples:
- `feature/phase-04-signal-lifecycle`
- `fix/phase-03-engagement-delete`
- `docs/phase-03-progress-reconciliation`

Rules:
- Do not develop directly on `main` or `develop`.
- Keep branch scope small and single-purpose.
- If scope grows, split into additional branches.

## Step 2: Plan Before Edit

Before file changes:
- List exact files expected to change.
- List expected tests to run.
- List docs expected to update.
- Define risks and rollback notes.

No edits should start without this mini-plan.

## Step 3: Implement in Thin Vertical Slices

Implement in small slices where each slice includes:
- code,
- basic validation,
- documentation delta.

Do not perform large unverified bulk edits.

## Step 4: Intermittent Scan Gate (Required)

Run scan checks after each meaningful slice or every 30 to 45 minutes (whichever comes first).

Each intermittent scan must verify:
1. Scope scan: change still matches checklist item intent.
2. Code scan: no broken handlers, missing filters, or dead paths.
3. API scan: routes perform actual targeted operations (not placeholder success responses).
4. Auth/RBAC scan: protected boundaries still enforced.
5. Docs scan: status and implementation notes still accurate.
6. Missing-parts scan: identify partially implemented behavior, TODO gaps, or non-functional CRUD.

Record scan findings in PR notes or working notes.

## Step 5: Verification Gate

Minimum verification before claiming completion:
- Naming/variable checks pass via lint rules.
- Type checking passes with no errors.
- Library/import connection checks pass (no unresolved or extraneous imports).
- Targeted tests pass for touched scope.
- Build compatibility checked when route/model changes occur.
- Manual behavior sanity check for user-facing paths.

Mandatory command for AI before completion claim:
- `npm run quality:check`

If unrelated existing failures appear, log them as pre-existing and continue only if your change is not the cause.

## Step 6: Progress and Docs Update (One-by-One)

For each checklist item:
- Mark complete only after verification evidence exists.
- Add short evidence note (files, tests, outcomes).
- Update in sequence (item-by-item), not as a bulk phase stamp.

Required update pattern:
- From: `[ ]`
- To: `[x]`
- Add: date + proof summary in adjacent notes/changelog.

## Step 7: PR Readiness

Before merge:
- Confirm branch scope remains single-purpose.
- Confirm commit history is checklist-item scoped (one checklist item per commit).
- Confirm all intermittent scan findings are resolved or explicitly deferred.
- Confirm docs and progress files are synchronized.
- Confirm no checklist item is overstated.

---

## Strict Scanning Checklist Template

Use this checklist during intermittent scans:

- [ ] Planned item still in scope and phase-correct.
- [ ] All modified endpoints perform real targeted DB actions.
- [ ] Update/Delete operations use correct identifier constraints.
- [ ] Auth/session checks preserved at API boundaries.
- [ ] Input validation for required fields is present.
- [ ] UI state reflects true backend behavior (no false success states).
- [ ] Tests validate implementation logic, not only mocked fetch success.
- [ ] `docs/PROGRESS.md` reflects current verified state.
- [ ] Any partial implementation explicitly labeled as partial.

---

## Completion Evidence Standard

A task is complete only if all are true:

- Functional behavior works for acceptance criteria.
- Failure paths are handled (4xx/5xx, empty states, unauthorized).
- Tests cover core success and failure paths.
- Docs updated for any scope/design/status changes.
- Progress status is accurate and not optimistic.

If any one condition is false, status remains in-progress.

---

## Git Branching and Execution Discipline

Required lifecycle for each task:
1. Create branch.
2. Implement one checklist item.
3. Commit exactly that checklist item as a single focused commit.
4. Run intermittent scan.
5. Verify with lint/tests.
6. Update progress for that item only.
7. Open PR.
8. Merge.
9. Start next branch for next item.

Do not chain unrelated checklist items in one branch unless explicitly approved.
Do not use one “phase completion” commit for multiple checklist items.

Commit message convention (required):
- `feat(phase-XX:item-short-name): <what changed>`
- `fix(phase-XX:item-short-name): <what changed>`
- `docs(phase-XX:item-short-name): <what changed>`

Examples:
- `feat(phase-04:signal-lifecycle-status): add open/in-progress/resolved/closed transitions`
- `fix(phase-03:engagement-delete-api): enforce id-scoped delete with where clause`

---

## Missing-Parts Detection Heuristics

Flag as missing/partial if any of these are found:

- Endpoint returns success without data mutation.
- Update/Delete logic lacks identifier-based filtering.
- UI claims feature complete but backend lacks corresponding behavior.
- Checklist says complete but no matching implementation file exists.
- Test passes rely entirely on mocked network calls for server behavior.
- Docs claim percentages or totals not derivable from repository state.

Any flagged item must be recorded under:
- `Verified Complete`
- `Partial`
- `Not Implemented`

---

## Status Vocabulary (Use Strictly)

Allowed status labels:
- `Not Started`
- `In Progress`
- `Partial (Scaffolded)`
- `Verified Complete`
- `Deferred`
- `Blocked`

Avoid vague labels like “Done-ish”, “Mostly done”, or “Production-ready” without evidence.

---

## AI Agent Behavior Contract

When AI is implementing:
- Always announce current step and next action.
- Always perform scans intermittently.
- Always report discovered mismatches immediately.
- Always prefer root-cause fixes over cosmetic edits.
- Always keep scope minimal and traceable to planning docs.

When AI is reviewing:
- Reconcile docs vs code vs tests.
- Highlight over-reported and under-reported completion.
- Recommend exact checklist corrections.

---

## Enforcement for Beacon

Any PR or implementation session should be rejected or reworked if:
- progress tracking is not evidence-based,
- branch discipline is skipped,
- intermittent scans are missing,
- missing parts are discovered but not recorded,
- completion claims exceed verified implementation.

This guideline is mandatory for phase execution reliability and auditability.
