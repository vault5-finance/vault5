# Vault5 System Flowchart

**Designed by Bryson OMullo** 📊

## Overview
This document provides comprehensive flowcharts for the Vault5 EMI-Style Financial Freedom Platform, showing the complete user journey, transaction flows, and system architecture.

---

## 🏦 **Main System Architecture**

```mermaid
flowchart TD
    %% User Entry Points
    A[User] --> B{Landing Page}
    B --> C[Registration/Login]
    C --> D{Authentication}

    %% Authentication Flow
    D -->|Valid| E[Dashboard]
    D -->|Invalid| F[Error Page]

    %% Main Dashboard
    E --> G[Account Overview]
    E --> H[Quick Actions]
    E --> I[Recent Transactions]

    %% Account Management
    G --> J[Six Vault Accounts]
    J --> K[Daily Account]
    J --> L[Emergency Account]
    J --> M[Investment Account]
    J --> N[Long-Term Account]
    J --> O[Fun Account]

    %% Money Transfer System
    H --> P[Send Money]
    P --> Q{Transfer Type}
    Q -->|Internal| R[Internal Transfer]
    Q -->|P2P| S[P2P Transfer]
    Q -->|Bank| T[Bank Transfer]
    Q -->|M-Pesa| U[M-Pesa Transfer]

    %% Recipient Verification
    S --> V[Recipient Search]
    V --> W{Contact Found?}
    W -->|Yes| X[Auto-fill Details]
    W -->|No| Y[Manual Entry]
    X --> Z[Security Verification]
    Y --> Z

    %% Lending System
    H --> AA[Lending]
    AA --> AB[Contact-Based Lending]
    AB --> AC[Select Contact]
    AC --> AD[Loan Details]
    AD --> AE[Security Checks]
    AE --> AF[Submit Request]

    %% Compliance & Security
    Z --> AG{Verification}
    AG -->|Pass| AH[Transaction Complete]
    AG -->|Fail| AI[Additional Checks]
    AI --> AJ{Approved?}
    AJ -->|Yes| AH
    AJ -->|No| AK[Transaction Blocked]

    %% Admin System
    AL[Admin Panel] --> AM[User Management]
    AL --> AN[Compliance Center]
    AL --> AO[Financial Reports]
    AL --> AP[System Monitoring]

    %% Backend Processing
    AH --> AQ[Backend API]
    AQ --> AR[Database Update]
    AR --> AS[Transaction Record]
    AS --> AT[Account Balance Update]
    AT --> AU[Notification System]
```

---

## 💰 **Money Transfer Flow**

```mermaid
flowchart TD
    %% Transfer Initiation
    A[User Initiates Transfer] --> B{Transfer Type}
    B -->|Internal| C[Internal Transfer]
    B -->|P2P| D[P2P Transfer]
    B -->|External| E[External Transfer]

    %% P2P Transfer Flow
    D --> F[Recipient Search]
    F --> G{Search Method}
    G -->|Phone| H[Phone Lookup]
    G -->|Email| I[Email Lookup]

    H --> J[Contact Found?]
    I --> J
    J -->|Yes| K[Auto-fill Details]
    J -->|No| L[Manual Entry]

    K --> M[Display Masked Info]
    M --> N[User Confirms?]
    L --> N

    %% Security Verification
    N -->|Yes| O[Security Checks]
    N -->|No| P[Transfer Cancelled]

    O --> Q{Verification Level}
    Q -->|Vault5 User| R[Auto-Verified]
    Q -->|External User| S[Kenyan Verification]
    S --> T[Hakikisha System]
    T --> U{Verified?}
    U -->|Yes| V[Proceed]
    U -->|No| W[Additional Checks]

    %% Transaction Processing
    V --> X[Amount Validation]
    X --> Y{Valid Amount?}
    Y -->|Yes| Z[Process Transfer]
    Y -->|No| AA[Error]

    Z --> AB[Update Sender Account]
    AB --> AC[Update Recipient Account]
    AC --> AD[Create Transaction Records]
    AD --> AE[Send Notifications]
    AE --> AF[Transfer Complete]

    %% Error Handling
    AA --> AG[Show Error]
    W --> AG
    P --> AG
```

---

