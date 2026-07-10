// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal ERC-8004 Reputation Registry interface (Base mainnet/testnet)
interface IReputationRegistry {
    function giveFeedback(
        uint256 agentId,
        uint8 score,
        string calldata tag,
        string calldata evidenceUri,
        bytes calldata agentSig
    ) external;
}

/// @title KredzAttestationVerifier
/// @notice Accepts Midnight-signed KREDZ Score attestations and writes them to the
///         ERC-8004 Reputation Registry on Base. Deployed on Base Sepolia for testnet.
///
/// Attestation format (65 bytes signed by attestationSigner):
///   bytes 0-1   : score (uint16, big-endian)
///   bytes 2-21  : user EVM address (20 bytes)
///   bytes 22-29 : timestamp (uint64, big-endian)
///   bytes 30-31 : tier (uint16, big-endian)
contract KredzAttestationVerifier {
    address public immutable attestationSigner;
    IReputationRegistry public immutable reputationRegistry;

    // ERC-8004 agent ID for KREDZ on Base (set at deploy time)
    uint256 public immutable kredzAgentId;

    // Prevent replay: track last accepted timestamp per user
    mapping(address => uint64) public lastTimestamp;

    event ScoreAttested(address indexed user, uint16 score, uint8 tier, uint64 timestamp);

    error InvalidSignature();
    error StaleAttestation();
    error AddressMismatch();

    constructor(address _signer, address _reputationRegistry, uint256 _agentId) {
        attestationSigner = _signer;
        reputationRegistry = IReputationRegistry(_reputationRegistry);
        kredzAgentId = _agentId;
    }

    /// @notice Submit a Midnight-signed score attestation to bridge it to Base.
    /// @param user       The user's Base wallet address
    /// @param score      KREDZ Score (0–1000)
    /// @param tier       Privacy tier (0/1/2)
    /// @param timestamp  Unix timestamp of the Midnight attestation
    /// @param sig        65-byte ECDSA signature from attestationSigner
    function submitAttestation(
        address user,
        uint16 score,
        uint8 tier,
        uint64 timestamp,
        bytes calldata sig
    ) external {
        if (timestamp <= lastTimestamp[user]) revert StaleAttestation();

        bytes32 digest = _buildDigest(user, score, tier, timestamp);
        address recovered = _recover(digest, sig);
        if (recovered != attestationSigner) revert InvalidSignature();

        lastTimestamp[user] = timestamp;

        // Write to ERC-8004 Reputation Registry
        // score is 0-1000; ERC-8004 expects 0-100, so we scale down with rounding
        uint8 erc8004Score = uint8((score + 5) / 10);
        string memory tag = _tierTag(tier);
        string memory evidenceUri = string(abi.encodePacked(
            "https://kredz.xyz/attestation/", _toHex(user), "/", _uint64ToString(timestamp)
        ));

        // agentSig is empty — KREDZ contract is the authorized submitter
        reputationRegistry.giveFeedback(kredzAgentId, erc8004Score, tag, evidenceUri, "");

        emit ScoreAttested(user, score, tier, timestamp);
    }

    function _buildDigest(address user, uint16 score, uint8 tier, uint64 timestamp) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            keccak256(abi.encodePacked(user, score, tier, timestamp))
        ));
    }

    function _recover(bytes32 digest, bytes calldata sig) internal pure returns (address) {
        require(sig.length == 65, "Bad sig length");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := calldataload(sig.offset)
            s := calldataload(add(sig.offset, 32))
            v := byte(0, calldataload(add(sig.offset, 64)))
        }
        return ecrecover(digest, v, r, s);
    }

    function _tierTag(uint8 tier) internal pure returns (string memory) {
        if (tier == 0) return "anonymous";
        if (tier == 1) return "pseudonymous";
        return "full-compliance";
    }

    function _toHex(address addr) internal pure returns (string memory) {
        bytes memory b = abi.encodePacked(addr);
        bytes memory hex_ = new bytes(42);
        hex_[0] = '0'; hex_[1] = 'x';
        bytes memory alphabet = "0123456789abcdef";
        for (uint i = 0; i < 20; i++) {
            hex_[2 + i * 2] = alphabet[uint8(b[i] >> 4)];
            hex_[3 + i * 2] = alphabet[uint8(b[i] & 0x0f)];
        }
        return string(hex_);
    }

    function _uint64ToString(uint64 v) internal pure returns (string memory) {
        if (v == 0) return "0";
        uint64 tmp = v;
        uint len;
        while (tmp != 0) { len++; tmp /= 10; }
        bytes memory buf = new bytes(len);
        while (v != 0) { buf[--len] = bytes1(uint8(48 + v % 10)); v /= 10; }
        return string(buf);
    }
}
