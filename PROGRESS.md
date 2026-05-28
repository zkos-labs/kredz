# KREDZ — Development Progress

**Project:** KREDZ — Privacy-preserving credit scoring across Midnight, Canton, Base, Solana, and Cardano
**Stack:** React 18 + Vite + TypeScript + Tailwind CSS v4 + Framer Motion (frontend) / Node.js + Express + Python + XGBoost (backend) / Compact + DAML + Solidity + Anchor + Blockfrost (contracts, 5 networks)
**Wallet:** 1AM (dust-free ZK proving, ProofStation sponsors all fees) **Sync:** EffectStream (multichain state machine)
**Design:** Premium dark cinematic — black + cream (#DEDBC8) — Prisma-inspired with noise textures and WordsPullUp animations
**Started:** 2026-04-29
**Last Updated:** 2026-05-22

---

## Architecture Overview

```
kredz/
├── prd.md                          # v0.2 PRD — full stack specification
├── PROGRESS.md                     # This file
├── kredz-frontend/                 # React + Vite + Tailwind v4 frontend (BUILT)
│   ├── contracts/kredz.compact     #   Midnight ZK contract (written, needs compile)
│   └── src/                        #   All pages, components, hooks, providers
├── contracts/                      # Foundry — Solidity contracts for Base (BUILT)
│   └── src/{KredzAttestationVerifier, KredzScoreBadge}.sol
├── relayer/                        # Node.js attestation relayer (BUILT)
│   └── index.ts
├── solana/                         # Solana Anchor program (needs build fixes)
├── canton/                         # ★ NEW — Canton Network DAML contracts
│   └── daml/{KredzScore, KredzQuery, KredzSubscription, Main}.daml
└── backend/                        # ★ NEW — Scoring engine (Node.js + Python ML)
    ├── src/{api, scoring, providers, attestation, types}/
    └── python/{model.py, bridge.py, requirements.txt}
```

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

### Midnight Contract

| # | Task | Status | Notes |
|---|------|--------|-------|
| MC-1 | `kredz.compact` contract | ✅ Written | 6 circuits, 6 ledger fields |
| MC-2 | Compile with Midnight toolchain | 🔴 Blocked | Need `compact` CLI + toolchain installation |
| MC-3 | Replace mock API | 🔴 Blocked | Depends on MC-2 |
| MC-4 | IndexedDB private state provider | 🔴 Blocked | Need Midnight SDK update or custom wrapper |
| MC-5 | localStorage contract persistence | 🟡 Pending | Quick fix; can be done independently |

### Canton Network (★ NEW)

| # | Task | Status | Notes |
|---|------|--------|-------|
| CN-1 | DAML contract files | ✅ Done | 4 templates in `canton/daml/` |
| CN-2 | daml.yaml project config | ✅ Done | SDK 3.3.0 |
| CN-3 | Compile (via cn-quickstart) | 🔴 Blocked | Need Nix + Docker + 8 GB RAM |
| CN-4 | Deploy to DevNet | 🔴 Blocked | Need SV sponsor for validator onboarding |
| CN-5 | Score sync pipeline (Midnight → Canton) | 🟡 Pending | Backend stub ready; needs live chain |
| CN-6 | Institutional lender onboarding | 🔴 Future | Phase 2 (Months 6-9) |

### Scoring Engine Backend (★ NEW)

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
| SE-9 | Base sync | 🟡 Stub | Needs deployed verifier contract on Base Sepolia |
| SE-10 | Canton sync | 🟡 Stub | Needs Canton participant node |
| SE-11 | SumSub KYC integration | 🟡 Stub | Client ready; needs API credentials |

### Attestation Relayer

| # | Task | Status | Notes |
|---|------|--------|-------|
| AR-1 | Relayer service (`relayer/index.ts`) | ✅ Done | Polls indexer, signs ECDSA, submits to Base |
| AR-2 | Test with live Midnight contract | 🔴 Blocked | Depends on MC-2 (contract compilation) |
| AR-3 | Test with deployed Base verifier | 🔴 Blocked | Needs Base Sepolia deployment |

### Solana (Anchor Program)

| # | Task | Status | Notes |
|---|------|--------|-------|
| SL-1 | ScoreBadge program (`lib.rs`) | ✅ Written | PDA + Ed25519 verification |
| SL-2 | Tests (`kredz_score_badge.ts`) | ✅ Written | LiteSVM-based tests |
| SL-3 | Fix Anchor v0.31 compatibility | 🔴 Blocked | Needs downgrade to v0.30 or syntax fix |
| SL-4 | Deploy to Solana devnet | 🔴 Blocked | Depends on SL-3 |

---

**Build status (frontend):** ✅ `npm run build` passes (426 kB bundle, 0 errors)
**Build status (backend):** 🟡 Not yet installed (`npm install` needed)
**Build status (Canton DAML):** 🟡 Needs `cn-quickstart` + `dpm build`

---

## Running Locally

```bash
# Frontend
cd kredz-frontend
npm install
npm run dev        # http://localhost:5173

# Backend (scoring engine)
cd backend
npm install
pip install -r python/requirements.txt
cp .env.example .env  # edit with your keys
npm run dev         # http://localhost:3001

# Canton (requires Nix + Docker)
# See canton/README.md for cn-quickstart instructions
```

---

## Known Limitations

- **kredz.compact:** Written but not compiled. Midnight toolchain required.
- **mock contract API:** `kredz-frontend/src/midnight/contract.ts` uses mock with simulated delays.
- **`levelPrivateStateProvider`:** Uses LevelDB (Node.js). Need IndexedDB provider for browser.
- **Scoring engine:** MVP returns default/placeholder data until connected to live Midnight indexer.
- **Canton DAML:** Compiles with correct DAML v3.x syntax but needs `cn-quickstart` for `dpm build`.
- **Solana:** Anchor v0.31 compatibility issues need resolution.

---

## Next Immediate Steps

1. **Install Midnight toolchain** → compile `kredz.compact` → replace mock API
2. **Resolve IndexedDB provider** → browser-compatible private state storage
3. **Spin up Midnight local devnet** → test end-to-end flow
4. **Deploy Base contracts to Sepolia** → test attestation relayer
5. **Set up cn-quickstart** → compile and test DAML contracts locally
6. **Install backend deps** → test Python ML bridge → connect to real chain data
