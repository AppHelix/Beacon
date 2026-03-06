# Beacon Production Release Checklist

Use this checklist for every production release candidate.

Note: this checklist is **strict by design** for release readiness (typically Weeks 10–12+).
During bootstrap development (Weeks 1–4), teams may use a reduced subset while still tracking risk and rollback notes.

---

## 1) Scope & Approval

- [ ] Release scope frozen and linked to approved tickets.
- [ ] Change log generated and reviewed.
- [ ] Risk classification completed (Low/Medium/High).
- [ ] Product + Engineering sign-off recorded.

## 2) Quality Gates

- [ ] `commitlint` passes for all merged commits in release range.
- [ ] CI green: lint, type-check, unit/integration tests.
- [ ] E2E regression suite passes for critical journeys.
- [ ] Accessibility checks pass for impacted UI surfaces.
- [ ] No unresolved P0/P1 defects in release scope.

## 3) Security & RBAC

- [ ] Security checklist complete (authn, authz, input validation, secrets handling).
- [ ] RBAC changes reviewed against permission matrix.
- [ ] Privileged admin paths verified with negative authorization tests.
- [ ] Audit events validated for critical admin operations.

## 4) Data Safety

- [ ] Migrations reviewed and tested on representative dataset.
- [ ] Constraints/index updates verified.
- [ ] Backfill jobs (if any) completed or scheduled.
- [ ] Rollback path tested or simulation documented.
- [ ] Backup/restore readiness confirmed.

## 5) Deployment Controls

- [ ] Deployment plan includes canary/gradual rollout for high-risk changes.
- [ ] Feature flags configured for reversible behavior.
- [ ] On-call ownership assigned for release window.
- [ ] Incident communication channel prepared.

## 6) Post-Deploy Verification

- [ ] Smoke checks pass (login, catalog, signals, AI query, admin paths).
- [ ] SLO metrics stable (latency, error rate, saturation).
- [ ] No critical alert bursts during observation window.
- [ ] Release marked complete with evidence links.

## 7) UX Acceptance Gate (From Wireframes)

- [ ] Page purpose is clear within one glance.
- [ ] Primary action is obvious within 5 seconds.
- [ ] Navigation path is clear without external explanation.
- [ ] Empty/loading/error/success states are implemented.
- [ ] UI styling and interaction patterns are consistent across core pages.
- [ ] First-time user can complete intended journey without support assistance.
