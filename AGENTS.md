# AI Agent Guidelines for KREDZ

## Project Identity

KREDZ is a privacy-preserving multichain credit identity protocol spanning five networks. Users prove credit tiers via ZK proofs on Midnight without revealing exact scores. The same identity is portable across EVM (Base), SVM (Solana), Canton (institutional lending), and Cardano (wallet history).

**Two frontend apps in this repo:**

| App | Directory | What it does | How to run |
|-----|-----------|-------------|------------|
| Contract pipeline | `kredz-midnight/` | Compact contract source + compile + ZK asset sync | `npm ci && npm run compile && npm run sync-zk` |
| User-facing app | `kredz-frontend/` | Multichain landing, wallet linking, Midnight deploy, dashboard, modules | `npm install && npm run dev` |

**Five networks:**

| Network | Role | Language | Status |
|---------|------|----------|--------|
| Midnight Preprod | ZK credit identity + scoring | Compact 0.22+ | Compiled (5 circuits), deploy via 1AM wallet |
| Base Sepolia | EVM portability, ERC-8004 SBT | Solidity 0.8.24 (Foundry) | Deployed |
| Solana Devnet | SVM portability, Score PDA | Anchor 0.31 (Rust) | Deployed |
| Canton | Institutional lending via Zenith EVM | DAML 3.3.0 + Solidity | Code complete, needs Nix/Docker |
| Cardano | Partner chain wallet history | Blockfrost API | Integrated |

---

## Complete Directory Map

```
kredz/
├── AGENTS.md                          ← THIS FILE — you are reading it
├── README.md                          ← Public project overview
├── DEPLOYMENT_PLAN.md                 ← Deployment plan + contract addresses
├── PROGRESS.md                        ← Detailed task-level progress tracker
├── prd.md                             ← Product Requirements Document
│
├── kredz-midnight/                    ← COMPACT CONTRACT SOURCE + BUILD
│   ├── contracts/
│   │   └── kredz_score_profile.compact  ← THE CONTRACT (5 ZK circuits)
│   ├── contracts/managed/               ← Compiled output (keys/, zkir/, contract/)
│   ├── scripts/
│   │   ├── compile-contract.js          ← Compiles .compact → managed/
│   │   └── sync-zk.js                   ← Copies ZK assets → kredz-frontend/
│   ├── .env.example                     ← Environment template
│   ├── .gitignore
│   ├── package.json                     ← compact-js, compact-runtime, ledger-v8 only
│   └── README.md                        ← Contract-specific docs
│
├── kredz-frontend/                    ← THE MAIN APPLICATION
│   ├── contracts/managed/               ← Compiled contract (synced from kredz-midnight)
│   ├── public/
│   │   ├── contract/kredz-score-profile/ ← Browser-served ZK assets (synced)
│   │   ├── robots.txt
│   │   ├── sitemap.xml
│   │   ├── auth.md
│   │   └── .well-known/                 ← MCP, agent-skills, API catalog
│   ├── src/
│   │   ├── main.tsx                     ← Entry point, registers WebMCP tools
│   │   ├── App.tsx                      ← Router + global layout
│   │   ├── App.css                      ← Design system CSS
│   │   ├── index.css                    ← Tailwind imports
│   │   ├── pages/
│   │   │   ├── Landing.tsx              ← Hero, How It Works, Networks, Tiers
│   │   │   ├── LinkWallets.tsx          ← Connect 1AM+MetaMask+Phantom, deploy to Midnight
│   │   │   ├── TierSelection.tsx        ← Choose privacy tier (0/1/2)
│   │   │   ├── Dashboard.tsx           ← Score ring, layer breakdown, network cards
│   │   │   └── Privacy.tsx              ← Privacy policy (8 sections)
│   │   ├── components/
│   │   │   ├── Navbar.tsx               ← Top navigation
│   │   │   ├── Toast.tsx                ← Toast notification system
│   │   │   ├── ProtectedRoute.tsx       ← Auth gate for /app/* routes
│   │   │   └── LiteracyModules.tsx      ← Financial literacy quizzes + XP
│   │   ├── hooks/
│   │   │   ├── useMidnightWallet.ts     ← 1AM wallet detection + connect
│   │   │   ├── useEvmWallet.ts          ← MetaMask detection + connect
│   │   │   ├── useSolanaWallet.ts       ← Phantom detection + connect
│   │   │   ├── useBaseScore.ts          ← Reads KredzScoreBadge on Base
│   │   │   └── useSolanaScore.ts        ← Reads ScoreBadge PDA on Solana
│   │   ├── context/
│   │   │   └── AppContext.tsx           ← Global React state + localStorage sync
│   │   ├── midnight/
│   │   │   ├── types.ts                 ← 1AM wallet TypeScript types
│   │   │   ├── providers.ts             ← (deprecated, kept for reference)
│   │   │   ├── contract.ts              ← REAL deployContract (createUnprovenDeployTx)
│   │   │   ├── witnesses.ts             ← attestorSecret witness function
│   │   │   ├── hex.ts                   ← toHex / fromHex helpers
│   │   │   ├── indexer-patch.ts         ← Patched queryContractState
│   │   │   └── private-state.ts         ← In-memory private state provider
│   │   ├── contracts/
│   │   │   └── kredz.ts                 ← TypeScript types for kredz.compact
│   │   └── lib/
│   │       └── webmcp.ts               ← WebMCP tool registrations
│   ├── middleware.ts                    ← Vercel Edge Middleware (Markdown for Agents)
│   ├── vercel.json                      ← SPA rewrites + cache headers + Link headers
│   ├── vite.config.ts                   ← Vite config (WASM + top-level-await)
│   ├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
│   ├── package.json                     ← React 18 + Midnight SDK + Vite plugins
│   └── .env /.env.example
│
├── contracts/                          ← FOUNDRY — SOLIDITY FOR BASE (EVM)
│   ├── src/
│   │   ├── KredzAttestationVerifier.sol ← ECDSA verifier → writes to ERC-8004
│   │   ├── KredzScoreBadge.sol          ← Soulbound ERC-721 token
│   │   └── MockReputationRegistry.sol   ← Mock for testing
│   ├── script/Deploy.s.sol              ← Foundry deploy script
│   ├── test/KredzAttestationVerifier.t.sol ← 4 tests
│   ├── foundry.toml                     ← Solc 0.8.24, Base Sepolia RPC
│   └── broadcast/                       ← Deploy transaction receipts
│
├── solana/                             ← ANCHOR — SVM PORTABILITY
│   ├── programs/kredz_score_badge/src/lib.rs ← ScoreBadge PDA + Ed25519 verify
│   ├── tests/kredz_score_badge.ts       ← Integration tests
│   ├── Anchor.toml                      ← Devnet cluster config
│   └── Cargo.toml
│
├── canton/                             ← DAML + ZENITH EVM (CANTON)
│   ├── daml/
│   │   ├── KredzScore.daml              ← Score registry template
│   │   ├── KredzQuery.daml              ← Query response + audit log
│   │   ├── KredzSubscription.daml       ← Lender subscription
│   │   ├── KredzTests.daml              ← 5 DAML Script tests
│   │   └── Main.daml                    ← Package entry
│   ├── daml.yaml                        ← SDK 3.3.0
│   └── docker-compose.yaml              ← LocalNet: 2 participants + postgres
│
├── backend/                            ← SCORING ENGINE
│   ├── src/
│   │   ├── api/                         ← Express REST API + auth + rate limiting
│   │   ├── scoring/                     ← Layer 1/2/3 + ML bridge
│   │   ├── attestation/                 ← ECDSA signer + sync pipeline
│   │   └── providers/                   ← Midnight indexer, EVM RPC, SumSub clients
│   ├── python/                          ← XGBoost model + stdin/stdout bridge
│   ├── package.json
│   └── openapi.yaml                     ← 367-line OpenAPI 3.1 spec
│
├── relayer/                            ← MIDNIGHT → BASE ATTESTATION RELAYER
│   └── index.ts                         ← Polls Midnight indexer, signs ECDSA, submits
│
└── effectstream/                       ← MULTICHAIN SYNC ENGINE
    └── state-machine/src/scoring.ts     ← Deterministic scoring across 5 networks
```

---

## Dependency Graph

### kredz-midnight/ (contract pipeline)

```json
{
  "@midnight-ntwrk/compact-js": "2.5.0",
  "@midnight-ntwrk/compact-runtime": "0.15.0",
  "@midnight-ntwrk/ledger-v8": "8.0.3"
}
```

### kredz-frontend/ (user-facing app)

