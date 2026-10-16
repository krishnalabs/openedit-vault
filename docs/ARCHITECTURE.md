# OpenEdit Vault — System Architecture & Security Specification
### *Smart India Hackathon 2026 | Problem Statement ID: SIH26125*
> **Blockchain-Based Secure Platform for Identity, Access Control, and Digital Asset Management**  
> **Target Organization:** Bharat Electronics Limited (BEL), Ministry of Defence  
> **Team:** Krishnalabs | **Theme:** Information Security / Digital Asset Security

---

## 1. Architectural Philosophy: Hybrid Zero-Trust Architecture

OpenEdit Vault solves the primary dilemma of enterprise and defence blockchain adoption:
> **How to achieve immutable blockchain provenance without suffering public network gas fees, network latency, or exposing classified payload data to open nodes.**

Our solution utilizes a **Dual-Layer Hybrid Security Paradigm**:
1. **Execution & Privacy Layer (Client-Side Edge)**: Files are processed, parsed, hashed, and redacted exclusively in the client execution sandbox using **W3C WebCrypto API** and WebAssembly. Unencrypted binaries and schematics never touch an untrusted cloud server.
2. **Consortium Provenance Layer (Blockchain)**: The `OpenEditAssetLedger.sol` smart contract immutably records asset genesis digests (SHA-256), cryptographic Merkle roots of audit events, and W3C DID-bound Role-Based Access Control (RBAC) grants.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT EXECUTION LAYER                          │
│               (Air-Gapped In-Memory WebCrypto Sandbox)                 │
├────────────────────────────────────────────────────────────────────────┤
│  Ingested Digital Asset (Schematic, Firmware, Telemetry CSV)           │
│         │                                                              │
│         ▼                                                              │
│  [SHA-256 Genesis Fingerprint] ──► [AES-256-GCM Envelope Encryption]  │
│         │                                                              │
│         ▼                                                              │
│  [Dynamic RBAC Enforcement]    ──► [Client Redaction Engine]           │
└─────────┬──────────────────────────────────────────────────────────────┘
          │ (Zero Plaintext Exposed)
          ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN PROVENANCE LAYER                         │
│               (OpenEditAssetLedger.sol / EVM Consortium)                │
├────────────────────────────────────────────────────────────────────────┤
│  • W3C DID Registry: did:bel:0x7F2a... ◄──► Role Tier (Commander/Auditor)
│  • Asset Registry: Keccak256(UUID) ──► Genesis SHA-256 Digest          │
│  • Merkle Audit Roots: Root(Block #104,291)                           │
│  • Tamper Alert Event Emitter: Auto-freeze on SHA-256 discrepancy      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Cryptographic Security Flows

### A. Asset Registration & Provenance Binding
1. User with valid DID clearance selects an asset: `Tactical_Drone_Avionics_Firmware_v4.2.bin`.
2. Browser calculates:
   $$H_{genesis} = 	ext{SHA256}(	ext{AssetBytes})$$
3. Transaction submitted to `OpenEditAssetLedger.registerAsset(...)` anchoring $H_{genesis}$, classification level (`TOP_SECRET`), and DID ownership.

### B. 1-Byte Tamper Detection & Auto-Freezing
1. When any user opens an asset, the client engine recomputes:
   $$H_{current} = 	ext{SHA256}(	ext{CurrentBytes})$$
2. Calls `verifyIntegrity(assetId, computedHash)` against the smart contract:
   - If $H_{current} == H_{genesis}$ ➔ **STATUS: AUTHENTIC ✓**
   - If $H_{current} 
e H_{genesis}$ ➔ **TAMPER DETECTED ❌**. Client emits `reportTamper(...)`, triggering an on-chain `AssetFrozen` event and terminating unauthorized access.

### C. Role-Based Access Control (RBAC) Hierarchy
- **Defence Commander (`DEFENCE_COMMANDER`)**: Full cryptographic authority (Register, Decrypt, Re-key, Grant/Revoke access).
- **Security Analyst (`SECURITY_ANALYST`)**: Verification authority (Inspect metadata, run integrity verification, update Merkle roots).
- **External Auditor (`AUDITOR`)**: Read-only verification (Tamper test execution, audit log inspection, watermarked export only).

---

## 3. Deployment & Live Verification
- **Smart Contract Source:** `contracts/OpenEditAssetLedger.sol`
- **Interactive Live Vault:** [https://openedits.lovable.app/vault](https://openedits.lovable.app/vault)
- **Official Pricing & Procurement:** [https://openedits.lovable.app/pricing](https://openedits.lovable.app/pricing)
