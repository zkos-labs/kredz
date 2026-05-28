# KREDZ — Privacy-Preserving Credit Identity Protocol

**Midnight Network × Canton Network × Base (EVM) × Solana × Cardano**

> kredz.xyz bridges crypto-native users to institutional lenders through dual-privacy credit scoring: ZK proofs on Midnight + sub-transaction privacy on Zenith EVM (Canton).

| Network | Role | Contract Language | Status |
|---------|------|-------------------|--------|
| Midnight | Credit identity · ZK scoring | Compact | Written, needs compile |
| Zenith (Canton) | Institutional lenders · Compliance | Solidity (via Zenith EVM) | Written, needs Zenith EVM deploy |
| Base | EVM portability · DeFi oracle | Solidity | Code complete |
| Solana | SVM portability · Score PDA | Anchor (Rust) | Written, Anchor v0.31 fix needed |
| Cardano | Partner chain · Wallet history | Blockfrost API | Integrated for Layer 1 scoring |

---

## Architecture

```
                    BORROWER (1AM Wallet)
                           │
                           ▼
               ┌─────────────────────────┐
               │     MIDNIGHT NETWORK      │
               │  ZK Privacy (Compact)     │
               │  ─────────────────────    │
               │  • Credit identity        │
               │  • Three-layer scoring    │
               │  • Selective disclosure   │
               │  • Financial literacy XP  │
               └───────────┬───────────────┘
                           │ ZK attestation
              ┌────────────┼────────────────┐────────────┐
              ▼            ▼                 ▼
   ┌──────────────────┐ ┌──────────────────────┐ ┌──────────────────┐
   │   BASE (EVM)      │ │   CANTON NETWORK     │ │  SOLANA (SVM)     │ │   CARDANO          │
   │   Public Port.    │ │   Institutional      │ │  SVM Portability  │ │   Partner Chain    │
   │   ─────────────   │ │   ────────────────── │ │  ──────────────   │ │   ─────────────   │
   │   • ERC-8004 SBT  │ │   • Sub-tx privacy   │ │  • ScoreBadge PDA │ │  • Blockfrost idx  │
   │   • IKredzOracle  │ │   • KredzScore DAML  │ │  • Ed25519 verify │ │  • Native L1 hist  │
   │   • Relayer bridge│ │   • QueryScore       │ │  • Phantom wallet │ │  • 1AM wallet      │
   └──────────────────┘ │   • KredzAuditLog    │ └──────────────────┘ └──────────────────┘
                         └──────────────────────┘
```

| Network | Status | Privacy Model | Contract |
|---------|--------|---------------|----------|
| **Midnight** | Written, needs compile | ZK proofs (Compact) | `kredz.compact` |
| **Zenith (Canton)** | Written, needs Zenith EVM deploy | Sub-transaction privacy | Solidity (Zenith EVM) |
| **Base** | Code complete (needs deploy) | Public EVM | Solidity + ERC-8004 |
| **Solana** | Written, Anchor v0.31 fix needed | Public SVM | Anchor (Rust) |

### Why Five Networks?

**Midnight** — ZK-native credit scoring. Borrowers prove creditworthiness without exposing raw data.
**Zenith (Canton)** — Institutional credit distribution. Lenders query scores privately via Zenith EVM's sub-transaction privacy, using standard Solidity contracts and Ethereum RPC.
**Base** — EVM composability. Any DeFi protocol can read a borrower's score on-chain via `IKredzOracle`.
**Solana** — SVM composability. ScoreBadge PDA + Ed25519 verification for the Solana DeFi ecosystem.
**Cardano** — Midnight's partner chain. Blockfrost-indexed wallet history enriches Layer 1 scoring signals natively.

One identity, five networks, zero repetition of the onboarding process.

## Quick Start

### Prerequisites

