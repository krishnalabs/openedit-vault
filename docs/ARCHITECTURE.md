# OpenEdit Vault — Architecture & Security Boundaries

## 1. Purpose

OpenEdit Vault is a browser-first prototype for sensitive investigation documents and demonstrations of cryptographic integrity verification, hash-linked custody events, redaction workflows, client-side encryption primitives, and Section 63-oriented certification output.

The design goal is **verifiability without pretending that a browser application alone is an immutable government evidence system**.

## 2. Logical Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    OpenEdit Vault UI                        │
│ React + TypeScript + Tailwind                              │
├─────────────────────────────────────────────────────────────┤
│ Case Workspace                                              │
│  ├─ Evidence Registry                                       │
│  ├─ Integrity Verification                                  │
│  ├─ Chain-of-Custody Timeline                               │
│  ├─ Redaction / Presentation Views                          │
│  └─ Section 63 Certificate Workflow                         │
├─────────────────────────────────────────────────────────────┤
│ Browser Security Layer                                      │
│  ├─ Web Crypto API (SHA-256 / AES-GCM)                     │
│  ├─ Canvas / PDF processing                                 │
│  └─ IndexedDB local persistence                             │
└─────────────────────────────────────────────────────────────┘
```

## 3. Evidence Integrity Flow

For evidence artifact `E`:

```text
digest_0 = SHA256(E)
```

During verification:

```text
digest_current = SHA256(E_current)
verify := (digest_current === digest_0)
```

A byte-level change should produce a different SHA-256 digest with overwhelming practical probability.

## 4. Hash-Linked Custody Ledger

A custody event can be modeled as:

```text
event_n = {
  sequence,
  timestamp,
  actor,
  action,
  evidence_id,
  previous_event_hash,
  metadata,
  event_hash
}
```

where `event_hash` is the SHA-256 digest of a canonical representation of the event fields excluding `event_hash` itself. The next event references that digest as `previous_event_hash`.

```text
Genesis Evidence Hash
        │
        ▼
Block 01 ──hash──► Block 02 ──hash──► Block 03 ──hash──► Block 04
```

This is a **hash-linked ledger**, not a blockchain. It is tamper-evident when the verifier has an independently trusted anchor. A purely client-side ledger does not become immutable merely because its entries are hashed.

## 5. Redaction Security Boundary

A secure redaction export should create a new artifact in which sensitive content is actually removed, replaced, or rasterized.

Unsafe:

```text
Original Text + Black Rectangle Overlay
            ↓
Sensitive bytes may still exist
```

Safer:

```text
Original Content
      ↓
Redaction Transform
      ↓
New Sanitized Artifact
      ↓
New SHA-256 Digest
```

The exported artifact should be independently inspected to confirm that hidden layers, metadata, OCR text, or embedded objects do not retain the redacted information.

## 6. Encryption Boundary

AES-GCM is authenticated encryption. A production implementation must define key generation, storage, wrapping, rotation, recovery, device enrollment, revocation, and compromise response.

Using Web Crypto does **not automatically create a zero-knowledge system**. Zero-knowledge requires an end-to-end architecture in which plaintext and key material are not exposed to unintended service operators.

## 7. Offline-First Model

Selected workflows can persist locally:

```text
User Device
   ├── IndexedDB
   ├── Web Crypto
   └── Local Editor State
```

For production, synchronization must be an authenticated, conflict-aware protocol with explicit authority over accepted custody events.

## 8. Trust Zones

- **Presentation:** UI displaying case/evidence status.
- **Cryptographic processing:** browser cryptographic APIs.
- **Local persistence:** IndexedDB on the endpoint.
- **External authority:** production identity, key custody, policy, audit retention, and government integrations.

The browser should not be treated as the sole trust anchor for high-stakes evidence management.

## 9. Threat Model

Relevant threats include compromised endpoints, malicious extensions, stolen devices, copied local storage, credential theft, malicious insiders, clock manipulation, replayed synchronization events, incomplete redaction, compromised certificate-signing authority, and administrator privilege abuse.

Controls should be mapped to threats rather than relying on a single cryptographic primitive.

## 10. Production Hardening Roadmap

1. Hardware-backed or managed key custody.
2. Strong identity and role-based access control.
3. Append-only remote audit infrastructure.
4. Trusted timestamping and clock-drift detection.
5. Device attestation where appropriate.
6. Offline event signatures with authenticated synchronization.
7. Formal forensic validation procedures.
8. Independent penetration testing and cryptographic review.
9. Evidence retention / legal hold controls.
10. Government and judicial integration under approved SOPs.

## 11. Security Disclaimer

OpenEdit Vault is a prototype. Hashing, encryption, and UI controls do not automatically establish statutory admissibility, evidentiary authenticity, or immutable custody. Those properties depend on implementation details, operational process, identity, trusted infrastructure, forensic methodology, and applicable law.
