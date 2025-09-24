# Vault5 Incident Response Plan — Kenya-Aligned (2025)

Status
- Created for internal use. Align with Kenya Data Protection Act (2019) and regulator expectations (ODPC, CBK/FRC context when relevant).
- Legal/security counsel review recommended before finalization and regulator communication use.

Purpose
- Define a fast, repeatable method to detect, contain, eradicate, and recover from security/privacy incidents.
- Ensure lawful notifications and evidence handling in Kenya.

Scope
- Applies to all production systems, user data, and third-party services integrated with Vault5.
- Covers confidentiality, integrity, and availability incidents (CIA triad).

IR Team and Roles
- Incident Lead: Appointed per incident (default: senior engineering or security lead).
- Communications Lead: Coordinates internal and external messaging; consults founder/legal.
- Compliance/Privacy Lead: Reviews ODPC obligations, data subject rights, and breach thresholds.
- Engineering On-Call: Executes technical containment and recovery steps.
- Founder: Approves material public statements and regulator escalations.

Severity Levels (Example)
- P1 – Data breach/high risk privacy incident; widespread service compromise; regulator notification may be required.
- P2 – Limited account compromise; regional service interruption; no regulator notice expected but user notification likely.
- P3 – Minor outages/bugs; operational but degraded; no external notice required.

ODPC and Kenya Data Protection Considerations
- Determine whether incident is a “personal data breach” under KDPA (loss, alteration, unauthorized disclosure or access).
- If risk to data subjects is likely, prepare notifications to ODPC and impacted users without undue delay, within legal timelines.
- Content of notices must be clear and include nature of breach, affected categories, advice to reduce harm, and steps taken.

IR Workflow (6 Phases)
1) Preparation
   - Playbooks up-to-date; contacts and on-call rotations maintained.
   - Logging with sensitive redaction; SIEM/alerts configured for anomaly detection.
   - Backups and restore drills (see BCDR Plan).

2) Identification
   - Trigger: IDS alerts, partner notifications, user reports, monitoring anomalies.
   - Collect initial facts: time, scope, systems, data types, volume, region, cloud vendor.
   - Assign severity (P1/P2/P3) and Incident Lead; open ticket and war room channel.

3) Containment
   - Short-term: Isolate affected services, revoke keys/tokens, disable compromised accounts, block IPs.
   - Preserve volatile evidence (memory dumps/log slices) where safe; snapshot compromised nodes.
   - Maintain service continuity if safe; place banners to inform users of partial outages.

4) Eradication
   - Remove malicious code, reset credentials, patch vulnerabilities, rotate secrets, reconfigure CORS/headers.
   - Validate third-party integrations (KYC, PSPs) for indicators of compromise.

5) Recovery
   - Restore services from clean state; verify integrity with hash/attestation checks where applicable.
   - Monitor for recurrence; gradually re-enable limited accounts or features.

6) Post-Incident Review
   - Within 5 business days: timeline, root cause, blast radius, controls that worked/didn’t.
   - Action items: code fixes, infra hardening, process/contract changes; assign owners and due dates.
   - Update policies and user comms templates as needed; report to leadership.

Notification Decision Tree (Kenya Focus)
- Is personal data involved? If no → consider service-only communication.
- If yes, is there risk to data subjects (identity theft, financial loss, discrimination, etc.)?
  - If yes → Notify ODPC and affected users within legal timelines; coordinate with counsel.
  - If uncertain → Conduct DPIA-style quick risk assessment; document rationale and decision.
- For payment partner incidents → follow partner notice rules (e.g., PSP program obligations) in addition to ODPC.

Evidence Handling
- Time-stamped logs, system snapshots, forensic notes; keep chain-of-custody details.
- Store in restricted evidence repository; limit access to IR team.
- Comply with Kenya Evidence Act principles where relevant.

User Communication Templates (Summaries)
- P1 Template (Data Breach):
  - What happened, when discovered, categories of data affected, steps taken, what we are doing to help (e.g., password reset).
  - Contact and complaint channels; references to Privacy policy and ODPC rights.
- P2 Template (Account Security Issue):
  - Unusual activity detected; recommended actions (password/MFA reset); we have secured your account.
- P3 Template (Service Outage):
  - Explanation of downtime and current status; ETA and remedial steps.

Third-Party Coordination
- PSP/KYC vendors: raise tickets through designated channels; share IOCs within contractual limits.
- Hosting/Cloud: open severity-matched support tickets; request forensic timelines and logs as allowed.

Metrics and SLAs
- Time to Detect (TTD), Time to Contain (TTC), Time to Recover (TTR).
- Notification SLA: If ODPC notification required, prepare within legal timelines and “without undue delay”.
- Quarterly IR drills; review outcomes and update this plan.

Access Controls During IR
- Limit “break-glass” access; log all emergency privileges granted.
- Remove emergency privileges immediately after IR phase completes.

Post-Incident Actions (Examples)
- Security hardening (headers, CSP, rate limit trust proxy settings).
- Dependency upgrades and scanning rules in CI.
- Runbook updates; user documentation updates (if behavior changed).
- Partner contract amendments for incident data flows if needed.

Kenya-Specific References (Practical)
- Kenya Data Protection Act (2019) and ODPC data breach guidance.
- FRC reporting (AML/CTF) if incident overlaps with suspicious transactions.
- CBK/NPS obligations via PSP partners (when handling funds).

Document Control
- Owner: Security Lead (until appointed, founder serves as owner).
- Review: Semi-annual or after any material incident.
- Related Docs:
  - BCDR Plan → ./BCDR_PLAN.md
  - Operations Manual → ./OPERATIONS_MANUAL.md
  - Security Policy → ../SECURITY.md
  - Privacy Policy → ../legal/PRIVACY_POLICY.md
  - Kenya Compliance Overview → ../regions/kenya/COMPLIANCE_OVERVIEW.md

Annex: Contact Roster (Populate at Launch)
- Incident Lead On-Call:
- Communications Lead:
- Compliance/Privacy Lead:
- Founder:
- PSP Partner Emergency Contact:
- KYC Vendor Emergency Contact:
- Cloud Provider Support: