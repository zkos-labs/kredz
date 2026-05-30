# KREDZ Score Profile — Midnight Network

Privacy-preserving credit identity on Midnight Network. Users attest credit scores using zero-knowledge proofs — the score itself is **never stored on-chain in plaintext**. Only cryptographic commitments and tier classifications are public.

Built for the **Midnight Build Club Fellowship**.

---

## Privacy Features

| Feature | Description |
|---------|-------------|
| **Witness-based authorization** | `witness attestorSecret()` — the attestor proves knowledge of a private key via ZK witness, without ever revealing it on-chain. |
| **Score commitment hashing** | Scores are hashed with a secret salt using `persistentHash`. Only the hash is stored in the ledger — the actual score value is a private witness that never touches the chain. |
| **Selective disclosure** | `prove_tier()` reveals only the user's tier (0/1/2) without disclosing the exact score. `prove_score_hash()` lets a user prove they know the score matching a stored commitment without revealing it. |
| **Domain-separated keys** | Attestor keys use domain separation (`"kredz:attestor:v1"`) preventing cross-contract key reuse. |

## Architecture

```
User Wallet (1AM)
    │
    ├─── attest_score(user, score, salt, tier)
    │      score + salt = PRIVATE WITNESSES
    │      score_hash + tier = PUBLIC (on-chain)
    │
    ├─── prove_tier(user)
    │      returns: tier only (score stays private)
    │
    └─── prove_score_hash(user, score, salt)
           ZK commitment opening proof
```

### Contract Circuits

| Circuit | Ledger Writes | Privacy Preserved |
|---------|--------------|-------------------|
| `attest_score` | `score_hashes`, `tiers` | `score` + `salt` are witnesses |
| `prove_tier` | none (read-only) | Exact score not returned |
| `prove_score_hash` | none (read-only) | Only boolean match returned |
| `link_evm` | `evm_linked` | EVM address disclosed (intentional) |
| `link_solana` | `solana_linked` | Solana address disclosed (intentional) |

---

## Prerequisites

- **Node.js 22+** (`node --version`)
- **Midnight Compact compiler `0.5.1`** (`compact --version` must output exactly `compact 0.5.1`)
  - Install: follow [Midnight Getting Started](https://docs.midnight.network/getting-started)
  - Check the [Midnight support matrix](https://docs.midnight.network/relnotes/support-matrix) to verify compiler/runtime compatibility
- **1AM Wallet browser extension** beta channel
  - [Install from 1AM](https://1am.xyz/install-beta)
  - Create or import a wallet on Midnight Preprod
  - Fund it with NIGHT tokens from the [Preprod Faucet](https://faucet.preprod.midnight.network)
- **1AM Wallet browser extension** — [Install from 1AM](https://1am.xyz/install-beta)
  - Create or import a wallet on Midnight Preprod
  - Fund it with NIGHT tokens from the [Preprod Faucet](https://faucet.preprod.midnight.network)
- **npm** (or yarn/pnpm)

---

## Setup

```bash
# 1. Clone
git clone <repo-url> && cd kredz/kredz-midnight

# 2. Install dependencies
npm ci

# 3. Configure environment
cp .env.example .env
# .env is pre-configured for Preprod — edit if needed

# 4. Compile the Compact contract
npm run compile

# 5. Sync ZK assets to the public directory
npm run sync-zk
```

---

## Run

```bash
# Development server
npm run dev
```

Open `http://localhost:5173` in your browser.

1. **Connect** your 1AM wallet (top of the page)
2. **Deploy** the KREDZ Score Profile contract via the "Deploy" tab
3. **Attest** a score for any Midnight address via the "Attest" tab
4. **Prove** a user's tier without revealing their score via the "Prove" tab

---

## Build

```bash
npm run build
# Output: dist/
```

Serve with any static file server:
```bash
npx serve dist
```

---

## Network Configuration

| Setting | Preprod (default) |
|---------|-------------------|
| `VITE_NETWORK_ID` | `preprod` |
| Indexer (HTTP) | `https://indexer.preprod.midnight.network/api/v4/graphql` |
| Indexer (WS) | `wss://indexer.preprod.midnight.network/api/v4/graphql/ws` |
| RPC Node | `https://rpc.preprod.midnight.network` |
| Proof Server | 1AM ProofStation (via wallet) |

For local development with Docker, see `.env.example` for `undeployed` settings.

---

## DUST & Fees

On Preprod, the 1AM wallet **sponsors all fees** via ProofStation's `balanceUnsealedTransaction` — users pay **0 NIGHT, 0 DUST**. No manual DUST registration required.

---

## Tech Stack

- **React 18** + **TypeScript**
- **Vite 5** (with WASM + top-level-await plugins)
- **Tailwind CSS**
- **Midnight JS SDK** (`@midnight-ntwrk/midnight-js-*` v4.x)
- **Compact language** (smart contract)

### SDK Packages (pinned versions)

```
@midnight-ntwrk/compact-js@^2.5.0
@midnight-ntwrk/compact-runtime@^0.15.0
@midnight-ntwrk/dapp-connector-api@^4.0.1
@midnight-ntwrk/ledger-v8@^8.0.3
@midnight-ntwrk/midnight-js-contracts@^4.0.4
@midnight-ntwrk/midnight-js-fetch-zk-config-provider@^4.0.4
@midnight-ntwrk/midnight-js-indexer-public-data-provider@^4.0.4
@midnight-ntwrk/midnight-js-network-id@^4.0.4
@midnight-ntwrk/midnight-js-types@^4.0.4
```

---

## Troubleshooting

**`compact: command not found`** — Install the Midnight toolchain from [docs.midnight.network/getting-started](https://docs.midnight.network/getting-started). Add `~/.compact/bin` to PATH.

**ZK assets 404** — Run `npm run sync-zk` before `npm run dev`. Vite serves files from `public/` only at startup.

**1AM wallet not detected** — Install from [1am.xyz/install-beta](https://1am.xyz/install-beta). The page polls for `window.midnight['1am']` for 6 seconds after load.

**Transaction hanging** — The indexer takes 10-60 seconds to index new contract state. The app polls automatically for up to 60 seconds. If it still fails, check the Preprod indexer status.

**"Unsupported contract version"** — Recompile: `npm run compile && npm run sync-zk`. The proving keys must match the contract exactly.

---

## Related Contracts (in parent repo)

| Network | Contract | Address |
|---------|----------|---------|
| Base Sepolia (EVM) | KredzAttestationVerifier | `0x318Ecad2bA565778753918e287AAaA2e65E5b1Dd` |
| Base Sepolia (EVM) | KredzScoreBadge | `0xc583b1aa2f68BE9176Ce17b36b6928c99091E3fd` |
| Solana Devnet | kredz_score_badge | `x6MWmEFP2dDNepzXjyZngt5EvQqBDy6Vry6svcaXXMM` |

---

## License

MIT
