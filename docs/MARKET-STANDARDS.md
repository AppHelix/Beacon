# Beacon Market Standards Reference

This document captures external best-practice baselines used to define Beacon’s production standards.

---

## 1) SaaS Delivery Baseline (12-Factor)

Reference: https://12factor.net/

Applied to Beacon:
- Config is environment-driven; no secrets in code.
- Build/release/run separation in CI/CD.
- Dev/stage/prod parity to reduce release drift.
- Logs treated as event streams and shipped to centralized observability.
- Admin/maintenance tasks run as one-off operational jobs.

---

## 2) Security Verification Baseline (OWASP ASVS)

Reference: https://owasp.org/www-project-application-security-verification-standard/

Applied to Beacon:
- Security controls are validated against ASVS requirement categories.
- Access control, input validation, and sensitive data handling are explicitly tested.
- Security checks are included in PR and release gates.
- Security findings are tracked with severity and remediation ownership.

---

## 3) Reliability & Operations Baseline (SRE Practices)

Reference: https://sre.google/workbook/table-of-contents/

Applied to Beacon:
- SLI/SLO targets for critical user journeys.
- Alerting tied to SLO/error-budget policies.
- Incident response and postmortem discipline.
- Toil reduction through automation of recurring operational tasks.

---

## 4) Architecture Pattern Baseline (CQRS Guidance)

Reference: https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs

Applied to Beacon:
- Default to simple CRUD where sufficient.
- Introduce read/write model separation for high read-scale or complex domains.
- Use materialized/read models for performance-sensitive query paths.
- Document consistency expectations when asynchronous projection is used.

---

## 5) Data Integrity & Performance Baseline (PostgreSQL)

References:
- https://www.postgresql.org/docs/current/ddl-constraints.html
- https://www.postgresql.org/docs/current/indexes-intro.html
- https://www.postgresql.org/docs/current/sql-createindex.html
- https://www.postgresql.org/docs/current/rules-materializedviews.html

Applied to Beacon:
- Strong relational constraints (PK/FK/UNIQUE/CHECK/NOT NULL) as first-class invariants.
- Indexing strategy based on real query patterns and ongoing review.
- Use `CREATE INDEX CONCURRENTLY` for production-safe index rollout where needed.
- Use materialized views selectively for high-cost reads with explicit refresh ownership.

---

## 6) Production-Grade Outcomes We Enforce

- Secure by default RBAC with deny-by-default authorization.
- Observable services (structured logs, metrics, tracing, audit events).
- Controlled releases with roll-forward/rollback readiness.
- Database safety through constraints, migration discipline, indexing governance.
- Weekly evidence-based phase showcases to prove delivery quality.
