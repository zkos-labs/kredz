// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IERC721 is IERC165 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function setApprovalForAll(address operator, bool approved) external;
    function getApproved(uint256 tokenId) external view returns (address operator);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

/// @title KredzScoreBadge
/// @notice Non-transferable ERC-721 Soulbound Token representing a user's KREDZ Score on Base.
///         Minted by the KredzAttestationVerifier after a valid attestation is submitted.
///         One badge per address — re-minting updates the score metadata.
contract KredzScoreBadge is IERC721 {
    string public name = "KREDZ Score Badge";
    string public symbol = "KREDZ";

    address public immutable verifier;

    uint256 private _nextId = 1;
    mapping(address => uint256) public tokenOfOwner;
    mapping(uint256 => address) private _ownerOf;
    mapping(uint256 => BadgeData) public badgeData;

    struct BadgeData {
        uint16 score;
        uint8 tier;
        uint64 timestamp;
    }

    event BadgeUpdated(address indexed owner, uint256 indexed tokenId, uint16 score, uint8 tier);

    error NotVerifier();
    error Soulbound();
    error InvalidTokenId();
    error TransferNotAllowed();
    error ApprovalNotAllowed();

    constructor(address _verifier) {
        verifier = _verifier;
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == 0x01ffc9a7  // ERC165
            || interfaceId == 0x80ac58cd  // ERC721
            || interfaceId == 0x5b5e139f; // ERC721Metadata
    }

    function balanceOf(address owner) external view returns (uint256) {
        if (owner == address(0)) revert InvalidTokenId();
        return tokenOfOwner[owner] != 0 ? 1 : 0;
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        address owner = _ownerOf[tokenId];
        if (owner == address(0)) revert InvalidTokenId();
        return owner;
    }

    function approve(address, uint256) external pure { revert ApprovalNotAllowed(); }
    function setApprovalForAll(address, bool) external pure { revert ApprovalNotAllowed(); }
    function getApproved(uint256) external pure returns (address) { revert ApprovalNotAllowed(); }
    function isApprovedForAll(address, address) external pure returns (bool) { return false; }

    /// @notice Mint or update a score badge. Called by KredzAttestationVerifier.
    function mintOrUpdate(address user, uint16 score, uint8 tier, uint64 timestamp) external {
        if (msg.sender != verifier) revert NotVerifier();

        uint256 tokenId = tokenOfOwner[user];
        if (tokenId == 0) {
            tokenId = _nextId++;
            tokenOfOwner[user] = tokenId;
            _ownerOf[tokenId] = user;
            emit Transfer(address(0), user, tokenId);
        }

        badgeData[tokenId] = BadgeData(score, tier, timestamp);
        emit BadgeUpdated(user, tokenId, score, tier);
    }

    /// @notice Soulbound: transfers are blocked.
    function transferFrom(address, address, uint256) external pure { revert TransferNotAllowed(); }
    function safeTransferFrom(address, address, uint256) external pure { revert TransferNotAllowed(); }
    function safeTransferFrom(address, address, uint256, bytes calldata) external pure { revert TransferNotAllowed(); }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        BadgeData memory d = badgeData[tokenId];
        string memory tierName = d.tier == 0 ? "Anonymous" : d.tier == 1 ? "Pseudonymous" : "Full Compliance";
        return string(abi.encodePacked(
            'data:application/json;base64,',
            _base64Encode(bytes(abi.encodePacked(
                '{"name":"KREDZ Score Badge","description":"Privacy-preserving credit score on Midnight, bridged to Base.","attributes":[',
                '{"trait_type":"Score","value":', _uint16ToString(d.score), '},',
                '{"trait_type":"Tier","value":"', tierName, '"},',
                '{"trait_type":"Timestamp","value":', _uint64ToString(d.timestamp), '}]}'
            )))
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

    string constant _TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        uint256 len = data.length;
        if (len == 0) return "";
        uint256 outputLen = 4 * ((len + 2) / 3);
        bytes memory result = new bytes(outputLen);
        uint256 i;
        uint256 j;
        while (i < len) {
            uint256 a = uint8(data[i]) << 16;
            uint256 b = (i + 1 < len ? uint8(data[i + 1]) : 0) << 8;
            uint256 c = i + 2 < len ? uint8(data[i + 2]) : 0;
            uint256 triple = a | b | c;
            result[j] = bytes(_TABLE)[(triple >> 18) & 0x3f];
            result[j + 1] = bytes(_TABLE)[(triple >> 12) & 0x3f];
            result[j + 2] = (i + 1 < len) ? bytes(_TABLE)[(triple >> 6) & 0x3f] : "=";
            result[j + 3] = (i + 2 < len) ? bytes(_TABLE)[triple & 0x3f] : "=";
            i += 3;
            j += 4;
        }
        return string(result);
    }
}
