# KREDZ Fellowship Submission — Deployment Plan
# Generated: 2026-05-29

## Deployed Contract Addresses

### Phase 1: EVM — Base Sepolia ✅

| Contract | Address | Deployer |
|----------|---------|----------|
| KredzAttestationVerifier | `0x318Ecad2bA565778753918e287AAaA2e65E5b1Dd` | `0x41003D8a06072bD14Ae1816E1a79294D15F48eCA` |
| KredzScoreBadge | `0xc583b1aa2f68BE9176Ce17b36b6928c99091E3fd` | Same |

**Usage:** Score attestations signed by attestor ECDSA key → verified on-chain → written to ERC-8004 Reputation Registry. Badge is a non-transferable ERC-721 (soulbound).

**Transaction:** `forge script Deploy.s.sol --rpc-url base_sepolia --broadcast`
**Status:** On-chain, 4/4 tests passing

---

### Phase 2: Solana — Devnet ✅

| Detail | Value |
|--------|-------|
| Program ID | `x6MWmEFP2dDNepzXjyZngt5EvQqBDy6Vry6svcaXXMM` |
| Deployer | `E9PsSz9XWgNR3TmSC57NHC2ZxJzF5NmbrWsDKEe7A7yM` |
| RELAYER_PUBKEY | `c34e6f7b2a8e8490592c4601f40a0f0adb0ed483c4245fbb1db98d2d273e5fc4` |

**Usage:** Ed25519 pre-instruction verification → upserts ScoreBadge PDA with score + tier + timestamp. Monotonic timestamp enforcement.

**Transaction:** `anchor deploy --cluster devnet`
**Status:** Deployed, compiled successfully (warnings on deprecated macro)

---

### Phase 3: Midnight — Preprod ✅

| Detail | Value |
|--------|-------|
| Contract | `kredz_score_profile.compact` |
| Language | Compact v0.22+ |
| Circuits | 5 (attest_score, prove_tier, prove_score_hash, link_evm, link_solana) |
| Privacy | witness attestorSecret(), persistentHash commitments, selective disclosure |
| Frontend | React 18 + Vite 5 + Tailwind CSS |
| SDK | @midnight-ntwrk/midnight-js-* v4.x |
| Network | Preprod |

**Usage:** Attestor (witness secret holder) records score hashes on-chain. Users can prove their tier without revealing exact score.

**Contract deployed via app UI — requires 1AM wallet connection.**
**Status:** Compiled (5 circuits, all ZK keys generated), frontend build passing

---

### Phase 4: Canton — DAML ✅

| Detail | Value |
|--------|-------|
| Language | DAML 3.3.0 |
| Templates | 4 (KredzScore, KredzScoreResponse, KredzAuditLog, KredzLenderSubscription) |
| Tests | 5 Daml Script tests (lifecycle, update, expiry, subscription, privacy) |
| LocalNet | Docker Compose (2 participants + synchronizer + 4 postgres) |
| Config | participant configs + bootstrap.canton + deploy-dar.sh |
| Frontend | useCanton hook (JSON Ledger API client) |

**Usage:** Institutional lenders query borrower scores confidentially. Sub-transaction privacy prevents third-party visibility. Immutable audit logs track every query.

**LocalNet:** `cd canton && docker compose up -d && ./deploy-dar.sh build && ./deploy-dar.sh localnet`
**Status:** DAML contracts written, config files complete, ready for localnet deploy

**Testnet Deployment:** Requires SV sponsorship via Canton Network forum.
1. Build DAR: `./deploy-dar.sh build`
2. Configure participant for Testnet GS
3. Upload DAR + allocate parties
4. Frontend connects via `VITE_CANTON_LEDGER_API`
