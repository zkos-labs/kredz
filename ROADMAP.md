# KREDZ Roadmap

**Status: Testing and pre-launch. Awaiting further development and funding.**

---

## Current Phase: Testnet Validation

Kredz is a multichain credit identity protocol spanning Midnight, Base, Solana, Canton, and Cardano. All major components are built, compiled, or deployed at the testnet level. The project is not yet ready for mainnet users. No real funds are at risk.

### Completed

| Component | Status | Notes |
|---|---|---|
| Midnight Compact contract (5 circuits) | Compiled | `kredz_score_profile.compact` compiles with ZK keys generated. Needs manual deploy to Preprod via 1AM wallet. |
| Frontend (kredz.xyz) | Live | Landing page, wallet linking, tier selection, dashboard, and literacy modules. Uses mock contract API until Midnight deploy completes. |
| Base Sepolia EVM contracts | Deployed | `KredzAttestationVerifier` at `0x318Ecad2b...1Dd`. `KredzScoreBadge` at `0xc583b1aa...3fd`. 4/4 Foundry tests passing. |
| Solana Devnet Anchor program | Deployed | `kredz_score_badge` at `x6MWmEFP...cXXMM`. Integration tests written. |
| Canton DAML contracts | Code complete | Score registry, query, subscription, and 5 DAML Script tests written. Blocked on Nix and Docker environment setup. |
| Cardano wallet history | Integrated | Blockfrost API integration for partner chain wallet history queries. |
| Relayer (Midnight to Base) | Built | Node.js service that polls Midnight indexer and submits ECDSA attestations to Base. Not yet tested end to end. |
| Scoring engine backend | Scaffolded | Express API, Python XGBoost model bridge, SumSub KYC integration. Returns placeholder data until connected to live chains. |
| EffectStream sync engine | Built | Multichain deterministic scoring state machine across 5 networks. |

### In Progress

| Task | Priority | Blocker |
|---|---|---|
| Deploy Compact contract to Midnight Preprod | High | Manual step via 1AM browser wallet |
| End to end attestation flow (Midnight to Base) | High | Needs live Midnight contract address |
| Wire relayer to live contracts | High | Depends on both Midnight and Base deploys |
| Connect scoring engine to live chain data | Medium | Needs deployed contracts and indexer access |
| Canton localnet setup (Nix and Docker) | Low | Environment complexity |

---

## What Needs Funding

The following work exceeds solo builder capacity and requires dedicated development time:

| Initiative | Why funding is needed |
|---|---|
| Midnight mainnet deployment and security audit | Compact contract audit by a ZK security firm before mainnet. Estimated 3 to 5 weeks of specialist review. |
| Scoring model training and validation | Real training data pipeline, model backtesting, fairness testing across demographic groups. Requires data engineering and ML engineering time. |
| TEE enclave integration | Deploy scoring engine inside AWS Nitro Enclave with remote attestation. Replaces trust in the operator with trust in hardware. Estimated 4 to 6 weeks. |
| Consumer mobile app | React Native wallet for credit score access on mobile. Essential for emerging market users who are mobile only. |
| Halal compliance certification | Sharia review of the scoring model, ZK circuit design, and token mechanics. Required for Islamic finance integration via Tawf Foundation. |
| Bittensor subnet for DeFi literacy | Decentralized evaluation of literacy modules via subnet miners and validators. Removes single judge bias from quiz grading. |
| Institutional onboarding and BD | Partnerships with DeFi lending protocols, credit bureaus, and halal certification bodies across SEA and MENA. |

---

## Funding Applications

| Program | Status | Notes |
|---|---|---|
| Midnight Build Club Fellowship Cohort 2 | Applied (June 2026) | Primary target. Covers Midnight contract deployment, ZK circuit optimization, and ecosystem integration. |
| Retro9000 (Avalanche) | Preparing | Agent skills toolkit and MCP server for Avalanche L1 development. Indirectly benefits kredz if Avalanche is added as a sixth chain. |
| UNICEF Venture Fund | Applied (via tabah protocol) | Emergency aid distribution with ZK privacy. Adjacent technology with shared Midnight infrastructure. |

---

## Next Milestones

### Short term (no funding required)

1. Deploy `kredz_score_profile` to Midnight Preprod via 1AM wallet
2. Complete end to end attestation loop (score on Midnight, badge on Base)
3. Wire relayer to live contracts and run first automated attestation
4. Connect scoring engine to live Midnight indexer and EVM RPCs
5. Deploy V1 frontend with live contract calls (replace mock API)

### Medium term (partial funding)

6. TEE scoring engine deployment (AWS Nitro Enclave)
7. Compact contract security audit
8. Scoring model training on real user data with fairness validation
9. Consumer mobile app (React Native) for iOS and Android
10. Halal compliance certification via Tawf Foundation Sharia Council

### Long term (full funding)

11. Midnight mainnet deployment
12. Bittensor subnet for decentralized DeFi literacy evaluation
13. Institutional API for credit bureaus, DeFi protocols, and Islamic banks
14. Avalanche L1 integration as sixth supported chain
15. Full TEE plus Bittensor hybrid trust architecture

---

## Important Note

Kredz is in active testing and is not ready for production use. No real user funds or identity data should be submitted. The project is maintained by a solo builder and progress depends on successful funding applications. All timelines are estimates and subject to change.

For questions or collaboration: kredz.xyz or open an issue on GitHub.
