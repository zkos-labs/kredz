# kredz.xyz
## Product Requirements Document — Full Stack
### Midnight Network × Canton Network × Base (EVM) × Solana × Cardano

**Version:** 0.2
**Status:** Active Draft
**Owner:** DeDanzi / Kredz Labs
**Last Updated:** May 2026
**Classification:** Confidential

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Product Vision](#3-product-vision)
4. [Target Users](#4-target-users)
5. [The KREDZ Three-Layer Scoring Model](#5-the-kredz-three-layer-scoring-model)
6. [Tiered Privacy & Access Model](#6-tiered-privacy--access-model)
7. [Network Strategy](#7-network-strategy)
8. [Midnight Implementation](#8-midnight-implementation)
9. [Canton Network Implementation](#9-canton-network-implementation)
10. [Base EVM Layer](#10-base-evm-layer)
11. [Cross-Network Architecture](#11-cross-network-architecture)
12. [Smart Contract Specifications](#12-smart-contract-specifications)
13. [AI Scoring Engine](#13-ai-scoring-engine)
14. [Financial Literacy Layer](#14-financial-literacy-layer)
15. [User Stories](#15-user-stories)
16. [API & Integration Requirements](#16-api--integration-requirements)
17. [Security Requirements](#17-security-requirements)
18. [Compliance & Regulatory](#18-compliance--regulatory)
19. [Revenue Model](#19-revenue-model)
20. [Roadmap](#20-roadmap)
21. [Success Metrics](#21-success-metrics)
22. [Risks & Mitigations](#22-risks--mitigations)
23. [Open Questions](#23-open-questions)
24. [Appendix](#24-appendix)

---

## 1. Executive Summary

kredz.xyz is a privacy-preserving credit identity and scoring protocol that bridges crypto-native users to institutional lenders across three complementary networks. Users build a verifiable KREDZ Score from on-chain behavior, ZK-attested real-world financial data, and financial literacy signals. That score is portable across Midnight Network (privacy-native ZK scoring), Canton Network (institutional credit distribution to regulated financial entities), and Base (EVM-wide portability via ERC-8004 attestation).

The product addresses a gap no single-chain credit solution has closed: connecting the underbanked and crypto-native user who has meaningful financial history but no formal credit profile, to institutional lenders who require privacy-preserving compliance before they can extend credit on-chain.

**Current build status:** Frontend is complete (React + Vite + TypeScript + Tailwind v4). Midnight wallet integration, tier selection flow, dashboard, literacy modules, multichain Base bridge via ERC-8004, and attestation relayer are all built. Compact contract is written, pending toolchain compilation. This PRD formalizes what exists and specifies the Canton layer as the next major addition.

---

## 2. Problem Statement

### 2.1 The Credit Identity Gap

Over 1.4 billion adults globally are unbanked. Hundreds of millions more are underbanked: they transact regularly via mobile money, e-wallets (GoPay, OVO, bKash, M-Pesa), and informal lending networks, but hold no formal credit file. Traditional credit bureaus (Experian, Equifax, CTOS) cannot score them because they have no record.

Meanwhile, these same users are increasingly active on-chain. Their wallet history, DeFi repayment behavior, staking patterns, and governance participation constitute a rich behavioral signal that no credit protocol is capturing privately.

The problem has two sides:

**For borrowers:** No portable, privacy-preserving credit identity that combines their real-world financial behavior (web2) with their on-chain history (web3) into a single provable score.

**For lenders:** No compliant, auditable mechanism for extending undercollateralized credit on-chain without either requiring full identity disclosure (unacceptable to users) or lending blind (unacceptable to risk teams).

### 2.2 Why Existing Solutions Fall Short

| Solution | Limitation |
|----------|-----------|
| Spectral Finance | On-chain only, no web2 signals, no ZK privacy |
| Cred Protocol | EVM-centric, no institutional compliance layer |
| Masa Finance | Identity aggregation without ZK attestation |
| Traditional bureaus | Web2 only, centralized, no on-chain portability |
| Coinbase KYC (Base) | Centralized identity disclosure, not ZK |
| RociFi | Collateral-based, not reputation-native |

None combines web2 + web3 + literacy signals with ZK privacy AND institutional-grade compliance in a single portable score.

### 2.3 The Regulatory Moment

MiCA (EU, 2024), the GENIUS Act (US, 2025), and MAS PS Act amendments (Singapore, 2025) are all pushing toward requiring compliance infrastructure for on-chain lending. Institutional lenders entering DeFi (BlackRock, Franklin Templeton, Goldman Sachs via Canton) need a compliance-ready credit layer before they can deploy capital at scale. That layer does not exist yet.

---

## 3. Product Vision

**Vision:** kredz.xyz becomes the foundational credit identity layer for the multi-chain ecosystem, enabling undercollateralized lending through privacy-preserving AI scoring that works for the crypto-native user and satisfies the institutional lender simultaneously.

**Core Principles:**

**Privacy by default, compliance on demand.** Every user starts anonymous. ZK proofs unlock higher credit tiers without forcing data disclosure. The underlying data never leaves the user's control.

**Portable reputation.** A KREDZ Score built on Midnight is verifiable on Canton and attestable on Base. One identity, three networks, zero repetition of the onboarding process.

**Financial literacy as a moat.** Literacy signals are behavioral, longitudinal, and hard to fake. They reward users who engage genuinely and create a defensible data advantage that pure on-chain scoring cannot replicate.

**Institutional-grade from day one.** The scoring model, compliance attestation, and audit trail are designed to satisfy regulated financial institution requirements, not just crypto protocol integrations.

---

## 4. Target Users

### 4.1 Crypto-Native Borrower (Midnight Primary)

**Profile:** A DeFi-active user in Southeast Asia, Africa, or Latin America with 12+ months of on-chain history but no formal credit file. Age 22-40. Uses GoPay, OVO, or mobile banking for daily transactions. Has interacted with at least 2 DeFi protocols. Understands crypto but has never accessed institutional credit.

**Pain point:** Cannot access undercollateralized loans despite having demonstrable financial behavior because no protocol can score them credibly without requiring identity disclosure.

**What they want:**
- A credit score that reflects their actual financial behavior
- Privacy: lenders see the score, not the underlying data
- Portability: score works across protocols without rebuilding it per platform
- A path to higher credit limits as they build history

### 4.2 Institutional Lender (Canton Primary)

**Profile:** A regulated financial institution (bank, asset manager, credit fund) operating on Canton Network. Has compliance obligations under MiCA, MAS, or GENIUS Act. Wants to extend on-chain credit but requires KYC/AML verification and credit risk assessment before deployment.

**Pain point:** Cannot extend on-chain credit without verifiable borrower compliance data. Cannot request raw financial data from borrowers (privacy regulations). Has no trusted on-chain credit oracle they can audit.

**What they want:**
- A credit score from a verifiable, auditable source
- Proof of borrower KYC/AML clearance without receiving raw identity data
- An API that integrates with their existing Canton-based infrastructure
- Regulatory defensibility: the score is explainable, audited, and ZK-verified

### 4.3 DeFi Protocol Integrator (Base/Midnight)

**Profile:** A DeFi lending protocol (undercollateralized lending, BNPL, credit lines) seeking to integrate a credit oracle. Technical team. Integrates via Score API or ERC-8004 on-chain read.

**What they want:**
- Simple API or on-chain read for a borrower's current score
- Webhook for score updates
- Configurable minimum score threshold for their lending product

### 4.4 Financial Literacy Seeker

**Profile:** A crypto-curious user who is not yet active in DeFi but wants to build a credit identity for future use. May be onboarding to crypto for the first time via the literacy modules.

**What they want:**
- Learn DeFi concepts in a structured, rewarded format
- See their literacy score improve in real time
- Understand what they need to do to unlock higher credit tiers

---

## 5. The KREDZ Three-Layer Scoring Model

The KREDZ Score (0-1000) is computed by an AI scoring engine that fuses three distinct signal layers. Each layer contributes a weighted subscore. The final score is computed off-chain and attested on-chain via ZK proof.

### Layer 1: On-Chain Signals (Weight: 40%)

Analyzes the user's wallet history across Midnight, Cardano, and EVM chains.

| Signal | Description | Weight within Layer |
|--------|-------------|-------------------|
| Wallet age | Time since first transaction | 15% |
| Transaction frequency | Average monthly transactions, consistency | 10% |
| DeFi interactions | Protocol diversity, complexity of interactions | 20% |
| Repayment history | On-chain loan repayments, liquidation events | 30% |
| Asset stability | Holding patterns vs. speculative churn | 10% |
| Governance participation | DAO votes, staking, delegation | 10% |
| Cross-chain activity | Multi-chain presence as a trust signal | 5% |

**Data sources:** Midnight indexer (native), Cardano Blockfrost, Base/EVM via Alchemy, Ethereum via Infura. All wallet addresses are linked via the `linkEvmAddress` Compact circuit (already built) without revealing address relationships publicly.

### Layer 2: ZK-KYC Signals (Weight: 40%)

The differentiating layer. Uses Midnight's ZK circuits to attest to real-world financial attributes without raw data exposure.

| Attribute | Attestation Method | Score Contribution |
|-----------|-------------------|-------------------|
| Income range | ZK proof of bank statement / payroll data | High |
| Employment status | ZK proof of employer verification | Medium |
| Bank account history | ZK proof of account age + average balance range | High |
| E-wallet history | ZK proof of GoPay/OVO/bKash transaction volume | Medium |
| Existing credit commitments | ZK proof of outstanding loan obligations | Negative signal |
| No adverse credit events | ZK proof of absence of defaults or judgments | High |
| Jurisdiction | ZK proof of residency (for regulatory tier mapping) | Low |

**KYC provider integrations:** SumSub (identity), Chainalysis KYT (wallet), Plaid/Brankas (bank data for SEA), Persona (document verification).

Layer 2 signals are only available at Tier 1 and Tier 2 (see Section 6). Tier 0 users receive Layer 1 + Layer 3 scores only.

### Layer 3: Behavioral & Literacy Signals (Weight: 20%)

| Signal | Description | Score Contribution |
|--------|-------------|-------------------|
| Literacy modules completed | Number of verified modules (5 available at MVP) | Per module |
| Quiz accuracy | Correct answers on first attempt vs. retries | Per quiz |
| Module recency | Modules completed within the last 90 days weighted higher | Time decay |
| Engagement consistency | Regular module completion vs. one-time burst | Longitudinal |
| Advanced modules | Higher-level modules (DeFi risk, advanced credit) score higher | Tiered |

Literacy signals are the moat. They are behavioral, longitudinal, and require genuine engagement. A user who completes all 5 modules correctly in a single session scores differently from a user who completes them over 3 months with consistent return engagement.

---

## 6. Tiered Privacy & Access Model

kredz.xyz uses Midnight's selective disclosure to create three borrower tiers, each unlocking progressively higher credit limits and more institutional access.

### Tier 0: Anonymous

**Requirements:** Connect Midnight wallet. No identity disclosure.

**Score range:** 0-400 (Layer 1 + Layer 3 only)

**What's unlocked:**
- Micro-lending protocols on Midnight and Base (up to $500 equivalent)
- Basic score dashboard
- Access to financial literacy modules
- Base score attestation via ERC-8004

**Who this serves:** Crypto-native users who want to start building credit history immediately without any KYC friction.

### Tier 1: Pseudonymous

**Requirements:** ZK-prove at least one real-world attribute (income range, employment status, or account age) via a Midnight ZK circuit. Identity not disclosed; the proof is.

**Score range:** 0-700 (all three layers active)

**What's unlocked:**
- Mid-tier lending protocols (up to $5,000 equivalent)
- Full Layer 2 scoring (ZK-attested attributes)
- Preferred rates on integrated lending protocols
- Score shared with Midnight-native DeFi protocols

**Who this serves:** Users who have meaningful real-world financial history and want to unlock higher credit limits without full KYC.

### Tier 2: Full Compliance

**Requirements:** Complete KYC/AML via Midnight-compatible credential issuance (SumSub + Chainalysis). Credential committed to Midnight shielded state. Identity not on-chain; credential validity is.

**Score range:** 0-1000 (all layers, all signals)

**What's unlocked:**
- Institutional liquidity pools via Canton Network integration
- Credit limits up to $50,000 equivalent
- Canton Score API access (score shared with institutional lenders)
- MiCA/GENIUS Act compliant credit profile
- Priority ZK-KYC processing on renewal

**Who this serves:** Users seeking access to institutional lending capital; professionals and business owners with substantial real-world financial history.

---

## 7. Network Strategy

kredz.xyz is not a single-chain product. Each network plays a distinct, non-overlapping role.

```
BORROWER JOURNEY
     │
     ▼
┌─────────────────────────────┐
│       MIDNIGHT NETWORK       │
│  Credit identity layer       │
│  - Score computation (ZK)    │
│  - Shielded LP registry      │
│  - Literacy XP on-chain      │
│  - ZK credential storage     │
│  Primary users: Tier 0-2     │
└────────────┬────────────────┘
             │ ZK attestation
             │ score proof
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌──────────┐    ┌──────────────────────┐
│  BASE     │    │   CANTON NETWORK     │
│  (EVM)    │    │   Institutional      │
│           │    │   credit layer       │
│ ERC-8004  │    │   - DAML contracts   │
│ SBT Badge │    │   - Score API for    │
│ Portable  │    │     regulated lenders│
│ attestation│   │   - Compliance audit │
│ for DeFi  │    │   - MiCA/GENIUS Act  │
│ protocols │    │   Primary users: T2  │
└──────────┘    └──────────────────────┘
```

| Network | Role | Primary Audience | Contract Language |
|---------|------|-----------------|------------------|
| Midnight | Credit identity, ZK scoring, credential gate | All tiers, crypto-native users | Compact |
| Canton | Institutional credit distribution, B2B API | Tier 2, regulated lenders | DAML |
| Base | EVM-wide portability, DeFi protocol oracle | DeFi protocols, EVM users | Solidity (ERC-8004) |

### Why This Three-Network Design

**Midnight alone** serves the privacy-native user but has no institutional lender infrastructure yet. A Midnight-only product cannot reach regulated financial institutions.

**Canton alone** serves institutions but has no crypto-native user base or ZK credit-building rails. Canton participants need a credit data source; they are not the borrowers.

**Base alone** is public and lacks privacy. Raw on-chain credit scoring without ZK is unsuitable for institutional use.

Together: Midnight builds the credit identity privately. Canton distributes it to institutions compliantly. Base makes it portable across the broader EVM ecosystem. Users onboard once on Midnight and their score flows to wherever lenders operate.

---

## 8. Midnight Implementation

### 8.1 Current Build Status

The following components are already built and functional:

- React 18 + Vite + TypeScript + Tailwind CSS v4 frontend
- `useMidnightWallet` hook for Lace Beta wallet connection
- `buildProviders()` function wiring all Midnight SDK providers
- `kredz.compact` contract written (pending Compact toolchain compilation)
- Tier selection flow (Tier 0, 1, 2) with ZK-KYC mock calls
- Dashboard: animated KREDZ Score ring, layer breakdown, score refresh from chain
- 5 literacy modules with 3-question quizzes and on-chain XP submission
- Page transitions, mobile-responsive, toast notifications

### 8.2 Compact Contract Architecture

The `kredz.compact` contract manages three core state objects:

**Public state:** `score_registry` (wallet DID → score_hash, tier, last_updated), `literacy_registry` (DID → modules_completed, xp_total), `attestation_store` (attestation ID → score_range, tier, epoch, proof_hash).

**Shielded state:** `layer2_attributes` (DID → attribute_hash, issuer_did, expiry), `score_components` (DID → layer1, layer2, layer3), `evm_links` (DID → evm_addresses[]).

**Key circuits:** `setTier`, `updateScore`, `scoreAttestation`, `linkEvmAddress`, `completeModule`.

### 8.3 Scoring Engine Integration

The AI scoring engine runs off-chain (Node.js backend). It pulls wallet data from Midnight indexer, Cardano Blockfrost, and EVM RPCs, computes the three-layer score, signs the result with the Arcana scoring engine key, and submits to the `updateScore` circuit on-chain.

### 8.4 Lace Wallet Integration

The existing `useMidnightWallet` hook connects to `window.midnight.mnLace` (Lace Beta), managing `wallet.enable()`, `walletAPI.state()`, `serviceUriConfig()`, and connection state in global `AppContext`.

---

## 9. Canton Network Implementation

### 9.1 What Canton Network Is

Canton is a privacy-enabled enterprise blockchain built by Digital Asset using the DAML smart contract language. Key properties relevant to kredz.xyz:

- **Sub-transaction privacy:** Participants only see the portions of a transaction directly relevant to them.
- **Institutional participants:** Goldman Sachs, BNP Paribas, Deloitte, S&P Global, and others operate Canton nodes.
- **DAML contracts:** Smart contracts in DAML, a purpose-built functional language for financial workflows.
- **Synchronizer:** The Canton Global Synchronizer enables atomic cross-ledger transactions.
- **Regulatory alignment:** Designed for MiCA, MiFID II, and GENIUS Act compliance.

### 9.2 kredz.xyz as a Canton Participant

kredz.xyz operates as a Canton participant node, exposing the KREDZ Score API:

```
kredz.xyz Canton Node
├── KredzScore DAML template (score registry)
├── KredzQuery DAML workflow (score request/response)
├── KredzAudit DAML template (compliance audit log)
├── KredzLenderSubscription DAML template
└── Score API gateway (REST + Canton gRPC bridge)
```

### 9.3 DAML Contract Architecture

See `canton/daml/` directory for the full DAML contract implementations. Key templates:

- **KredzScore:** Registry of borrower scores with `QueryScore`, `UpdateScore`, `ExpireScore` choices
- **KredzScoreResponse:** Response contract for a score query, visible only to lender and kredz
- **KredzAuditLog:** Immutable audit record of each score query
- **KredzLenderSubscription:** Subscription registry with `AddBorrower`, `RemoveBorrower` choices

### 9.4 Score Synchronization: Midnight to Canton

When a Tier 2 user's score is updated on Midnight:
1. Scoring engine generates `scoreAttestation` proof for Canton
2. Proof hash stored in Midnight's `attestation_store`
3. Backend detects via Midnight indexer webhook
4. Backend updates `KredzScore` DAML contract on Canton
5. Subscribed lenders notified via Canton event stream

### 9.5 Institutional Lender Onboarding

**Option A:** Direct Canton participant query via `QueryScore` choice
**Option B:** REST API for non-Canton lenders
**Option C:** Webhook subscription for score change notifications

### 9.6 Canton-Specific Compliance Features

- Regulatory audit export (DAML-signed, dual-party attestation)
- Score explainability (layer breakdown with structural weights)
- Adverse action support (ZK-proof-backed reason codes)

---

## 10. Base EVM Layer

### 10.1 Current Build Status (Complete)

The Base layer is fully built: `KredzAttestationVerifier.sol`, `KredzScoreBadge.sol` (non-transferable ERC-721 SBT), deploy script targeting Base Sepolia, attestation relayer, `useBaseScore` hook, and dashboard score card.

### 10.2 ERC-8004 Implementation

ERC-8004 (Trustless Agents) makes the KREDZ Score portable across EVM chains. The `KredzScoreBadge` SBT implements Identity Registry, Reputation Registry, and Validation Registry.

### 10.3 Attestation Relayer

The relayer polls the Midnight indexer, extracts attestations, signs with ECDSA key, and submits to `KredzAttestationVerifier` on Base.

### 10.4 DeFi Protocol Integration on Base

Any Base lending protocol can integrate via `IKredzOracle` interface: `getScore(address)` and `meetsThreshold(address, uint256)`.

---

## 11. Cross-Network Architecture

### 11.1 Full System Diagram

```
USER (Borrower)
      │ Lace Beta wallet
      ▼
┌─────────────────────────────────────────────────┐
│                 MIDNIGHT NETWORK                 │
│  kredz.compact: Public + Shielded State          │
└─────────┼───────────────────────────────────────┘
          │ ZK attestation
    ┌─────┴──────────────────────┐
    ▼                            ▼
┌──────────────────┐   ┌──────────────────────────┐
│  ATTESTATION     │   │     CANTON NETWORK        │
│  RELAYER (Node)  │   │  KredzScore, KredzQuery   │
│  → Base sync     │   │  KredzAuditLog, KredzSub  │
└────────┬─────────┘   └──────────────────────────┘
         ▼
┌────────────────────────┐
│     BASE (EVM)          │
│  KredzAttestationVerifier│
│  KredzScoreBadge (SBT)  │
│  IKredzOracle            │
└────────────────────────┘
```

### 11.2 Data Flow Summary

| Event | Midnight | Canton | Base |
|-------|---------|--------|------|
| User registers (Tier 0) | Score in public state | — | SBT minted (optional) |
| Score updated | `updateScore` circuit | KredzScore updated (T2) | SBT metadata updated |
| Lender queries score | — | `QueryScore` choice | `getScore()` oracle |
| Literacy module done | XP on-chain | — | — |
| Compliance audit | ZK credential verified | Audit log created | — |

---

## 12. Smart Contract Specifications

### 12.1 Midnight: kredz.compact

Located at `kredz-frontend/contracts/kredz.compact`. Key types: `Tier` (Field), `ScoreEntry`, `LiteracyEntry`, `AttestationEntry`. Compilation via `compact compile`.

### 12.2 Canton: DAML

Located at `canton/daml/`. Templates: `KredzScore`, `KredzScoreResponse`, `KredzAuditLog`, `KredzLenderSubscription`.

### 12.3 Base: Solidity

Located at `contracts/src/`. Contracts: `KredzAttestationVerifier.sol`, `KredzScoreBadge.sol`, `KredzOracle.sol` (v1).

---

## 13. AI Scoring Engine

### 13.1 Architecture

Runs as a backend service (Node.js + Python ML). Components: Data Aggregator, Feature Engineering, ML Model (XGBoost), Score Signer. At v2, the model output is wrapped in a ZK-ML proof (EZKL).

### 13.2 Score Update Triggers

| Trigger | Frequency | Priority |
|---------|-----------|----------|
| Manual refresh | On demand | High |
| New on-chain tx | Within 1 hour | High |
| Literacy module | Immediate | High |
| Scheduled | Every 7 days | Normal |
| Tier upgrade | Immediate | Critical |

---

## 14. Financial Literacy Layer

### 14.1 MVP Module Set (5 Modules)

| Module | Topic | XP | Quiz Qs |
|--------|-------|-----|---------|
| M1 | DeFi Fundamentals | 50 XP | 3 |
| M2 | Credit and Collateral | 75 XP | 3 |
| M3 | Risk Management | 75 XP | 3 |
| M4 | Interest and APR | 50 XP | 3 |
| M5 | Privacy and Self-Custody | 100 XP | 3 |

### 14.2 Gamification Mechanics

XP-to-score conversion with time decay (full value <30 days, 75% 31-90, 50% 91-180, 25% >180), streak bonus (10%), first-attempt accuracy bonus (20%).

### 14.3 v1 Expansion

15 modules at v1 with advanced DeFi topics, regulatory landscape, and Canton introduction.

---

## 15. User Stories

### 15.1 Borrower Stories (Midnight)

**B-001:** Connect wallet → see credit score anonymously (Tier 0).
**B-002:** Complete literacy module → see score increase.
**B-003:** Upgrade to Tier 1 via ZK attribute proof.
**B-004:** Mint Base SBT for EVM portability.

### 15.2 Institutional Lender Stories (Canton)

**IL-001:** QueryScore on Canton → receive KredzScoreResponse.
**IL-002:** Subscribe to score updates for borrower list.
**IL-003:** Generate quarterly compliance audit report.

---

## 16. API & Integration Requirements

### 16.1 Score API (B2B REST)

Base URL: `https://api.kredz.xyz/v1`. Auth: API key header. Endpoints: `GET /score/{did}`, `POST /subscriptions`, `DELETE /subscriptions/{id}`, `GET /audit`, `GET /oracle/base/{address}`.

### 16.2 Webhook Events

`score.updated`: subscription_id, borrower_did, old_score, new_score, delta, updated_at.

### 16.3 On-Chain Oracle Interface (Base)

`IKredzOracle`: `getScore(address)`, `meetsThreshold(address, uint256)`, `getProofHash(address)`.

### 16.4 Midnight Indexer

Monitors: `scoreRegistry`, `attestationStore`, `literacyRegistry` updates. Fires webhook on new attestation → triggers relayer.

---

## 17. Security Requirements

- `kredz.compact`: formal review by IOG security team, key rotation, input validation
- Canton node: HSM-backed DAML keys, only kredz party can create/update
- Relayer: ECDSA key in AWS CloudHSM, rate-limited, open-source
- API: scoped keys, HMAC signatures, 1,000 queries/day per institution

---

## 18. Compliance & Regulatory

| Activity | Potential Trigger | Jurisdiction |
|----------|------------------|-------------|
| KYC credential issuance | VASP license | SG (MAS), UAE (VARA) |
| Credit scoring service | Credit reference agency license | UK (FCA), EU (MiCA) |
| Score distribution | DPA | EU (GDPR Art. 28) |

MiCA alignment: score explainability via layer breakdown + adverse action notices. GENIUS Act: Tier 2 credential satisfies KYC requirements. GDPR: no PII stored directly; DPA with SumSub; right to erasure.

---

## 19. Revenue Model

| Stream | Monthly (Y1 End) | Annual |
|--------|-----------------:|------:|
| Score API (B2B) | $15,000 | $90,000 |
| Premium subscriptions | $10,000 | $60,000 |
| Literacy SaaS | $10,000 | $60,000 |
| Protocol integrations | $5,000 | $30,000 |
| **Total** | **$40,000** | **$240,000** |

---

## 20. Roadmap

### Phase 0: Testnet Completion (Now → Month 2)
Compile kredz.compact, replace mock API, scoring engine backend, SumSub sandbox. Demo-ready for Midnight Build Club.

### Phase 1: Midnight Mainnet MVP (Months 3-5)
Mainnet deployment, 100 users, Score API live, 3 Base protocol integrations.

### Phase 2: Canton Integration (Months 6-9)
Canton participant node, DAML deployment, first institutional lender, score sync pipeline.

### Phase 3: Scale (Months 10-18)
10+ institutional lenders, ZK-ML attestation, 15 literacy modules, Literacy SaaS licensing.

---

## 21. Success Metrics

| Metric | Month 6 | Month 12 |
|--------|---------|---------|
| Credentialed users | 500 | 2,000 |
| Tier 2 users | 25 | 100 |
| Canton lenders | 1 | 5 |
| Base integrations | 3 | 10 |
| Monthly revenue | $5,000 | $40,000 |

---

## 22. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Midnight mainnet delay | Demo on testnet; Build Club doesn't require mainnet |
| Canton onboarding slow | REST API serves non-Canton lenders in parallel |
| Compact toolchain bugs | Pin SDK version; maintain testnet for regression |
| Scoring engine bias | Bias testing; model card; no protected attributes |
| Competitor adds KYC | Literacy moat; move fast on literacy SaaS |

---

## 23. Open Questions

- Midnight SDK IndexedDB provider availability
- Digital Asset Canton onboarding requirements and timeline
- Score granularity on Canton (exact score vs range)
- Brankas pricing for MVP scale
- Midnight Build Club requirements (testnet demo sufficient?)
- ERC-8004 finalization status
- Scoring engine signing key trust concern threshold

---

## 24. Appendix

### 24.1 Glossary

| Term | Definition |
|------|-----------|
| KREDZ Score | Composite credit score (0-1000) |
| Compact | Midnight's ZK smart contract language |
| DAML | Digital Asset Modeling Language (deprecated for kredz) |
| Zenith EVM | EVM-compatible execution environment on Canton (Reth/Solidity) |
| ERC-8004 | Trustless Agents standard for EVM portability |
| SBT | Soulbound Token (non-transferable NFT) |
| Selective Disclosure | Proving specific attributes without full data exposure |
| ZK-ML | Zero-knowledge machine learning inference |
| MAIS | Midnight Agent Identity Standard (MIP draft) |
| Midnight Passport | Seven-layer identity infrastructure for Midnight |

### 24.2 Current Tech Stack

| Layer | Technology | Status |
|-------|-----------|--------|
| Frontend | React 18 + Vite + TypeScript + Tailwind v4 | Built |
| Animations | Framer Motion | Built |
| Midnight wallet | 1AM (dust-free, ProofStation) | Built |
| Midnight SDK | providers.ts | Built |
| ZK contract | kredz.compact | **Compiled** (compact 0.5.1, 6 circuits, 796 KB keys) |
| EVM wallet | MetaMask | Built |
| Base contracts | Solidity + Foundry (3 files, 4/4 tests) | Built |
| Solana program | Anchor (written, compiled .so) | Built |
| Zenith EVM contracts | Solidity (deployable to Zenith EVM on Canton) | Written |
| Attestation relayer | Node.js | Built (deprecated, migrating to EffectStream) |
| Scoring engine | Node.js + Python ML | See `backend/` |
| KYC integration | SumSub | Partial (stub) |
| Multichain sync | EffectStream | See `effectstream/` |

### 24.3 References

- Midnight Network docs: docs.midnight.network
- 1AM Wallet: 1am.xyz/developers
- Zenith EVM: docs.zenith.network/zenith-evm
- EffectStream: effectstream.github.io/docs
- ERC-8004: eips.ethereum.org/EIPS/eip-8004
- SumSub API: docs.sumsub.com
- Chainalysis KYT: docs.chainalysis.com/api/kyt
- MiCA Regulation: eur-lex.europa.eu (32023R1114)
- GENIUS Act: congress.gov (2025)
- MAIS MIP Draft: github.com/midnightntwrk/midnight-improvement-proposals/pull/110
- Midnight Passport: midnight-passport.vercel.app

### 24.4 Future Integrations

#### Midnight Agent Identity Standard (MAIS)

MAIS is a proposed MIP defining four Compact contracts for AI agent identity on Midnight: Identity Registry (dual-mode public/private), Reputation Registry (public scores with private evidence), Validation Registry (tiered staked validators), and Disclosure Tier Registry (mapping agent data to Midnight's three disclosure tiers). An optional ERC-8004 bridge enables cross-chain agent identity with Ethereum.

**Relevance to kredz:** kredz borrowers can be registered as MAIS agents, making KREDZ Scores composable with the broader Midnight agent ecosystem. The Reputation Registry's score model (0-100 with public scores and private evidence) aligns with kredz's three-layer scoring approach. The Validation Registry's tiered validator system (10K/50K/100K NIGHT stake tiers) provides a trust framework that kredz's institutional lender verification could leverage. The Disclosure Tier Registry maps directly to kredz's privacy tiers (Anonymous / Pseudonymous / Full Compliance).

**Status:** Draft MIP awaiting editor review. DevRel team has escalated to engineering for deep review. Integration targeted for Phase 2+.

#### Midnight Passport

Midnight Passport is a seven-layer identity infrastructure currently in closed-source development by LFDT-Nightstream. The layers span from TEE hardware key protection (Layer 1) through wallet compartments (Layer 2), account model (Layer 3), ZK credentials via zkMe zkKYC (Layer 4), human-readable naming (Layer 5), chain abstraction (Layer 6), to a DApp operating system (Layer 7). It supports seedless recovery, multi-chain account abstraction, and zero-knowledge encrypted cloud backup.

**Relevance to kredz:** Layer 4 (Identity & Credentials) could serve as a credential provider for kredz's Tier 1 and Tier 2 verification, potentially replacing direct SumSub integration with Midnight-native zkKYC flows. Layer 5 (naming) would enable human-readable borrower identities (`alice.midnight`) instead of raw wallet addresses. Layer 6 (chain abstraction) aligns with kredz's multi-network portability goal.

**Status:** Closed-source, no public API or SDK. Integration deferred until public release.

---

*kredz.xyz PRD v0.2 — DeDanzi / Kredz Labs — Confidential*
