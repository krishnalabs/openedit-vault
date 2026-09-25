# BSA 2023 — Electronic Records & Section 63 Mapping

## 1. Scope

This document maps the OpenEdit Vault prototype to the Bharatiya Sakshya Adhiniyam, 2023 (BSA) provisions concerning electronic records.

It is a technical compliance mapping for SIH 2026 demonstration purposes and is **not legal advice**.

## 2. Section 61 — Electronic or Digital Record

The BSA contains provisions governing the evidentiary treatment of electronic or digital records. OpenEdit Vault therefore emphasizes explicit handling of source identity, content integrity, custody history, acquisition metadata, and certification workflow.

## 3. Section 63 — Admissibility of Electronic Records

Section 63 provides the statutory framework for admissibility of electronic records and includes certificate-related requirements. The prototype therefore exposes a **Section 63-oriented certificate generator** that can include:

- case/evidence identifiers;
- description of the electronic record;
- cryptographic hash;
- relevant device/system details;
- declarant/officer details;
- declaration and signature fields;
- verification metadata.

## 4. What the Prototype Demonstrates

1. Evidence record identification.
2. SHA-256 content hashing.
3. Current-vs-recorded hash comparison.
4. Hash-mismatch indication after simulated alteration.
5. Custody-event sequencing.
6. Structured certificate generation.
7. Redacted presentation of sensitive information.

These features support a workflow; they do not automatically determine admissibility.

## 5. What the Prototype Does Not Prove

A generated certificate PDF is not by itself proof that every legal requirement has been satisfied.

A real deployment must establish, as applicable, the statutory facts represented in the certificate, identity and authority of the declarant, reliability and operation of the relevant system, acquisition and preservation procedures, evidence integrity throughout the lifecycle, and all applicable court/departmental rules and SOPs.

## 6. Why Hashes Matter

A cryptographic hash provides a compact integrity reference:

```text
Evidence bytes
     ↓
 SHA-256
     ↓
Digest
```

Recomputing the digest allows detection of differences between compared bytes.

A matching hash does **not** independently prove who created the file, whether acquisition was lawful, or whether the source is authentic. Those are separate evidentiary questions.

## 7. Chain of Custody vs. Section 63

These are related but distinct:

- **Chain of custody:** tracks possession, handling, movement, processing, and custody events.
- **Section 63 certificate:** addresses statutory certification requirements for electronic records.

OpenEdit Vault combines them in one workflow because operational traceability and certificate preparation solve different parts of the evidence lifecycle.

## 8. Certificate Design Principles

| Field | Purpose |
| --- | --- |
| Case / FIR Number | Links the record to the case |
| Evidence ID | Uniquely identifies the exhibit |
| Source Device / System | Identifies source context |
| Acquisition Date / Time | Preserves acquisition chronology |
| Hash Algorithm | Declares the digest method |
| Hash Value | Provides an integrity reference |
| Declarant | Identifies the certifying person |
| Capacity / Authority | Establishes the role of the declarant |
| Signature / Approval | Captures the formal attestation step |

## 9. Legal Review Requirement

Statutes, rules, official forms, judicial directions, and departmental procedures can change. Before operational use, exact wording and required certificate fields should be reviewed against the current BSA and applicable authoritative guidance by qualified legal and forensic professionals.

## 10. References

- Bharatiya Sakshya Adhiniyam, 2023 — official statutory text.
- Applicable rules, notifications, and judicial directions relating to electronic records and certification.
- Relevant forensic and evidence-handling SOPs.

For the SIH prototype, read this document together with [`ARCHITECTURE.md`](ARCHITECTURE.md).
