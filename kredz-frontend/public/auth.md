# Agent Registration — Kredz

## Identity
Kredz is a privacy-preserving credit identity protocol. Agents interact with Midnight Network for ZK score attestations.

## Agent Authentication
Agents authenticate via the 1AM wallet extension (window.midnight['1am']) on Midnight Network. No OAuth flow is required for read-only score queries. Attestation write operations require the attestor's ZK witness secret.

## Relevant Endpoints
- Midnight Indexer (Preprod): https://indexer.preprod.midnight.network/api/v4/graphql
- Midnight RPC (Preprod): https://rpc.preprod.midnight.network
- Kredz Score Profile contract: deployed on Midnight Preprod
