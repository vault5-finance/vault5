# Vault5 Data Retention & Deletion Policy — Kenya (2025)

Status
- Created for Kenya launch preparation. Aligns with the Kenya Data Protection Act (2019), sector guidance, and partner program rules.
- Requires review by Kenyan counsel before public release and regulator communications.

Purpose
- Define what data Vault5 retains, why, for how long, and how it is securely deleted or anonymized when no longer needed.
- Support legal, operational, and security obligations (including AML/CTF, tax, and consumer protection).

Scope
- Applies to all personal data processed by Vault5 and stored within Vault5 systems or those of contracted processors.
- Covers user accounts, financial activity records, KYC/AML, support logs, analytics, and system/audit logs.

A) Principles
- Data Minimization: Collect only what is necessary for the stated purpose.
- Purpose Limitation: Use data strictly for permitted purposes (contract, legal obligation, legitimate interest, consent where applicable).
- Security: Protect data with appropriate technical and organizational measures throughout its lifecycle.
- Transparency: Provide users with clear information on retention and deletion practices.
- Lawfulness: Follow Kenyan laws and lawful bases for processing; meet sector retention obligations (e.g., KYC/AML, tax).

B) Legal and Operational Retention Grounds (Kenya)
- Contractual necessity: Retain data to deliver services and maintain accurate records.
- Legal obligation: AML/CTF, tax, consumer protection, and financial reporting requirements.
- Legitimate interest: Security monitoring, fraud prevention, product analytics (balanced against user rights).
- Consent: Marketing communications (retain preferences and consent logs as long as needed to honor choices).

C) Retention Schedule (Categories and Durations)
Note: Durations below are baseline targets and may be extended where necessary for legal, regulatory, or active dispute reasons. “Y” means years.

1) Account and Profile Data
- Identification (name, email, phone, avatar), settings, preferences:
  - Active Account: Retain while account is active and for 2Y after closure for dispute handling and support.
  - Inactive/Dormant: 2Y from last activity, unless longer is required by other obligations.
- Authentication and Security (2FA/device IDs, trusted devices):
  - Active Account: Retain while necessary to protect account security.
  - After Closure: 1Y, then delete or anonymize unless required for ongoing security investigations.

2) KYC/AML Data (Kenya)
- Identity documents (ID/passport), proof of address, verification outcomes, sanctions/PEP checks:
  - Retain for 5–7Y after the end of the customer relationship or the date of the last transaction, consistent with AML/CTF standards and auditor/regulator expectations.
- AML Investigations (STR/SAR-related records):
  - Retain for 7Y minimum (or as required by FRC/POCAMLA guidance).

3) Financial Activity and Transaction Records
- Income, transfers, investments, loans, and ledgers:
  - Retain for 7Y from the date of the record for accounting, audit, and tax compliance.
- Statements and receipts:
  - Retain for 7Y from the date of issuance.

4) Support and Complaints
- Tickets, emails, attachments, resolutions:
  - Retain for 5Y from case closure (or longer if linked to regulatory or legal matters).
- Complaint handling (Kenya-specific policy artifacts):
  - Retain for 5Y from case closure.

5) Logs and Security Telemetry
- Application and audit logs:
  - Retain 1–2Y for forensic and security review; longer if needed for regulatory or legal holds.
- Anonymized analytics:
  - May be retained beyond personal data lifetimes if fully de-identified and non-reversible.

6) Marketing and Communications
- Consent/opt-in/opt-out records:
  - Retain as long as necessary to honor preferences and demonstrate compliance; typically 2Y from last interaction.
- Campaign analytics (aggregated):
  - Retain indefinitely if fully de-identified.

D) Deletion and Anonymization
- Deletion Triggers
  - End of contract + retention period elapsed
  - Successful data subject deletion request (subject to legal/regulatory exceptions)
  - End of legal hold or dispute
- Secure Deletion
  - Overwrite or cryptographic erasure for primary and backups when feasible per storage architecture.
  - Ensure processors perform deletion upon instruction and provide evidence when appropriate.
- Anonymization
  - Where deletion would impair legitimate internal analytics, transform data into de-identified aggregates without re-identification risk.

E) Data Subject Requests (Kenya DP Act, 2019)
- Right to deletion/erasure
  - If no longer necessary and not subject to legal obligations (e.g., AML/CTF, tax), delete within a reasonable time.
  - Log decisions and reasons (granted/denied/partially granted).
- Right to access/correction/objection/restriction
  - Honor rights within legal timeframes; verify identity before acting.

F) Legal Holds and Exceptions
- If litigation, investigation, or regulator inquiry is active, place legal hold and pause deletion of relevant records.
- Resume normal retention and deletion after hold is lifted; record dates and scope of hold.

G) Process Controls
- Ownership
  - Data Protection Lead (or designated Privacy Officer) maintains this policy and approves exceptions.
- Process
  - Quarterly review of retention queues and deletion jobs.
  - Annual policy review or after regulatory changes.
- Evidence
  - Keep logs of deletions and anonymization (timestamps, scopes, success/failure).

H) Third Parties and Processors
- Contracts must include retention obligations, deletion timelines, and evidence of secure disposal.
- Regular reviews to ensure processor compliance and timely execution of deletion requests.

I) Cross-Border Data Considerations
- If processed outside Kenya, implement contractual safeguards and comply with Kenya DP Act requirements.
- Reflect cross-border flows in the Privacy Policy and Kenya Compliance Overview.

J) User Communications
- Publish a summary of this policy in the Legal Center/Privacy Policy.
- Provide contact method for retention/deletion queries.

K) Versioning and Change Management
- Record version, effective date, and summary of changes.
- Notify users of material changes where required by law or policy.

Related Documents
- Privacy Policy → [PRIVACY_POLICY.md](./PRIVACY_POLICY.md)
- Kenya Compliance Overview → [../regions/kenya/COMPLIANCE_OVERVIEW.md](../regions/kenya/COMPLIANCE_OVERVIEW.md)
- Security Policy → [../SECURITY.md](../SECURITY.md)
- Complaints Handling (Kenya) → [COMPLAINTS_POLICY.md](./COMPLAINTS_POLICY.md)
- Operations Manual (Kenya) → [../ops/OPERATIONS_MANUAL.md](../ops/OPERATIONS_MANUAL.md)
- Incident Response Plan → [../ops/INCIDENT_RESPONSE_PLAN.md](../ops/INCIDENT_RESPONSE_PLAN.md)

Notes
- Retention periods may be revised based on regulatory guidance, partner requirements, and business needs.
- Counsel review is required for final publication and regulator-facing versions.