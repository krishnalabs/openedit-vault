// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OpenEditAssetLedger
 * @notice Enterprise & Defence Digital Asset Provenance and Access Control Contract
 * @dev Smart India Hackathon 2026 - Problem Statement SIH26125
 *      Organization: Bharat Electronics Limited (BEL), Ministry of Defence
 *      Team: Krishnalabs
 */
contract OpenEditAssetLedger {

    // Classification levels for defence and enterprise assets
    enum ClassificationLevel {
        UNCLASSIFIED,
        CONFIDENTIAL,
        RESTRICTED,
        TOP_SECRET
    }

    // Role definitions
    enum UserRole {
        NONE,
        AUDITOR,
        SECURITY_ANALYST,
        DEFENCE_COMMANDER,
        ADMIN
    }

    struct DigitalAsset {
        bytes32 assetId;          // Keccak256 or UUID hash
        bytes32 genesisSha256;    // SHA-256 fingerprint generated at ingestion
        string assetName;         // e.g. Tactical_Drone_Avionics_Firmware_v4.2.bin
        string ownerDID;          // W3C DID (e.g. did:bel:0x7F2a98B1...)
        ClassificationLevel classification;
        uint256 registeredAt;
        bytes32 merkleRoot;       // Merkle root of audit log entries
        bool isFrozen;            // Frozen if tamper is flagged
        bool exists;
    }

    address public admin;

    // DID to Role mapping
    mapping(string => UserRole) public didRoles;

    // Cryptographic DID-to-Address and Address-to-DID bindings to prevent spoofing
    mapping(string => address) public didToAddress;
    mapping(address => string) public addressToDID;

    // AssetId to DigitalAsset mapping
    mapping(bytes32 => DigitalAsset) public assets;

    // AssetId to Accessor DID to permission grant mapping
    mapping(bytes32 => mapping(string => bool)) public assetAccessGrants;

    // Events for immutable on-chain audit trail
    event AssetRegistered(
        bytes32 indexed assetId,
        bytes32 indexed genesisSha256,
        string assetName,
        string ownerDID,
        ClassificationLevel classification,
        uint256 timestamp
    );

    event AccessGranted(
        bytes32 indexed assetId,
        string indexed accessorDID,
        string granterDID,
        uint256 timestamp
    );

    event AccessRevoked(
        bytes32 indexed assetId,
        string indexed accessorDID,
        string revokerDID,
        uint256 timestamp
    );

    event TamperAlertLogged(
        bytes32 indexed assetId,
        bytes32 reportedHash,
        string reporterDID,
        uint256 timestamp
    );

    event AssetFrozen(bytes32 indexed assetId, string reason, uint256 timestamp);
    event AssetUnfrozen(bytes32 indexed assetId, string resolverDID, string reason, uint256 timestamp);
    event MerkleRootAnchored(bytes32 indexed assetId, bytes32 merkleRoot, uint256 timestamp);
    event DIDBound(string indexed did, address indexed account, uint256 timestamp);
    event DIDUnbound(string indexed did, address indexed account, uint256 timestamp);

    modifier onlyAdmin() {
        require(msg.sender == admin, "OpenEdit: Caller is not system admin");
        _;
    }

    constructor() {
        admin = msg.sender;
        // Seed default BEL roles for testing & consortium bootstrapping
        didRoles["did:bel:0x7F2a98B1A45C3b9E"] = UserRole.DEFENCE_COMMANDER;
        didRoles["did:bel:analyst:lab-09"] = UserRole.SECURITY_ANALYST;
        didRoles["did:bel:auditor:ext-03"] = UserRole.AUDITOR;
    }

    /**
     * @notice Bind a W3C DID to an authorized Ethereum address
     */
    function bindDID(string memory did, address account) external onlyAdmin {
        require(account != address(0), "OpenEdit: Invalid account address");
        require(bytes(did).length > 0, "OpenEdit: DID cannot be empty");

        // Clear existing reverse binding if previously set
        address previousAccount = didToAddress[did];
        if (previousAccount != address(0) && previousAccount != account) {
            delete addressToDID[previousAccount];
            emit DIDUnbound(did, previousAccount, block.timestamp);
        }

        didToAddress[did] = account;
        addressToDID[account] = did;

        emit DIDBound(did, account, block.timestamp);
    }

    /**
     * @notice Unbind a W3C DID from an Ethereum address
     */
    function unbindDID(string memory did) external onlyAdmin {
        address boundAccount = didToAddress[did];
        require(boundAccount != address(0), "OpenEdit: DID is not bound");

        delete addressToDID[boundAccount];
        delete didToAddress[did];

        emit DIDUnbound(did, boundAccount, block.timestamp);
    }

    /**
     * @notice Set role for a specific DID
     */
    function setRole(string memory did, UserRole role) external onlyAdmin {
        didRoles[did] = role;
    }

    /**
     * @notice Set role and bind DID to account in a single atomic transaction
     */
    function setRoleAndBindDID(
        string memory did,
        UserRole role,
        address account
    ) external onlyAdmin {
        require(account != address(0), "OpenEdit: Invalid account address");
        require(bytes(did).length > 0, "OpenEdit: DID cannot be empty");

        didRoles[did] = role;
        didToAddress[did] = account;
        addressToDID[account] = did;

        emit DIDBound(did, account, block.timestamp);
    }

    /**
     * @dev Internal helper verifying that msg.sender is authorized to act under callerDID
     */
    function _verifyCallerDID(string memory callerDID) internal view {
        if (msg.sender == admin) {
            return; // System admin has superuser emergency authority
        }

        address boundAddress = didToAddress[callerDID];
        if (boundAddress != address(0)) {
            require(msg.sender == boundAddress, "OpenEdit: Caller not authorized for this DID");
        } else {
            // If the DID is not explicitly bound, an arbitrary address cannot claim it
            revert("OpenEdit: Unbound DID requires admin caller");
        }
    }

    /**
     * @notice Register a newly ingested high-security digital asset
     */
    function registerAsset(
        bytes32 assetId,
        bytes32 genesisSha256,
        string memory assetName,
        string memory ownerDID,
        ClassificationLevel classification,
        bytes32 initialMerkleRoot
    ) external {
        require(!assets[assetId].exists, "OpenEdit: Asset already registered");

        _verifyCallerDID(ownerDID);

        require(
            didRoles[ownerDID] == UserRole.DEFENCE_COMMANDER ||
            didRoles[ownerDID] == UserRole.SECURITY_ANALYST ||
            msg.sender == admin,
            "OpenEdit: Unauthorized to register classified assets"
        );

        assets[assetId] = DigitalAsset({
            assetId: assetId,
            genesisSha256: genesisSha256,
            assetName: assetName,
            ownerDID: ownerDID,
            classification: classification,
            registeredAt: block.timestamp,
            merkleRoot: initialMerkleRoot,
            isFrozen: false,
            exists: true
        });

        // Grant owner implicit access
        assetAccessGrants[assetId][ownerDID] = true;

        emit AssetRegistered(
            assetId,
            genesisSha256,
            assetName,
            ownerDID,
            classification,
            block.timestamp
        );
    }

    /**
     * @notice Verify client-side calculated hash against immutable on-chain record
     */
    function verifyIntegrity(bytes32 assetId, bytes32 computedSha256)
        external
        view
        returns (bool isAuthentic, bool isFrozen, bytes32 expectedHash)
    {
        require(assets[assetId].exists, "OpenEdit: Asset not found");
        DigitalAsset memory asset = assets[assetId];
        bool matchSuccess = (asset.genesisSha256 == computedSha256);
        return (matchSuccess, asset.isFrozen, asset.genesisSha256);
    }

    /**
     * @notice Report a hash mismatch (tamper detection alert) and automatically freeze access
     */
    function reportTamper(
        bytes32 assetId,
        bytes32 mismatchHash,
        string memory reporterDID
    ) external {
        require(assets[assetId].exists, "OpenEdit: Asset not found");
        require(!assets[assetId].isFrozen, "OpenEdit: Asset is already frozen");
        require(
            mismatchHash != assets[assetId].genesisSha256,
            "OpenEdit: Reported hash matches authentic genesis hash"
        );

        assets[assetId].isFrozen = true;

        emit TamperAlertLogged(assetId, mismatchHash, reporterDID, block.timestamp);
        emit AssetFrozen(assetId, "Cryptographic hash mismatch alert", block.timestamp);
    }

    /**
     * @notice Resolve tamper alert and unfreeze asset after forensic verification
     */
    function resolveTamperAndUnfreeze(
        bytes32 assetId,
        string memory resolverDID,
        string memory resolutionReason
    ) external {
        require(assets[assetId].exists, "OpenEdit: Asset not found");
        require(assets[assetId].isFrozen, "OpenEdit: Asset is not frozen");

        _verifyCallerDID(resolverDID);

        require(
            didRoles[resolverDID] == UserRole.DEFENCE_COMMANDER || msg.sender == admin,
            "OpenEdit: Insufficient privilege to unfreeze asset"
        );

        assets[assetId].isFrozen = false;
        emit AssetUnfrozen(assetId, resolverDID, resolutionReason, block.timestamp);
    }

    /**
     * @notice Grant access to a specific DID under RBAC policy
     */
    function grantAccess(
        bytes32 assetId,
        string memory targetDID,
        string memory callerDID
    ) external {
        require(assets[assetId].exists, "OpenEdit: Asset not found");
        require(!assets[assetId].isFrozen, "OpenEdit: Asset is frozen due to security alert");

        _verifyCallerDID(callerDID);

        require(
            didRoles[callerDID] == UserRole.DEFENCE_COMMANDER || msg.sender == admin,
            "OpenEdit: Insufficient privilege to grant asset access"
        );

        assetAccessGrants[assetId][targetDID] = true;
        emit AccessGranted(assetId, targetDID, callerDID, block.timestamp);
    }

    /**
     * @notice Revoke access from a specific DID under RBAC policy
     */
    function revokeAccess(
        bytes32 assetId,
        string memory targetDID,
        string memory revokerDID
    ) external {
        require(assets[assetId].exists, "OpenEdit: Asset not found");

        _verifyCallerDID(revokerDID);

        require(
            didRoles[revokerDID] == UserRole.DEFENCE_COMMANDER || msg.sender == admin,
            "OpenEdit: Insufficient privilege to revoke asset access"
        );

        assetAccessGrants[assetId][targetDID] = false;
        emit AccessRevoked(assetId, targetDID, revokerDID, block.timestamp);
    }

    /**
     * @notice Anchor a batch of audit events via Merkle root
     */
    function anchorAuditMerkleRoot(
        bytes32 assetId,
        bytes32 newMerkleRoot,
        string memory callerDID
    ) external {
        require(assets[assetId].exists, "OpenEdit: Asset not found");
        require(!assets[assetId].isFrozen, "OpenEdit: Asset is frozen due to security alert");

        _verifyCallerDID(callerDID);

        require(
            didRoles[callerDID] == UserRole.DEFENCE_COMMANDER ||
            didRoles[callerDID] == UserRole.SECURITY_ANALYST ||
            msg.sender == admin,
            "OpenEdit: Unauthorized to anchor audit state"
        );

        assets[assetId].merkleRoot = newMerkleRoot;
        emit MerkleRootAnchored(assetId, newMerkleRoot, block.timestamp);
    }
}
