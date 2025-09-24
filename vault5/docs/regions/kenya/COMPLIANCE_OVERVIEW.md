# Kenya Compliance & Market Readiness Overview (2025)

Status
- Created for initial market entry in Kenya. Requires review by licensed Kenyan counsel before public use.
- This document guides product, engineering, operations, and legal toward a compliant Kenya launch.

Purpose
- Summarize Kenya-specific rules that apply to Vault5 at launch and as features expand.
- Provide a practical, action-oriented checklist for product decisions, licensing, data protection, AML/CTF, payments, taxes, and consumer protection.

Scope and Current Posture
- Present scope: Personal finance discipline system with allocation engine, goals, reports, lending module (P2P/social lending), loans tracking, investment tracking, notifications, and analytics.
- Payments posture: Start as a non-custodial budgeting and money-management tool. When enabling real payments (sending/receiving), use licensed partners (Payment Service Providers) and follow their program rules.
- Brand note: Vault5 is not a bank; it is a fintech platform that prioritizes lawful behavior, financial discipline, privacy, and user safety.

A) Core Laws, Regulators, and Standards
- Central Bank of Kenya (CBK)
  - National Payment System Act (NPS) and Regulations
  - CBK licensing for Payment Service Providers (PSP), E-Money Issuers (EMI), and Remittance Providers
  - Prudential guidelines, float management for EMI, settlement rules, agent oversight
- Office of the Data Protection Commissioner (ODPC)
  - Kenya Data Protection Act (2019) + Regulations
  - Registration as Data Controller and/or Data Processor, DPO designation where required
  - Lawful bases for processing, consent, data subject rights, DPIAs for high-risk processing
- Financial Reporting Centre (FRC)
  - Proceeds of Crime and Anti-Money Laundering Act (POCAMLA)
  - AML/CTF program, KYC, sanctions, PEP screening, suspicious transaction reporting (STR/SAR)
- Kenya Revenue Authority (KRA)
  - VAT on Digital Services (where applicable)
  - Excise duty on money transfer fees (if applicable)
  - Withholding tax obligations for certain payouts/remittances or service fees
- Competition Authority of Kenya (CAK) and Consumer Protection frameworks
  - Fair marketing, clear pricing, no unfair contract terms
- Communications Authority: Marketing/communications compliance (telecom rules if SMS used)
- Sectoral frameworks: If we integrate with M-Pesa (Safaricom), Airtel Money, PesaLink (IPSL), or banks, their program compliance guidebooks and KYC/AML standards apply

B) Product Posture and Licensing Strategy
- Phase 1 (Non-custodial/planning only)
  - Vault5 provides budgeting and discipline features without moving customer funds
  - No CBK license required for simple planning tools, but KDPA still applies (ODPC registration may apply depending on data types/volumes)
- Phase 2 (Payments via partners)
  - Partner with licensed PSP/EMI/Remittance providers for actual transfers/remittances
  - Follow partner’s KYC/AML and flow constraints (limits, cooldowns, velocity caps, reserve periods)
- Phase 3 (Direct licensing if strategic)
  - Consider applying for relevant CBK authorizations (e-money issuance, payments aggregation, remittance) only after material traction and investment into compliance program maturity

C) Data Protection (ODPC)
- Registration
  - Determine if Vault5 must register as a Data Controller and/or Data Processor. In practice, most consumer fintechs must register
  - Designate a Data Protection Officer (DPO) if required by law/risk profile
- Lawful bases for processing
  - Contract: Provide core services (account management, allocation engine, reports)
  - Legal obligation: AML/CTF checks, retention rules
  - Legitimate interest: Product analytics and basic fraud/risk, balanced against user rights
  - Consent: Optional marketing; in-app toggles and unambiguous opt-ins
- Data subject rights
  - Access, correction, deletion/erasure (subject to AML/CTF retention), portability (where applicable)
  - Clear contact channel for privacy requests, with identity verification
- DPIA and security
  - DPIA for KYC/AML, risk scoring, or sensitive processing
  - Strong encryption, access controls, audit logs, incident response (see ops)
- Cross-border transfers
  - If processing or storage occurs outside Kenya, implement safeguards (e.g., contractual clauses) and document data flows

D) AML/CTF (FRC)
- AML program
  - Documented program with risk assessment, KYC/CDD/EDD standards, sanctions/PEP screening, training and audits
  - Recordkeeping and AML retention (commonly 5–7 years)