```json
{
  "core": {
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-router-dom": "7.14.2",
    "vite": "5.4.21",
    "typescript": "5.2.2"
  },
  "midnight-sdk": {
    "@midnight-ntwrk/compact-js": "2.5.0",
    "@midnight-ntwrk/compact-runtime": "0.15.0",
    "@midnight-ntwrk/dapp-connector-api": "4.0.1",
    "@midnight-ntwrk/ledger-v8": "8.0.3",
    "@midnight-ntwrk/midnight-js-contracts": "4.0.4",
    "@midnight-ntwrk/midnight-js-fetch-zk-config-provider": "4.0.4",
    "@midnight-ntwrk/midnight-js-indexer-public-data-provider": "4.0.4",
    "@midnight-ntwrk/midnight-js-network-id": "4.0.4",
    "@midnight-ntwrk/midnight-js-types": "4.0.4",
    "@midnight-ntwrk/midnight-js-utils": "4.0.2",
    "@midnight-ntwrk/wallet-sdk-address-format": "3.1.0"
  },
  "vite-plugins": {
    "vite-plugin-wasm": "3.6.0",
    "vite-plugin-top-level-await": "1.5.0",
    "vite-plugin-node-polyfills": "0.26.0"
  },
  "overrides": {
    "@midnight-ntwrk/ledger-v8": "8.0.3"
  }
}
```

### Critical: The `overrides` field

Both `kredz-midnight/package.json` and `kredz-frontend/package.json` have:
```json
"overrides": {
  "@midnight-ntwrk/ledger-v8": "8.0.3"
}
```

Without this, `midnight-js-contracts` and `midnight-js-types` each pull their own nested copy of `ledger-v8`, causing `instanceof _CostModel` failures at runtime. **Never remove this override.**

---

## Quick Start — Full Pipeline

```bash
# 1. Clone
git clone https://github.com/kredz-labs/kredz && cd kredz

# 2. Compile the Midnight contract
cd kredz-midnight
npm ci
npm run compile          # 5 circuits, needs compact 0.5.1 on PATH
npm run sync-zk          # copies ZK assets to kredz-frontend/

# 3. Run the frontend
cd ../kredz-frontend
npm install
npm run dev              # http://localhost:5173

# 4. EVM contracts (optional)
cd ../contracts
forge test -vv           # 4 Foundry tests
forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast

# 5. Solana contracts (optional)
cd ../solana
anchor build
anchor deploy --provider.cluster devnet

# 6. Canton (optional, needs Docker + Nix)
cd ../canton
docker compose up -d
```

---

## Midnight Contract Architecture

### Contract: `kredz-midnight/contracts/kredz_score_profile.compact`

**5 ZK circuits:**

| Circuit | Arguments | Ledger writes | Privacy preserved |
|---------|-----------|--------------|-------------------|
| `attest_score` | `user_pubkey, score, salt, tier` | `score_hashes, tiers, total_users` | `score` + `salt` are witnesses |
| `prove_tier` | `user_pubkey` | None (read) | Exact score not returned |
| `prove_score_hash` | `user_pubkey, score, salt` | None (read) | Boolean match only |
| `link_evm` | `user_pubkey, evm_address` | `evm_linked` | Auth via witness |
| `link_solana` | `user_pubkey, solana_address` | `solana_linked` | Auth via witness |

### Ledger fields (public on-chain):

```
initialized: Boolean
attestor_key: Bytes<32>         ← derived from attestorSecret witness
total_users: Uint<64>
tiers: Map<Bytes<32>, Uint<8>>  ← user → privacy tier (0/1/2)
score_hashes: Map<Bytes<32>, Bytes<32>>  ← user → persistentHash(score, salt)
evm_linked: Map<Bytes<32>, Bytes<20>>
solana_linked: Map<Bytes<32>, Bytes<32>>
attestor_nonce: Counter         ← rotating key prevents replay attacks
```

### Constructor:

```compact
constructor() {
  const secret = attestorSecret();
  attestor_key = disclose(attestorPublicKey(secret, 0 as Uint<64>));
  attestor_nonce.increment(1);
  initialized = true;
  total_users = 0;
}
```

The constructor takes NO arguments. It derives `attestor_key` from the witness `attestorSecret()` using `attestorPublicKey(secret, 0)`. This follows Compact Pattern 2 (Hash-Based Auth with domain-separated keys).

### Witness function (TypeScript side):

```typescript
// src/midnight/witnesses.ts
function attestorSecret(context: { privateState: any }): [any, Uint8Array] {
  const ps = context.privateState ?? {};
  const secret = (ps as any).attestorSecret ?? getOrCreateSecret();
  return [{ ...ps, attestorSecret: secret }, secret];
}
```

At deploy time, a random 32-byte secret is generated via `crypto.getRandomValues`. The contract's constructor derives the matching public key automatically. The secret is cached in private state for subsequent circuit calls.

