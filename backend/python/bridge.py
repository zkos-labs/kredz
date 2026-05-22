#!/usr/bin/env python3
"""
kredz.xyz — Node.js ↔ Python ML Bridge

Reads JSON input from stdin, runs XGBoost inference,
writes JSON output to stdout.

Usage: node sends JSON to python3 bridge.py stdin → python returns JSON to stdout

This avoids needing a separate Python HTTP server.
"""

import sys
import json
from model import (
    extract_wallet_features,
    extract_kyc_features,
    extract_literacy_features,
    compute_score,
)

def main():
    try:
        input_data = sys.stdin.read()
        if not input_data.strip():
            print(json.dumps({"layer1": 0, "layer2": 0, "layer3": 0, "total": 0}))
            return

        data = json.loads(input_data)

        wallet = extract_wallet_features(data.get("wallet", {}))
        kyc = extract_kyc_features(data.get("kyc", {}))
        literacy = extract_literacy_features(data.get("literacy", {}))
        tier = data.get("tier", 0)

        result = compute_score(wallet, kyc, literacy, tier)

        print(json.dumps(result), flush=True)
    except Exception as e:
        print(json.dumps({"error": str(e)}), flush=True)
        sys.exit(1)

if __name__ == "__main__":
    main()