## 🔐 **Security & Compliance Flow**

```mermaid
flowchart TD
    %% Security Gates
    A[Transaction Request] --> B[Authentication Check]
    B --> C{Valid User?}
    C -->|No| D[Access Denied]
    C -->|Yes| E[Geo-IP Check]

    E --> F{Allowed Location?}
    F -->|No| G[Location Blocked]
    F -->|Yes| H[Device Verification]

    H --> I{Valid Device?}
    I -->|No| J[Device Blocked]
    I -->|Yes| K[Compliance Gates]

    %% Compliance Checks
    K --> L[Limitation Check]
    L --> M{Under Limitation?}
    M -->|Yes| N[Outgoing Blocked]
    M -->|No| O[Continue]

    O --> P[Velocity Check]
    P --> Q{Within Limits?}
    Q -->|No| R[Rate Limited]
    Q -->|Yes| S[Continue]

    S --> T[Amount Caps Check]
    T --> U{Within Caps?}
    U -->|No| V[Amount Too High]
    U -->|Yes| W[Continue]

    %% Transaction Processing
    W --> X[Process Transaction]
    X --> Y[Risk Assessment]
    Y --> Z{Acceptable Risk?}
    Z -->|No| AA[High Risk Flag]
    Z -->|Yes| AB[Transaction Approved]

    %% Post-Transaction
    AB --> AC[Update Records]
    AC --> AD[Send Notifications]
    AD --> AE[Audit Log]
    AE --> AF[Complete]

    %% Admin Monitoring
    AF --> AG[Admin Dashboard]
    AG --> AH[Monitor Transactions]
    AH --> AI[Review Flags]
    AI --> AJ[Take Action]
```

---

## 📱 **Contact-Based Lending Flow**

```mermaid
flowchart TD
    %% Lending Initiation
    A[User Requests Loan] --> B[Contact Selection]
    B --> C{Select Contact}
    C -->|From Contacts| D[Phone Contacts API]
    C -->|Manual Entry| E[Manual Input]

    D --> F[Load Contacts]
    F --> G[Display Contacts]
    E --> G

    %% Contact Selection
    G --> H[User Selects Contact]
    H --> I[Auto-fill Details]
    I --> J[Trust Score Check]
    J --> K{Calculate Score}

    %% Security Assessment
    K --> L[Contact Verification]
    L --> M{Vault5 User?}
    M -->|Yes| N[Auto-Verified]
    M -->|No| O[External Verification]

    O --> P[Kenyan Verification]
    P --> Q{Verification Pass?}
    Q -->|Yes| R[Proceed]
    Q -->|No| S[Security Flag]

    %% Loan Processing
    R --> T[Amount Validation]
    T --> U{Within Limits?}
    U -->|No| V[Amount Adjusted]
    U -->|Yes| W[Continue]

    W --> X[Terms Agreement]
    X --> Y[Submit Request]
    Y --> Z[Request Sent]

    %% Response Handling
    Z --> AA[Waiting Response]
    AA --> AB{Response?}
    AB -->|Accepted| AC[Loan Approved]
    AB -->|Rejected| AD[Loan Rejected]
    AB -->|Counter| AE[Counter Offer]

    %% Completion
    AC --> AF[Funds Disbursed]
    AF --> AG[Repayment Schedule]
    AG --> AH[Monitoring]
```

---

## 🏗️ **System Components Architecture**

```mermaid
flowchart TD
    %% Frontend Layer
    subgraph FE [Frontend Layer]
        A[React SPA]
        B[TailwindCSS UI]
        C[State Management]
        D[API Services]
    end

    %% Backend Layer
    subgraph BE [Backend Layer]
        E[Express Server]
        F[Route Handlers]
        G[Controllers]
        H[Middleware Stack]
        I[Security Gates]
    end

    %% Database Layer
    subgraph DB [Database Layer]
        J[MongoDB Atlas]
        K[User Collection]
        L[Account Collection]
        M[Transaction Collection]
        N[Compliance Collection]
    end

    %% External Services
    subgraph ES [External Services]
        O[M-Pesa API]
        P[Airtel Money API]
        P[Airtel Money API]
        Q[Bank APIs]
        R[SMS Services]
        S[Email Services]
    end

    %% Admin Layer
    subgraph AD [Admin Layer]
        T[Admin Dashboard]
        U[Compliance Center]
        V[User Management]
        W[Financial Reports]
        X[System Monitoring]
    end

    %% Connections
    FE --> BE
    BE --> DB
    BE --> ES
    AD --> BE

    %% Data Flow
    A --> D
    D --> F
    F --> G
    G --> H
    H --> I
    I --> J
    I --> K
    I --> L
    I --> M
    I --> N
    I --> O
    I --> P
    I --> Q
    I --> R
    I --> S
```

