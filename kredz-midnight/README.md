# KREDZ Score Profile — Compact Contract

Privacy-preserving credit identity smart contract for Midnight Network. This directory contains the Compact source, compiled artifacts, and compile pipeline.

## Contract

`contracts/kredz_score_profile.compact` — 5 ZK circuits:

| Circuit | Privacy Feature |
|---------|----------------|
| `attest_score` | Score + salt are private witnesses, only commitment hash and tier go on-chain |
| `prove_tier` | Returns tier without revealing exact score (selective disclosure) |
| `prove_score_hash` | ZK commitment opening proof — verifier learns only true/false |
| `link_evm` | Links EVM address with attestor witness authorization |
| `link_solana` | Links Solana address with attestor witness authorization |

## Prerequisites

- **Node.js 22+**
- **Midnight Compact compiler `0.5.1`** (`compact --version` must output `compact 0.5.1`)
  - Install: [Midnight Getting Started](https://docs.midnight.network/getting-started)
  - Check the [support matrix](https://docs.midnight.network/relnotes/support-matrix)

## Quick Start

```bash
cd kredz-midnight
npm ci
npm run compile        # compiles 5 circuits, generates keys/ + zkir/
npm run sync-zk        # copies ZK assets to ../kredz-frontend/public/contract/

cd ../kredz-frontend
npm install
npm run dev            # http://localhost:5173
```

## Output Structure

```
contracts/managed/kredz-score-profile/
  keys/
    attest_score.prover       # 2-10 MB each
    attest_score.verifier     # ~2 KB each
    ...
  zkir/
    attest_score.bzkir        # 1-3 KB each
    attest_score.zkir
    ...
  contract/
    index.js                  # TypeScript bindings
    index.d.ts
```

## Dependencies (pinned)

- `@midnight-ntwrk/compact-js` `2.5.0`
- `@midnight-ntwrk/compact-runtime` `0.15.0`
- `@midnight-ntwrk/ledger-v8` `8.0.3`

The frontend app consuming this contract is at `../kredz-frontend/`.
