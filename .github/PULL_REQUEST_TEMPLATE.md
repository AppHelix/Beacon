## Summary

- What changed:
- Why it changed:
- Scope boundaries (what is intentionally not included):

## Linked Work Item

- Ticket/Issue:
- Phase (Week 01–12):

## Checklist — Required Before Review

- [ ] Acceptance criteria mapped and satisfied.
- [ ] Risk level classified (Low / Medium / High).
- [ ] Rollback plan documented (for Medium/High risk).
- [ ] `commitlint` checked for commits in this PR (advisory in Bootstrap, required from Stabilization).
- [ ] Lint + type-check + tests pass locally.
- [ ] Observability updates included (logs/metrics/alerts) for new behavior.

## Security & RBAC

- [ ] Authentication and authorization impact reviewed.
- [ ] Negative authorization tests included for privileged routes/actions.
- [ ] No secrets/PII leakage in logs.
- [ ] Security findings addressed or explicitly accepted with owner.

## Data & Database Changes

- [ ] No DB change.
- [ ] DB schema changed and migration included.
- [ ] Constraint/index rationale documented.
- [ ] `EXPLAIN`/query-plan evidence attached for affected queries.
- [ ] Backfill/cutover/rollback plan documented.

## Testing Evidence

- [ ] Unit tests (or marked N/A for Bootstrap spike work)
- [ ] Integration tests (or marked N/A with rationale)
- [ ] E2E tests (required for critical flows, optional for non-critical Bootstrap changes)
- [ ] Accessibility checks (if UI changes)
- [ ] Performance checks (if hot path changes)

## UI Evidence (if applicable)

- Screenshots/video:

## Deployment Plan

- Environment rollout order:
- Feature flag/canary strategy:
- Verification checks post-deploy:

## Post-Deploy Monitoring

- Dashboards/alerts to watch:
- Success criteria window:
