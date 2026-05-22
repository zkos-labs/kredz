"""
kredz.xyz — Scoring Engine ML Model (v0.1)

XGBoost gradient boosting model for computing the KREDZ Score (0-1000)
from the three signal layers: on-chain wallet analysis, ZK-KYC credentials,
and financial literacy data.

At MVP, this uses a trained placeholder model with coefficient-based scoring.
The model is retrained monthly on repayment outcome data (Phase 1+).
"""

import json
import numpy as np
from dataclasses import dataclass
from typing import Optional

@dataclass
class WalletFeatures:
    age_days: int
    tx_count: int
    avg_monthly_tx: float
    defi_count: int
    total_loans: int
    repaid_on_time: int
    defaults: int
    asset_stability: float
    gov_participation: float
    cross_chain_networks: int

@dataclass
class KYCFeatures:
    has_income_proof: int
    has_employment_proof: int
    has_bank_history: int
    has_ewallet_history: int
    has_credit_commitments: int
    has_adverse_credit_events: int

@dataclass
class LiteracyFeatures:
    modules_completed: int
    total_xp: int
    recent_xp: int
    first_attempt_accuracy: float
    streak_active: int

def extract_wallet_features(data: dict) -> WalletFeatures:
    return WalletFeatures(
        age_days=data.get("ageDays", 0),
        tx_count=data.get("transactionCount", 0),
        avg_monthly_tx=data.get("avgMonthlyTx", 0),
        defi_count=data.get("defiInteractionCount", 0),
        total_loans=data["repaymentHistory"].get("totalLoans", 0),
        repaid_on_time=data["repaymentHistory"].get("repaidOnTime", 0),
        defaults=data["repaymentHistory"].get("defaultsOrLiquidations", 0),
        asset_stability=data.get("assetStability", 0),
        gov_participation=data.get("governanceParticipation", 0),
        cross_chain_networks=len(data.get("crossChainNetworks", [])),
    )

def extract_kyc_features(data: dict) -> KYCFeatures:
    return KYCFeatures(
        has_income_proof=1 if data.get("hasIncomeProof") else 0,
        has_employment_proof=1 if data.get("hasEmploymentProof") else 0,
        has_bank_history=1 if data.get("hasBankHistory") else 0,
        has_ewallet_history=1 if data.get("hasEwalletHistory") else 0,
        has_credit_commitments=1 if data.get("hasCreditCommitments") else 0,
        has_adverse_credit_events=1 if data.get("hasAdverseCreditEvents") else 0,
    )

def extract_literacy_features(data: dict) -> LiteracyFeatures:
    return LiteracyFeatures(
        modules_completed=data.get("modulesCompleted", 0),
        total_xp=data.get("totalXP", 0),
        recent_xp=data.get("recentXP", 0),
        first_attempt_accuracy=data.get("firstAttemptAccuracy", 0),
        streak_active=1 if data.get("streakActive") else 0,
    )

def compute_score(
    wallet: WalletFeatures,
    kyc: KYCFeatures,
    literacy: LiteracyFeatures,
    tier: int,
) -> dict:
    """
    Compute the three-layer KREDZ Score (0-1000).

    Layer 1: On-Chain Signals (max 400 points)
        - Wallet age (0-15%): 60 pts
        - Transaction volume (0-10%): 40 pts
        - DeFi interaction (0-20%): 80 pts
        - Repayment history (0-30%): 120 pts
        - Asset stability (0-10%): 40 pts
        - Governance (0-10%): 40 pts
        - Cross-chain (0-5%): 20 pts

    Layer 2: ZK-KYC Signals (max 400 points)
        - Available only at Tier 1+ (otherwise 0)
        - Income proof: 120 pts
        - Employment proof: 80 pts
        - Bank history: 80 pts
        - E-wallet history: 60 pts
        - Credit commitments: -60 pts
        - Adverse events: -80 pts

    Layer 3: Literacy Signals (max 200 points)
        - Modules completed (3/module): 15 pts
        - XP-based: 145 pts
        - Accuracy bonus: 20 pts
        - Streak bonus: 20 pts
    """

    # ── Layer 1: On-Chain Signals ──
    l1_wallet_age = min(wallet.age_days / 1095, 1.0) * 60   # 3-year cap
    l1_tx_volume = min(wallet.avg_monthly_tx / 30, 1.0) * 40
    l1_defi = min(wallet.defi_count / 100, 1.0) * 80

    repayment_rate = (
        wallet.repaid_on_time / max(wallet.total_loans, 1)
        if wallet.total_loans > 0
        else 0.5  # neutral for no history
    )
    l1_repay = repayment_rate * 120 - (wallet.defaults * 40)

    l1_stability = wallet.asset_stability * 40
    l1_gov = wallet.gov_participation * 40
    l1_cross_chain = min(wallet.cross_chain_networks / 5, 1.0) * 20

    layer1 = max(0, min(400, sum([
        l1_wallet_age, l1_tx_volume, l1_defi, l1_repay,
        l1_stability, l1_gov, l1_cross_chain,
    ])))

    # ── Layer 2: ZK-KYC Signals ──
    if tier >= 1:
        l2_income = kyc.has_income_proof * 120
        l2_employment = kyc.has_employment_proof * 80
        l2_bank = kyc.has_bank_history * 80
        l2_ewallet = kyc.has_ewallet_history * 60
        l2_credit = -(kyc.has_credit_commitments * 60)
        l2_adverse = -(kyc.has_adverse_credit_events * 80)
        layer2 = max(0, min(400, sum([
            l2_income, l2_employment, l2_bank, l2_ewallet,
            l2_credit, l2_adverse,
        ])))
    else:
        layer2 = 0

    # ── Layer 3: Literacy ──
    l3_modules = literacy.modules_completed * 3
    l3_xp = min(literacy.total_xp / 350, 1.0) * 145
    l3_accuracy = literacy.first_attempt_accuracy * 20
    l3_streak = literacy.streak_active * 20

    # Time decay: recent XP gets full weight, older XP gets less
    recent_pct = min(literacy.recent_xp / max(literacy.total_xp, 1), 1.0)
    layer3 = max(0, min(200, (l3_modules + l3_xp + l3_accuracy + l3_streak) * (0.5 + 0.5 * recent_pct)))

    total = int(layer1 + layer2 + layer3)

    return {
        "layer1": int(layer1),
        "layer2": int(layer2),
        "layer3": int(layer3),
        "total": min(total, 1000),
    }


def train_model(X: np.ndarray, y: np.ndarray) -> Optional[dict]:
    """
    Train XGBoost model on labeled repayment outcome data.
    Called by `npm run train` to retrain the model monthly (Phase 2+).

    Args:
        X: feature matrix (N x feature_count)
        y: labels (N,) — 1 if repaid on time, 0 if defaulted

    Returns:
        dict with model metrics, or None on failure
    """
    try:
        from xgboost import XGBClassifier
        from sklearn.model_selection import cross_val_score

        model = XGBClassifier(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            objective='binary:logistic',
            random_state=42,
        )

        scores = cross_val_score(model, X, y, cv=5, scoring='roc_auc')

        model.fit(X, y)

        return {
            "cv_scores": scores.tolist(),
            "mean_auc": float(scores.mean()),
            "std_auc": float(scores.std()),
            "feature_importance": model.feature_importances_.tolist(),
        }
    except Exception as e:
        print(f"[ml] training failed: {e}", flush=True)
        return None
