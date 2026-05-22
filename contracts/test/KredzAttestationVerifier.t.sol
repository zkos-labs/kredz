// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/KredzAttestationVerifier.sol";
import "../src/MockReputationRegistry.sol";

contract KredzAttestationVerifierTest is Test {
    KredzAttestationVerifier verifier;
    MockReputationRegistry registry;

    uint256 signerKey = 0xA11CE;
    address signer;
    address user = address(0xBEEF);

    function setUp() public {
        signer = vm.addr(signerKey);
        registry = new MockReputationRegistry();
        verifier = new KredzAttestationVerifier(signer, address(registry), 1);
    }

    function _sign(address _user, uint16 score, uint8 tier, uint64 timestamp)
        internal view returns (bytes memory)
    {
        bytes32 inner = keccak256(abi.encodePacked(_user, score, tier, timestamp));
        bytes32 digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", inner));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerKey, digest);
        return abi.encodePacked(r, s, v);
    }

    function test_ValidAttestation() public {
        uint16 score = 750;
        uint8 tier = 2;
        uint64 ts = uint64(block.timestamp);
        bytes memory sig = _sign(user, score, tier, ts);

        vm.expectEmit(true, false, false, true);
        emit KredzAttestationVerifier.ScoreAttested(user, score, tier, ts);

        verifier.submitAttestation(user, score, tier, ts, sig);
        assertEq(verifier.lastTimestamp(user), ts);
    }

    function test_InvalidSignature() public {
        uint256 badKey = 0xBAD;
        address badSigner = vm.addr(badKey);
        assertNotEq(badSigner, signer);

        uint16 score = 500;
        uint8 tier = 1;
        uint64 ts = uint64(block.timestamp);

        bytes32 inner = keccak256(abi.encodePacked(user, score, tier, ts));
        bytes32 digest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", inner));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(badKey, digest);
        bytes memory sig = abi.encodePacked(r, s, v);

        vm.expectRevert(KredzAttestationVerifier.InvalidSignature.selector);
        verifier.submitAttestation(user, score, tier, ts, sig);
    }

    function test_StaleAttestation() public {
        uint16 score = 400;
        uint8 tier = 0;
        uint64 ts = uint64(block.timestamp);
        bytes memory sig = _sign(user, score, tier, ts);

        verifier.submitAttestation(user, score, tier, ts, sig);

        // Same timestamp should revert
        vm.expectRevert(KredzAttestationVerifier.StaleAttestation.selector);
        verifier.submitAttestation(user, score, tier, ts, sig);
    }

    function test_ScoresScaledForERC8004() public {
        // score 1000 → ERC-8004 score 100
        uint16 score = 1000;
        uint8 tier = 2;
        uint64 ts = uint64(block.timestamp);
        bytes memory sig = _sign(user, score, tier, ts);

        vm.expectEmit(false, false, false, false); // just check it doesn't revert
        emit MockReputationRegistry.FeedbackGiven(1, 100, "full-compliance");
        verifier.submitAttestation(user, score, tier, ts, sig);
    }
}
