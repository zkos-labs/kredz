// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/KredzAttestationVerifier.sol";
import "../src/KredzScoreBadge.sol";

contract Deploy is Script {
    function run() external {
        address attestationSigner = vm.envAddress("ATTESTATION_SIGNER_ADDRESS");
        address reputationRegistry = vm.envOr(
            "ERC8004_REPUTATION_REGISTRY",
            address(0x8004BAa17C55a88189AE136b182e5fdA19dE9b63)
        );
        uint256 agentId = vm.envOr("KREDZ_AGENT_ID", uint256(1));

        vm.startBroadcast();

        KredzAttestationVerifier verifier = new KredzAttestationVerifier(
            attestationSigner,
            reputationRegistry,
            agentId
        );
        console.log("KredzAttestationVerifier:", address(verifier));

        KredzScoreBadge badge = new KredzScoreBadge(address(verifier));
        console.log("KredzScoreBadge:", address(badge));

        vm.stopBroadcast();

        console.log("\nAdd to kredz-frontend/.env:");
        console.log(string.concat("VITE_VERIFIER_ADDRESS=", vm.toString(address(verifier))));
        console.log(string.concat("VITE_BADGE_ADDRESS=", vm.toString(address(badge))));
    }
}
