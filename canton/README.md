# kredz.xyz — Canton Network DAML Contracts

## Status: Spec implementation — pending `cn-quickstart` environment

These DAML smart contracts implement the Canton Network layer of kredz.xyz as specified in the v0.2 PRD (Section 9).

## Files

| File | Purpose |
|------|---------|
| `daml.yaml` | Project config (SDK 3.3.0, package name: `kredz`) |
| `daml/KredzScore.daml` | `KredzScore` template — borrower score registry with `QueryScore`, `UpdateScore`, `ExpireScore` choices |
| `daml/KredzQuery.daml` | `KredzScoreResponse` and `KredzAuditLog` templates — query response + immutable audit trail |
| `daml/KredzSubscription.daml` | `KredzLenderSubscription` template — lender subscription with `AddBorrower`, `RemoveBorrower`, `Cancel` choices |
| `daml/Main.daml` | Module re-exports (package entry point) |

## Template Architecture

```
KredzScore (score registry)
    ├── QueryScore → KredzScoreResponse
    │       └── AcknowledgeScore → KredzAuditLog
    ├── UpdateScore → KredzScore (recreated)
    └── ExpireScore → ()

KredzLenderSubscription (lender sub)
    ├── AddBorrower
    ├── RemoveBorrower
    ├── UpdateThreshold
    ├── UpdateWebhook
    └── Cancel
```

## Signatories & Visibility

- **kredz operator** is signatory on all contracts
- **Lender** is signatory on subscription and co-signatory on audit logs
- `KredzScoreResponse` is visible only to operator + querying lender (sub-transaction privacy)
- `KredzAuditLog` is co-signed by operator + lender, immutable

## How to Compile & Test

These contracts require the Canton Network developer toolchain which uses Nix + Docker + Gradle. The recommended approach is via `cn-quickstart`.

### Prerequisites

```bash
# 1. Clone the quickstart
git clone https://github.com/digital-asset/cn-quickstart.git
cd cn-quickstart
direnv allow

# 2. Install Daml SDK
cd quickstart
make install-daml-sdk

# 3. Copy kredz DAML files into the quickstart daml/ directory
cp -r path/to/kredz/canton/daml/* daml/

# 4. Build DAML contracts
make build-daml

# 5. Run localnet
make setup
make build
make start
```

### Daml Script Tests

Add test scripts in `daml/` using Daml Script:

```daml
module KredzTest where

import Daml.Script
import KredzScore
import KredzQuery
import KredzSubscription

testScoreLifecycle : Script ()
testScoreLifecycle = script do
  -- allocate parties
  kredz <- allocatePartyWithHint "kredz" (PartyIdHint "kredz")
  lender <- allocatePartyWithHint "lender" (PartyIdHint "lender")

  -- create initial score
  t <- getTime
  scoreCid <- submit kredz do
    createCmd KredzScore with
      operator = kredz
      borrowerDid = "did:midnight:abc123"
      score = 650
      tier = "pseudonymous"
      proofHash = "0xabc123..."
      updatedAt = t
      expiresAt = addRelTime t (days 30)

  -- lender queries score
  responseCid <- submit lender do
    exerciseCmd scoreCid QueryScore with
      lender
      purpose = "credit_assessment"

  -- lender acknowledges (creates audit log)
  submit lender do
    exerciseCmd responseCid AcknowledgeScore

  pure ()
```

### Deploy to DevNet

After local testing:
1. Request DevNet access via a sponsoring SV node (see docs.canton.network)
2. Deploy via `make deploy-to-devnet`
3. Onboard institutional lenders via Canton's participant onboarding process

### Deploy to MainNet

Requires:
- Validator node connected to MainNet via sponsored SV
- DAR file uploaded and vetted by SV
- Canton Coin for traffic credits

## Differences from PRD Pseudocode

The v0.2 PRD uses conceptual pseudocode. This implementation corrects several syntax details for actual Cameron DAML v3.x:

| PRD Pseudocode | DAML v3.x |
|---------------|-----------|
| `kredz : Party` (standalone) | Part of `with` block: `kredz : Party` |
| `assertMsg "msg" condition` | `assert condition` (with comment for context) |
| `now ()` | `getTime` |
| `filter (/= did)` | `filter (/= did) dids` |
| `addRelTime (now ()) (days 30)` | `addRelTime t (DA.Time.days 30)` |
| `Optional Text` | Correct — DAML supports `Optional` |
| `signatory kredz` | Correct — comma-separated or separate lines |

## References

- [Canton Network Docs](https://docs.canton.network)
- [Canton QuickStart](https://github.com/digital-asset/cn-quickstart)
- [DAML Language Reference](https://docs.canton.network/appdev/reference/daml-language-reference)
- [Canton DevNet Onboarding](https://docs.canton.network/global-synchronizer/deployment/onboarding-process)
