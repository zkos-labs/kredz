export default function middleware(request: Request) {
  const accept = request.headers.get('accept') || '';

  if (accept.includes('text/markdown')) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/' || path === '') {
      return new Response(
        `# KREDZ — Privacy Credit Layer

Privacy-preserving credit identity across five networks (Midnight, Base, Solana, Canton, Cardano).

## What it does
Kredz uses **ZK proofs on Midnight Network** to attest credit scores without revealing personal data. Scores are stored as cryptographic commitments — the actual score is a private witness that never touches the chain.

## Key features
- **ZK witnesses** for attestor authorization
- **Score commitment hashing** — actual scores never stored on-chain
- **Selective disclosure** — prove credit tier without revealing exact score
- Cross-chain wallet linking (EVM + Solana)
- 1AM wallet integration (dust-free proving via ProofStation)

## Networks
- Midnight (ZK scoring, privacy)
- Base Sepolia (ERC-8004 attestation verifier)
- Solana devnet (ScoreBadge PDA)
- Canton (institutional lending via Zenith EVM)
- Cardano (wallet history via Blockfrost)

## API
- Midnight Indexer: https://indexer.preprod.midnight.network/api/v4/graphql
- Midnight RPC: https://rpc.preprod.midnight.network

## Repository
https://github.com/kredz-labs/kredz
`,
        {
          headers: {
            'content-type': 'text/markdown; charset=utf-8',
          },
        },
      );
    }

    return new Response(null, { status: 404 });
  }
}

export const config = {
  matcher: '/',
};
