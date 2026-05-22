# kredz.xyz — Scoring Engine Backend

## Status: Scaffolded — awaiting integration

The scoring engine backend computes KREDZ Scores (0-1000) from three signal layers:
on-chain wallet analysis (Layer 1), ZK-KYC credentials (Layer 2), and financial
literacy data (Layer 3).

## Tech Stack

| Component | Technology |
|-----------|-----------|
| API server | Express (Node.js + TypeScript) |
| ML inference | Python 3 (XGBoost + NumPy) |
| ML bridge | stdin/stdout JSON (no HTTP overhead) |
| On-chain data | Midnight indexer (GraphQL), EVM RPC (ethers) |
| KYC | SumSub REST API (stub) |
| Attestation signing | ECDSA (Node.js crypto) |

## Project Structure

```
backend/
├── package.json
├── tsconfig.json
├── .env.example
├── src/
│   ├── index.ts              # Express API server (port 3001)
│   ├── config.ts             # Zod-validated env config
│   ├── api/
│   │   ├── routes.ts         # GET /score/:did, POST /score/refresh, POST /score/attest
│   │   └── middleware.ts     # API key auth, rate limiting, error handler
│   ├── scoring/
│   │   ├── engine.ts         # Orchestrator: fetch data → compute → return score
│   │   ├── layer1.ts         # Layer 1: on-chain wallet analysis
│   │   ├── layer2.ts         # Layer 2: ZK-KYC credentials (SumSub stub)
│   │   ├── layer3.ts         # Layer 3: literacy XP data
│   │   └── model.ts          # ML bridge: spawns Python subprocess
│   ├── providers/
│   │   ├── midnight-indexer.ts # GraphQL client for Midnight indexer
│   │   ├── evm-rpc.ts          # Base/EVM RPC via ethers
│   │   └── sumsub.ts           # SumSub KYC API integration
│   ├── attestation/
│   │   ├── signer.ts         # ECDSA signature + verification
│   │   └── sync.ts           # Base/Canton attestation sync
│   └── types/
│       └── index.ts          # Shared type definitions
├── python/
│   ├── requirements.txt      # xgboost, numpy, pandas, scikit-learn
│   ├── model.py              # XGBoost model + feature engineering
│   └── bridge.py             # stdin/stdout JSON bridge
└── README.md
```

## Quick Start

```bash
cd backend

# Install Node.js deps
npm install

# Install Python deps
pip install -r python/requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your SCORING_ENGINE_KEY, MIDNIGHT_INDEXER_URL, etc.

# Start dev server
npm run dev

# Train the ML model (if you have labeled data)
npm run train
```

## API Endpoints

### GET /api/v1/score/:did

Query a borrower's current KREDZ Score.

**Auth:** `X-Kredz-API-Key` header

**Response:**
```json
{
  "did": "did:midnight:abc123",
  "score": 720,
  "tier": "pseudonymous",
  "score_floor": 670,
  "layer_breakdown": { "onchain_pct": 41, "zk_kyc_pct": 38, "literacy_pct": 21 },
  "proof_hash": "0x...",
  "midnight_attestation_id": "att-abc",
  "valid_until": "2026-08-01T00:00:00Z",
  "updated_at": "2026-06-15T14:22:00Z"
}
```

### POST /api/v1/score/refresh

Triggers a manual score recomputation for the given DID.

**Body:** `{ "did": "did:midnight:abc123" }`

### POST /api/v1/score/attest

Generate a ZK-attestation proof for Base (chain=0) or Canton (chain=1).

**Body:** `{ "did": "...", "chain": 0 }`

## Scoring Algorithm

### Layer 1: On-Chain Signals (max 400 pts)
| Signal | Max Pts | Factors |
|--------|---------|---------|
| Wallet age | 60 | Days / 1095 (3-year cap) |
| Transaction volume | 40 | Avg monthly tx / 30 |
| DeFi interactions | 80 | Count / 100 |
| Repayment history | 120 | Repay rate × 120 - defaults × 40 |
| Asset stability | 40 | Holding days / 365 |
| Governance | 40 | Participation score |
| Cross-chain | 20 | Network count / 5 |

### Layer 2: ZK-KYC (max 400 pts, Tier 1+ only)
| Signal | Pts |
|--------|-----|
| Income proof | +120 |
| Employment proof | +80 |
| Bank history | +80 |
| E-wallet history | +60 |
| Credit commitments | -60 |
| Adverse events | -80 |

### Layer 3: Literacy (max 200 pts)
| Signal | Pts |
|--------|-----|
| Modules completed | 3/module |
| XP-based | Up to 145 |
| Accuracy bonus | Up to 20 |
| Streak bonus | Up to 20 |
| Time decay | 50-100% weight multiplier |

## ML Bridge Architecture

```
Node.js (model.ts)                   Python (bridge.py)
      │                                     │
      │ spawn python3 bridge.py             │
      │                                     │
      ├── JSON → stdin ──────────────────→  │ parse input
      │                                     │ extract features
      │                                     │ compute_score()
      │  ←─ JSON stdout ←───────────────────│ output result
      │                                     │
      ▼                                     ▼
  { layer1, layer2, layer3, total }
```

The bridge uses stdin/stdout JSON — no HTTP server needed. Fallback scoring
is used if Python is unavailable (tier-based static values).

## Phase 0 Status

| Task | Status |
|------|--------|
| API server scaffold | Done |
| ML model + feature engineering | Done |
| Python bridge | Done |
| Midnight indexer GraphQL client | Done (no live chain yet) |
| EVM RPC client | Done (no deployed oracle yet) |
| SumSub client | Stub (needs API credentials) |
| ECDSA attestation signing | Done |
| Canton sync | Stub (needs Canton node) |
| Base sync | Stub (needs deployed verifier) |

## Dependencies

### External (when live)
- Midnight indexer (GraphQL endpoint)
- Base Sepolia RPC
- SumSub API (for KYC credential issuance)
- Canton Ledger API (for institutional score delivery)

### Local
- Python 3.10+
- Node.js 20+
- SCORING_ENGINE_KEY (ECDSA private key in hex)
