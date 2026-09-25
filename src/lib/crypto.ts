/**
 * OpenEdit Vault - Core Cryptographic Primitives
 * Compliant with NIST FIPS 180-4 (SHA-256) and W3C Web Cryptography API
 * Built for Smart India Hackathon 2026 | PSID: SIH26190
 */

export interface GenesisHashRecord {
  fileHash: string;
  algorithm: 'SHA-256';
  timestamp: string;
  officerId: string;
  docketId: string;
}

export interface VerificationResult {
  isValid: boolean;
  computedHash: string;
  originHash: string;
  tamperDetected: boolean;
  verifiedAt: string;
}

/**
 * Computes an immutable SHA-256 genesis hash for an evidentiary document
 */
export async function computeGenesisHash(
  fileBuffer: ArrayBuffer,
  officerId: string,
  docketId: string
): Promise<GenesisHashRecord> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return {
    fileHash,
    algorithm: 'SHA-256',
    timestamp: new Date().toISOString(),
    officerId,
    docketId,
  };
}

/**
 * Validates document buffer against registered genesis record to detect post-seizure tampering
 */
export async function verifyEvidenceIntegrity(
  fileBuffer: ArrayBuffer,
  expectedHash: string
): Promise<VerificationResult> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const isValid = computedHash.toLowerCase() === expectedHash.toLowerCase();

  return {
    isValid,
    computedHash,
    originHash: expectedHash,
    tamperDetected: !isValid,
    verifiedAt: new Date().toISOString(),
  };
}

/**
 * Simulates bit-flip or metadata tamper attack for demonstration
 */
export function simulateTamperPayload(fileBuffer: ArrayBuffer): ArrayBuffer {
  const copy = fileBuffer.slice(0);
  const view = new Uint8Array(copy);
  if (view.length > 0) {
    view[0] ^= 0xff; // Invert first byte to simulate tamper
  }
  return copy;
}
