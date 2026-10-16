<p align="center">
  <img src="assets/logo.png" width="130" alt="OpenEdit Vault Shield Logo" />
</p>

<h1 align="center">🛡️ OpenEdit Vault</h1>
<h3 align="center">Blockchain-Based Digital Asset, Identity & Access Control Platform</h3>
<p align="center">
  <em>Smart India Hackathon 2026 | Problem Statement ID: <strong>SIH26125</strong></em><br>
  <strong>Target Ministry / Organization:</strong> Bharat Electronics Limited (BEL), Ministry of Defence<br>
  <strong>Team:</strong> Krishnalabs | <strong>Team Leader:</strong> Shyamji Soni | <strong>Category:</strong> Blockchain & Cybersecurity
</p>

<p align="center">
  <a href="https://openedits.lovable.app/vault"><img src="https://img.shields.io/badge/Live_MVP-openedits.lovable.app%2Fvault-0A66C2?style=for-the-badge&logo=google-chrome" alt="Live MVP"></a>
  <a href="https://openedits.lovable.app/pricing"><img src="https://img.shields.io/badge/Enterprise_Pricing-GeM_Procurement_Ready-2ea44f?style=for-the-badge" alt="Pricing"></a>
  <a href="contracts/OpenEditAssetLedger.sol"><img src="https://img.shields.io/badge/Smart_Contract-Solidity_0.8.20-blueviolet?style=for-the-badge&logo=solidity" alt="Solidity Contract"></a>
  <a href="docs/STANDARDS_AND_COMPLIANCE.md"><img src="https://img.shields.io/badge/Standards-W3C_DID_|_NIST_|_ISO27001-orange?style=for-the-badge" alt="Standards"></a>
</p>

---

## 📌 Executive Summary
Conventional digital asset management (DAM) platforms rely on server-side trust models where unencrypted binaries, blueprints, and sensitive telemetry logs can be inspected or altered by database administrators.

**OpenEdit Vault** is an air-gapped, zero-trust digital asset platform engineered for **Bharat Electronics Limited (BEL)**. It combines:
1. **Zero-Knowledge Client-Side Engine**: Ingests, hashes (SHA-256), and redacts assets in memory using the browser's WebCrypto API. Unencrypted defence payloads never touch external cloud servers.
2. **Blockchain Provenance & Access Layer**: Immutably anchors asset genesis digests, Merkle audit roots, and W3C DID-bound Role-Based Access Control (RBAC) via the [`OpenEditAssetLedger.sol`](contracts/OpenEditAssetLedger.sol) smart contract.

---

## 🚀 Live Prototypes & Commercial URLs
- **Interactive Asset Vault Workspace:** [https://openedits.lovable.app/vault](https://openedits.lovable.app/vault)
- **Enterprise & Defence Pricing:** [https://openedits.lovable.app/pricing](https://openedits.lovable.app/pricing)
- **Primary Creative Studio:** [https://openedits.lovable.app](https://openedits.lovable.app)
- **Benchmark Asset Docket:** *BEL Strategic Docket No. BEL-2026/09 — High-Assurance Cryptographic Digital Asset Verification*

---

## ⚡ Key Innovations & Differentiators

| Feature | Conventional DAM Systems | OpenEdit Vault (BEL SIH26125) |
| :--- | :--- | :--- |
| **Asset Integrity** | Server-side cleartext storage; vulnerable to privilege abuse | **Client-side SHA-256 genesis fingerprinting** before transmission |
| **Tamper Resistance** | Periodic check-sums or passive logs | **Real-time 1-Byte Tamper Alert Engine** detecting bit-level alteration & auto-freezing asset |
| **Access Control (RBAC)** | Coarse permissions (Viewer / Editor / Admin) | **W3C DID-Linked Clearance:** Defence Commander, Security Analyst, External Auditor |
| **Privacy & Sanitization** | Server-side processing with risk of data exposure | **Air-gapped in-memory canvas redaction** with irreversible blackout |
| **Blockchain Provenance** | Centralized SQL database editable by admins | **Solidity Smart Contract (`OpenEditAssetLedger.sol`)** anchoring Merkle audit blocks |
| **Infrastructure Cost** | High gas fees & heavy servers | **Hybrid Zero-Gas WebCrypto architecture** with selective consortium anchoring |

---

## 🛠️ Repository Architecture & Files

```text
├── contracts/
│   └── OpenEditAssetLedger.sol      # EVM Smart Contract for DID, RBAC & Asset Anchoring
├── assets/
│   └── logo.png                     # Official OpenEdit Vault Cyber Shield emblem
├── docs/
│   ├── ARCHITECTURE.md              # System architecture & cryptographic security flows
│   └── STANDARDS_AND_COMPLIANCE.md  # W3C DID v1.0, NIST SP 800-53, ISO 27001, GeM framework
├── index.html                       # Standalone interactive browser demo for BEL assets
├── app.js                           # WebCrypto SHA-256 verification & 1-byte tamper simulation
└── styles.css                       # High-trust dark defense UI styling
```

---

## 💼 Enterprise Commercialization & Procurement Model
As showcased on our live [Pricing Portal](https://openedits.lovable.app/pricing):
- **SIH 2026 Jury & Evaluator Access:** 100% Free unrestricted access across all tools and vault features.
- **Consumer Studio (`/`):** Local-first free tools driving adoption.
- **Enterprise & Defence Tier (`/vault`):** On-premise air-gapped deployment, hardware-token authentication, GeM (Government e-Marketplace) procurement compliance, and dedicated SLA for defence contractors and PSUs.

---

## 👥 Team Krishnalabs 
- **Team Leader:** Shyamji Soni
- **Problem Statement ID:** SIH26125 (Bharat Electronics Limited - BEL)
- **Theme:** Information Security / Digital Asset Security
