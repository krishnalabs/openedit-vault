// OpenEdit Vault — BEL Defence Asset & DID Integrity Demo (SIH26125)
const GENESIS_BYTES = new Uint8Array([
  0x7f, 0x45, 0x4c, 0x46, 0x02, 0x01, 0x01, 0x00, 0x54, 0x61, 0x63, 0x74, 0x69, 0x63, 0x61, 0x6c,
  0x5f, 0x44, 0x72, 0x6f, 0x6e, 0x65, 0x5f, 0x46, 0x69, 0x72, 0x6d, 0x77, 0x61, 0x72, 0x65, 0x21
]);

let currentBytes = new Uint8Array(GENESIS_BYTES);
let genesisHash = "";

async function sha256Hex(buffer) {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
}

const ROLES = {
  COMMANDER: {
    did: "did:bel:0x7F2a98B1A45C3b9E",
    clearance: "TOP SECRET · Level 4",
    class: "pill success"
  },
  ANALYST: {
    did: "did:bel:analyst:lab-09",
    clearance: "RESTRICTED · Level 2",
    class: "pill info"
  },
  AUDITOR: {
    did: "did:bel:auditor:ext-03",
    clearance: "AUDIT-ONLY · Level 1",
    class: "pill warning"
  }
};

const BLOCKS = [
  { height: "#104,289", event: "CONTRACT_DEPLOYED", hash: "0x3f1a...88c2", did: "did:bel:admin", time: "10:40:12 UTC" },
  { height: "#104,290", event: "ASSET_MINTED (Drone_Avionics_Firmware)", hash: "0x89e2...bb41", did: "did:bel:0x7F2a...98B1", time: "10:42:55 UTC" },
  { height: "#104,291", event: "RBAC_GRANT (Analyst_Lab09)", hash: "0x94c1...aa03", did: "did:bel:0x7F2a...98B1", time: "10:45:00 UTC" }
];

async function init() {
  genesisHash = await sha256Hex(GENESIS_BYTES);
  document.getElementById("ledgerHash").innerText = genesisHash;
  document.getElementById("currentHash").innerText = genesisHash;

  // Render Ledger
  const chainEl = document.getElementById("ledgerChain");
  chainEl.innerHTML = BLOCKS.map(b => `
    <div class="ledger-block" style="border: 1px solid #1e293b; background: #0f172a; padding: 12px; margin-bottom: 8px; border-radius: 6px; font-size: 13px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
        <strong style="color: #38bdf8;">Block ${b.height} · ${b.event}</strong>
        <span style="color: #94a3b8; font-size: 11px;">${b.time}</span>
      </div>
      <div style="font-family: monospace; color: #cbd5e1; font-size: 11px;">Merkle Root: ${b.hash} | Signer: ${b.did}</div>
    </div>
  `).join("");

  // Role selector
  document.getElementById("roleSelect").addEventListener("change", (e) => {
    const roleData = ROLES[e.target.value] || ROLES.COMMANDER;
    document.getElementById("activeDID").innerText = roleData.did;
    const badge = document.getElementById("clearanceBadge");
    badge.innerText = roleData.clearance;
    badge.className = roleData.class;
  });

  // Action buttons
  document.getElementById("btnVerify").addEventListener("click", async () => {
    currentBytes = new Uint8Array(GENESIS_BYTES);
    const curr = await sha256Hex(currentBytes);
    document.getElementById("currentHash").innerText = curr;
    document.getElementById("tamperAlertBox").style.display = "none";
    const pill = document.getElementById("integrityPill");
    pill.innerText = "GENESIS PROVENANCE VERIFIED ✓";
    pill.className = "pill success";
  });

  document.getElementById("btnTamper").addEventListener("click", async () => {
    // Flip 1 byte
    currentBytes = new Uint8Array(GENESIS_BYTES);
    currentBytes[12] = 0xAA; // altered byte
    const tamperedHash = await sha256Hex(currentBytes);
    document.getElementById("currentHash").innerText = tamperedHash;
    document.getElementById("tamperAlertBox").style.display = "block";
    const pill = document.getElementById("integrityPill");
    pill.innerText = "TAMPER DETECTED ❌ (ASSET FROZEN)";
    pill.className = "pill danger";
  });

  document.getElementById("btnLedger").addEventListener("click", () => {
    document.getElementById("ledgerView").scrollIntoView({ behavior: "smooth" });
  });
}

window.addEventListener("DOMContentLoaded", init);
