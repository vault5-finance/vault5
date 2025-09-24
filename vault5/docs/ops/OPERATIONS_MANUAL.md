# Vault5 Operations Manual (Kenya Launch, 2025)

Status
- Created for internal use and go-live readiness in Kenya. Align with Kenyan law and regulator guidance (CBK, ODPC, FRC). Legal counsel review recommended before public release.
- This manual defines operational playbooks and SOPs for product, engineering, finance, compliance, and support.

Purpose
- Provide step-by-step, Kenyan-market-ready operating procedures to ensure safety, legality, and excellent user outcomes.
- Serve as the live runbook for day-to-day operations, issue handling, escalations, and regulator-facing readiness.

Scope
- Applies to all production operations (payments via partners), compliance/KYC/AML, support, incidents, deployments, reserves, refunds/chargebacks (where applicable), and audits.

A) Principles and Kenya Context
- Lawful by Design: Operate within Kenyan law and public policy at all times. Respect CBK, ODPC, FRC requirements and partner program rules.
- Mission-First: Financial freedom through discipline. Simplify choices, prevent harm, and build trust.
- Transparency: Plain-language user communications. Clear fees and decisions. Documented rationales for risk/compliance actions.
- Minimal data, strong safeguards: Collect only what we need; protect it rigorously; retain per legal schedules.
- Partner-Led Payments: For fund movement, use licensed PSP/EMI/Remittance partners and follow their program rules (limits, holds, reserves, reporting).

B) Organization and Roles
- Founder: Final authority on product direction and major risk decisions.
- Compliance (Kenya): KYC/AML/CTF program owner, sanctions/PEP screening, STR/threshold reporting to FRC, ODPC liaison (with DPO as required).
- Engineering: Secure SDLC, deployments, observability, incident response, and data protection.
- Finance: Reconciliations, reserves, fees, settlements, partner coordination.
- Support: Tiered case handling, complaints policy execution, refunds/escalations per policy.
- Admins: Role-based scopes (system, finance, compliance, support, content, accounts). Every sensitive admin action must be auditable.

C) Environment and Deployments
- Backend (Render): Ensure app.set('trust proxy', 1). Use PORT from process.env.PORT. Keep CORS aligned with Vercel domains.
- Frontend (Vercel): REACT_APP_API_URL points to Render backend. Clear cache on redeploy.
- CI: Security scans (ZAP baseline, WARN only), tests, and build checks must pass before deploy.
- Secrets: Managed in platform environment stores. No secrets in repo. Rotate if leaked.

D) KYC/AML/CTF SOP (Kenya)
1) Onboarding tiers (illustrative; confirm with counsel and partners)
   - Tier 0 (limited): basic details; minimal limits; no payouts.
   - Tier 1 (standard): ID + face match + proof of address; higher limits.
   - Tier 2 (enhanced): EDD for higher-risk profiles or volumes.
2) Screening
   - Sanctions, PEP, watchlists updates daily or per vendor service-levels.
   - Block or limit accounts on possible matches; escalate to Compliance for review.
3) Monitoring
   - Velocity caps, per-transaction caps, monthly caps aligned to partner and policy.
   - Red flags: structuring, sudden spikes, cross-border anomalies, device risk.
4) Reporting
   - STR/threshold reporting through FRC channels; maintain records; “no tipping off”.
5) Recordkeeping
   - Retain KYC/AML records per Kenyan law (commonly 5–7 years). See Data Retention policy.

E) Data Protection (Kenya)
- ODPC Readiness
  - Register as Controller/Processor if required; publish privacy contact (DPO if needed).
  - Maintain lawful bases per data category (contract, legal obligation, legitimate interest, consent).
- Data Subject Rights
  - Access, correction, deletion (unless AML/legal retention), restriction, and objection per KDPA.
  - Verify identity prior to action; record requests and outcomes.
- DPIA
  - For high-risk profiling (risk scoring, EDD), complete a DPIA. Review with counsel as needed.

F) Payments and Partners
- Movement of Funds
  - Use licensed partners for remittances and payouts. Follow limits and reserve policies.
  - All fees visible pre-confirmation to the user. Reflect excise duty if applicable to specific services; confirm with KRA.
- Reconciliations
  - Daily and monthly reconciliation reports from partners. Investigate mismatches within 2 business days.
- Reserves/Holds
  - Enforce reserve holds for riskier transactions or accounts in limitation states (temporary_30/180) under policy.
  - Clear communication to users about reserve reason, countdown, and release conditions.

G) Admin Tools and Controls
- Admin Finance Credit (internal)
  - Endpoint: POST /api/admin/finance/credit-income (finance_admin/super_admin only).
  - Purpose: Legitimate adjustments (e.g., correction or manual credit) with allocation rules applied.
  - Discipline: Mandatory description and unique tag; auto-audit entry created; notify Compliance if above threshold.
