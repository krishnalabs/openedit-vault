# 🛡️ OpenEdit Vault — Digital Asset & Access Control Platform
### *Smart India Hackathon 2026 | Problem Statement ID: SIH26125*
> **Blockchain-Based Secure Platform for Identity, Access Control, and Digital Asset Management**  
> **Organization:** Bharat Electronics Limited (BEL) | **Category:** Software / Blockchain & Cybersecurity  
> **Team:** Krishnalabs | **Team Leader:** Shyamji Soni | **Theme:** Information Security / Digital Assets

[![Live Prototype](https://img.shields.io/badge/Live_MVP-openedits.lovable.app%2Fvault-0A66C2?style=for-the-badge&logo=google-chrome)](https://openedits.lovable.app/vault)
[![Compliance](https://img.shields.io/badge/Security-Zero--Trust_RBAC-success?style=for-the-badge)](docs/ARCHITECTURE.md)
[![Security](https://img.shields.io/badge/Cryptography-WebCrypto_AES--GCM_%2B_SHA--256-blueviolet?style=for-the-badge)](docs/ARCHITECTURE.md)

---

## 📌 Executive Summary
Conventional digital asset management (DAM) platforms are vulnerable to post-ingestion asset tampering, excessive administrative privileges, and high cloud processing latency. 

**OpenEdit Vault** is an air-gapped, decentralized cryptographic platform engineered for **Bharat Electronics Limited (BEL)** and high-security enterprise environments. It provides client-side zero-knowledge digital asset verification, chained tamper-evident audit ledgers, fine-grained Role-Based Access Control (RBAC), and irreversible client-side asset redaction.

## 🚀 Live Prototype & Deployment
- **Interactive Asset Vault Workspace:** https://openedits.lovable.app/vault
- **Primary Creative Studio:** https://openedits.lovable.app
- **Benchmark Asset Docket:** *BEL Strategic Docket No. BEL-2026/09 — Cryptographic Digital Asset & Verification System*

## ⚡ Key Innovations & Differentiators

| Feature | Conventional DAM Systems | OpenEdit Vault (BEL SIH26125) |
| :--- | :--- | :--- |
| **Asset Integrity** | Server-side cleartext storage; vulnerable to privilege abuse | **Client-side SHA-256 genesis fingerprinting** before transmission |
| **Tamper Resistance** | Periodic check-sums or passive logs | **Real-time 1-Byte Tamper Alert Engine** detecting bit-level alteration |
| **Access Control (RBAC)** | Coarse permissions (Viewer / Editor / Admin) | **Two-Tier Fine-Grained Access:** Administrator/Master vs Sanitized Public View |
| **Privacy & Sanitization** | Server-side processing with risk of data exposure | **Air-gapped in-memory canvas redaction** with irreversible blackout |
| **Audit Ledger** | Database logs editable by system admins | **Immutable chained block ledger** binding Genesis -> Inspection -> Export |
| **Zero Infrastructure Cost** | High blockchain gas fees & heavy servers | **Zero-gas WebCrypto architecture** running directly on client CPU |

## 🛠️ Technical Architecture & Stack
- **Frontend & UI:** React, TypeScript, Tailwind CSS, Lucide Icons
- **Cryptographic Engine:** W3C Web Cryptography API (`crypto.subtle`) for SHA-256 and AES-256-GCM
- **Local Persistence:** Browser-native IndexedDB for air-gapped security
- **Audit Ledger:** Sequential hash-chained block records ensuring non-repudiation
- **Export Engines:** Irreversible canvas redaction and cryptographic compliance certificate compilation

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full system flow.

## 🔬 Public Showcase & Tamper Verification Demo
The repository includes a standalone zero-backend demonstration at the repository root (`index.html`, `styles.css`, `app.js`):
1. **Asset Passport:** Synthetic asset metadata and SHA-256 baseline.
2. **Local SHA-256 Verifier:** In-browser hashing of any local asset without uploading.
3. **1-Byte Tamper Simulator:** In-memory single-byte mutation demonstrating instant cryptographic failure.
4. **Chained Ledger Visualizer:** Verifiable hash-linked sequence of asset lifecycle events.

### Run locally
```bash
python -m http.server 8000
```
Then open `http://localhost:8000/`.

## 📜 Standards & Compliance
- **ISO/IEC 27001 & 27037:** Information security and digital asset preservation guidelines.
- **NIST SP 800-57 & 800-86:** Cryptographic standards and digital forensics techniques.
- **NIST SP 800-207:** Zero Trust Architecture guidelines for identity and access control.

## 👥 Team
- **Team Name:** Krishnalabs  
- **Team Leader:** Shyamji Soni  
- **Institute:** NMIET

## 📄 License
Licensed under the Apache License 2.0.