---

## Midnight Privacy Features

| Feature | How it works | Why privacy-preserving |
|---------|-------------|----------------------|
| Witness-based auth | `witness attestorSecret()` in Compact, body in TypeScript | Secret never touches chain, only ZK proof of knowledge |
| Score commitment | `persistentHash(ScoreData{score, salt})` | Score stored as hash, actual value is private witness |
| Selective disclosure | `prove_tier()` returns tier only | Verifier learns tier, NOT exact score |
| Commitment opening | `prove_score_hash()` returns boolean | Verifier learns only "match" or "no match" |
| Domain-separated keys | `pad(32, "kredz:attestor:v1")` | Same secret produces different keys across domains |
| Rotating keys | `attestor_nonce` increments each call | Each transaction uses a fresh attestor key |

---

## Midnight Build Pipeline

### compile

```bash
cd kredz-midnight
npm run compile
```

What it does:
1. Checks `compact --version` is 0.5.x (rejects 0.4.x and 0.6.x)
2. Runs `compact compile contracts/kredz_score_profile.compact contracts/managed/kredz-score-profile`
3. Produces `keys/` (prover/verifier files), `zkir/` (ZK intermediate representations), `contract/` (TypeScript bindings)

### sync-zk

```bash
cd kredz-midnight
npm run sync-zk
```

What it does:
1. Copies `keys/` and `zkir/` to `../kredz-frontend/public/contract/kredz-score-profile/` (browser-served via Vite)
2. Copies entire `contracts/managed/kredz-score-profile/` to `../kredz-frontend/contracts/managed/kredz-score-profile/` (imported by frontend TypeScript)

### How the frontend imports the contract

```typescript
// src/midnight/contract.ts
const mod = await import('../../contracts/managed/kredz-score-profile/contract/index.js');
cachedContract = mod.Contract;
```

The generated `Contract` class is instantiated with witnesses:
```typescript
CompiledContract.make('kredz_score_profile', cachedContract).pipe(
  CompiledContract.withWitnesses(makeWitnesses()),
  CompiledContract.withCompiledFileAssets('/contract/kredz-score-profile'),
)
```

The `FetchZkConfigProvider` loads ZK assets from `/contract/kredz-score-profile/` relative to the deployed URL.

---

## Midnight Deploy Flow

When a user clicks "Link All Wallets & Continue" on `/app/link`:

```
1. 1AM wallet connect (preprod) → getConfiguration → setNetworkId
2. loadContract() → dynamic import of compiled TypeScript bindings
3. getCompiledContract() → CompiledContract.make with witnesses
4. createUnprovenDeployTx(providers, { compiledContract, args: [], signingKey })
   → builds unsigned deploy transaction
5. submitTxAsync(providers, { unprovenTx })
   → proofProvider.proveTx()       ← 1AM / ProofStation generates ZK proof
   → walletProvider.balanceTx()    ← balanceUnsealedTransaction adds dust fees
   → midnightProvider.submitTx()   ← api.submitTransaction submits to chain
6. persistSecret() → caches attestor secret in private state
7. waitForContractIndexed() → polls indexer every 2s for contract state
8. Contract address saved to localStorage, navigate to /app/tier
```

**Why `createUnprovenDeployTx` and not `deployContract`?**

`deployContract` internally calls `watchForTxData` which hangs indefinitely on Preprod (indexer lag). `createUnprovenDeployTx` + `submitTxAsync` skips the blocking watch. The contract address is available from `deployTxData.public.contractAddress` immediately, before submission.

**Total user cost: 0 NIGHT, 0 DUST.** 1AM's ProofStation sponsors all fees via `balanceUnsealedTransaction`.

---

## EVM Contract Architecture

### `KredzAttestationVerifier.sol`

- Accepts ECDSA-signed attestations from the scoring engine's attestation signer
- Verifies EIP-191 signed message format
- Replay protection via monotonic `lastTimestamp` per user
- Scales scores 0-1000 down to 0-100 for ERC-8004 `giveFeedback()` interface
- Generates evidence URIs pointing to `kredz.xyz/attestation/<address>/<timestamp>`

### `KredzScoreBadge.sol`

- Non-transferable (soulbound) ERC-721 token
- Only `KredzAttestationVerifier` can call `mintOrUpdate()`
- Transfers revert with `Soulbound` error
- Dynamic on-chain `tokenURI()` with inline JSON metadata

### Deploy to Base Sepolia

