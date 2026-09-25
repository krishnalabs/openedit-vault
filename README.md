# 🏛️ OpenEdit Vault — Secure Case Workspace
### *Smart India Hackathon 2026 | Problem Statement ID: SIH26190*
> **Secure Digital Document Management System for Legal and Investigation Documents**  
> **Team:** Krishnalabs | **Team Leader:** Shyamji Soni | **Theme:** Miscellaneous / LegalTech

[![Live Prototype](https://img.shields.io/badge/Live_MVP-openedits.lovable.app%2Fvault-0A66C2?style=for-the-badge&logo=google-chrome)](https://openedits.lovable.app/vault)
[![Compliance](https://img.shields.io/badge/Compliance-BSA_2023_Sec_63-success?style=for-the-badge)](docs/BSA_2023_COMPLIANCE.md)
[![Security](https://img.shields.io/badge/Security-WebCrypto_AES--GCM_%2B_SHA--256-blueviolet?style=for-the-badge)](docs/ARCHITECTURE.md)

---

## 📌 Executive Summary
Traditional document management systems are not purpose-built for forensic and criminal investigations, where evidentiary integrity, chain of custody, privacy controls, and statutory procedure matter.

**OpenEdit Vault** is an offline-first, client-side security-oriented case and evidence workspace for Investigating Officers (IOs), Forensic Science Laboratories (FSLs), Public Prosecutors, and judicial workflows. The prototype focuses on cryptographic integrity verification, structured custody events, sensitive-data redaction, and electronic-record certification workflows.

> **Important scope note:** OpenEdit Vault is a prototype for SIH 2026 evaluation. It does not by itself establish legal admissibility, certify an official government record, or replace statutory procedures, forensic SOPs, court orders, or qualified legal review.

## 🚀 Live Prototype & Deployment
- **Interactive Case Workspace:** https://openedits.lovable.app/vault
- **Primary Creative Studio:** https://openedits.lovable.app
- **Pre-Loaded Benchmark Case:** *FIR No. 204/2026 — State vs. Cyber Syndicate (Cyber Crime Police Station)*

## ⚡ Key Innovations & Differentiators

| Feature | Conventional General-Purpose DMS | OpenEdit Vault |
| :--- | :--- | :--- |
| **Evidence Integrity** | File storage with optional hashes | **SHA-256 integrity verification** tied to evidence records |
| **Privacy** | Centralized/cloud processing may expose sensitive content | **Client-side processing path** intended to minimize unnecessary data transfer |
| **Custody Tracking** | Generic activity/audit logs | **Hash-linked custody ledger model** for tamper-evident event sequencing |
| **Redaction** | Often manual or workflow-dependent | **Dedicated redaction workflow** with Officer vs. Court/Public modes |
| **Field Usability** | Often network-dependent | **Offline-first browser architecture** using local persistence |
| **Certification Workflow** | Generic document export | **BSA 2023 Section 63-oriented certificate workflow** |

## 🛠️ Technical Architecture & Stack
- **Frontend & UI:** React, TypeScript, Tailwind CSS, Radix UI / Lucide Icons
- **Cryptography Engine:** W3C Web Cryptography API ('crypto.subtle') for SHA-256 hashing and AES-GCM encryption
- **Local Storage:** IndexedDB
- **State Management:** Zustand
- **Export Engines:** Canvas-based redaction and client-side PDF generation/compilation
- **Deployment:** Browser/PWA-oriented architecture suitable for low-connectivity workflows

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## 📋 Interactive Verification & Demonstration Path
1. Open the [OpenEdit Vault Demo](https://openedits.lovable.app/vault).
2. Open case **FIR No. 204/2026**.
3. Click **Verify Integrity** next to FIR_Signed_Copy_204_2026.pdf.
4. Click **Simulate Tamper Attack** to demonstrate a hash-mismatch alert.
5. Click **Generate BSA Certificate** to inspect the Section 63-oriented workflow.
6. Toggle **Public / Court Redacted View** to inspect the redaction presentation layer.

> Demo case data is synthetic/prototype content and must not be treated as a real investigation record.

## 🔐 Security Model at a Glance
- **Hashing:** SHA-256 provides a reproducible content fingerprint for comparison.
- **Encryption:** AES-GCM provides authenticated confidentiality when correctly implemented and key material is protected.
- **Local-first processing:** Sensitive operations can be performed in-browser to reduce unnecessary server exposure.
- **Chain of custody:** Events can bind metadata to the prior event hash, producing a verifiable sequence.
- **Redaction:** Secure exports must remove or rasterize sensitive content rather than merely overlaying a black rectangle.

Using Web Crypto does **not automatically create a zero-knowledge system**; that claim depends on the complete data, key, identity, and infrastructure architecture.

## 📜 Statutory Standards & References
- **Bharatiya Sakshya Adhiniyam, 2023 (BSA)** — electronic-record provisions including Sections 61 and 63.
- **ISO/IEC 27037:2012** — Guidelines for identification, collection, acquisition and preservation of digital evidence.
- **NIST FIPS 180-4** — Secure Hash Standard.

See [docs/BSA_2023_COMPLIANCE.md](docs/BSA_2023_COMPLIANCE.md).

## 🧭 Project Status
**SIH 2026 Prototype — Public Documentation Release**

A production deployment would additionally require formal security review, key management, identity/access controls, append-only audit infrastructure, forensic validation, operational SOPs, and legal review.

## 🤝 Team
**Krishnalabs**  
**Team Leader:** Shyamji Soni

## 📄 License
Licensed under the **Apache License 2.0**. See [LICENSE](LICENSE).