| Tool | Why |
|------|-----|
| Node.js 20+ | Frontend (React) + Backend (Express) |
| 1AM Wallet | Midnight connection (dust-free) |
| MetaMask | Base connection |
| Docker 24+ | Zenith EVM LocalNet (Canton) |
| Python 3.10+ | Scoring engine ML model |

### Frontend (React)

```bash
cd kredz-frontend
npm install
npm run dev            # http://localhost:5173
```

### Backend (Scoring Engine)

```bash
cd backend
npm install
pip install -r python/requirements.txt
cp .env.example .env   # edit with your keys
npm run dev            # http://localhost:3001
```

### Zenith EVM LocalNet (Canton)

```bash
cd canton
docker compose up -d   # starts 2 participants + sequencer + mediator

# Wait for all services healthy (~60 seconds)
docker compose ps

# Deploy DAML contracts (requires DAML SDK)
dpm build && dpm deploy --host localhost --port 3901
```

### Base Contracts (Foundry)

```bash
cd contracts
forge test -vv
forge script script/Deploy.s.sol --rpc-url $BASE_SEPOLIA_RPC --private-key $KEY --broadcast
```

---

## Three-Layer Scoring Model

The KREDZ Score (0–1000) fuses signals from privacy-preserving ZK proofs, on-chain behavior, and financial literacy:

| Layer | Weight | Description |
|-------|--------|-------------|
| **On-Chain Signals** | 40% | Wallet age, DeFi interactions, repayment history across Midnight + EVM |
| **ZK-Attested KYC** | 40% | Income, employment, bank history — proven via ZK without raw data exposure |
| **Financial Literacy** | 20% | 5+ modules with quizzes, time-decay XP, streak bonuses |

---

## Privacy Tiers

| Tier | Name | Score Range | Proof Required | Lender Access |
|------|------|-------------|----------------|--------------|
| 0 | **Anonymous** | 0–400 | None | Micro-lending only |
| 1 | **Pseudonymous** | 0–650 | ZK-proof of 1 attribute | Mid-tier DeFi |
| 2 | **Full Compliance** | 0–1000 | Full ZK-KYC bundle | Canton institutional lenders |

---

## Zenith EVM Integration (Canton)

### What We Built on Zenith EVM

**Solidity Contracts** (deployable to Zenith EVM on Canton):

| Contract | Purpose | Privacy Feature |
|----------|---------|----------------|
| `KredzScore` | Score registry — institutional lenders query borrower scores via standard RPC | Only `operator` is signatory |
| `KredzScoreResponse` | Response to a score query | Visible to `operator` + `lender` only |
| `KredzAuditLog` | Immutable audit record of each query | Co-signed by both parties, no mutation |
| `KredzLenderSubscription` | Subscribed borrower tracking with webhook delivery | `signatory kredz, lender` |

**Key Zenith EVM Features Demonstrated:**

- **Sub-transaction privacy:** A lender's score query result is visible only to that lender and the kredz operator. No third party can observe it. Zenith EVM inherits Canton's privacy model.
- **Atomic composability:** Zenith EVM transactions settle on Canton MainNet. State roots and finality are confirmed by Canton's validator set.
- **Standard Ethereum RPC:** Lenders interact with Zenith EVM exactly like Ethereum — same tooling (Foundry, Hardhat, MetaMask), no DAML required.

### Demo Flow

```
1. Borrower connects 1AM wallet on Midnight
2. Selects privacy tier, builds KREDZ Score (layers 1-3)
3. Score attested via ZK proof → proof hash stored on Midnight
4. Backend syncs attestation to Zenith EVM on Canton → KredzScore contract created
5. Institutional lender queries score on Zenith EVM → KredzScoreResponse (private)
6. Lender acknowledges → KredzAuditLog created (immutable compliance record)
```

---

## Repository Structure

