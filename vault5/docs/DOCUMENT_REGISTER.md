# Vault5 Document Register (2025)

Purpose
- Single source of truth for all documents across product, legal, operations, governance, engineering, marketing, and people.
- Tracks status: Created, Draft, Planned, External.
- Links to documents in-repo or placeholders for upcoming work.

Document Status Legend
- Created = In repo and usable
- Draft = In repo but requires review before public use
- Planned = Not yet created; defined and scheduled
- External = Hosted/managed outside repo (e.g., regulator portal)

1) Product and User-Facing Documentation
- Created
  - Product Overview (plain language) → [PRODUCT_OVERVIEW.md](./PRODUCT_OVERVIEW.md)
  - Features → [FEATURES.md](./FEATURES.md)
  - User Guide → [USER_GUIDE.md](./USER_GUIDE.md)
  - Payments Overview → [PAYMENTS.md](./PAYMENTS.md)
  - EMI Design System → [EMI_DESIGN_SYSTEM.md](./EMI_DESIGN_SYSTEM.md)
  - Component Library → [COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md)
  - Admin Guide → [ADMIN_GUIDE.md](./ADMIN_GUIDE.md)
  - Troubleshooting Guide → [TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md)
  - Development Setup Guide → [DEVELOPMENT_SETUP.md](./DEVELOPMENT_SETUP.md)
- Draft
  - Changelog → [CHANGELOG.md](./CHANGELOG.md)
  - Docs Index → [README.md](./README.md)
- Planned
  - FAQ (plain-language FAQ for onboarding) → ./PRODUCT_FAQ.md
  - Pricing & Fees explainer (non-legal) → ./PRICING_EXPLAINER.md

2) Legal and Compliance
- Created
  - Security Policy (public) → [SECURITY.md](./SECURITY.md)
  - Legal Notes (brand references, non-infringement stance) → [LEGAL-NOTES.md](./LEGAL-NOTES.md)
  - Terms of Service (template) → [legal/TERMS.md](./legal/TERMS.md)
  - Privacy Policy (template) → [legal/PRIVACY_POLICY.md](./legal/PRIVACY_POLICY.md)
  - Cookie Policy (template) → [legal/COOKIE_POLICY.md](./legal/COOKIE_POLICY.md)
  - Acceptable Use Policy (template) → [legal/ACCEPTABLE_USE.md](./legal/ACCEPTABLE_USE.md)
  - KYC/AML Policy (template) → [legal/KYC_AML_POLICY.md](./legal/KYC_AML_POLICY.md)
  - Complaints Handling Policy (Kenya) → [legal/COMPLAINTS_POLICY.md](./legal/COMPLAINTS_POLICY.md)
  - PCI DSS Scope & Notes → [PCI_DSS_Compliance.md](./PCI_DSS_Compliance.md)
  - Policies (general, company) → [Policies.md](./Policies.md)
- Planned (jurisdiction-specific counsel review required)
  - Data Processing Addendum (DPA) → ./legal/DATA_PROCESSING_ADDENDUM.md
  - Data Retention & Deletion Policy → ./legal/DATA_RETENTION_POLICY.md
  - IP and Trademark Policy → ./legal/IP_POLICY.md
  - Lending & Borrowing Policy → ./legal/LENDING_POLICY.md
  - Regulatory Disclosures (country-specific) → ./legal/DISCLOSURES.md

3) Governance, Ownership, Finance
- Created
  - Founder Statement → [FOUNDER.md](./FOUNDER.md)
  - Business Plan (high level) → [BUSINESS_PLAN.md](./BUSINESS_PLAN.md)
  - Investor Pitch Deck (summary) → [INVESTOR_PITCH_DECK.md](./INVESTOR_PITCH_DECK.md)
  - Ownership & Equity Framework (template) → [governance/OWNERSHIP_EQUITY_FRAMEWORK.md](./governance/OWNERSHIP_EQUITY_FRAMEWORK.md)
  - Reinvestment & Alternative Revenue Policy (template) → [governance/REINVESTMENT_POLICY.md](./governance/REINVESTMENT_POLICY.md)
- Planned
  - Investment Policy (treasury, yield instruments) → ./governance/INVESTMENT_POLICY.md
  - Board Charter & Governance → ./governance/BOARD_CHARTER.md
  - Expense & Procurement Policy → ./governance/EXPENSES_PROCUREMENT_POLICY.md
  - Vendor Due Diligence Standard → ./governance/VENDOR_DUE_DILIGENCE.md

