# KREDZ — Privacy-Preserving Credit Identity Protocol

This project is built on the Midnight Network.

**Midnight Network × Canton Network × Base (EVM) × Solana × Cardano**

> kredz.xyz bridges crypto-native users to institutional lenders through dual-privacy credit scoring: ZK proofs on Midnight + sub-transaction privacy on Canton.

## Project Structure

| Directory | What it is | Key commands |
|-----------|-----------|--------------|
| **`kredz-midnight/`** | Compact contract source + compile pipeline | `npm ci && npm run compile && npm run sync-zk` |
| **`kredz-frontend/`** | Multichain landing page + dashboard + Midnight deploy | `npm install && npm run dev` |
| `contracts/` | Foundry Solidity contracts for Base (EVM) | `forge test && forge script` |
| `solana/` | Anchor program for Solana SVM portability | `anchor build && anchor deploy` |
| `canton/` | DAML contracts + Zenith EVM for institutional lending | `docker compose up` |
| `backend/` | Scoring engine (Node.js + Python XGBoost) | `npm run dev` |

**kredz-midnight** compiles the Compact contract (5 ZK circuits) and syncs assets to kredz-frontend. **kredz-frontend** is the user-facing app that deploys and interacts with the contract on Midnight Preprod via the 1AM wallet.

## Quick Start

```bash
cd kredz-midnight
npm ci && npm run compile && npm run sync-zk

cd ../kredz-frontend
npm install && npm run dev        # http://localhost:5173
```

| Network | Role | Language | Status |
|---------|------|----------|--------|
| Midnight | Credit identity · ZK scoring | Compact | Compiled (5 circuits) · Preprod |
| Base (EVM) | EVM portability · ERC-8004 SBT | Solidity (Foundry) | Deployed on Sepolia |
| Solana | SVM portability · Score PDA | Anchor (Rust) | Deployed on Devnet |
| Canton | Institutional lenders | DAML + Solidity (Zenith EVM) | Code complete |
| Cardano | Partner chain · Wallet history | Blockfrost API | Integrated |

---

## Deployed Contracts