```
kredz/
├── kredz-frontend/          # React + Vite + TypeScript + Tailwind v4
│   ├── contracts/
│   │   └── kredz.compact    # Midnight ZK smart contract
│   └── src/                 # Pages, hooks, components, providers
│
├── backend/                 # Scoring engine (Node.js + Python XGBoost)
│   ├── src/
│   │   ├── scoring/         # Layer 1/2/3 + ML bridge
│   │   ├── attestation/     # ECDSA signer + Canton/Base sync
│   │   ├── providers/       # Midnight indexer, EVM RPC, SumSub
│   │   └── api/             # REST API + auth + rate limiting
│   ├── python/              # XGBoost model + stdin/stdout bridge
│   └── openapi.yaml         # Score API specification
│
├── canton/                  # Canton Network
│   ├── daml/                # DAML smart contracts
│   │   ├── KredzScore.daml
│   │   ├── KredzQuery.daml
│   │   ├── KredzSubscription.daml
│   │   ├── KredzTests.daml  # 5 DAML Script tests
│   │   └── Main.daml
│   ├── daml.yaml            # Package config (SDK 3.3.0)
│   └── docker-compose.yaml  # Canton LocalNet setup
│
├── contracts/               # Foundry — Solidity for Base
│   ├── src/
│   │   ├── KredzAttestationVerifier.sol
│   │   ├── KredzScoreBadge.sol
│   │   └── MockReputationRegistry.sol
│   └── test/
│       └── KredzAttestationVerifier.t.sol
│
├── relayer/                 # Attestation relayer (Midnight → Base)
│   └── index.ts
│
├── solana/                   # Solana Anchor program (SVM portability)
│   ├── programs/
│   │   └── kredz_score_badge/
│   │       └── lib.rs        # ScoreBadge PDA + Ed25519 verification
│   └── tests/
│       └── kredz_score_badge.ts
│
├── kredz-pitch-deck.pptx    # Hackathon pitch deck (12 slides)
├── prd.md                   # Product Requirements Document v0.2
└── README.md
```

---

## Built With

| Layer | Technology | Network |
|-------|-----------|---------|
| ZK Contracts | Compact | Midnight |
| Privacy Contracts | Solidity (Zenith EVM) | Canton |
| EVM Contracts | Solidity + Foundry | Base |
| SVM Contracts | Anchor (Rust) | Solana |
| Native Chain | Blockfrost API | Cardano |
| Frontend | React 19 + Vite + Tailwind v4 | — |
| Backend | Node.js + Express + TypeScript | — |
| ML Model | Python + XGBoost | — |
| Orchestration | Docker Compose | — |
| Wallet | 1AM (dust-free) | Midnight |
| Multichain Sync | EffectStream | All 5 networks |

---

## Hackathon

Built for the **Build on Canton Hackathon** (June 2026) by Encode Club, powered by Canton Foundation.

**Track:** Private DeFi & Capital Markets — Confidential lending, private credit scoring, institutional compliance.

**Our differentiation:** kredz.xyz is the only credit protocol demonstrating **dual-privacy** — ZK proofs on Midnight for borrower privacy AND sub-transaction privacy on Canton for institutional lender confidentiality. And the only credit protocol spanning **five networks** — Midnight, Canton, Base, Solana, and Cardano — from a single onboarding flow.

---

## Network Status

| Network | Contract | Status | What's Needed |
|---------|----------|--------|---------------|
| Midnight | `kredz.compact` | Written | `compact` CLI toolchain to compile |
| Canton | 4 DAML templates | Written | Nix + Docker for cn-quickstart / DevNet access |
| Base | 2 Solidity contracts | Code complete | Deploy to Base Sepolia, wire relayer |
| Cardano | Blockfrost API | Integrated | Blockfrost API key for wallet history |
| Solana | Anchor program (125 LOC) | Written | Fix Anchor v0.31 compatibility |

**All five networks** share one scoring model and one user identity. The bottleneck is toolchain access (Midnight Compiler, Canton Nix/Docker, Anchor versioning) — the contract logic and frontend integration are complete.
