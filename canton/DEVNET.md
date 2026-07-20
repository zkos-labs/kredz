# Canton DevNet Deployment Guide

This guide walks through deploying the KREDZ DAML contracts to Canton Foundation DevNet.

## Architecture

```
┌──────────────────────────────────────────────────────┐
│  Your Machine                                        │
│                                                      │
│  ┌─────────────────┐    ┌──────────────────────────┐ │
│  │ splice-node/     │    │ cn-quickstart/            │ │
│  │                  │    │                           │ │
│  │  Validator ──────┼────┤  PQS (scribe)             │ │
│  │  Participant ────┼────┤  Backend Service          │ │
│  │                  │    │  Frontend                  │ │
│  └────────┬─────────┘    └──────────────────────────┘ │
│           │                                           │
│           │ VPN                                       │
└───────────┼───────────────────────────────────────────┘
            ▼
┌───────────────────────────────────────────────────────┐
│  Canton Foundation DevNet                             │
│                                                       │
│  Super Validator (SV)                                 │
│  ├── Sequencer                                        │
│  └── Mediator                                         │
└───────────────────────────────────────────────────────┘
```

## Prerequisites

1. **Validator sponsorship** — Apply at https://canton.foundation/apply-to-set-up-a-validator-node/
2. **Docker 24+** and docker compose v2+
3. **VPN client** — to connect to the DevNet SV's private network
4. **cn-quickstart** — the Canton reference application framework
5. **DAML SDK** (`dpm` CLI) — for building DAR files

## Step 1: Clone and Setup cn-quickstart

```bash
git clone https://github.com/digital-asset/cn-quickstart.git
cd cn-quickstart
direnv allow

# Install DAML SDK
cd quickstart
make install-daml-sdk

# Copy KREDZ DAML files
cp -r /path/to/kredz/canton/daml/* daml/kredz/

# Verify build
dpm build
```

## Step 2: Get the Splice Node Bundle

Download the latest splice-node release from:
https://github.com/canton-network/splice/releases

Extract it next to cn-quickstart:

```
Canton_Network_App_Dev/
├── cn-quickstart/
└── splice-node/
```

## Step 3: Configure Credentials

Copy the environment template and fill in your validator credentials:

```bash
cp .env.example .env
```

Edit `canton/.env` with your values:

```env
# Private key for the participant node (64-byte hex)
CANTON_VALIDATOR_KEY=<your-validator-key>

# API token for JSON Ledger API access
CANTON_API_TOKEN=<your-api-token>

# Network configuration
CANTON_NETWORK=devnet
CANTON_SV_URL=https://sv.sv-1.dev.global.canton.network.sync.global
CANTON_PARTY_HINT=kredz-operator-1
```

These credentials are sourced automatically by `deploy-dar.sh`.

## Step 4: Configure DevNet Connection

```bash
cd splice-node/docker-compose/validator

# Get the current network info
INFO_URL="https://docs.dev.global.canton.network.sync.global/info"
SPLICE_VERSION=$(curl -s "$INFO_URL" | jq -r '.synchronizer?.active?.version')
MIGRATION_ID=$(curl -s "$INFO_URL" | jq -r '.synchronizer?.active?.migration_id')

# Get onboarding secret from the Super Validator
SPONSOR_SV_URL="https://sv.sv-1.dev.global.canton.network.sync.global"
ONBOARDING_SECRET=$(curl -s -X POST "$SPONSOR_SV_URL/api/sv/v0/devnet/onboard/validator/prepare")
echo "$ONBOARDING_SECRET"

# Set your party hint (must match what's in cn-quickstart)
PARTY_HINT="kredz-operator-1"
```

## Step 5: Add Host Entries

Add to `/etc/hosts`:

```
127.0.0.1 json-ledger-api.localhost
127.0.0.1 grpc-ledger-api.localhost
127.0.0.1 validator.localhost
127.0.0.1 participant.localhost
127.0.0.1 wallet.localhost
```

## Step 6: Connect VPN & Start Validator