```bash
cd contracts
ATTESTATION_SIGNER_ADDRESS=0x41003D8a06072bD14Ae1816E1a79294D15F48eCA \
ERC8004_REPUTATION_REGISTRY=0x8004BAa17C55a88189AE136b182e5fdA19dE9b63 \
KREDZ_AGENT_ID=1 \
BASE_SEPOLIA_RPC=https://sepolia.base.org \
forge script script/Deploy.s.sol --rpc-url base_sepolia --private-key $KEY --broadcast
```

---

## Solana Contract Architecture

### `kredz_score_badge/src/lib.rs`

- `upsert_score` instruction with Ed25519 pre-instruction verification
- PDA seeds: `["kredz", user.key().as_ref()]`
- Monotonic timestamp enforcement
- `RELAYER_PUBKEY_BYTES` must be set to the relayer's public key before deploy

### Deploy to Solana Devnet

```bash
cd solana
anchor build
anchor deploy --provider.cluster devnet
```

Program ID: `x6MWmEFP2dDNepzXjyZngt5EvQqBDy6Vry6svcaXXMM`

---

## Frontend Architecture

### Page Route Map

| Route | Component | Requires | Description |
|-------|-----------|----------|-------------|
| `/` | `Landing` | None | Hero, networks, tiers, CTAs |
| `/app` | Redirect | Midnight wallet | Redirects to correct step |
| `/app/link` | `LinkWallets` | Midnight wallet | Connect 1AM+MetaMask+Phantom, deploy contract |
| `/app/tier` | `TierSelection` | All wallets linked | Choose privacy tier (0/1/2) |
| `/app/dashboard` | `Dashboard` | All wallets linked | Score ring, layers, network cards |
| `/privacy` | `Privacy` | None | 8-section privacy policy |

### Wallet Integration

**1AM (Midnight):** `useMidnightWallet` → detects `window.midnight['1am']` with 5s polling → connects to Preprod (configurable via `VITE_MIDNIGHT_NETWORK`)

**MetaMask (EVM):** `useEvmWallet` → detects `window.ethereum` → switches to Base Sepolia

**Phantom (Solana):** `useSolanaWallet` → detects `window.solana` → connects to Solana Devnet

### State Management

`AppContext.tsx` holds:

| State | localStorage key | Persisted |
|-------|-----------------|-----------|
| `wallet` (Midnight) | — | No (reconnects each session) |
| `evmWallet` | `kredz_evm_wallet` | Yes |
| `walletsLinked` | `kredz_wallets_linked` | Yes |
| `tier` | — | No |
| `contractAddress` | `kredz_contract_address` | Yes (mock addresses auto-cleared) |
| `score` | — | No |
| `layerScores` | — | No |
| `completedModules` | `kredz_modules` | Yes (auto-cleared on load, scored once) |

---

## Vite Configuration

```typescript
// vite.config.ts — CRITICAL: do not remove any plugin
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [react(), tailwindcss(), wasm(), topLevelAwait(), nodePolyfills({ include: ['buffer', 'events'] })],
  build: { target: 'esnext' },
  server: { allowedHosts: true },
  assetsInclude: ['**/*.wasm'],
});
```

**IMPORTANT:** Do NOT add `external: [/^@midnight-ntwrk\//]` to the build config. That was the OLD config that broke runtime SDK imports. The Midnight SDK packages MUST be bundled for browser use.

---

## Vercel Deployment

**Project:** `muhammad-zidan-fatonies-projects/kredz`
**Domain:** `kredz.xyz`

### Critical Settings

| Setting | Value |
|---------|-------|
| Framework | Vite |
| Root Directory | **Empty** (must NOT be `kredz-frontend`) |
| Build Command | Default (`npm run build`) |
| Install Command | Default (`npm install`) |
| Node Version | 22.x |

### vercel.json

```json
{
  "rewrites": [{ "source": "/((?!.*\\.).*)", "destination": "/index.html" }],
  "headers": [
    { "source": "/(.*)", "headers": [{ "key": "Cache-Control", "value": "no-cache" }] },
    { "source": "/assets/(.*)", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] },
    { "source": "/", "headers": [{ "key": "Link", "value": "</.well-known/api-catalog>; rel=\"api-catalog\", </.well-known/agent-skills/index.json>; rel=\"agent-skills\", </auth.md>; rel=\"auth.md\"" }] }
  ]
}
```

### Root Directory Gotcha

