// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title KredzScoreBadge
/// @notice Non-transferable ERC-721 Soulbound Token representing a user's KREDZ Score on Base.
///         Minted by the KredzAttestationVerifier after a valid attestation is submitted.
///         One badge per address — re-minting updates the score metadata.
contract KredzScoreBadge {
    string public name = "KREDZ Score Badge";
    string public symbol = "KREDZ";

    address public immutable verifier;

    uint256 private _nextId = 1;
    mapping(address => uint256) public tokenOfOwner;
    mapping(uint256 => address) public ownerOf;
    mapping(uint256 => BadgeData) public badgeData;

    struct BadgeData {
        uint16 score;
        uint8 tier;
        uint64 timestamp;
    }

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event BadgeUpdated(address indexed owner, uint256 indexed tokenId, uint16 score, uint8 tier);

    error NotVerifier();
    error Soulbound();

    constructor(address _verifier) {
        verifier = _verifier;
    }

    /// @notice Mint or update a score badge. Called by KredzAttestationVerifier.
    function mintOrUpdate(address user, uint16 score, uint8 tier, uint64 timestamp) external {
        if (msg.sender != verifier) revert NotVerifier();

        uint256 tokenId = tokenOfOwner[user];
        if (tokenId == 0) {
            tokenId = _nextId++;
            tokenOfOwner[user] = tokenId;
            ownerOf[tokenId] = user;
            emit Transfer(address(0), user, tokenId);
        }

        badgeData[tokenId] = BadgeData(score, tier, timestamp);
        emit BadgeUpdated(user, tokenId, score, tier);
    }

    /// @notice Soulbound: transfers are blocked.
    function transferFrom(address, address, uint256) external pure { revert Soulbound(); }
    function safeTransferFrom(address, address, uint256) external pure { revert Soulbound(); }
    function safeTransferFrom(address, address, uint256, bytes calldata) external pure { revert Soulbound(); }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        BadgeData memory d = badgeData[tokenId];
        string memory tierName = d.tier == 0 ? "Anonymous" : d.tier == 1 ? "Pseudonymous" : "Full Compliance";
        return string(abi.encodePacked(
            'data:application/json;utf8,{"name":"KREDZ Score Badge","description":"Privacy-preserving credit score on Midnight, bridged to Base.","attributes":[',
            '{"trait_type":"Score","value":', _uint16ToString(d.score), '},',
            '{"trait_type":"Tier","value":"', tierName, '"},',
            '{"trait_type":"Timestamp","value":', _uint64ToString(d.timestamp), '}]}'
        ));
    }

    function _uint16ToString(uint16 v) internal pure returns (string memory) {
        if (v == 0) return "0";
        uint16 tmp = v; uint len;
        while (tmp != 0) { len++; tmp /= 10; }
        bytes memory buf = new bytes(len);
        while (v != 0) { buf[--len] = bytes1(uint8(48 + v % 10)); v /= 10; }
        return string(buf);
    }

    function _uint64ToString(uint64 v) internal pure returns (string memory) {
        if (v == 0) return "0";
        uint64 tmp = v; uint len;
        while (tmp != 0) { len++; tmp /= 10; }
        bytes memory buf = new bytes(len);
        while (v != 0) { buf[--len] = bytes1(uint8(48 + v % 10)); v /= 10; }
        return string(buf);
    }
}
