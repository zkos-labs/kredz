# kredz.xyz — Canton Network DAML Contracts

## Status: Ready for localnet & DevNet deploy

These DAML smart contracts implement the Canton Network layer of kredz.xyz, providing
institutional lenders with confidential, ZK-attested credit scores via sub-transaction privacy.

> **Deploying to Canton DevNet?** See [DEVNET.md](./DEVNET.md) for the full step-by-step guide.

## Architecture

```
KredzScore (score registry)
    ├── QueryScore → KredzScoreResponse
    │       └── AcknowledgeScore → KredzAuditLog
    ├── UpdateScore → KredzScore (recreated)
    └── ExpireScore → ()

KredzLenderSubscription (lender sub)
    ├── AddBorrower / RemoveBorrower
    ├── UpdateThreshold / UpdateWebhook
    └── Cancel
```

## Quick Start — LocalNet

```bash
# 1. Start the Canton localnet (Docker)
cd canton
docker compose up -d

# 2. Wait for all services to be healthy
docker compose ps

# 3. Build the DAML contracts into a DAR
./deploy-dar.sh build

# 4. Deploy the DAR to the localnet
./deploy-dar.sh localnet
```

Once running, the JSON Ledger API is available at:
- **Participant 1 (kredz operator):** `http://localhost:3975`
- **Participant 2 (lender):** `http://localhost:4975`

## Deploy to Canton Testnet

### Prerequisites
1. SV (Super Validator) sponsorship — request via the [Canton Network forum](https://discuss.canton.network)
2. A Canton participant node connected to the Canton Testnet Global Synchronizer
3. Canton Coin for traffic credits

### Steps
```bash
# 1. Build the DAR
./deploy-dar.sh build

# 2. Configure your participant for Testnet (update participant.conf):
#    - Point to the Testnet Global Synchronizer endpoints
#    - Set up mutual TLS certificates

# 3. Start your participant and upload the DAR
#    participant.dars.upload("kredz.dar", false)

# 4. Allocate parties
#    participant.parties.enable("kredz")

# 5. Your JSON Ledger API is now accessible to institutional lenders
```

## Frontend Integration

The frontend uses the `useCanton` hook at `src/hooks/useCanton.ts` to connect to the Canton JSON Ledger API:

```tsx
import { useCanton } from '../hooks/useCanton';

const { queryScore, checkHealth, loading, error } = useCanton();

// Check if Canton is reachable
const online = await checkHealth();

// Query a borrower's score by Midnight DID
const score = await queryScore('did:midnight:abc123');
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_CANTON_LEDGER_API` | `http://localhost:3975` | Canton JSON Ledger API URL |
| `VITE_CANTON_KREDZ_PARTY` | `kredz` | Canton party ID for the kredz operator |

## Files

| File | Purpose |
|------|---------|
| `daml/KredzScore.daml` | `KredzScore` template — borrower score registry |
| `daml/KredzQuery.daml` | `KredzScoreResponse` + `KredzAuditLog` templates |
| `daml/KredzSubscription.daml` | `KredzLenderSubscription` template |
| `daml/KredzTests.daml` | 5 Daml Script tests (score lifecycle, update, expiry, subscription, privacy) |
| `daml/Main.daml` | Package entry point |
| `daml.yaml` | Project config (SDK 3.3.0) |
| `deploy-dar.sh` | Build and deploy DAR to localnet or testnet |
| `bootstrap.canton` | Auto-bootstrap script for localnet |
| `docker-compose.yaml` | 7-service localnet (2 participants + sequencer + mediator + 4 postgres) |
| `config/participant1.conf` | Kredz operator participant config |
| `config/participant2.conf` | Institutional lender participant config |
| `config/sequencer.conf` | Global synchronizer sequencer config |
| `config/mediator.conf` | Global synchronizer mediator config |

## Signatories & Privacy Model

| Contract | Signatories | Observers | Privacy |
|----------|------------|-----------|---------|
| KredzScore | kredz operator | kredz operator | Public to operator |
| KredzScoreResponse | kredz operator | lender | Sub-transaction privacy |
| KredzAuditLog | kredz operator + lender | — | Immutable, co-signed |
| KredzLenderSubscription | kredz operator + lender | — | Operator + lender only |

## References

- [Canton Network Docs](https://docs.canton.network)
- [Canton QuickStart](https://github.com/digital-asset/cn-quickstart)
- [DAML Language Reference](https://docs.canton.network/appdev/reference/daml-language-reference)
- [Canton DevNet/TestNet Onboarding](https://docs.canton.network/global-synchronizer/deployment/onboarding-process)
