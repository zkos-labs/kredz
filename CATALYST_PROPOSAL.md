# Cardano Catalyst Proposal — kredz.xyz

## Proposal Title

kredz: Privacy-Preserving Credit Identity Protocol for Cardano and Midnight

## Requested Funds

[To be determined — typical Catalyst OpenDev range: 50,000-200,000 ADA]

## Duration

6 months

---

## Proposal Summary (TL;DR)

1.4 billion adults globally are unbanked. Hundreds of millions more transact via mobile wallets but hold no formal credit file. Meanwhile, these same users are increasingly active on-chain. kredz gives them a portable credit score built from their on-chain behavior, ZK-attested financial data, and financial literacy, all while keeping their raw data private.

kredz is built on Midnight (Cardano's ZK partner chain) and already has a working React frontend, compiled Compact ZK contracts (6 circuits), and multichain bridges to Base, Solana, and Cardano. Catalyst funding would accelerate the final steps to ship a live demo on Midnight testnet with real ZK proofs and Cardano Blockfrost wallet history analysis.

---

## Problem Statement

The Cardano ecosystem has no privacy-preserving credit identity layer. DeFi lending protocols on Cardano and Midnight lack a standard way to assess borrower creditworthiness without demanding full identity disclosure. Traditional credit bureaus cannot score the 1.4 billion unbanked adults who are increasingly active on-chain. Existing solutions (Spectral Finance, Cred Protocol) are EVM-centric and offer no ZK privacy or Cardano integration.

## Solution

kredz is a privacy-preserving credit identity protocol built on Midnight (Cardano's zero-knowledge partner chain). It computes a KREDZ Score (0-1000) from three signal layers:

1. **On-chain signals** (40%) — wallet history across Midnight, Cardano (via Blockfrost), and EVM chains
2. **ZK-KYC signals** (40%) — real-world financial attributes proven via ZK circuits without raw data exposure
3. **Financial literacy** (20%) — gamified modules with XP and time-decay scoring

Users control their privacy through three tiers: Anonymous (no KYC), Pseudonymous (one ZK attribute), and Full Compliance (full ZK-KYC bundle).

## Why Cardano Catalyst

kredz is Cardano-native by design:

- **Midnight is Cardano's ZK partner chain** — every Compact contract deployed on Midnight is part of the Cardano ecosystem
- **Blockfrost integration** — kredz already uses Cardano's Blockfrost API for Layer 1 wallet history analysis
- **1AM wallet** — the user-facing wallet is Cardano/Midnight compatible, replacing the previous Lace integration
- **ERC-8004 bridge** — kredz connects Midnight identity to the broader EVM ecosystem, making Cardano reputation portable
- **Open source** — code is public at github.com/kredz-labs/kredz under Apache 2.0

## Current State (Built)

| Component | Status |
|-----------|--------|
| React frontend (dark cinematic UI) | Built |
| Compact ZK contracts (6 circuits) | Compiled with compact 0.5.1, ZK keys generated |
| 1AM wallet integration (dust-free) | Built |
| Cardano Blockfrost Layer 1 scoring | Backend stub ready |
| Base EVM bridge (Foundry, 4/4 tests) | Built |
| Solana SVM bridge (Anchor) | Compiled |
| Canton/Zenith EVM bridge | Written |
| EffectStream multichain sync | Scaffolded |
| MAIS MIP (agent identity standard) | Submitted to midnight-improvement-proposals |

## What Catalyst Funding Enables

| Milestone | Deliverable | Timeline |
|-----------|------------|----------|
| **M1: Testnet deployment** | Deploy kredz.compact to Midnight testnet with real ZK proofs. Live user flow: connect wallet, select tier, build score. | Month 1-2 |
| **M2: Cardano wallet history** | Wire Blockfrost API for real Layer 1 scoring. Users with Cardano transaction history get scored on their actual on-chain behavior. | Month 2-3 |
| **M3: Financial literacy launch** | Publish 5+ modules on Midnight. Open to Cardano and Midnight communities. Gamification with XP and time-decay scoring. | Month 3-4 |
| **M4: Live demo with lending protocol** | Integrate KREDZ Score API with at least one Midnight or Cardano DeFi lending protocol for undercollateralized lending. | Month 4-5 |
| **M5: Open Metrics Dashboard** | Public dashboard tracking KREDZ Scores across Cardano and Midnight, anonymized. Community governance for score parameters. | Month 5-6 |

## Impact on Cardano Ecosystem

- **New DeFi primitives** — undercollateralized lending becomes possible with a credit oracle
- **Financial inclusion** — the unbanked and underbanked can build credit identity from on-chain behavior
- **Privacy standards** — demonstrates ZK identity patterns that other Cardano projects can adopt
- **Cross-chain composability** — kredz bridges Cardano/Midnight to EVM and SVM ecosystems
- **Developer tooling** — EffectStream config, Compact contract templates, and API specs are reusable by other teams

## Team

**M Zidan Fatonie (DeDanzi / Kredz Labs)** — Solo builder. Published @dedanzi/midnight-mobile-sdk on npm. Active in Midnight Discord and Aliit program. MAIS MIP author. Building kredz end-to-end including Compact ZK contracts, React frontend, multichain bridges, and scoring engine.

## Links

- Website: https://kredz.xyz
- GitHub: https://github.com/kredz-labs/kredz
- MAIS MIP: https://github.com/midnightntwrk/midnight-improvement-proposals/pull/110
- MAIS MPS: https://github.com/midnightntwrk/midnight-improvement-proposals/pull/113
- Midnight Build Club: applied (pending)

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Midnight toolchain instability | Pin to specific SDK version; maintain testnet regression suite |
| Low Cardano DeFi adoption | Literacy modules drive user acquisition independently of lending integrations |
| ZK circuit bugs | Formal review by Midnight security team; open-source audits |
| Solo builder risk | Open-source community contributions; Build Club program support |

---

*Submitted for Cardano Catalyst — [edit date before submission]*
