[cite_start]This Product Requirements Document (PRD) adapts the **kredz.xyz** strategy for **Midnight**, a data-protection blockchain designed for selective disclosure[cite: 7, 23]. [cite_start]By leveraging Midnight’s native Zero-Knowledge (ZK) capabilities, kredz.xyz can provide high-integrity credit scoring while ensuring user data remains private and decentralized[cite: 5, 29].

---

## 1. Product Vision & Core Thesis
[cite_start]**Vision:** To become the foundational reputation and credit layer for the Midnight ecosystem, enabling undercollateralized lending through privacy-preserving AI scoring[cite: 5, 8].

**Core Thesis:**
* [cite_start]**Privacy-Native Compliance:** Unlike Base, which relies on centralized KYC (Coinbase), Midnight allows for **Selective Disclosure**, where users prove creditworthiness without revealing raw financial data[cite: 7, 16, 29].
* [cite_start]**The Midnight Edge:** Midnight’s architecture is purpose-built for the "Compliance vs. Privacy" tension, making it the ideal home for a ZK-KYC credit score[cite: 22, 23].

---

## 2. The KREDZ Three-Layer Scoring Model
[cite_start]The Al scoring engine fuses three distinct signal layers into a single **KREDZ Score (0-1000)** that updates continuously[cite: 19].

| Layer | Type | Midnight Implementation |
| :--- | :--- | :--- |
| **Layer 1** | **On-chain Signals** | Analyzes transaction history across Midnight and Cardano. [cite_start]Includes wallet age, DeFi interactions, and repayment behavior[cite: 20]. |
| **Layer 2** | **ZK-KYC Signals** | [cite_start]**The Differentiator.** Uses Midnight’s ZK-circuits to attest to real-world attributes (income, bank history) without raw data exposure[cite: 20, 29]. |
| **Layer 3** | **Behavioral/Literacy** | [cite_start]Users earn points by completing verified financial literacy modules (DeFi mechanics, risk management)[cite: 20, 36, 43]. |

---

## 3. Tiered Privacy & Access Model
[cite_start]Kredz utilizes Midnight’s selective disclosure to create a tiered access system for borrowers[cite: 23].

* **Tier 0 (Anonymous):** Based purely on on-chain behavior. [cite_start]Unlocks micro-lending (0-400 score range)[cite: 24].
* **Tier 1 (Pseudonymous):** Requires a ZK-proof of one real-world attribute (e.g., "User is over 18" or "User has >$5k income"). [cite_start]Unlocks mid-tier lending (0-650 score range)[cite: 24].
* **Tier 2 (Full Compliance):** Integration with Midnight-compatible KYC providers. [cite_start]Unlocks full lending access and institutional liquidity pools (0-1000 score range)[cite: 25, 26, 28].

---

## 4. Technical Architecture: ERC-8004 & Midnight Interop
[cite_start]While Midnight is a Cardano sidechain, kredz.xyz will utilize the **ERC-8004 (Trustless Agents)** standard to ensure the credit score is portable across EVM chains (Arbitrum, Polygon, etc.) via Midnight's interoperability layers[cite: 90, 97, 98].

* [cite_start]**Identity Registry:** Every user wallet is registered as a lightweight ERC-8004 agent, making their reputation discoverable by any protocol[cite: 93, 97].
* [cite_start]**Reputation Registry:** Stores the KREDZ Score history on-chain for composability with Midnight lending protocols[cite: 93, 107].
* [cite_start]**Validation Registry:** Allows institutional partners to trustlessly audit the AI scoring model via **ZK-ML proofs** or TEE attestations[cite: 93, 100, 107].

---

## 5. Market Sizing & Revenue Model
[cite_start]Midnight’s focus on regulated DeFi positions kredz.xyz to capture high-value institutional and retail users[cite: 46, 76].

### Revenue Streams
* [cite_start]**Score API (B2B):** Charging Midnight lending protocols (e.g., $0.10–$0.50) per credit score query[cite: 49, 50, 51].
* [cite_start]**Premium User Tier (B2C):** $5–$10/month for score history, coaching, and priority ZK-KYC processing[cite: 53].
* [cite_start]**Literacy SaaS:** Licensing education infrastructure to neobanks and wallets looking to onboard users to Midnight[cite: 53].

---

## 6. Go-to-Market Strategy (Midnight)
1.  [cite_start]**MVP Launch:** Deploy the on-chain scoring engine on Midnight’s testnet; partner with early Midnight-native lending protocols[cite: 60, 61].
2.  [cite_start]**Ecosystem Funding:** Apply for Midnight/Cardano ecosystem grants, emphasizing the "Privacy + Compliance" narrative[cite: 63, 64].
3.  [cite_start]**Literacy Beta:** Launch gamified score-building modules via Farcaster and Midnight community hubs to solve the "thin-file" user problem[cite: 34, 35, 70].
4.  [cite_start]**Institutional Integration:** Position kredz.xyz as the compliance middleware required for banks to operate on Midnight under **MICA** or the **GENIUS Act**[cite: 76, 77, 78].

---

## 7. Key Risks & Mitigations
* [cite_start]**ZK Metadata Leakage:** Sophisticated users may fear "ZK" solutions that leak metadata[cite: 84]. [cite_start]**Mitigation:** Invest in rigorous ZK-circuit audits specifically for Midnight’s DPC (Decentralized Private Computation) model[cite: 85].
* [cite_start]**Competitor Speed:** Existing players like Cred Protocol could add KYC layers[cite: 86]. [cite_start]**Mitigation:** Move fast on the **Financial Literacy** moat, which is harder to replicate than pure data aggregation[cite: 35, 86].