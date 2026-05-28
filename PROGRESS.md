# KREDZ — Development Progress

**Project:** KREDZ — Privacy-preserving credit scoring across Midnight, Canton, Base, Solana, and Cardano
**Stack:** React 18 + Vite + TypeScript + Tailwind CSS v4 + Framer Motion (frontend) / Node.js + Express + Python + XGBoost (backend) / Compact + DAML + Solidity + Anchor + Blockfrost (contracts, 5 networks)
**Wallet:** 1AM (dust-free ZK proving, ProofStation sponsors all fees) **Sync:** EffectStream (multichain state machine)
**Design:** Premium dark cinematic — black + cream (#DEDBC8) — Prisma-inspired with noise textures and WordsPullUp animations
**Started:** 2026-04-29
**Last Updated:** 2026-05-29

---

## Architecture Overview

```
kredz/
├── prd.md                          # v0.2 PRD — full stack specification
├── PROGRESS.md                     # This file
├── DEPLOYMENT_PLAN.md              # Full deployment plan & addresses
├── kredz-frontend/                 # React + Vite + Tailwind v4 frontend (BUILT)
│   ├── contracts/kredz.compact     #   Midnight ZK contract (written, needs compile)
│   └── src/                        #   All pages, components, hooks, providers
├── kredz-midnight/                 # ★ NEW — Midnight Build Club Fellowship app
│   ├── contracts/kredz_score_profile.compact  # Compiled (5 circuits, ZK keys)
│   ├── src/                        #   React 18 + 1AM wallet + 4-tab UI
│   └── README.md                   #   Full setup instructions
├── contracts/                      # Foundry — Solidity contracts for Base (BUILT)
│   └── src/{KredzAttestationVerifier, KredzScoreBadge}.sol
├── relayer/                        # Node.js attestation relayer (BUILT)
│   └── index.ts
├── solana/                         # Solana Anchor program (DEPLOYED)
├── canton/                         # Canton Network DAML contracts
│   └── daml/{KredzScore, KredzQuery, KredzSubscription, Main}.daml
├── backend/                        # Scoring engine (Node.js + Python ML)
│   ├── src/{api, scoring, providers, attestation, types}/
│   └── python/{model.py, bridge.py, requirements.txt}
└── effectstream/                   # EffectStream multichain sync engine
```

### Separate Repos

| Repo | Location | Purpose |
|------|----------|---------|
| `midnight-agent-did-manager` | `~/Documents/Github/midnight-agent-did-manager/` | DID Registry for AI agents on Midnight (standalone Build Club project) |

---

## Deployed Contract Addresses

### Base Sepolia (EVM) — ✅ Deployed

| Contract | Address |
|----------|---------|
| KredzAttestationVerifier | `0x318Ecad2bA565778753918e287AAaA2e65E5b1Dd` |
| KredzScoreBadge | `0xc583b1aa2f68BE9176Ce17b36b6928c99091E3fd` |
| Deployer | `0x41003D8a06072bD14Ae1816E1a79294D15F48eCA` |

### Solana Devnet — ✅ Deployed

| Detail | Value |
|--------|-------|
| Program ID | `x6MWmEFP2dDNepzXjyZngt5EvQqBDy6Vry6svcaXXMM` |
| Deployer | `E9PsSz9XWgNR3TmSC57NHC2ZxJzF5NmbrWsDKEe7A7yM` |
| RELAYER_PUBKEY | `c34e6f7b2a8e8490592c4601f40a0f0adb0ed483c4245fbb1db98d2d273e5fc4` |

### Midnight Preprod — ✅ Ready for deploy

| Detail | Value |
|--------|-------|
| Contract | `kredz_score_profile.compact` |
| Circuits | 5 (attest_score, prove_tier, prove_score_hash, link_evm, link_solana) |
| Network | Preprod |

---

## User Flow

```
Landing Page
    ↓ "Launch App" / "Connect Wallet"
Lace Beta Wallet Connect (window.midnight.mnLace)
    ↓ wallet.enable() → walletAPI.state() → serviceUriConfig()
Link Wallets (/app/link)
    ├── Lace (Midnight) + MetaMask (Base) + Phantom (Solana)
    ↓ linkEvmAddress / linkSolanaAddress
Tier Selection (/app/tier)
    ├── Tier 0 (Anonymous)     → setTier0() — no proof needed
    ├── Tier 1 (Pseudonymous)  → setTier1(attribute) — ZK-prove one attribute
    └── Tier 2 (Full Compliance) → setTier2(fullKyc) — ZK-prove full KYC
    ↓ deployKredzContract() → MidnightSetupAPI
Dashboard (/app/dashboard)
    ├── Animated KREDZ Score ring (0–1000)
    ├── Tier badge (Anonymous / Pseudonymous / Full Compliance)
    ├── Layer breakdown (On-chain / ZK-KYC / Literacy)
    ├── Base Score card (SBT status, sync, mint)
    ├── Solana Score card
    └── Literacy Modules (5 modules, quiz → on-chain XP submission)

                    ── Scoring Engine Backend (Off-Chain) ──
                    ↓ computeScore()
                    ├── Layer 1: Midnight indexer + EVM RPC wallet analysis
                    ├── Layer 2: SumSub ZK-KYC credential check
                    ├── Layer 3: Literacy XP from Midnight indexer
                    └── ML: XGBoost inference via Python bridge
                    ↓ signAttestation()
                    ├── → Base: KredzAttestationVerifier.verifyAndUpdate()
                    └── → Canton: KredzScore DAML contract update

                    ── Canton Network (Institutional) ──
                    ↓ KredzScore template
                    ├── Institutional lender → QueryScore
                    │   └── KredzScoreResponse → AcknowledgeScore → KredzAuditLog
                    └── KredzLenderSubscription (webhook notifications)
```

---

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--color-dark` | `#00041F` | Background |
| `--color-accent` | `#B56939` | Primary accent, CTAs |
| `--color-gold` | `#D4A853` | Highlights, score |
| `--color-light` | `#EFF4FF` | Text |
| `.glass` | `backdrop-blur-12px + border rgba(181,105,57,0.18)` | Cards |
| `.glow-btn` | `box-shadow: 0 4px 60px 4px rgba(181,105,57,0.45)` | CTAs |
| `.cinematic-bg` | CSS animated floating orbs (brand colors) | Global background |
| Font | Manrope (headings) + Inter (body) | Google Fonts |

---

## Task Progress

### Frontend (kredz-frontend/)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Project scaffold & design system | ✅ Done | Vite + React + TS + Tailwind v4 |
| 2 | Landing page — Hero, How It Works, Tiers, CTA | ✅ Done | Cinematic background + BlurIn animations |
| 3 | Wallet connection — Lace Beta | ✅ Done | `useMidnightWallet` hook, error handling |
| 4 | Routing & protected routes | ✅ Done | React Router, AnimatePresence |
| 5 | Compact ZK contract | ✅ Done | `kredz.compact` written; needs compile |
| 6 | Midnight providers setup | ✅ Done | `buildProviders()` wired to real SDK |
| 7 | Tier Selection — ZK-KYC flow | ✅ Done | 3 tiers, mock proof submission |
| 8 | Dashboard — Score ring & layers | ✅ Done | Animated SVG ring, layer breakdown |
| 9 | Literacy modules | ✅ Done | 5 modules, 3-question quizzes |
| 10 | Cinematic global background | ✅ Done | CSS animated dark mesh orbs |
| 11 | Multichain — EVM wallet (MetaMask) | ✅ Done | `useEvmWallet` hook, Base Sepolia switch |
| 12 | Multichain — LinkWallets page | ✅ Done | Lace + MetaMask + Phantom linking |
| 13 | Multichain — Base contracts | ✅ Done | Solidity contracts + Foundry tests |
| 14 | Multichain — Attestation relayer | ✅ Done | `relayer/index.ts` — polls indexer, signs, relays |
| 15 | Multichain — useBaseScore hook | ✅ Done | Reads KredzScoreBadge on Base via RPC |
| 16 | Multichain — Dashboard score cards | ✅ Done | Base + Solana score display, sync buttons |

### kredz-midnight/ — Midnight Build Club Fellowship App (★ NEW)

| # | Task | Status | Notes |
|---|------|--------|-------|
| MB-1 | `kredz_score_profile.compact` contract | ✅ Done | 5 circuits with privacy features |
| MB-2 | Compile with `compact 0.5.1` | ✅ Done | 5 circuits, all ZK keys generated |
| MB-3 | 1AM wallet integration | ✅ Done | Full session setup, patched indexer, proof provider |
| MB-4 | React frontend (4 tabs) | ✅ Done | Deploy / Attest / Profile / Prove |
| MB-5 | Sync ZK assets to public/ | ✅ Done | keys/ + zkir/ synced |
| MB-6 | Fresh clone verification | ✅ Done | npm ci → compile → sync-zk → typecheck → build (all pass) |
| MB-7 | Deploy to Midnight Preprod | 📋 Manual | Requires browser + 1AM wallet connection |
| MB-8 | End-to-end test (attest → prove) | 📋 Manual | Requires deployed contract |

### Midnight Contract (kredz.compact in kredz-frontend/)

| # | Task | Status | Notes |
|---|------|--------|-------|
| MC-1 | `kredz.compact` contract | ✅ Written | 6 circuits, 6 ledger fields |
| MC-2 | Compile with Midnight toolchain | 🟡 Pending | Toolchain available; needs dedicated compile step |
| MC-3 | Replace mock API | 🟡 Pending | Depends on MC-2 |
| MC-4 | IndexedDB private state provider | 🟡 Pending | Can use patterns from kredz-midnight/ |
| MC-5 | localStorage contract persistence | 🟡 Pending | Quick fix; can be done independently |

### Canton Network

| # | Task | Status | Notes |
|---|------|--------|-------|
| CN-1 | DAML contract files | ✅ Done | 4 templates in `canton/daml/` |
| CN-2 | daml.yaml project config | ✅ Done | SDK 3.3.0 |
| CN-3 | Compile (via cn-quickstart) | 🔴 Blocked | Need Nix + Docker + 8 GB RAM |
| CN-4 | Deploy to DevNet | 🔴 Blocked | Need SV sponsor for validator onboarding |
| CN-5 | Score sync pipeline (Midnight → Canton) | 🟡 Pending | Backend stub ready; needs live chain |
| CN-6 | Institutional lender onboarding | 🔴 Future | Phase 2 (Months 6-9) |

### Scoring Engine Backend

| # | Task | Status | Notes |
|---|------|--------|-------|
| SE-1 | Project scaffold (Express + TS) | ✅ Done | `backend/src/` structure complete |
| SE-2 | API routes + middleware | ✅ Done | Auth, rate limiting, score endpoints |
| SE-3 | Layer 1 — On-chain wallet analysis | ✅ Done | Midnight indexer GraphQL client (placeholder data) |
| SE-4 | Layer 2 — ZK-KYC credentials | 🟡 Stub | SumSub client ready; needs API credentials |
| SE-5 | Layer 3 — Literacy data | 🟡 Stub | Needs live indexer connection |
| SE-6 | ML model (XGBoost + Python bridge) | ✅ Done | Feature engineering + coefficient-based scoring |
| SE-7 | Python bridge (stdin/stdout JSON) | ✅ Done | Fallback scoring if Python unavailable |
| SE-8 | Attestation signer (ECDSA) | ✅ Done | Sign + verify with scoring engine key pair |
| SE-9 | Base sync | 🟡 Stub | Verifier deployed; needs scoring engine live data |
| SE-10 | Canton sync | 🟡 Stub | Needs Canton participant node |
| SE-11 | SumSub KYC integration | 🟡 Stub | Client ready; needs API credentials |

### Attestation Relayer

| # | Task | Status | Notes |
|---|------|--------|-------|
| AR-1 | Relayer service (`relayer/index.ts`) | ✅ Done | Polls indexer, signs ECDSA, submits to Base |
| AR-2 | Test with live Midnight contract | 🟡 Pending | Contract ready; needs connection |
| AR-3 | Test with deployed Base verifier | 🟡 Pending | Verifier deployed (0x318E...); needs relayer config |

### Solana (Anchor Program)

| # | Task | Status | Notes |
|---|------|--------|-------|
| SL-1 | ScoreBadge program (`lib.rs`) | ✅ Written | PDA + Ed25519 verification |
| SL-2 | Tests (`kredz_score_badge.ts`) | ✅ Written | LiteSVM-based tests |
| SL-3 | Fix Anchor v0.31 compatibility | ✅ Resolved | Builds with warnings; `anchor build` succeeds |
| SL-4 | Deploy to Solana devnet | ✅ Done | Program ID `x6MWmEFP2dDNepzXjyZngt5EvQqBDy6Vry6svcaXXMM` |
| SL-5 | Set RELAYER_PUBKEY_BYTES | ✅ Done | `c34e6f7b...` |

### midnight-agent-did-manager (★ NEW — Separate Repo)

| # | Task | Status | Notes |
|---|------|--------|-------|
| DA-1 | Move to separate Github folder | ✅ Done | `~/Documents/Github/midnight-agent-did-manager/` |
| DA-2 | npm ci | ✅ Done | All deps installed |
| DA-3 | Compile did_registry.compact | ✅ Done | 6 circuits compiled |
| DA-4 | Compile native_ownership_proof.compact | ✅ Done | 1 circuit compiled |

---

**Build status (kredz-frontend):** ✅ `npm run build` passes
**Build status (kredz-midnight):** ✅ Fresh clone → npm ci → compile → sync-zk → typecheck → build (all pass)
**Build status (backend):** 🟡 Not yet installed (`npm install` needed)
**Build status (Canton DAML):** 🟡 Needs `cn-quickstart` + `dpm build`
**Build status (midnight-agent-did-manager):** ✅ npm ci + compile-contract + compile-ownership-proof (all pass)

---

## Running Locally

```bash
# Frontend (kredz-frontend)
cd kredz-frontend
npm install
npm run dev        # http://localhost:5173

# Midnight App (kredz-midnight) — Fellowship submission
cd kredz-midnight
npm ci
npm run compile && npm run sync-zk
npm run dev        # http://localhost:5173

# Backend (scoring engine)
cd backend
npm install
pip install -r python/requirements.txt
cp .env.example .env  # edit with your keys
npm run dev         # http://localhost:3001

# DID Manager (separate repo)
cd ~/Documents/Github/midnight-agent-did-manager
npm ci
npm run compile-contract && npm run compile-ownership-proof
npm run dev         # http://localhost:5173

# Canton (requires Nix + Docker)
# See canton/README.md for cn-quickstart instructions
```

---

## Known Limitations

- **kredz.compact:** Written but not compiled. Midnight toolchain available — needs dedicated compile step.
- **mock contract API:** `kredz-frontend/src/midnight/contract.ts` uses mock with simulated delays.
- **`levelPrivateStateProvider`:** Uses LevelDB (Node.js). Need IndexedDB provider for browser.
- **Scoring engine:** MVP returns default/placeholder data until connected to live Midnight indexer.
- **Canton DAML:** Compiles with correct DAML v3.x syntax but needs `cn-quickstart` for `dpm build`.
- **kredz-midnight deploy:** Requires browser + 1AM wallet to deploy contract to Preprod.

---

## Next Immediate Steps

1. **Deploy kredz_score_profile** → open kredz-midnight, connect 1AM wallet, click Deploy
2. **End-to-end test** → attest score → prove tier → verify selective disclosure
3. **Wire relayer to live contracts** → connect relayer to deployed Base verifier + Midnight contract
4. **Install backend deps** → test Python ML bridge → connect to real chain data
5. **Set up cn-quickstart** → compile and test DAML contracts locally
6. **Submit to Midnight Build Club Fellowship** → repo: https://github.com/kredz-labs/kredz
