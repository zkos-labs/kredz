# kredz.xyz — EffectStream Sync Engine

Replaces manual `relayer/index.ts` polling. Uses [EffectStream](https://github.com/effectstream/effectstream)'s
Sync Service to read events from all 5 networks and feed them into a unified state machine
that computes the KREDZ Score (0-1000).

## Architecture

```
effectstream/
├── shared/data-types/src/
│   └── config.ts          # ConfigBuilder: 5 networks + primitives
├── state-machine/src/
│   └── scoring.ts         # Three-layer score computation as state transition functions
└── package.json            # bun + EffectStream deps
```

## Networks Monitored

| Network | Protocol | Purpose |
|---------|----------|---------|
| NTP | `NTP_MAIN` | Deterministic clock (1s tick) |
| Midnight | `MIDNIGHT_PARALLEL` | ZK contract events (score, tier, attestation, literacy) |
| Base | `EVM_RPC_PARALLEL` | EVM SBT badge events |
| Cardano | `CARDANO_CARP_PARALLEL` | Wallet history for Layer 1 scoring |
| Solana | `SOLANA` (stub) | ScoreBadge PDA events (TBD) |

## Primitives (Event Watchers)

| Primitive | Scheduled Prefix | Source |
|-----------|-----------------|--------|
| `KredzScoreUpdated` | `scoreUpdated` | Midnight |
| `KredzTierChanged` | `tierChanged` | Midnight |
| `KredzAttestationStored` | `attestationStored` | Midnight |
| `KredzLiteracyCompleted` | `literacyCompleted` | Midnight |
| `KredzSbtEvents` | `sbtEvent` | Base |
| `CardanoWalletHistory` | `cardanoTx` | Cardano |

## State Machine (Scoring Engine)

State transition functions in `state-machine/src/scoring.ts`:

- `onScoreUpdated()` — recomputes three-layer score (Layer 1: on-chain, Layer 2: ZK-KYC, Layer 3: literacy)
- `onTierChanged()` — updates privacy tier (0/1/2)
- `onAttestationStored()` — counts attestations
- `onLiteracyCompleted()` — updates XP with time-decay

Same scoring algorithm as `backend/python/model.py` but runs deterministically within EffectStream's NTP-ordered event stream.

## Quick Start

```bash
cd effectstream
bun install
cp .env.example .env  # fill in chain RPC URLs and API keys
bun run dev
```

## Relationship to relayer/index.ts

The `relayer/index.ts` is a polling-based approach. EffectStream replaces it with an event-driven architecture.
Both produce the same output. The relayer is kept as fallback until state-machine.ts output is validated.
