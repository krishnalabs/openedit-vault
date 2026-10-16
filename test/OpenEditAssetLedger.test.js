const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OpenEditAssetLedger Test Suite", function () {
  let OpenEditAssetLedger;
  let ledger;
  let admin, commander, analyst, auditor, outsider, newAccount;

  // Pre-seeded DIDs from contract constructor
  const COMMANDER_DID = "did:bel:0x7F2a98B1A45C3b9E";
  const ANALYST_DID = "did:bel:analyst:lab-09";
  const AUDITOR_DID = "did:bel:auditor:ext-03";
  const UNREGISTERED_DID = "did:bel:unregistered:00";

  // Test Asset Constants
  const ASSET_ID_1 = ethers.keccak256(ethers.toUtf8Bytes("DRONE_FIRMWARE_V4"));
  const ASSET_ID_2 = ethers.keccak256(ethers.toUtf8Bytes("RADAR_CALIBRATION_SPEC"));
  const GENESIS_HASH_1 = ethers.keccak256(ethers.toUtf8Bytes("GENESIS_BYTES_FIRMWARE"));
  const GENESIS_HASH_2 = ethers.keccak256(ethers.toUtf8Bytes("GENESIS_BYTES_RADAR"));
  const TAMPERED_HASH = ethers.keccak256(ethers.toUtf8Bytes("TAMPERED_PAYLOAD_BYTE_FLIPPED"));
  const MERKLE_ROOT_INIT = ethers.keccak256(ethers.toUtf8Bytes("MERKLE_ROOT_BLOCK_100"));
  const MERKLE_ROOT_UPDATE_1 = ethers.keccak256(ethers.toUtf8Bytes("MERKLE_ROOT_BLOCK_200"));
  const MERKLE_ROOT_UPDATE_2 = ethers.keccak256(ethers.toUtf8Bytes("MERKLE_ROOT_BLOCK_300"));

  const CLASSIFICATION_TOP_SECRET = 3; // TOP_SECRET enum
  const CLASSIFICATION_RESTRICTED = 2; // RESTRICTED enum

  beforeEach(async function () {
    [admin, commander, analyst, auditor, outsider, newAccount] = await ethers.getSigners();
    OpenEditAssetLedger = await ethers.getContractFactory("OpenEditAssetLedger");
    ledger = await OpenEditAssetLedger.deploy();
    await ledger.waitForDeployment();

    // Bind official consortium test DIDs to authorized test signers
    await ledger.connect(admin).bindDID(COMMANDER_DID, commander.address);
    await ledger.connect(admin).bindDID(ANALYST_DID, analyst.address);
    await ledger.connect(admin).bindDID(AUDITOR_DID, auditor.address);
  });

  // =========================================================================
  // 1. DID ROLE CHECKS & CRYPTOGRAPHIC BINDINGS
  // =========================================================================
  describe("1. DID Role Checks & Identity Bindings", function () {
    it("should initialize default seeded roles correctly", async function () {
      expect(await ledger.didRoles(COMMANDER_DID)).to.equal(3); // DEFENCE_COMMANDER
      expect(await ledger.didRoles(ANALYST_DID)).to.equal(2);   // SECURITY_ANALYST
      expect(await ledger.didRoles(AUDITOR_DID)).to.equal(1);   // AUDITOR
      expect(await ledger.didRoles(UNREGISTERED_DID)).to.equal(0); // NONE
    });

    it("should correctly record DID-to-address and address-to-DID bindings", async function () {
      expect(await ledger.didToAddress(COMMANDER_DID)).to.equal(commander.address);
      expect(await ledger.addressToDID(commander.address)).to.equal(COMMANDER_DID);
      expect(await ledger.didToAddress(ANALYST_DID)).to.equal(analyst.address);
      expect(await ledger.addressToDID(analyst.address)).to.equal(ANALYST_DID);
    });

    it("should allow admin to assign, update, and revoke roles via setRole", async function () {
      const customDID = "did:bel:specialist:42";
      await expect(ledger.connect(admin).setRole(customDID, 2)).to.not.be.reverted;
      expect(await ledger.didRoles(customDID)).to.equal(2);

      await ledger.connect(admin).setRole(customDID, 3);
      expect(await ledger.didRoles(customDID)).to.equal(3);

      await ledger.connect(admin).setRole(customDID, 0);
      expect(await ledger.didRoles(customDID)).to.equal(0);
    });

    it("should prevent non-admin from modifying roles via setRole", async function () {
      await expect(
        ledger.connect(outsider).setRole(UNREGISTERED_DID, 3)
      ).to.be.revertedWith("OpenEdit: Caller is not system admin");

      await expect(
        ledger.connect(commander).setRole(UNREGISTERED_DID, 3)
      ).to.be.revertedWith("OpenEdit: Caller is not system admin");
    });

    it("should allow admin to bind and unbind DIDs, rejecting unauthorized bindings", async function () {
      const specialistDID = "did:bel:drone:expert-01";

      // Non-admin binding attempt should revert
      await expect(
        ledger.connect(outsider).bindDID(specialistDID, newAccount.address)
      ).to.be.revertedWith("OpenEdit: Caller is not system admin");

      // Admin binds new DID
      await expect(ledger.connect(admin).bindDID(specialistDID, newAccount.address))
        .to.emit(ledger, "DIDBound");

      expect(await ledger.didToAddress(specialistDID)).to.equal(newAccount.address);
      expect(await ledger.addressToDID(newAccount.address)).to.equal(specialistDID);

      // Admin unbinds DID
      await expect(ledger.connect(admin).unbindDID(specialistDID))
        .to.emit(ledger, "DIDUnbound");

      expect(await ledger.didToAddress(specialistDID)).to.equal(ethers.ZeroAddress);
      expect(await ledger.addressToDID(newAccount.address)).to.equal("");
    });

    it("should allow admin to set role and bind DID atomically", async function () {
      const fieldDID = "did:bel:field:operator-12";
      await expect(
        ledger.connect(admin).setRoleAndBindDID(fieldDID, 2, newAccount.address)
      ).to.emit(ledger, "DIDBound");

      expect(await ledger.didRoles(fieldDID)).to.equal(2);
      expect(await ledger.didToAddress(fieldDID)).to.equal(newAccount.address);
    });

    it("should reject asset registration by unauthorized DIDs (Auditor or Unregistered)", async function () {
      await expect(
        ledger.connect(auditor).registerAsset(
          ASSET_ID_1,
          GENESIS_HASH_1,
          "Radar_Spec.bin",
          AUDITOR_DID,
          CLASSIFICATION_RESTRICTED,
          MERKLE_ROOT_INIT
        )
      ).to.be.revertedWith("OpenEdit: Unauthorized to register classified assets");

      // Outsider with unbound DID
      await expect(
        ledger.connect(outsider).registerAsset(
          ASSET_ID_1,
          GENESIS_HASH_1,
          "Radar_Spec.bin",
          UNREGISTERED_DID,
          CLASSIFICATION_RESTRICTED,
          MERKLE_ROOT_INIT
        )
      ).to.be.revertedWith("OpenEdit: Unbound DID requires admin caller");
    });

    it("should prevent unauthorized callers from spoofing privileged DIDs", async function () {
      // Outsider attempts to use Commander DID to register asset
      await expect(
        ledger.connect(outsider).registerAsset(
          ASSET_ID_1,
          GENESIS_HASH_1,
          "Tampered_Drone.bin",
          COMMANDER_DID,
          CLASSIFICATION_TOP_SECRET,
          MERKLE_ROOT_INIT
        )
      ).to.be.revertedWith("OpenEdit: Caller not authorized for this DID");
    });

    it("should allow authorized roles (Defence Commander and Security Analyst) to register assets", async function () {
      await expect(
        ledger.connect(commander).registerAsset(
          ASSET_ID_1,
          GENESIS_HASH_1,
          "Drone_Firmware.bin",
          COMMANDER_DID,
          CLASSIFICATION_TOP_SECRET,
          MERKLE_ROOT_INIT
        )
      ).to.not.be.reverted;

      await expect(
        ledger.connect(analyst).registerAsset(
          ASSET_ID_2,
          GENESIS_HASH_2,
          "Radar_Spec.bin",
          ANALYST_DID,
          CLASSIFICATION_RESTRICTED,
          MERKLE_ROOT_INIT
        )
      ).to.not.be.reverted;
    });

    it("should allow admin address to register assets regardless of DID role", async function () {
      const adminAssetId = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ASSET"));
      await expect(
        ledger.connect(admin).registerAsset(
          adminAssetId,
          GENESIS_HASH_1,
          "Admin_Confidential.bin",
          "did:bel:admin",
          CLASSIFICATION_TOP_SECRET,
          MERKLE_ROOT_INIT
        )
      ).to.not.be.reverted;
    });

    it("should restrict grantAccess to Defence Commander or Admin", async function () {
      await ledger.connect(commander).registerAsset(
        ASSET_ID_1,
        GENESIS_HASH_1,
        "Drone_Firmware.bin",
        COMMANDER_DID,
        CLASSIFICATION_TOP_SECRET,
        MERKLE_ROOT_INIT
      );

      const recipientDID = "did:bel:contractor:77";

      // Analyst cannot grant access
      await expect(
        ledger.connect(analyst).grantAccess(ASSET_ID_1, recipientDID, ANALYST_DID)
      ).to.be.revertedWith("OpenEdit: Insufficient privilege to grant asset access");

      // Auditor cannot grant access
      await expect(
        ledger.connect(auditor).grantAccess(ASSET_ID_1, recipientDID, AUDITOR_DID)
      ).to.be.revertedWith("OpenEdit: Insufficient privilege to grant asset access");

      // Outsider claiming Commander DID should be rejected by cryptographic binding
      await expect(
        ledger.connect(outsider).grantAccess(ASSET_ID_1, recipientDID, COMMANDER_DID)
      ).to.be.revertedWith("OpenEdit: Caller not authorized for this DID");

      // Commander CAN grant access
      await expect(
        ledger.connect(commander).grantAccess(ASSET_ID_1, recipientDID, COMMANDER_DID)
      ).to.emit(ledger, "AccessGranted");

      expect(await ledger.assetAccessGrants(ASSET_ID_1, recipientDID)).to.be.true;

      // Admin CAN grant access
      const secondRecipient = "did:bel:contractor:88";
      await expect(
        ledger.connect(admin).grantAccess(ASSET_ID_1, secondRecipient, "did:bel:admin")
      ).to.not.be.reverted;
      expect(await ledger.assetAccessGrants(ASSET_ID_1, secondRecipient)).to.be.true;
    });

    it("should support revokeAccess by Defence Commander or Admin", async function () {
      await ledger.connect(commander).registerAsset(
        ASSET_ID_1,
        GENESIS_HASH_1,
        "Drone_Firmware.bin",
        COMMANDER_DID,
        CLASSIFICATION_TOP_SECRET,
        MERKLE_ROOT_INIT
      );

      const recipientDID = "did:bel:contractor:77";
      await ledger.connect(commander).grantAccess(ASSET_ID_1, recipientDID, COMMANDER_DID);
      expect(await ledger.assetAccessGrants(ASSET_ID_1, recipientDID)).to.be.true;

      // Analyst cannot revoke
      await expect(
        ledger.connect(analyst).revokeAccess(ASSET_ID_1, recipientDID, ANALYST_DID)
      ).to.be.revertedWith("OpenEdit: Insufficient privilege to revoke asset access");

      // Commander revokes access
      await expect(
        ledger.connect(commander).revokeAccess(ASSET_ID_1, recipientDID, COMMANDER_DID)
      ).to.emit(ledger, "AccessRevoked");
      expect(await ledger.assetAccessGrants(ASSET_ID_1, recipientDID)).to.be.false;
    });
  });

  // =========================================================================
  // 2. ASSET HASH ANCHORING
  // =========================================================================
  describe("2. Asset Hash Anchoring", function () {
    it("should anchor genesis SHA-256 hash and emit AssetRegistered with exact metadata", async function () {
      const tx = await ledger.connect(commander).registerAsset(
        ASSET_ID_1,
        GENESIS_HASH_1,
        "Tactical_Drone_Avionics_Firmware_v4.2.bin",
        COMMANDER_DID,
        CLASSIFICATION_TOP_SECRET,
        MERKLE_ROOT_INIT
      );

      const block = await ethers.provider.getBlock(tx.blockNumber);

      await expect(tx)
        .to.emit(ledger, "AssetRegistered")
        .withArgs(
          ASSET_ID_1,
          GENESIS_HASH_1,
          "Tactical_Drone_Avionics_Firmware_v4.2.bin",
          COMMANDER_DID,
          CLASSIFICATION_TOP_SECRET,
          block.timestamp
        );

      const asset = await ledger.assets(ASSET_ID_1);
      expect(asset.assetId).to.equal(ASSET_ID_1);
      expect(asset.genesisSha256).to.equal(GENESIS_HASH_1);
      expect(asset.assetName).to.equal("Tactical_Drone_Avionics_Firmware_v4.2.bin");
      expect(asset.ownerDID).to.equal(COMMANDER_DID);
      expect(asset.classification).to.equal(CLASSIFICATION_TOP_SECRET);
      expect(asset.merkleRoot).to.equal(MERKLE_ROOT_INIT);
      expect(asset.isFrozen).to.be.false;
      expect(asset.exists).to.be.true;
      expect(asset.registeredAt).to.equal(block.timestamp);

      expect(await ledger.assetAccessGrants(ASSET_ID_1, COMMANDER_DID)).to.be.true;
    });

    it("should prevent duplicate registration of the same assetId", async function () {
      await ledger.connect(commander).registerAsset(
        ASSET_ID_1,
        GENESIS_HASH_1,
        "Asset_A.bin",
        COMMANDER_DID,
        CLASSIFICATION_TOP_SECRET,
        MERKLE_ROOT_INIT
      );

      await expect(
        ledger.connect(commander).registerAsset(
          ASSET_ID_1,
          GENESIS_HASH_1,
          "Duplicate_Asset.bin",
          COMMANDER_DID,
          CLASSIFICATION_TOP_SECRET,
          MERKLE_ROOT_INIT
        )
      ).to.be.revertedWith("OpenEdit: Asset already registered");
    });

    it("should accurately verify integrity when computed hash matches anchored genesis hash", async function () {
      await ledger.connect(commander).registerAsset(
        ASSET_ID_1,
        GENESIS_HASH_1,
        "Asset_A.bin",
        COMMANDER_DID,
        CLASSIFICATION_TOP_SECRET,
        MERKLE_ROOT_INIT
      );

      const [isAuthentic, isFrozen, expectedHash] = await ledger.verifyIntegrity(
        ASSET_ID_1,
        GENESIS_HASH_1
      );

      expect(isAuthentic).to.be.true;
      expect(isFrozen).to.be.false;
      expect(expectedHash).to.equal(GENESIS_HASH_1);
    });

    it("should flag discrepancy when computed hash diverges from anchored genesis hash", async function () {
      await ledger.connect(commander).registerAsset(
        ASSET_ID_1,
        GENESIS_HASH_1,
        "Asset_A.bin",
        COMMANDER_DID,
        CLASSIFICATION_TOP_SECRET,
        MERKLE_ROOT_INIT
      );

      const [isAuthentic, isFrozen, expectedHash] = await ledger.verifyIntegrity(
        ASSET_ID_1,
        TAMPERED_HASH
      );

      expect(isAuthentic).to.be.false;
      expect(isFrozen).to.be.false;
      expect(expectedHash).to.equal(GENESIS_HASH_1);
    });

    it("should revert verifyIntegrity for non-existent assetId", async function () {
      const nonExistentId = ethers.keccak256(ethers.toUtf8Bytes("NON_EXISTENT"));
      await expect(
        ledger.verifyIntegrity(nonExistentId, GENESIS_HASH_1)
      ).to.be.revertedWith("OpenEdit: Asset not found");
    });
  });

  // =========================================================================
  // 3. TAMPER-TRIGGERED FREEZES & RECOVERY
  // =========================================================================
  describe("3. Tamper-Triggered Freezes & Lifecycle", function () {
    beforeEach(async function () {
      await ledger.connect(commander).registerAsset(
        ASSET_ID_1,
        GENESIS_HASH_1,
        "Drone_Firmware.bin",
        COMMANDER_DID,
        CLASSIFICATION_TOP_SECRET,
        MERKLE_ROOT_INIT
      );
    });

    it("should freeze asset and emit TamperAlertLogged & AssetFrozen events upon reportTamper", async function () {
      const reporterDID = ANALYST_DID;
      const tx = await ledger.connect(analyst).reportTamper(ASSET_ID_1, TAMPERED_HASH, reporterDID);
      const block = await ethers.provider.getBlock(tx.blockNumber);

      await expect(tx)
        .to.emit(ledger, "TamperAlertLogged")
        .withArgs(ASSET_ID_1, TAMPERED_HASH, reporterDID, block.timestamp);

      await expect(tx)
        .to.emit(ledger, "AssetFrozen")
        .withArgs(ASSET_ID_1, "Cryptographic hash mismatch alert", block.timestamp);

      const asset = await ledger.assets(ASSET_ID_1);
      expect(asset.isFrozen).to.be.true;

      const [isAuthentic, isFrozen, expectedHash] = await ledger.verifyIntegrity(
        ASSET_ID_1,
        GENESIS_HASH_1
      );
      expect(isFrozen).to.be.true;
    });

    it("should reject tamper report if reported hash matches genuine genesis hash", async function () {
      await expect(
        ledger.connect(analyst).reportTamper(ASSET_ID_1, GENESIS_HASH_1, ANALYST_DID)
      ).to.be.revertedWith("OpenEdit: Reported hash matches authentic genesis hash");
    });

    it("should prevent duplicate reportTamper calls on an already frozen asset", async function () {
      await ledger.connect(analyst).reportTamper(ASSET_ID_1, TAMPERED_HASH, ANALYST_DID);

      await expect(
        ledger.connect(analyst).reportTamper(ASSET_ID_1, TAMPERED_HASH, ANALYST_DID)
      ).to.be.revertedWith("OpenEdit: Asset is already frozen");
    });

    it("should immediately block grantAccess when asset is frozen", async function () {
      await ledger.connect(analyst).reportTamper(ASSET_ID_1, TAMPERED_HASH, ANALYST_DID);

      await expect(
        ledger.connect(commander).grantAccess(ASSET_ID_1, "did:bel:contractor:99", COMMANDER_DID)
      ).to.be.revertedWith("OpenEdit: Asset is frozen due to security alert");

      await expect(
        ledger.connect(admin).grantAccess(ASSET_ID_1, "did:bel:contractor:99", "did:bel:admin")
      ).to.be.revertedWith("OpenEdit: Asset is frozen due to security alert");
    });

    it("should revert reportTamper on non-existent assetId", async function () {
      const dummyId = ethers.keccak256(ethers.toUtf8Bytes("UNKNOWN_ASSET"));
      await expect(
        ledger.connect(analyst).reportTamper(dummyId, TAMPERED_HASH, ANALYST_DID)
      ).to.be.revertedWith("OpenEdit: Asset not found");
    });

    it("should allow Defence Commander or Admin to resolve tamper alert and unfreeze asset", async function () {
      await ledger.connect(analyst).reportTamper(ASSET_ID_1, TAMPERED_HASH, ANALYST_DID);
      expect((await ledger.assets(ASSET_ID_1)).isFrozen).to.be.true;

      // Analyst cannot unfreeze
      await expect(
        ledger.connect(analyst).resolveTamperAndUnfreeze(
          ASSET_ID_1,
          ANALYST_DID,
          "False alarm after FSL forensic inspection"
        )
      ).to.be.revertedWith("OpenEdit: Insufficient privilege to unfreeze asset");

      // Commander resolves and unfreezes
      await expect(
        ledger.connect(commander).resolveTamperAndUnfreeze(
          ASSET_ID_1,
          COMMANDER_DID,
          "Hardware signature re-verified in secure room"
        )
      ).to.emit(ledger, "AssetUnfrozen");

      expect((await ledger.assets(ASSET_ID_1)).isFrozen).to.be.false;

      // After unfreezing, grantAccess succeeds again
      await expect(
        ledger.connect(commander).grantAccess(ASSET_ID_1, "did:bel:contractor:99", COMMANDER_DID)
      ).to.not.be.reverted;
    });
  });

  // =========================================================================
  // 4. MERKLE ROOT UPDATES
  // =========================================================================
  describe("4. Merkle Root Updates", function () {
    beforeEach(async function () {
      await ledger.connect(commander).registerAsset(
        ASSET_ID_1,
        GENESIS_HASH_1,
        "Drone_Firmware.bin",
        COMMANDER_DID,
        CLASSIFICATION_TOP_SECRET,
        MERKLE_ROOT_INIT
      );
    });

    it("should allow Defence Commander to update audit Merkle root and emit MerkleRootAnchored", async function () {
      const tx = await ledger.connect(commander).anchorAuditMerkleRoot(
        ASSET_ID_1,
        MERKLE_ROOT_UPDATE_1,
        COMMANDER_DID
      );
      const block = await ethers.provider.getBlock(tx.blockNumber);

      await expect(tx)
        .to.emit(ledger, "MerkleRootAnchored")
        .withArgs(ASSET_ID_1, MERKLE_ROOT_UPDATE_1, block.timestamp);

      const asset = await ledger.assets(ASSET_ID_1);
      expect(asset.merkleRoot).to.equal(MERKLE_ROOT_UPDATE_1);
    });

    it("should allow Security Analyst to update audit Merkle root", async function () {
      await expect(
        ledger.connect(analyst).anchorAuditMerkleRoot(
          ASSET_ID_1,
          MERKLE_ROOT_UPDATE_2,
          ANALYST_DID
        )
      ).to.emit(ledger, "MerkleRootAnchored");

      const asset = await ledger.assets(ASSET_ID_1);
      expect(asset.merkleRoot).to.equal(MERKLE_ROOT_UPDATE_2);
    });

    it("should allow Admin to update audit Merkle root", async function () {
      const adminRoot = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_BATCH_ROOT"));
      await expect(
        ledger.connect(admin).anchorAuditMerkleRoot(ASSET_ID_1, adminRoot, "did:bel:admin")
      ).to.not.be.reverted;

      const asset = await ledger.assets(ASSET_ID_1);
      expect(asset.merkleRoot).to.equal(adminRoot);
    });

    it("should reject Merkle root updates by Auditor or unauthorized DIDs", async function () {
      await expect(
        ledger.connect(auditor).anchorAuditMerkleRoot(ASSET_ID_1, MERKLE_ROOT_UPDATE_1, AUDITOR_DID)
      ).to.be.revertedWith("OpenEdit: Unauthorized to anchor audit state");

      await expect(
        ledger.connect(outsider).anchorAuditMerkleRoot(ASSET_ID_1, MERKLE_ROOT_UPDATE_1, UNREGISTERED_DID)
      ).to.be.revertedWith("OpenEdit: Unbound DID requires admin caller");
    });

    it("should prevent arbitrary callers from spoofing authorized DIDs to anchor Merkle root", async function () {
      // Outsider attempts to use Analyst DID to anchor root
      await expect(
        ledger.connect(outsider).anchorAuditMerkleRoot(ASSET_ID_1, MERKLE_ROOT_UPDATE_1, ANALYST_DID)
      ).to.be.revertedWith("OpenEdit: Caller not authorized for this DID");
    });

    it("should prevent Merkle root updates when asset is frozen due to security alert", async function () {
      // Freeze asset
      await ledger.connect(analyst).reportTamper(ASSET_ID_1, TAMPERED_HASH, ANALYST_DID);

      // Attempt Merkle root update on frozen asset
      await expect(
        ledger.connect(commander).anchorAuditMerkleRoot(
          ASSET_ID_1,
          MERKLE_ROOT_UPDATE_1,
          COMMANDER_DID
        )
      ).to.be.revertedWith("OpenEdit: Asset is frozen due to security alert");
    });

    it("should revert anchorAuditMerkleRoot for non-existent assetId", async function () {
      const phantomId = ethers.keccak256(ethers.toUtf8Bytes("PHANTOM"));
      await expect(
        ledger.connect(commander).anchorAuditMerkleRoot(phantomId, MERKLE_ROOT_UPDATE_1, COMMANDER_DID)
      ).to.be.revertedWith("OpenEdit: Asset not found");
    });
  });
});