- Reporting
  - Suspicious Transaction Reports (STR/SAR) to FRC as required
  - Threshold reporting where applicable
  - “No tipping off” policy to users when legally restricted
- Risk controls
  - Velocity caps, transaction limits (daily/monthly), reserve periods for risky profiles
  - Additional review steps for EDD (source of funds, additional docs)

E) Payments and Fees (CBK and partner rules)
- Payment features
  - Use licensed partners for actual movement of funds
  - Respect partner-specific KYC tiers and limits; do not bypass program rules
- Fees and taxes
  - Transparently disclose fees before confirmation
  - Determine whether excise duty applies to specific money transfer fees collected by Vault5 or partners
  - Comply with VAT on digital services if applicable; confirm churn tax impact for subscription models

F) Consumer Protection and Dispute Handling
- Clear disclosures
  - Pricing and fees visible pre-transaction
  - Disclaimers: Vault5 is not a bank; where partners are used, identify the partner
- Complaints
  - Provide contact channels and timelines (SLA) to address user complaints
  - Document “Complaints Handling Policy”
- Dispute resolution
  - Encourage internal resolution first
  - Provide escalation paths and arbitration clause consistent with Kenyan law (counsel to finalize)

G) Marketing and Communications
- Truthful marketing; no deceptive claims
- Policies for referral/partner incentives; disclose any material relationships
- Respect opt-in/opt-out for marketing under KDPA
- Maintain a Public Communications Policy (legal review prior to campaigns)

H) Engineering and Security
- Secure SDLC with threat modeling, code reviews, and CI security scans
- Incident response and breach notification workflow consistent with KDPA
- Logs and audit trails for sensitive operations
- Role-based access and admin action trails

I) Taxes and Accounting (High-Level)
- VAT (16%) on digital services when applicable (seek tax counsel)
- Excise duty on certain financial service fees (confirm applicability with counsel/partners)
- Proper invoicing and recordkeeping; coordinate with partners for settlement and reports

J) Governance and Ownership
- Document ownership framework and equity grants (templates in governance/)
- Board/Advisor oversight for risk and compliance growth
- Vendor due diligence for KYC/AML, data hosting, analytics, messaging providers

K) Inclusion, Cultural Context, and Compliance
- Vault5 operates under Kenyan law and cultural norms. All platform rules align to Kenyan legal frameworks and public policy
- Prohibit illegal content, harassment, or any unlawful use; enforce Acceptable Use policy
- Avoid discrimination in violation of Kenyan law across financial services access. Content moderation is lawful-use focused, not opinion enforcement

L) Launch Checklist (Action Items)
- Legal & Licensing
  - Confirm non-custodial scope vs. partner-led payments for Phase 2; finalize partner contracts
  - Counsel review: Terms, Privacy, Cookie, Acceptable Use, KYC/AML, Disclaimers, Complaints Policy
  - ODPC: Registration (Controller/Processor), appoint DPO if required
- AML/CTF
  - Finalize AML program doc; choose screening vendors; set thresholds and trigger events
  - Train staff on red flags and reporting; set STR process
- Product & Engineering
  - Implement app.set('trust proxy', 1) in production (done)
  - Enforce KYC tiers and limits; tune velocity/caps; log compliance decisions
  - 451 vs 200 response strategy: consider returning 200 with limitation payload for better UX
- Data Protection
  - Lawful bases mapping per data category
  - DPIA for high-risk processes; register with ODPC and publish contact for privacy requests
  - Data retention schedule per data type (align AML 5–7 years; tax)
- Consumer Protection
  - Implement Complaints Handling Policy and Support Playbook; publish contact channels
  - Show fees and terms pre-confirmation; provide receipts and statements
- Taxes
  - Confirm VAT/digital services tax applicability and excise duty on fees with KRA guidance
- Documentation
  - Update system docs and register after each policy or feature shift

M) Document Links (In-Repo)
- Legal templates: terms, privacy, cookies, AUP, KYC/AML, legal notes → see docs/legal/*
- Security policy → docs/SECURITY.md
- Governance templates → docs/governance/*
- Operations templates → docs/ops/* (planned)
- People templates → docs/people/*
- Kenya overview (this doc) → docs/regions/kenya/COMPLIANCE_OVERVIEW.md

Notes
- This overview is a practical guide; final public policies require Kenyan counsel review
- As we add payments, lending, or investment features, revisit licensing scope and update this document and the Document Register