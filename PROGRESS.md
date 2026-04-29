# KREDZ Frontend — Development Progress

**Project:** KREDZ — Privacy-preserving credit scoring on the Midnight blockchain  
**Stack:** React 18 + Vite + TypeScript + Tailwind CSS v4 + Framer Motion  
**Design:** MotionSites.ai premium finance aesthetic (dark, gold/amber, glassmorphism)  
**Started:** 2026-04-29

---

## Architecture Overview

```
kredz-frontend/
├── contracts/
│   └── kredz.compact          # Midnight ZK smart contract (Compact language)
├── src/
│   ├── context/
│   │   └── AppContext.tsx      # Global state: wallet, tier, score, modules
│   ├── hooks/
│   │   └── useMidnightWallet.ts # Lace Beta wallet connection hook
│   ├── midnight/
│   │   ├── types.ts            # Window.midnight type augmentation
│   │   ├── providers.ts        # Midnight SDK provider setup
│   │   └── contract.ts         # Deploy/join KREDZ contract helpers
│   ├── contracts/
│   │   └── kredz.ts            # TypeScript contract API types + stub
│   ├── components/
│   │   ├── BlurIn.tsx          # Scroll-triggered blur-in animation wrapper
│   │   ├── Navbar.tsx          # Fixed navbar with wallet connect
│   │   ├── ProtectedRoute.tsx  # Wallet-gated route guard
│   │   ├── Toast.tsx           # Lightweight toast notification system
│   │   └── LiteracyModules.tsx # Financial literacy quiz modules
│   ├── pages/
│   │   ├── Landing.tsx         # Landing page (Hero + How It Works + Tiers + CTA)
│   │   ├── TierSelection.tsx   # ZK-KYC tier selection + proof submission
│   │   └── Dashboard.tsx       # Score ring + layer breakdown + literacy modules
│   ├── App.tsx                 # Router + AnimatePresence page transitions
│   ├── main.tsx                # Entry point
│   └── index.css               # Tailwind v4 + design tokens + utilities
```

---

## User Flow

```
Landing Page
    ↓ "Launch App" / "Connect Wallet"
Lace Beta Wallet Connect (window.midnight.mnLace)
    ↓ wallet.enable() → walletAPI.state() → serviceUriConfig()
Tier Selection (/app/tier)
    ├── Tier 0 (Anonymous)     → setTier0() — no proof needed
    ├── Tier 1 (Pseudonymous)  → setTier1(attribute) — ZK-prove one attribute
    └── Tier 2 (Full Compliance) → setTier2(fullKyc) — ZK-prove full KYC bundle
    ↓ deployKredzContract() → MidnightSetupAPI
Dashboard (/app/dashboard)
    ├── Animated KREDZ Score ring (0–1000)
    ├── Tier badge (Anonymous / Pseudonymous / Full Compliance)
    ├── Layer breakdown (On-chain / ZK-KYC / Literacy)
    └── Literacy Modules (5 modules, quiz → on-chain score update)
```

---

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--color-dark` | `#00041F` | Background |
| `--color-accent` | `#B56939` | Primary accent, CTAs |
| `--color-gold` | `#D4A853` | Highlights, score |
| `--color-light` | `#EFF4FF` | Text |
| `--color-muted` | `#49484F` | Secondary text |
| `.glass` | `backdrop-blur-12px + border rgba(181,105,57,0.18)` | Cards |
| `.glow-btn` | `box-shadow: 0 4px 60px 4px rgba(181,105,57,0.45)` | CTA buttons |
| `.text-gradient` | `linear-gradient(135deg, #B56939, #D4A853)` | Score, headings |
| Font | Manrope (headings) + Inter (body) | Google Fonts |
| **Hero Video** | `https://res.cloudinary.com/dfonotyfb/video/upload/v1775585556/dds3_1_rqhg7x.mp4` | Full-screen cinematic background with layered overlays |

**Aesthetic:** Premium dark finance with cinematic video background. The hero section features a full-screen video with layered dark overlays (55% → 30% → 75% gradient) and a subtle amber radial glow. Inner app pages (TierSelection, Dashboard) carry a subtle video tint (7% opacity) for visual continuity.

---

## Task Progress

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | Project scaffold & design system | ✅ Done | Vite + React + TS + Tailwind v4 + design tokens |
| 2 | Landing page — Hero section | ✅ Done | Parallax fade, glow CTA, stats grid |
| 3 | Landing page — How It Works, Tiers, CTA | ✅ Done | BlurIn scroll animations, tier cards |
| 4 | Wallet connection — Lace Beta | ✅ Done | `useMidnightWallet` hook, error handling |
| 5 | Routing & protected routes | ✅ Done | React Router, AnimatePresence transitions |
| 6 | Compact ZK contract | ✅ Done | `kredz.compact` written; needs `compact` toolchain to compile |
| 7 | Midnight providers setup | ✅ Done | `buildProviders()` wires all SDK providers from wallet state |
| 8 | Tier Selection — ZK-KYC flow | ✅ Done | Real circuit calls (mock until contract compiled) |
| 9 | Dashboard — Score ring & layers | ✅ Done | Animated SVG ring, layer breakdown, refresh from chain |
| 10 | Literacy modules | ✅ Done | 5 modules, 3-question quizzes, on-chain XP submission |
| 11 | Polish — animations, responsiveness | ✅ Done | Page transitions, mobile-responsive, toast notifications |

**Build status:** ✅ `npm run build` passes (411 kB bundle, 0 errors)

---

## Midnight Contract — Next Steps

The `contracts/kredz.compact` file is written and ready. To compile it into real ZK circuits:

```bash
# 1. Install the Midnight toolchain
# https://docs.midnight.network/getting-started/installation

# 2. Compile the contract
compact compile contracts/kredz.compact contracts/managed/kredz

# 3. Replace the mock API in src/midnight/contract.ts with:
import { MidnightSetupAPI } from '@meshsdk/midnight-setup';
import { KredzContract } from '../contracts/managed/kredz/contract';

const contractInstance = new KredzContract({});
const api = await MidnightSetupAPI.deployContract(providers, contractInstance);
```

The `buildProviders()` function in `src/midnight/providers.ts` is already wired to the real Midnight SDK — it will work as-is once the contract is compiled.

---

## Running Locally

```bash
cd kredz-frontend
npm install
npm run dev        # http://localhost:5173

# Prerequisites for full ZK flow:
# - Lace Beta Wallet: https://chromewebstore.google.com/detail/lace-midnight-preview/hgeekaiplokcnmakghbdfbgnlfheichg
# - Midnight testnet tokens in wallet
# - Midnight toolchain for contract compilation
```

---

## Known Limitations / TODOs

- **Contract is mocked:** `src/midnight/contract.ts` uses a mock API with simulated delays. Replace with real `MidnightSetupAPI` after compiling `kredz.compact` with the Midnight toolchain.
- **Score computation:** Layer 1 (on-chain signals) scoring engine not yet implemented — currently uses static values. Needs a backend indexer to analyze wallet history.
- **`levelPrivateStateProvider`** uses LevelDB which requires Node.js environment. For browser use, swap to an IndexedDB-based provider when available from the Midnight SDK.
- **Contract address persistence:** Currently stored in React state only (lost on refresh). Add `localStorage` persistence or a backend registry.
