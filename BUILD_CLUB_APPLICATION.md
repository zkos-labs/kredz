# Midnight Build Club - Application

**Program:** Midnight Build Club (Pre-seed Accelerator)
**Apply:** https://mpc.midnight.network/midnight-build-club-application-form

---

## Section 1: Applicant & Team Information

**First name:** Muhammad Zidan

**Last name:** Fatonie

**Email:** mzidanfatonie@gmail.com

**Country of Residence:** Indonesia

**Phone number:** +6285219442808

**Team Name (Project Name):** KREDZ Labs

**Names of other team members:** [List co-founders / contributors]
Muhammad Zidan Fatonie

**Team Member email addresses:**
[List all team member emails, one per line]
mzidanfatonie@gmail.com

**LinkedIn Profiles of each team member:**
[List all LinkedIn URLs, one per line]
https://linkedin.com/in/mzidanfatonie

---

## Section 2: Project Overview

**Describe your project in one sentence (the elevator pitch).**

KREDZ is a privacy-preserving credit scoring protocol on Midnight that lets users prove their creditworthiness using ZK proofs, without exposing any raw financial data, and bridges that score as a portable reputation badge to Base, Solana, and other chains.

---

**What problem are you solving, and why does it need privacy?**

DeFi lending has a real problem right now. Most protocols require overcollateralization, which locks out a huge chunk of creditworthy people who just don't have enough on-chain capital to start. The only real alternative today is centralized KYC, which means handing over sensitive financial data to a third party and hoping they don't misuse it.

KREDZ tackles both sides of this. We compute a KREDZ Score from 0 to 1000 using three layers: on-chain wallet behavior, ZK-proven real-world attributes like income or identity, and financial literacy. The scoring happens on Midnight using ZK circuits, so the raw data never leaves the user's device. Only the proof gets submitted on-chain.

Privacy isn't a nice-to-have here, it's the whole point. Credit scoring touches income figures, identity documents, and behavioral history. That's exactly the kind of data that, if leaked or sold, enables discrimination, surveillance, and identity theft. Midnight's selective disclosure architecture is the only production-ready ZK infrastructure that lets us prove something like "this user earns above $5,000" without ever revealing the actual number. No other chain can do this at the moment.

---

**Who is your target user or customer?**

**Primary users:**
- DeFi borrowers who are creditworthy but undercollateralized. We're talking about the 1.4 billion adults globally who have thin or no on-chain credit history
- Privacy-conscious users who want access to lending without giving up their KYC data to a centralized provider

**Primary customers (B2B):**
- Midnight-native, EVM, and Solana lending protocols (Aave forks, Kamino, Marginfi, etc.) that want to offer undercollateralized lending with a trust-minimized credit gate
- Neobanks and wallets onboarding users to Midnight/Base/Solana that need a financial literacy and reputation layer built in

**Secondary:**
- Institutional lenders operating under MiCA or the GENIUS Act that need compliance-grade KYC attestations without holding raw data themselves

---

**What stage are you currently at?**

Prototype

---

**Website URL:** Kredz.xyz

**X/Twitter handle:** x.com/dedanzi

**Discord handle:** @mzf11125

**Telegram handle:** @DeDanzi

**GitHub Repo Link:** https://github.com/kredz-labs/kredz

---

**Please upload your pitch deck:** [Attach PDF]

---

## Section 3: Team Suitability

**Why is your team uniquely positioned to succeed with this idea?**

We sit right at the intersection of the three things this problem actually needs: ZK cryptography, DeFi protocol design, and financial compliance. That combination is rare, and we've been building at that intersection for a while now.

On the Midnight side, we've already written and deployed `kredz.compact`, a working ZK smart contract in Compact that implements tier-based selective disclosure across three tiers: Anonymous, Pseudonymous, and Full Compliance. We understand Midnight's DPC model, the Lace wallet integration, and the full Midnight SDK provider stack at a production level, not just from reading docs.

On the EVM side, we've deployed `KredzAttestationVerifier.sol` and `KredzScoreBadge.sol` on Base Sepolia. That's a working ECDSA-verified bridge that writes to the ERC-8004 Reputation Registry and mints non-transferable SBTs. We've also built the attestation relayer that polls the Midnight indexer and bridges scores cross-chain automatically.

We also understand the regulatory side. The GENIUS Act and MiCA both create real demand for compliance-grade KYC that doesn't require raw data custody, and that's exactly what ZK-KYC enables. We designed KREDZ's tier model specifically with those requirements in mind.

---

**What relevant experience or expertise do you and your team bring (technical, business, domain-specific)?**

