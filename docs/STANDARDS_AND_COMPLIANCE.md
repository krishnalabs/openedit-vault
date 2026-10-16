# OpenEdit Vault — Standards, Compliance & Regulatory Architecture
### *Smart India Hackathon 2026 | Problem Statement ID: SIH26125 (Bharat Electronics Limited)*

This document defines the cryptographic, architectural, and statutory compliance framework governing **OpenEdit Vault** for enterprise and defence-grade deployments under **Bharat Electronics Limited (BEL)** and associated aerospace/defence ecosystems.

---

## 1. Statutory & International Standards Matrix

| Standard / Framework | Regulatory Authority | Implementation in OpenEdit Vault | Status |
| :--- | :--- | :--- | :--- |
| **W3C Decentralized Identifiers (DIDs) v1.0** | World Wide Web Consortium (W3C) | Identity binding via `did:bel:<address>` with cryptographic key rotation and credential verification. | **Implemented** |
| **NIST SP 800-207** | National Institute of Standards & Technology | Zero-Trust Architecture: "Never trust, always verify" with client-side computation and zero server plaintext storage. | **Implemented** |
| **NIST SP 800-53 Rev. 5** | NIST Information Security | Access Control (AC-3, AC-6 least privilege) and System Integrity (SI-7 software, firmware and information integrity). | **Implemented** |
| **ISO/IEC 27001:2022 (A.8.24)** | International Organization for Standardization | Use of Cryptography: In-memory client-side WebCrypto SHA-256 genesis hashing + AES-256-GCM symmetric envelope encryption. | **Implemented** |
| **EVM / ERC-1155 Compatible Ledger** | Ethereum / Private Consortium (Hyperledger Besu / Polygon PoS) | Smart contract `OpenEditAssetLedger.sol` anchoring asset registration, RBAC grants, and tamper alerts on-chain. | **Implemented** |
| **GeM (Government e-Marketplace)** | Ministry of Commerce & Industry, GoI | Designed for indigenous defence procurement under Make in India / Atmanirbhar Bharat guidelines. | **Compliant Architecture** |

---

## 2. Cryptographic Security Invariants

1. **Client-Side Genesis Hashing**:
   - Every digital asset ingested into the vault is fingerprinted in the client execution environment (browser WebCrypto API) before any network transmission.
   - Hash Algorithm: `SHA-256` (FIPS 180-4 standard).

2. **Immutable On-Chain Anchor**:
   - The genesis hash is registered into `OpenEditAssetLedger.sol` along with the owning entity's W3C DID, asset metadata, and security classification tier.
   - Any future verification call checks current byte stream hash against this immutable on-chain record.

3. **1-Byte Tamper Alert Engine**:
   - If even a single byte of an asset (e.g. drone telemetry CSV, radar firmware binary, or contract PDF) is altered post-ingestion, the hash mismatch is flagged immediately.
   - The contract triggers an automatic `AssetFrozen` event to prevent unauthorized downstream execution or dissemination.

4. **Zero-Knowledge Air-Gap Operations**:
   - The core file processing, viewing, and redaction engine executes fully offline via client-side WebAssembly and HTML5 Canvas.
   - No sensitive defence payload is ever sent unencrypted to cloud infrastructure.

---

## 3. Commercial & Procurement Fit
In alignment with our live commercial tiering at [https://openedits.lovable.app/pricing](https://openedits.lovable.app/pricing):
- **SIH 2026 Jury & Evaluator Access**: 100% Free full-featured access across all demo tools.
- **Enterprise & Defence Tier**: On-premise air-gapped deployment, dedicated hardware security module (HSM) key management, and GeM procurement onboarding.
