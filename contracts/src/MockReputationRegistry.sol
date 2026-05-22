// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @dev Minimal mock for ERC-8004 Reputation Registry used in tests
contract MockReputationRegistry {
    event FeedbackGiven(uint256 agentId, uint8 score, string tag);

    function giveFeedback(
        uint256 agentId,
        uint8 score,
        string calldata tag,
        string calldata,
        bytes calldata
    ) external {
        emit FeedbackGiven(agentId, score, tag);
    }
}