If Root Directory is set to `kredz-frontend` in Vercel project settings, deploying from `kredz-frontend/` creates a double path (`kredz-frontend/kredz-frontend`) and fails. The Root Directory MUST be empty.

### Deploy via CLI

```bash
cd kredz-frontend
rm -rf .vercel
vercel link --project kredz --yes
vercel --prod -y
```

---

## All Environment Variables

### kredz-midnight/.env

| Variable | Default | Description |
|----------|---------|-------------|
| (none needed) | — | The compile script only needs `compact` on PATH |

### kredz-frontend/.env

| Variable | Value | Required |
|----------|-------|----------|
| `VITE_MIDNIGHT_NETWORK` | `preprod` | Yes (for 1AM wallet connect) |
| `VITE_VERIFIER_ADDRESS` | `0x318Ecad2bA565778753918e287AAaA2e65E5b1Dd` | Yes (Base KredzAttestationVerifier) |
| `VITE_BADGE_ADDRESS` | `0xc583b1aa2f68BE9176Ce17b36b6928c99091E3fd` | Yes (Base KredzScoreBadge) |
| `VITE_BASE_RPC` | `https://sepolia.base.org` | Yes |
| `VITE_SOLANA_PROGRAM_ID` | `24KqR89h5SMLvV4QCKw4HAcYxVjovZU73SMyYvjETZ7E` | Yes |
| `VITE_SOLANA_RPC` | `https://api.devnet.solana.com` | Yes |
| `VITE_INDEXER_URI` | `https://indexer.preprod.midnight.network/api/v4/graphql` | Preprod only (not used at runtime, from wallet config) |
| `VITE_INDEXER_WS_URI` | `wss://indexer.preprod.midnight.network/api/v4/graphql/ws` | Preprod only |
| `VITE_NODE_URI` | `https://rpc.preprod.midnight.network` | Preprod only |
| `VITE_PROVER_SERVER_URI` | `http://127.0.0.1:6300` | Not used with 1AM wallet |

### contracts/.env (Foundry)

| Variable | Description |
|----------|-------------|
| `ATTESTATION_SIGNER_ADDRESS` | ECDSA address that signs attestations |
| `ERC8004_REPUTATION_REGISTRY` | ERC-8004 contract on Base Sepolia |
| `KREDZ_AGENT_ID` | Agent ID for ERC-8004 |
| `PRIVATE_KEY` | Deployer private key (hex, no 0x) |
| `BASE_SEPOLIA_RPC` | RPC endpoint for Base Sepolia |

---

## Deployed Contract Addresses