| Network | Contract | Address | Explorer |
|---------|----------|---------|----------|
| Base Sepolia | KredzAttestationVerifier | `0x318Ecad2bA565778753918e287AAaA2e65E5b1Dd` | [Basescan](https://sepolia.basescan.org/address/0x318Ecad2bA565778753918e287AAaA2e65E5b1Dd) |
| Base Sepolia | KredzScoreBadge | `0xc583b1aa2f68BE9176Ce17b36b6928c99091E3fd` | [Basescan](https://sepolia.basescan.org/address/0xc583b1aa2f68BE9176Ce17b36b6928c99091E3fd) |
| Solana Devnet | kredz_score_badge | `x6MWmEFP2dDNepzXjyZngt5EvQqBDy6Vry6svcaXXMM` | [Solscan](https://solscan.io/account/x6MWmEFP2dDNepzXjyZngt5EvQqBDy6Vry6svcaXXMM?cluster=devnet) |
| Midnight Preprod | kredz_score_profile | Deploy via app (5 circuits compiled) | [Indexer](https://indexer.preprod.midnight.network/api/v4/graphql) |

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
              ▼            ▼                ▼            ▼
   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
   │   BASE (EVM)  │ │    CANTON     │ │  SOLANA (SVM)│ │   CARDANO    │
   │   Sepolia     │ │  Zenith EVM   │ │    Devnet    │ │  Blockfrost  │
   │   ──────────  │ │  ──────────   │ │  ──────────  │ │  ──────────  │
   │   • ERC-8004  │ │  • Sub-tx     │ │  • Score PDA │ │  • L1 hist   │
   │   • Soulbound │ │  • Private    │ │  • Ed25519   │ │  • 1AM wallet│
   └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

One identity, five networks, zero repetition of the onboarding process.

---

## Quick Start

### Prerequisites

| Tool | Why |
|------|-----|
| Node.js 22+ | Frontend + backend |
| 1AM Wallet | Midnight connection (dust-free proving via ProofStation) |
| MetaMask | Base (EVM) connection |
| Phantom | Solana connection |

### Frontend (kredz.xyz)

```bash
cd kredz-frontend
npm install
npm run dev            # http://localhost:5173
```

### Midnight Fellowship App (kredz-midnight/)

```bash
cd kredz-midnight
npm ci
npm run compile        # compile Compact contract (5 circuits)
npm run sync-zk        # copy ZK assets to public/
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

### Base Contracts (Foundry)

```bash
cd contracts
forge test -vv
```

### Canton (Zenith EVM)

```bash
cd canton
docker compose up -d          # starts LocalNet: 2 participants + sequencer + mediator
```

---

## Privacy Features

KREDZ uses three Midnight privacy patterns:

| Feature | Implementation | What it protects |
|---------|---------------|-----------------|
| **Witness-based auth** | `witness attestorSecret()` in Compact | Attestor proves knowledge of private key via ZK without revealing it on-chain |
| **Score commitment hashing** | `persistentHash(score, salt)` | Actual credit score is a private witness — only the hash goes on-chain |
| **Selective disclosure** | `prove_tier()` / `prove_score_hash()` | Users prove their credit tier or score threshold without revealing exact score |

---

## Three-Layer Scoring Model

The KREDZ Score (0–1000):

| Layer | Weight | Description |
|-------|--------|-------------|
| **On-Chain Signals** | 40% | Wallet age, DeFi interactions, repayment history across Midnight + EVM |
| **ZK-Attested KYC** | 40% | Income, employment, bank history — proven via ZK without raw data exposure |
| **Financial Literacy** | 20% | 5 modules with quizzes, time-decay XP, streak bonuses |

---

## Privacy Tiers

| Tier | Name | Score Range | Proof Required | Lender Access |
|------|------|-------------|----------------|--------------|
| 0 | **Anonymous** | 0–399 | None | Micro-lending only |
| 1 | **Pseudonymous** | 400–649 | ZK-proof of 1 attribute | Mid-tier DeFi |
| 2 | **Full Compliance** | 650–1000 | Full ZK-KYC bundle | Canton institutional |

---

## Repository Structure

```
kredz/
├── kredz-frontend/          # React 19 + Vite 8 + Tailwind v4 (kredz.xyz)
│   ├── contracts/
│   │   └── kredz.compact    # Midnight ZK smart contract (6 circuits)
│   ├── public/              # robots.txt, sitemap.xml, .well-known/, auth.md
│   ├── src/
│   │   ├── pages/           # Landing, LinkWallets, TierSelection, Dashboard, Privacy
│   │   ├── components/      # Navbar, Toast, LiteracyModules, ProtectedRoute
│   │   ├── hooks/           # useMidnightWallet, useEvmWallet, useSolanaWallet
│   │   ├── midnight/        # types, providers, contract API
│   │   ├── context/         # AppContext (global state)
│   │   └── lib/             # webmcp.ts (WebMCP agent tools)
│   ├── middleware.ts         # Vercel Edge Middleware (Markdown for Agents)
│   └── vercel.json           # SPA rewrites + Link headers
│
├── kredz-midnight/           # Midnight Build Club Fellowship app
│   ├── contracts/
│   │   └── kredz_score_profile.compact   # 5 circuits with privacy features
│   ├── contracts/managed/    # Compiled output (keys/, zkir/, contract/)
│   ├── src/
│   │   ├── components/       # WalletConnect, ScoreAttest, ScoreProfile, ProveTier
│   │   ├── context/          # WalletContext (1AM wallet state)
│   │   └── midnight/         # session, indexer-patch, private-state, contract
│   ├── public/contract/      # Synced ZK assets
│   ├── scripts/              # compile-contract.js, sync-zk.js
│   └── README.md             # Full setup, build, run instructions
│
├── contracts/               # Foundry — Solidity for Base (Sepolia)
│   ├── src/
│   │   ├── KredzAttestationVerifier.sol
│   │   ├── KredzScoreBadge.sol
│   │   └── MockReputationRegistry.sol
│   ├── script/Deploy.s.sol
│   ├── test/KredzAttestationVerifier.t.sol
│   └── foundry.toml
│
├── solana/                   # Anchor program (SVM portability)
│   ├── programs/kredz_score_badge/src/lib.rs
│   ├── tests/kredz_score_badge.ts
│   └── Anchor.toml
│
├── canton/                   # Canton Network (Zenith EVM + DAML)
│   ├── daml/                 # DAML contracts + tests
│   ├── daml.yaml
│   └── docker-compose.yaml
│
├── backend/                  # Scoring engine (Node.js + Python XGBoost)
│   ├── src/
│   │   ├── scoring/          # Layer 1/2/3 + ML bridge
│   │   ├── attestation/      # ECDSA signer + sync pipeline
│   │   ├── providers/        # Midnight indexer, EVM RPC, SumSub
│   │   └── api/              # REST API + auth + rate limiting
│   ├── python/               # XGBoost model + stdin/stdout bridge
│   └── openapi.yaml          # Score API specification
│
├── relayer/                  # Midnight to Base attestation relayer
│   └── index.ts
│
├── effectstream/             # Multichain sync engine (5 networks)
│
├── DEPLOYMENT_PLAN.md        # Deployment plan, addresses, verification
├── PROGRESS.md               # Detailed task progress
├── prd.md                    # Product Requirements Document v0.2
└── README.md
```

---

## Built With

| Layer | Technology | Network |
|-------|-----------|---------|
| ZK Contracts | Compact 0.5.1 | Midnight Preprod |
| EVM Contracts | Solidity 0.8.24 + Foundry | Base Sepolia |
| SVM Contracts | Anchor 0.31 (Rust) | Solana Devnet |
| Privacy Contracts | DAML 3.3.0 + Solidity (Zenith EVM) | Canton |
| Native Chain | Blockfrost API | Cardano |
| Frontend | React 19 + Vite 8 + Tailwind v4 | — |
| Midnight App | React 18 + Vite 5 + Midnight SDK v4 | Midnight Preprod |
| Backend | Node.js + Express + TypeScript | — |
| ML Model | Python + XGBoost | — |
| Orchestration | Docker Compose | — |
| Wallet | 1AM (dust-free proving via ProofStation) | Midnight |
| Sync | EffectStream | All 5 networks |

---

## Agent Readiness

kredz.xyz is agent-ready with Cloudflare's standards:

- `robots.txt` with AI crawler rules and Content-Signal
- `sitemap.xml` for crawler discovery
- `auth.md` — agent registration instructions
- `.well-known/mcp/server-card.json` — MCP server card
- `.well-known/agent-skills/index.json` — agent skills discovery
- `.well-known/api-catalog` — RFC 9727 API catalog
- `.well-known/oauth-authorization-server` — OAuth discovery
- `.well-known/oauth-protected-resource` — protected resource metadata
- WebMCP tools: `kredz_get_score`, `kredz_prove_tier`
- Markdown for Agents (Vercel Edge Middleware)
- DNS-AID record: `_index._agents.kredz.xyz`

---

## Network Status

| Network | Contract | Status | Details |
|---------|----------|--------|---------|
| Midnight | `kredz_score_profile.compact` | Compiled (5 circuits) | Deploy via kredz-midnight app |
| Base | 2 Solidity contracts | Deployed on Sepolia | `0x318E...` + `0xc583...` |
| Solana | Anchor program | Deployed on Devnet | `x6MWmEF...` |
| Canton | 4 DAML templates | Code complete | Requires Nix + Docker for cn-quickstart |

---

## Ecosystem

- Listed on [midnight-awesome-dapps](https://github.com/midnightntwrk/midnight-awesome-dapps) (PR #133)
- Midnight Build Club Fellowship submission
- Built for the Build on Canton Hackathon (June 2026)
- Track: Private DeFi & Capital Markets

## License

This project is licensed under the Apache License, Version 2.0 — see [LICENSE](LICENSE) for details.
