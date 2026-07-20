#!/usr/bin/env bash
# ── Build and Deploy KREDZ DAML Contracts ──
# Canton Network deployment pipeline for all environments.
#
# Quick start:
#   ./deploy-dar.sh localnet    # Docker-based local dev
#   ./deploy-dar.sh devnet      # Canton Foundation DevNet (requires SV sponsorship)
#   ./deploy-dar.sh build       # Build DAR only
#
# Prerequisites:
#   LocalNet: podman/docker 24+, podman-compose or docker compose v2+
#   DevNet:   Canton validator node, SV sponsorship, VPN, splice-node bundle
#
# See README.md for full documentation.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODE="${1:-build}"
DAR_PATH="$SCRIPT_DIR/.daml/dist/kredz-0.1.0.dar"

# ── Load environment ──
ENV_FILE="$SCRIPT_DIR/.env"
if [ -f "$ENV_FILE" ]; then
  set -a; source "$ENV_FILE"; set +a
fi

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
log()  { echo -e "${GREEN}[kredz-daml]${NC} $1"; }
warn() { echo -e "${YELLOW}[kredz-daml]${NC} $1"; }
err()  { echo -e "${RED}[kredz-daml]${NC}   $1"; }

# ── Container runtime auto-detect ──
detect_container() {
  if command -v podman &>/dev/null; then
    CONTAINER="podman"
    if podman compose version &>/dev/null 2>&1; then
      COMPOSE="podman compose"
    elif command -v podman-compose &>/dev/null; then
      COMPOSE="podman-compose"
    else
      COMPOSE="podman compose"
    fi
  elif command -v docker &>/dev/null; then
    CONTAINER="docker"
    COMPOSE="docker compose"
  else
    CONTAINER=""
    COMPOSE=""
  fi
  export CONTAINER COMPOSE
}
detect_container

has_env() { [ -f "$ENV_FILE" ]; }

# ── Upload DAR to a JSON Ledger API endpoint ──
upload_dar() {
  local api_url="${1:-http://localhost:3975}"
  local token="${2:-}"

  if [ ! -f "$DAR_PATH" ]; then
    err "DAR not found: $DAR_PATH — run build first"
    return 1
  fi

  local auth_header=()
  if [ -n "$token" ]; then
    auth_header=(-H "Authorization: Bearer $token")
  fi

  log "Uploading DAR to $api_url ..."
  local resp
  resp=$(curl -s -w "\n%{http_code}" -X POST "${api_url}/v2/dars?vetAllPackages=true" \
    "${auth_header[@]}" \
    -H "Content-Type: application/octet-stream" \
    --data-binary "@$DAR_PATH" 2>&1)

  local http_code
  http_code=$(echo "$resp" | tail -n1)
  local body
  body=$(echo "$resp" | sed '$d')

  if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    log "DAR uploaded successfully (HTTP $http_code)"
    return 0
  else
    err "DAR upload failed (HTTP $http_code): $body"
    return 1
  fi
}

# ── Step 1: Build the DAR ──
build_dar() {
  log "Building DAML package..."
  cd "$SCRIPT_DIR"

  if command -v dpm &>/dev/null; then
    dpm build -o "$DAR_PATH"
  elif command -v daml &>/dev/null; then
    daml build --target=3.3 -o "$DAR_PATH"
  else
    err "Neither 'dpm' nor 'daml' CLI found."
    err "Install DAML SDK: https://docs.daml.com/getting-started/installation/"
    err "Or use container: $COMPOSE run --rm daml-shell"
    exit 1
  fi

  if [ -f "$DAR_PATH" ]; then
    DAR_SIZE=$(du -h "$DAR_PATH" | cut -f1)
    log "DAR built: $DAR_PATH ($DAR_SIZE)"
  else
    err "DAR build failed — no output file at $DAR_PATH"
    exit 1
  fi
}

# ── Step 2: Run DAML Script tests ──
run_tests() {
  log "Running DAML Script tests..."
  cd "$SCRIPT_DIR"

  if command -v dpm &>/dev/null; then
    dpm test
    log "All Daml Script tests passed"
  else
    warn "DAML SDK not installed — skipping tests"
    warn "Tests are in daml/KredzTests.daml (5 tests)"
  fi
}

# ── LOCALNET ──
deploy_localnet() {
  log "Deploying to Compose LocalNet..."
  local have_container=true
  [ -z "$CONTAINER" ] && have_container=false

  # Start if not already running
  if ! $have_container || ! $COMPOSE ps 2>/dev/null | grep -q "participant1"; then
    log "Starting Canton LocalNet..."
    if $have_container; then
      $COMPOSE up -d --wait 2>&1 || true
    else
      err "Neither podman nor docker found — cannot start LocalNet"
      err "Install podman or docker to run Canton locally"
      return 1
    fi
    log "Waiting for participant1 to be ready..."
    sleep 15
  fi

  # Build and test DAR
  build_dar
  run_tests

  # Copy DAR into participant containers
  $CONTAINER cp "$DAR_PATH" participant1:/tmp/kredz.dar
  log "Uploading DAR to participant1..."

  $COMPOSE exec -T participant1 /canton/bin/canton daemon \
    --config /canton/participant.conf \
    -c "participant1.dars.upload(\"/tmp/kredz.dar\", false)" 2>&1 || true

  $CONTAINER cp "$DAR_PATH" participant2:/tmp/kredz.dar
  log "Uploading DAR to participant2..."

  $COMPOSE exec -T participant2 /canton/bin/canton daemon \
    --config /canton/participant.conf \
    -c "participant2.dars.upload(\"/tmp/kredz.dar\", false)" 2>&1 || true

  # Allocate parties
  log "Allocating kredz party on participant1..."
  $COMPOSE exec -T participant1 /canton/bin/canton daemon \
    --config /canton/participant.conf \
    -c "val k = participant1.parties.enable(\"kredz\"); println(s\"kredz party: \$k\")" 2>&1 || true

  log "Allocating lender party on participant2..."
  $COMPOSE exec -T participant2 /canton/bin/canton daemon \
    --config /canton/participant.conf \
    -c "val l = participant2.parties.enable(\"lender\"); println(s\"lender party: \$l\")" 2>&1 || true

  echo ""
  echo -e "${GREEN}══════════════════════════════════════════════${NC}"
  echo -e "${GREEN}  Canton LocalNet Ready — kredz.xyz${NC}"
  echo -e "${GREEN}══════════════════════════════════════════════${NC}"
  echo -e "  ${BLUE}JSON Ledger API (participant1):${NC} http://localhost:3975"
  echo -e "  ${BLUE}JSON Ledger API (participant2):${NC} http://localhost:4975"
  echo -e "  ${BLUE}gRPC Ledger API (participant1):${NC} localhost:3901"
  echo -e "  ${BLUE}gRPC Ledger API (participant2):${NC} localhost:4901"
  echo ""
  echo -e "  Frontend env:  VITE_CANTON_LEDGER_API=http://localhost:3975"
  echo -e "${GREEN}══════════════════════════════════════════════${NC}"
}

