# Solana Integration for KREDZ

## Summary
KREDZ now supports score bridging to Solana, creating a trichain reputation system:
- **Midnight** (source of truth via ZK circuits)
- **Base** (via ERC-8004 SBT on Ethereum L2)
- **Solana** (via ScoreBadge PDA on Devnet)

## Components Implemented

### 1. Solana Anchor Program (`kredz_score_badge`)
**Location:** `solana/programs/kredz_score_badge/src/lib.rs`
**Program ID:** `KREDZscoreBadge111111111111111111111111`

**Key Features:**
- `upsert_score` instruction with Ed25519 pre-instruction verification
- Relayer signature validation (prevents fraud)
- `ScoreBadge` PDA: stores user pubkey, score, tier, timestamp
- Replay protection (timestamp must increase)
- Events: `ScoreAttested` emitted on successful update

**Account Structure:**
```rust
pub struct ScoreBadge {
    pub user: Pubkey,      // 32 bytes
    pub score: u16,         // 0-1000
    pub tier: u8,          // 0-2 (Anonymous/Pseudonymous/Full Compliance)
    pub timestamp: i64,      // Unix epoch seconds
}
```

**Security:**
- Ed25519 signature verification in same transaction
- Relayer pubkey configurable (set at deploy via env var)
- Monotonic timestamp enforcement (prevents stale attestations)

### 2. Frontend Hooks

#### `useSolanaWallet` Hook
**Location:** `kredz-frontend/src/hooks/useSolanaWallet.ts`
**Features:**
- Phantom wallet detection (Wallet Standard v2+)
- LocalStorage persistence
- Connect/disconnect methods
- Error handling for `PHANTOM_NOT_FOUND`

#### `useSolanaScore` Hook
**Location:** `kredz-frontend/src/hooks/useSolanaScore.ts`
**Features:**
- PDA fetching from Solana devnet
- `mintBadge` function for manual badge minting (requires relayer signature)
- Score parsing (u16 score, u8 tier, i64 timestamp)
- Error handling

**PDA Derivation:**
```
seed: ["kredz", user_pubkey]
bump: 8 bytes
space: 8 + ScoreBadge::INIT_SPACE = 51 bytes
```

### 3. UI Integration

#### AppContext Updates
- Added `solanaWallet`, `solanaScore`, `solanaScoreTimestamp` to state
- Updated `ActiveChain` type: `'midnight' | 'base' | 'solana'`

#### LinkWallets Page
- Added Solana (Phantom) wallet card
- Trichain linking requirement (Midnight + Base + Solana)
- Updated copy to mention "trichain"

#### Dashboard
- Added Solana score card (green theme, matching Base card)
- Shows: score, tier, timestamp, devnet badge
- Sync button for fetching from devnet
- Mint Badge button (placeholder for relayer integration)
- Solscan link for PDA viewing

### 4. Midnight Contract Updates

#### `kredz.compact`
- Added `solanaAddress: Bytes<32>` ledger field
- Added `linkSolanaAddress(addr)` ZK circuit

#### `kredz.ts` (TypeScript Types)
- Added `solanaAddress: Uint8Array` to `KredzLedgerState`
- Added `linkSolanaAddress(addr)` to `KredzContractAPI`

## Deployment Status

### Solana Program
- **Status:** Code written, ready for Anchor v0.31 fixes
- **Known Issues:** 
  - Anchor v0.31 has breaking changes vs v0.30
  - `#[program]` macro syntax incompatible with v0.31
  - `init_if_needed` not supported in v0.31
- **Next Steps:** 
  1. Downgrade to Anchor v0.30 or fix v0.31 compatibility
  2. Build to get correct instruction discriminator
  3. Deploy to Solana devnet
  4. Run LiteSVM tests

### Frontend
- **Status:** Integration complete
- **Next:** Update `useSolanaScore` with correct discriminator after build

## Next Steps

1. **Fix Anchor v0.31 Compatibility**
   - Downgrade to Anchor v0.30 or use compatible syntax
   - Build and verify program compiles

2. **Deploy to Solana Devnet**
   - Build Solana program with `anchor build`
   - Get program ID from `anchor keys list`
   - Deploy with `anchor deploy --program-id <ID>`

3. **Create Relayer API**
   - Build `/api/relay-solana-score` endpoint
   - Accepts Midnight score + user address
   - Returns Ed25519 signature + relayer pubkey
   - Optionally signs transaction directly (production)

4. **Update Frontend**
   - Use actual discriminator from build in `useSolanaScore`
   - Connect real relayer API

5. **End-to-End Test**
   - Link Midnight wallet
   - Link Base wallet
   - Link Solana wallet
   - Deploy contract on Midnight
   - Update score
   - Verify score bridged to Base
   - Verify score bridged to Solana