| Network | Contract | Address | Explorer |
|---------|----------|---------|----------|
| Base Sepolia | KredzAttestationVerifier | `0x318Ecad2bA565778753918e287AAaA2e65E5b1Dd` | [Basescan](https://sepolia.basescan.org/address/0x318Ecad2bA565778753918e287AAaA2e65E5b1Dd) |
| Base Sepolia | KredzScoreBadge | `0xc583b1aa2f68BE9176Ce17b36b6928c99091E3fd` | [Basescan](https://sepolia.basescan.org/address/0xc583b1aa2f68BE9176Ce17b36b6928c99091E3fd) |
| Solana Devnet | kredz_score_badge | `x6MWmEFP2dDNepzXjyZngt5EvQqBDy6Vry6svcaXXMM` | [Solscan](https://solscan.io/account/x6MWmEFP2dDNepzXjyZngt5EvQqBDy6Vry6svcaXXMM?cluster=devnet) |
| Midnight Preprod | kredz_score_profile | Deploy via app | [Explorer](https://preprod.midnightexplorer.com) |

---

## Network Endpoints

| Network | Indexer HTTP | Indexer WS | RPC |
|---------|-------------|-----------|-----|
| Midnight Preprod | `https://indexer.preprod.midnight.network/api/v4/graphql` | `wss://indexer.preprod.midnight.network/api/v4/graphql/ws` | `https://rpc.preprod.midnight.network` |
| Midnight Preview | `https://indexer.preview.midnight.network/api/v4/graphql` | `wss://indexer.preview.midnight.network/api/v4/graphql/ws` | `wss://rpc.preview.midnight.network` |
| Base Sepolia | `https://sepolia.base.org` | — | — |
| Solana Devnet | `https://api.devnet.solana.com` | — | — |

---

## Version Compatibility Matrix

| Component | Version | Must match exactly? | Notes |
|-----------|---------|--------------------|-------|
| `compact` CLI | `0.5.1` | YES | Checked in compile script |
| `@midnight-ntwrk/compact-runtime` | `0.15.0` | YES | Pinned exact |
| `@midnight-ntwrk/compact-js` | `2.5.0` | YES | Pinned exact |
| `@midnight-ntwrk/ledger-v8` | `8.0.3` | YES | Single copy via `overrides` |
| `@midnight-ntwrk/midnight-js-contracts` | `4.0.4` | YES | Pinned exact |
| Node.js | `22+` | Minimum | |
| TypeScript | `5.2.2` | Recommended | TS 6.x causes build errors |
| Vite | `5.4.21` | Recommended | Vite 8 uses Rolldown, not Rollup |
| React | `18.2.0` | Recommended | React 19 untested with Midnight SDK |
| Solidity (Foundry) | `0.8.24` | YES | In foundry.toml |
| Anchor | `0.31.0` | Current | Builds with warnings |
| DAML | `3.3.0` | For Canton | |
| Python | `3.10+` | For backend ML | |

### TypeScript Configuration (CRITICAL)

```json
// tsconfig.app.json — must use these exact settings
{
  "compilerOptions": {
    "target": "esnext",        // NOT "es2023" (TS 6.x only)
    "lib": ["ES2020", "DOM"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "skipLibCheck": true
    // Do NOT include: erasableSyntaxOnly, tsBuildInfoFile without composite
  }
}
```

---

## Common Pitfalls

| # | Pitfall | Cause | Fix |
|---|---------|-------|-----|
| 1 | `withVacantWitnesses` causes deploy failure | No witness function wired for `attestorSecret` | Use `withWitnesses(makeWitnesses())` |
| 2 | `expected instance of _CostModel` at runtime | Two copies of `ledger-v8` in node_modules | Add `"overrides": {"@midnight-ntwrk/ledger-v8": "8.0.3"}` |
| 3 | `deployContract` hangs forever on Preprod | Internal `watchForTxData` blocks indefinitely | Use `createUnprovenDeployTx` + `submitTxAsync` |
| 4 | `deployContract` returns but contract not found | Indexer lag (10-120s) | Poll with `waitForContractIndexed()` |
| 5 | TS6 features fail on Vercel build | `erasableSyntaxOnly`, `es2023` target require TS 6 | Use `target: "esnext"`, remove TS6-only options |
| 6 | Vercel deploy shows `kredz-frontend/kredz-frontend` path error | Root Directory set to `kredz-frontend` in project settings | Set Root Directory to empty |
| 7 | Mock contract address shown on dashboard | Stale localStorage from old mock deployments | Auto-cleared on load (starts with `mock_` filter) |
| 8 | ZK assets 404 in browser | `sync-zk` not run before `npm run dev` | Always run `sync-zk` after compile |
| 9 | compact compiler version mismatch | Installed version differs from expected 0.5.1 | Install exact version: follow [support matrix](https://docs.midnight.network/relnotes/support-matrix) |
| 10 | `vite-plugin-top-level-await` missing field `ctxt` | SWC compatibility issue with old plugin version | Use `vite-plugin-top-level-await@1.5.0` or later |
| 11 | `setNetworkId` not called | Missing before SDK operations | Called in `createConnectedSession` or `deployContract` |
| 12 | `balanceUnsealedTransaction` returns null | Wallet not synced, no DUST available | Wait for wallet sync state, ensure NIGHT UTXOs registered |
| 13 | Constructor args mismatch | Contract changed from `constructor(owner_key)` to `constructor()` | Pass `args: []` to `createUnprovenDeployTx` |
| 14 | `ContractState` passed to `ledger()` instead of `ChargedState` | `queryContractState()` returns `ContractState` | Always pass `contractState.data` to `ledger()` |

---

## Testing Strategy

### Midnight Contract

```bash
cd kredz-midnight
npm run compile          # Compiles with --skip-zk not needed for dev loop
# Visual test: open kredz-frontend, connect 1AM wallet, deploy, attest, prove
```

Fresh clone verification:
```bash
git clone https://github.com/kredz-labs/kredz /tmp/test
cd /tmp/test/kredz-midnight
npm ci && npm run compile && npm run sync-zk
cd ../kredz-frontend
npm install && npx tsc --noEmit && npx vite build
```

### EVM Contracts

```bash
cd contracts
forge test -vv           # 4 tests: ValidAttestation, InvalidSignature, StaleAttestation, ScoresScaledForERC8004
```

### Solana Contracts

```bash
cd solana
anchor test --skip-build # Integration tests
```

---

## External Skill References

### Midnight Skills (`https://midnight-skills.netlify.app/`)

Load these skills when working on Midnight-specific code:

| Skill | Use for |
|-------|---------|
| `compact` | Writing or debugging `.compact` contracts, understanding witness/commitment/ledger patterns |
| `1am-wallet` | Setting up wallet connection, provider wiring, indexer patching, deploy flow |
| `midnight-js` | SDK API reference, `CompiledContract.make`, `createUnprovenDeployTx`, providers |
| `testing` | Debugging compiler errors, `--skip-zk` dev loop, version management |
| `multinetwork` | Network endpoints (Preprod/Preview/Mainnet), DUST flow, environment config |
| `indexer` | GraphQL queries, contract state reads, subscriptions |
| `security` | Privacy audit checklist, disclosure patterns, defensive contract design |
| `token-transfers` | Shielded/unshielded NIGHT transfers, DUST mechanics |
| `why-midnight` | Midnight architecture, public/private state model, selective disclosure |

### ETH Skills (`https://ethskills.com/`)

Load these skills when working on EVM/Solidity code:

| Skill | Use for |
|-------|---------|
| `security` | Solidity security patterns, common vulnerabilities, pre-deploy checklist |
| `standards` | ERC-8004 (onchain agent identity), ERC-721 (soulbound badge) |
| `wallets` | Key management, multisig patterns |
| `gas` | Current gas prices, cost estimation |
| `testing` | Foundry testing patterns, fuzz tests, fork tests |
| `tools` | Foundry, cast, forge commands |
| `addresses` | Verified contract addresses for Base Sepolia |
| `frontend-ux` | Onchain button patterns, approval flows |

---

## Common Agent Workflows

### Workflow: Deploy the Midnight contract

```bash
cd kredz-midnight
npm ci
npm run compile          # 5 circuits, compact 0.5.1
npm run sync-zk          # copies to kredz-frontend
cd ../kredz-frontend
npm install
npm run dev              # open http://localhost:5173
# Browser: connect 1AM wallet → /app/link → connect all wallets → click "Link All Wallets & Continue"
```

### Workflow: Add a new Compact circuit

1. Edit `kredz-midnight/contracts/kredz_score_profile.compact`
2. Add new `export circuit` or `pure circuit`
3. Run `npm run compile` in `kredz-midnight/`
4. Run `npm run sync-zk`
5. Add corresponding TypeScript function in `kredz-frontend/src/midnight/contract.ts`
6. Add UI in `kredz-frontend/src/pages/` or `kredz-frontend/src/components/`
7. Run `npx tsc --noEmit && npx vite build` to verify

### Workflow: Deploy to Vercel

```bash
cd kredz-frontend
npx tsc --noEmit && npx vite build   # verify locally first
rm -rf .vercel
vercel link --project kredz --yes
vercel --prod -y
```

### Workflow: Update npm packages

1. Check the [Midnight support matrix](https://docs.midnight.network/relnotes/support-matrix)
2. Update `package.json` with new exact versions (no `^` or `~`)
3. Keep `overrides` for `ledger-v8`
4. Run `rm -rf node_modules package-lock.json && npm install`
5. Recompile contract with `npm run compile`
6. Re-run `npm run sync-zk`
7. Build and test: `npx tsc --noEmit && npx vite build`
8. Check `npm ls @midnight-ntwrk/ledger-v8` shows exactly ONE copy

---

## Git Workflow

- **Branch:** `main` (trunk-based)
- **Commit style:** `type: short description` (e.g., `feat:`, `fix:`, `docs:`, `refactor:`)
- **No GPG signing** for agents (use `--no-gpg-sign` if configured)
- **Push to:** `origin main` → `https://github.com/kredz-labs/kredz.git`
- **Vercel auto-deploys** on every push to `main`

## File Modification Rules

### NEVER change these without explicit user approval:

- `package.json` version pins (especially `overrides`)
- `vite.config.ts` plugins (WASM, top-level-await, polyfills are all required)
- `tsconfig.json` / `tsconfig.app.json` (TS 5.2.2 compatibility is critical)
- `vercel.json` rewrites/headers
- Contract source files without recompiling and syncing ZK assets
- `kredz-frontend/public/contract/` ZK assets (they are generated, not hand-authored)

### OK to change:

- Component styling and layout
- Text/content in `pages/` files
- README.md, PROGRESS.md, DEPLOYMENT_PLAN.md
- New feature additions in `src/components/` or `src/pages/`
- `AppContext.tsx` state management
- `middleware.ts` (Edge Middleware)