4) People and HR
- Created (templates)
  - Mutual NDA Template → [people/NDA_TEMPLATE.md](./people/NDA_TEMPLATE.md)
  - Code of Conduct (Kenya-focused) → [people/CODE_OF_CONDUCT.md](./people/CODE_OF_CONDUCT.md)
- Planned (templates; customize per jurisdiction)
  - Offer Letter Template → ./people/OFFER_LETTER_TEMPLATE.md
  - Employment Agreement Template → ./people/EMPLOYMENT_AGREEMENT_TEMPLATE.md
  - Contractor Agreement Template → ./people/CONTRACTOR_AGREEMENT_TEMPLATE.md
  - Advisor Agreement Template → ./people/ADVISOR_AGREEMENT_TEMPLATE.md
  - Anti-Harassment and Equal Opportunity Policy → ./people/ANTI_HARASSMENT_EO_POLICY.md
  - Contributor License Agreement (CLA) → ./people/CONTRIBUTOR_LICENSE_AGREEMENT.md
  - Equity Grant Agreement (ESOP/Options) → ./people/EQUITY_GRANT_AGREEMENT_TEMPLATE.md

5) Operations
- Created
  - Adaptive Spend Control → [ADAPTIVE_SPEND_CONTROL.md](./ADAPTIVE_SPEND_CONTROL.md)
  - Accounts Rules → [ACCOUNTS_RULES.md](./ACCOUNTS_RULES.md)
  - Transfers & Payouts → [TRANSFERS_PAYOUTS.md](./TRANSFERS_PAYOUTS.md)
  - Operations Manual (Kenya Launch) → [ops/OPERATIONS_MANUAL.md](./ops/OPERATIONS_MANUAL.md)
- Planned
  - Incident Response Plan → ./ops/INCIDENT_RESPONSE_PLAN.md
  - Business Continuity & Disaster Recovery → ./ops/BCDR_PLAN.md
  - Customer Support Playbook → ./ops/SUPPORT_PLAYBOOK.md
  - Service Level Agreement Template (SLA) → ./ops/SLA_TEMPLATE.md
  - Runbook: Deployments, Env, Secrets → ./ops/RUNBOOK.md

6) Engineering
- Created
  - Architecture → [ARCHITECTURE.md](./ARCHITECTURE.md)
  - System Design Document → [SYSTEM_DESIGN_DOCUMENT.md](./SYSTEM_DESIGN_DOCUMENT.md)
  - System Flowchart → [SYSTEM_FLOWCHART.md](./SYSTEM_FLOWCHART.md)
  - API Overview → [API.md](./API.md)
  - API Documentation → [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
  - EMI Design Update → [EMI_DESIGN_UPDATE.md](./EMI_DESIGN_UPDATE.md)
  - EMI Feature Recommendations → [EMI_FEATURE_RECOMMENDATIONS.md](./EMI_FEATURE_RECOMMENDATIONS.md)
- Planned
  - Engineering Handbook (process, code, branching, reviews) → ./engineering/ENGINEERING_HANDBOOK.md
  - Coding Standards & Style → ./engineering/CODING_STANDARDS.md
  - Contribution Guidelines → ./engineering/CONTRIBUTING.md
  - Threat Modeling & Secure SDLC → ./engineering/SECURE_SDLC.md

7) Marketing & Communications
- Planned
  - Brand & Visual Guidelines → ./marketing/BRAND_GUIDELINES.md
  - Public Communications Policy → ./marketing/COMMS_POLICY.md
  - PR/Crisis Playbook → ./marketing/PR_CRISIS_PLAYBOOK.md

8) Country/Region-Specific (as needed)
- Created
  - Kenya (CBK, ODPC, FRC) Compliance Overview → [regions/kenya/COMPLIANCE_OVERVIEW.md](./regions/kenya/COMPLIANCE_OVERVIEW.md)
- Planned
  - EU (GDPR) → ./regions/eu/COMPLIANCE_OVERVIEW.md
  - US (CCPA and others) → ./regions/us/COMPLIANCE_OVERVIEW.md

How to use this register
- Start with Created docs to understand current decisions and user experience.
- For each Planned item, treat the path as authoritative and create the file there when we begin that work.
- When a doc is drafted, update status to Draft and later to Created once reviewed by the founder and counsel.

Change control
- Any legal policy used publicly must be reviewed by licensed counsel in the applicable jurisdiction(s) before publication.
- Governance changes require explicit founder approval and may require board/advisor review once constituted.

Owner
- Primary owner: Founder (Bryson Nyaliti)
- Maintainers: Product, Legal/Compliance, Engineering leads as appointed