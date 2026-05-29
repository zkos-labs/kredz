# Auth.md — Kredz Agent Registration

## Service
Kredz is a privacy-preserving credit identity protocol. Agents query on-chain score attestations and prove credit tiers on Midnight Network.

## Agent Authentication
Agents connect via the 1AM wallet extension (`window.midnight['1am']`) on Midnight Network Preprod. Score queries are public reads against the Midnight indexer. Attestation write operations require the issuer's ZK witness secret.

## Registration
Agents that need attestation authority must register their public key with the Kredz contract administrator. Contact via [GitHub Issues](https://github.com/kredz-labs/kredz/issues) to request attestation credentials.

## Credential Use
Once authorized, agents use the Midnight SDK to call `attest_score` with the score and salt as private witnesses. The contract stores only `persistentHash(score, salt)` — the actual score never touches the chain.

## Supported Methods
- **1AM Wallet**: Browser extension at `window.midnight['1am']`
- **Midnight SDK**: `@midnight-ntwrk/midnight-js-contracts` v4.x

## Endpoints
- Midnight Indexer: https://indexer.preprod.midnight.network/api/v4/graphql
- Midnight RPC: https://rpc.preprod.midnight.network
- Repository: https://github.com/kredz-labs/kredz/tree/main/kredz-midnight