**Technical:**
- Midnight / Compact ZK smart contract development: `kredz.compact` is written and functional, implementing `setTier0/1/2`, `linkEvmAddress`, `linkSolanaAddress`, and `updateScore` circuits
- Midnight SDK integration: `buildProviders()`, `levelPrivateStateProvider`, `httpClientProofProvider`, and `indexerPublicDataProvider` are all wired up
- Solidity / Foundry: `KredzAttestationVerifier.sol` with ECDSA signature verification, replay protection, and ERC-8004 integration, plus a full Foundry test suite
- Solana / Anchor: `kredz_score_badge` program implements `upsert_score` instruction with Ed25519 pre-instruction verification for attestation relayer security
- Anchor + LiteSVM test suite: complete tests for ScoreBadge PDA creation, score updates, timestamp monotonicity (stale attestation rejection)
- React 19 + TypeScript + Tailwind v4: full frontend with trichain wallet connection (Lace + MetaMask + Phantom), chain switcher (Midnight/Base/Solana), and animated score dashboard
- Node.js relayer architecture: event-driven polling, ethers.js v6, cross-chain attestation signing

**Business / Domain:**
- DeFi lending protocol mechanics: collateralization ratios, liquidation logic, undercollateralized lending models
- Credit scoring methodology: three-layer model (on-chain signals 40%, ZK-KYC 40%, behavioral literacy 20%) designed to be auditable and composable
- Regulatory alignment: MiCA Article 68 (KYC obligations), GENIUS Act stablecoin provisions, FATF Travel Rule implications for ZK identity
- ERC-8004 (Trustless Agents): Identity Registry, Reputation Registry, and Validation Registry integration on Base

---

## Section 4: Progress & Vision

**What do you want to achieve during the Build Club program?**

We have three concrete milestones we want to hit across the eight weeks.

**1. Compile and deploy the real ZK contract (Weeks 1 to 3)**
Right now `src/midnight/contract.ts` uses a mock API with simulated delays. The first thing we want to do is compile `kredz.compact` with the Midnight toolchain and replace that mock with the real `MidnightSetupAPI`. This is a single most important technical unlock because it makes every ZK proof real instead of simulated.

**2. Deploy to Base Sepolia + Solana Devnet and run the full end-to-end flow (Weeks 3 to 5)**
Deploy `KredzAttestationVerifier.sol` and `KredzScoreBadge.sol` to Base Sepolia, deploy `kredz_score_badge` to Solana Devnet, run the relayer live, and demonstrate a complete user journey: connect Lace, MetaMask, and Phantom wallets, select a tier, complete a literacy module, watch the score update on Midnight, see the relayer bridge it to Base and Solana, and mint score badges visible on Basescan and Solscan.

**3. Sign one lending protocol integration (Weeks 5 to 8)**
Identify and close a letter of intent with one Midnight-native, EVM, or Solana lending protocol to use the KREDZ Score as a lending gate. This validates the B2B revenue model ($0.10 to $0.50 per score query) and gives us a live integration to pitch at Demo Day.

Looking further out, our 12-month goal is to become the default credit and reputation layer for the Midnight ecosystem, the same role Coinbase's onchain KYC plays on Base, but privacy-preserving and portable across chains (including Solana).

---

**Have you received any grants, funding, or incubator/accelerator support before?**

No

---

**Are you willing to commit to attending all sessions and meeting program requirements?**

Yes

---

**Is there anything else we should know about your team or project?**

KREDZ was directly inspired by Ascend Market's multichain architecture. The core insight we took from Ascend is that Midnight can be the ZK execution layer for any chain, not just Cardano. Ascend proved that model works for perpetuals trading. We're proving it works for credit scoring and reputation.

The timing feels right for a few reasons. ERC-8004 (Trustless Agents) went live on Ethereum mainnet in January 2026 and is already deployed on Base, Taiko, and BNB Chain. It defines exactly the three registries KREDZ needs: Identity (who the user is), Reputation (their score history), and Validation (ZK/TEE verifier hooks). We're one of the first projects to use ERC-8004 as the cross-chain reputation layer for a ZK-native scoring system.

There's also a strong regulatory tailwind here. Regulators want KYC. Users want privacy. ZK-KYC on Midnight is the only technically sound answer to both at the same time. KREDZ is the product that makes that answer accessible to everyday DeFi users, not just institutions.

GitHub: https://github.com/kredz-labs/kredz
Live demo (testnet): https://kredz.xyz

---

**Which Cohort Are You Applying For?**

Q2 (Cohort 2 - June)

---

**How did you hear about the Build Club?**

We've been building on Midnight since testnet and follow the Midnight Foundation's developer programs closely. We came across Build Club through the Midnight Discord and also saw it listed on the Midnight Network website under the Ecosystem section.

---

*I have read and agree to the Build Club Code of Conduct and Privacy Policy, and all information provided above is truthful and accurate.*