---

## 📊 **Transaction Processing Flow**

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    participant N as Notifications

    U->>F: Initiate Transfer
    F->>B: POST /api/transactions/transfer
    B->>B: Validate Request
    B->>DB: Check Sender Balance
    DB-->>B: Balance Confirmed
    B->>DB: Find Recipient Account
    DB-->>B: Recipient Found
    B->>B: Apply Security Gates
    B->>B: Process Transfer
    B->>DB: Update Sender Account
    B->>DB: Update Recipient Account
    B->>DB: Create Transaction Records
    B->>N: Send Notifications
    N-->>U: Transfer Complete
    B-->>F: Success Response
    F-->>U: Show Confirmation
```

---

## 🔄 **Real-Time Updates Flow**

```mermaid
flowchart TD
    %% WebSocket Connection
    A[User Connects] --> B[WebSocket Established]
    B --> C[Real-time Updates]

    %% Account Updates
    C --> D[Account Balance Changes]
    D --> E[Transaction Updates]
    E --> F[Notification Updates]

    %% Lending Updates
    C --> G[Lending Status Changes]
    G --> H[Loan Request Updates]
    H --> I[Repayment Reminders]

    %% Compliance Updates
    C --> J[Compliance Status Changes]
    J --> K[Limitation Updates]
    K --> L[Verification Updates]

    %% Admin Monitoring
    C --> M[Admin Dashboard Updates]
    M --> N[User Activity Monitoring]
    N --> O[Transaction Monitoring]
    O --> P[Security Alerts]

    %% Push Notifications
    F --> Q[Push Notifications]
    I --> Q
    L --> Q
    P --> Q
```

---

## 📈 **Analytics & Reporting Flow**

```mermaid
flowchart TD
    %% Data Collection
    A[Transaction Data] --> B[Data Aggregation]
    B --> C[Analytics Engine]

    %% User Analytics
    C --> D[User Behavior Analysis]
    D --> E[Spending Patterns]
    E --> F[Financial Health Score]

    %% System Analytics
    C --> G[System Performance]
    G --> H[Transaction Volume]
    H --> I[Error Rates]
    I --> J[User Engagement]

    %% Compliance Analytics
    C --> K[Compliance Metrics]
    K --> L[KYC Completion Rates]
    L --> M[Limitation Statistics]
    M --> N[Risk Assessment]

    %% Reporting
    F --> O[User Reports]
    J --> P[System Reports]
    N --> Q[Compliance Reports]

    %% Dashboard Updates
    O --> R[User Dashboard]
    P --> S[Admin Dashboard]
    Q --> T[Compliance Dashboard]
```

---

## 🎯 **Key Features Integration**

| Feature | Flow Integration | Security Level |
|---------|------------------|----------------|
| **P2P Transfers** | Money Transfer Flow | High |
| **Contact Lending** | Lending Flow | High |
| **Recipient Verification** | Security Flow | Maximum |
| **Account Allocation** | Transaction Processing | Medium |
| **Compliance Gates** | Security Flow | Maximum |
| **Real-time Updates** | Updates Flow | Low |

---

## 📝 **Document Information**

**Created by**: Bryson OMullo
**Last Updated**: 2025-09-21
**Version**: 2.1.0 EMI
**Purpose**: Complete system documentation and flow visualization

---

## 🔗 **Related Documentation**

- [README.md](../README.md) - Main project documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture details
- [API.md](API.md) - API endpoint documentation
- [ROADMAP.md](../ROADMAP.md) - Development roadmap

---

**© 2025 Bryson OMullo - Vault5 EMI-Style Financial Freedom Platform**