# ── DEVNET ──
deploy_devnet() {
  build_dar
  run_tests

  local ledger_api="${CANTON_LEDGER_API:-http://localhost:3975}"
  local token="${CANTON_API_TOKEN:-}"
  local party_hint="${CANTON_PARTY_HINT:-kredz-operator-1}"
  local sv_url="${CANTON_SV_URL:-https://sv.sv-1.dev.global.canton.network.sync.global}"

  if has_env; then
    log ".env loaded"

    if [ -n "$token" ]; then
      log "Attempting DAR upload to $ledger_api ..."
      if upload_dar "$ledger_api" "$token"; then
        log "KREDZ DAR deployed to Canton DevNet!"
        log ""
        log "Next: allocate the kredz party via Admin API"
        log "  participant.parties.enable(\"$party_hint\")"
        log ""
        log "Then test from the frontend:"
        log "  VITE_CANTON_LEDGER_API=$ledger_api"
        log "  VITE_CANTON_KREDZ_PARTY=$party_hint"
        return 0
      else
        warn "Upload failed — falling through to manual instructions"
      fi
    fi
  fi

  echo ""
  echo -e "${YELLOW}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${YELLOW}║  Canton DevNet Deployment — Step-by-Step                    ║${NC}"
  echo -e "${YELLOW}╠══════════════════════════════════════════════════════════════╣${NC}"
  echo -e "${YELLOW}║                                                              ║${NC}"
  echo -e "${YELLOW}║  DAR built: kredz-0.1.0.dar                                 ║${NC}"
  echo -e "${YELLOW}║                                                              ║${NC}"
  echo -e "${YELLOW}║  To deploy to Canton DevNet:                                 ║${NC}"
  echo -e "${YELLOW}║                                                              ║${NC}"
  echo -e "${YELLOW}║  1. Apply for validator:                                     ║${NC}"
  echo -e "${YELLOW}║     https://canton.foundation/apply-to-set-up-a-validator/   ║${NC}"
  echo -e "${YELLOW}║                                                              ║${NC}"
  echo -e "${YELLOW}║  2. Download splice-node:                                    ║${NC}"
  echo -e "${YELLOW}║     https://github.com/canton-network/splice/releases        ║${NC}"
  echo -e "${YELLOW}║                                                              ║${NC}"
  echo -e "${YELLOW}║  3. Configure canton/.env with validator key + API token     ║${NC}"
  echo -e "${YELLOW}║     cp .env.example .env                                     ║${NC}"
  echo -e "${YELLOW}║                                                              ║${NC}"
  echo -e "${YELLOW}║  4. Start validator:                                         ║${NC}"
  echo -e "${YELLOW}║     ./start.sh -s $sv_url -p $party_hint ...           ║${NC}"
  echo -e "${YELLOW}║                                                              ║${NC}"
  echo -e "${YELLOW}║  5. Upload DAR (after validator is running):                 ║${NC}"
  echo -e "${YELLOW}║     curl -X POST \"$ledger_api/v2/dars?vetAllPackages=true\" \\${NC}"
  echo -e "${YELLOW}║       -H \"Authorization: Bearer \$TOKEN\" \\${NC}"
  echo -e "${YELLOW}║       --data-binary @.daml/dist/kredz-0.1.0.dar              ║${NC}"
  echo -e "${YELLOW}║                                                              ║${NC}"
  echo -e "${YELLOW}║  See: canton/DEVNET.md for full instructions                 ║${NC}"
  echo -e "${YELLOW}╚══════════════════════════════════════════════════════════════╝${NC}"
}

# ── BUILD ONLY ──
deploy_build() {
  build_dar
  run_tests
  echo ""
  log "Build complete. DAR at: $DAR_PATH"
  log "Next: ./deploy-dar.sh localnet   (for Docker-based local dev)"
  log "Next: ./deploy-dar.sh devnet     (for Canton Foundation DevNet)"
}

# ── Main ──
case "$MODE" in
  localnet)  deploy_localnet ;;
  devnet)    deploy_devnet ;;
  build)     deploy_build ;;
  test)      run_tests ;;
  *)
    echo "Usage: ./deploy-dar.sh [build|localnet|devnet|test]"
    echo ""
    echo "  build     Build DAR + run tests"
    echo "  localnet  Build + deploy to Docker Compose LocalNet"
    echo "  devnet    Build + show DevNet deployment instructions"
    echo "  test      Run DAML Script tests only"
    exit 1
    ;;
esac