- Admin Changes
  - All admin role updates and policy changes require audit logs and, if material, founder approval.

H) Refunds, Disputes, and Complaints
- Complaints Handling Policy
  - Acknowledge within 1 business day; resolution target 7–14 days depending on complexity.
  - Escalate to Compliance or Partner Support if payment-specific.
- Disputes
  - Encourage amicable resolution; if unresolved, follow Terms for Kenyan law-governed arbitration or litigation paths.
- Refunds
  - Only for eligible cases (duplicate charges, service failure). Coordinate with PSP partners; comply with partner rules and Kenya consumer protection standards.

I) Incident Response (Security/Privacy)
- Triage (P1/P2/P3)
  - P1: Active data breach or widespread outage; notify founder and incident lead immediately; consider regulator notification timelines if PII at risk.
  - P2: Single-user security incident; contain within 24 hours; notify user if impact confirmed.
  - P3: Minor bug or limited downtime; schedule fix and document.
- Workflow
  - Detect → Contain → Eradicate → Recover → Postmortem within 5 business days.
  - Communication: Prepare user-facing notice templates; coordinate with counsel for regulator-facing communications.

J) Business Continuity and Disaster Recovery (BCDR)
- RTO/RPO Targets
  - RTO ≤ 4 hours for critical API; RPO ≤ 15 minutes for key data (subject to infra).
- Backups and Drills
  - Automated daily backups; monthly restore drills; checklist updates after each drill.
- Alternate Channels
  - If PSP outage, show user banner and queue transactions where appropriate. Resume safely after partner confirms stability.

K) Taxes and Accounting (High-Level)
- VAT on digital services: Confirm applicability; configure invoicing if applicable.
- Excise Duty: Confirm whether money transfer fees are subject; coordinate with partners.
- Withholding Tax: Apply where relevant to vendor payments or certain income classes.

L) Engineering Operations
- Secure SDLC
  - Threat modeling for money movement features; code reviews for admin endpoints; dependency scanning in CI.
- Observability
  - Logs with privacy-safe redaction; per-endpoint latency/error budgets; anomaly alerts on risk/compliance events.
- Changes and Flags
  - Feature flags for risky features; default “off” in production until validated.

M) Kenya-Specific UX and Content
- Legal Center (Frontend)
  - Terms updated to reference Kenya governing law.
  - Privacy policy updated with Kenya compliance note and ODPC references.
  - Link to Kenya Compliance Overview in Legal Center and/or Policy Updates.
- Language
  - Use plain English in-app; Swahili help content can be added progressively (future).

N) Audits and Evidence
- Keep audit logs for admin actions and sensitive operations.
- Maintain change logs and deployment records.
- Prepare annual reviews of AML, data protection, and security posture.

O) SLA and Support Targets (Baseline)
- App uptime target: 99.5% monthly (excluding partner outages outside our control).
- First response time: ≤ 4 business hours during business days.
- Resolution target: ≤ 3 business days for standard tickets; faster for payment-impacting issues.

P) Runbooks and Templates (Related Docs)
- Incident Response Plan → ./INCIDENT_RESPONSE_PLAN.md (planned)
- BCDR Plan → ./BCDR_PLAN.md (planned)
- Customer Support Playbook → ./SUPPORT_PLAYBOOK.md (planned)
- SLA Template → ./SLA_TEMPLATE.md (planned)
- Deployments/Env/Secrets Runbook → ./RUNBOOK.md (planned)
- Kenya Compliance Overview → ../regions/kenya/COMPLIANCE_OVERVIEW.md (created)
- Security Policy → ../SECURITY.md (created)
- Legal Templates → ../legal/* (created)

Q) Versioning and Ownership
- Owner: Operations Lead (until appointed, founder acts as owner).
- Update cadence: Review quarterly or after material change (new features, partner, or law).
- Changes: Record in Document Register with Created/Draft status and references.

Appendix: Admin Finance Credit SOP (Collins example)
- Objective: Credit 50,000 KES to user email collins@gmail.com as income using allocation rules.
- Steps:
  1) Authenticate as finance_admin (2FA) and obtain JWT.
  2) POST /api/admin/finance/credit-income with body:
     {
       "email": "collins@gmail.com",
       "amount": 50000,
       "currency": "KES",
       "description": "Admin credit to Collins",
       "tag": "admin_credit",
       "category": "Admin"
     }
  3) Verify allocation applied to user vaults; reconcile balances vs. allocation percentages.
  4) Add an internal note (ticket or ledger entry) referencing transactionId for audit.
  5) Notify Compliance if any threshold triggers (per AML policy).