```bash
# Connect to your sponsoring SV's VPN
# (credentials provided after validator request is approved)

# Start the validator
./start.sh \
  -s "$SPONSOR_SV_URL" \
  -o "$ONBOARDING_SECRET" \
  -p "$PARTY_HINT" \
  -m "$MIGRATION_ID" \
  -w \
  -a
```

Wait for the validator to be fully operational. Check with:

```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

## Step 7: Build and Upload the DAR

```bash
# From the canton/ directory
cd /path/to/kredz/canton

# Build + upload in one command (uses credentials from canton/.env)
./deploy-dar.sh devnet
```

If the automated upload succeeds, you'll see:
```
[kredz-daml] DAR uploaded successfully (HTTP 200)
[kredz-daml] KREDZ DAR deployed to Canton DevNet!
```

If the validator isn't reachable yet, you can also upload manually:

```bash
# Get an auth token (if using Keycloak)
TOKEN=$(curl -s -X POST "http://keycloak.localhost:8082/realms/AppProvider/protocol/openid-connect/token" \
  -d "grant_type=client_credentials" \
  -d "client_id=app-provider-validator" \
  -d "client_secret=<YOUR_CLIENT_SECRET>" | jq -r .access_token)

# Upload the DAR to your DevNet validator
curl -X POST "http://json-ledger-api.localhost/v2/dars?vetAllPackages=true" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/octet-stream" \
  --data-binary @.daml/dist/kredz-0.1.0.dar

# An empty response {} indicates success
```

## Step 8: Allocate Parties & Test

```bash
# Via the Canton Console or Admin API, allocate the kredz party:
# participant.parties.enable("kredz")

# Create a test KredzScore contract
# submit kredz do
#   createCmd KredzScore with
#     operator = kredz
#     borrowerDid = "did:midnight:test123"
#     score = 650
#     ...
```

## Step 9: Connect Frontend

Set environment variables in `kredz-frontend/.env`:

```env
# Canton DevNet — via your validator's JSON Ledger API
VITE_CANTON_LEDGER_API=http://json-ledger-api.localhost
VITE_CANTON_KREDZ_PARTY=kredz-operator-1
```

## Environment Comparison

|                     | LocalNet                   | DevNet                                       |
|---------------------|---------------------------|----------------------------------------------|
| Runs on             | Docker Compose (localhost)| Your machine + remote SV                     |
| Validator           | Built-in (participant1/2) | splice-node bundle                           |
| Canton Coin         | Simulated                 | Real CC (tap available)                      |
| VPN required        | No                        | Yes                                          |
| Auth                | None or basic             | Keycloak OAuth2/OIDC                         |
| DAR upload          | Direct to container       | JSON Ledger API with Bearer token            |
| Network resets      | On restart                | Periodically by SV                           |
| DAML SDK            | `daml` or `dpm`           | `dpm` via cn-quickstart                      |

## Troubleshooting

### Validator won't start
- Check `docker logs splice-validator-validator-1 --tail 100`
- Onboarding secret expires after 1 hour — request a new one
- Verify VPN connection is active

### DAR upload fails with 401
- Get a fresh auth token from Keycloak
- Verify audience matches `VALIDATOR_AUTH_AUDIENCE` in `.env`

### "vmnetd" error on macOS
- Change nginx port from `80:80` to `8080:80` in `compose.yaml`
- Update all `LEDGER_PORT` references to 8080

### Connectivity issues
```bash
# Test SV connectivity
curl -s "https://scan.sv-1.dev.global.canton.network.sync.global/api/scan/v0/splice-instance-names"

# Check validator health
curl http://validator.localhost/health
```

## References

- [Canton Foundation — Apply for Validator](https://canton.foundation/apply-to-set-up-a-validator-node/)
- [SV Network Status](https://canton.foundation/sv-network-status/)
- [Splice Releases](https://github.com/canton-network/splice/releases)
- [Canton DevNet Docs](https://docs.canton.network/appdev/quickstart/deploy-to-devnet)
- [Validator Onboarding](https://docs.canton.network/global-synchronizer/deployment/onboarding-process)
