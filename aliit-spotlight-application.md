# Aliit Candidate Hangout. Spotlight Application

## Email
mzidanfatonie@gmail.com

## Your name
Muhammad Zidan Fatonie

---

## Why have you joined the Aliit? Are you actively building? How have you contributed so far?

I joined Aliit because I believe Midnight Network is the most credible ZK blockchain for privacy first applications. My work focuses on building infrastructure that makes ZK useful for real people, not just protocols for protocols' sake. I'm here to learn from builders tackling similar problems (selective disclosure, witness design, dust free UX) and to share what I'm learning building kredz.xyz across five chains.

**Actively building?** Yes, I'm a full time builder. My primary project is **kredz.xyz**, a privacy preserving multichain credit scoring protocol. I also maintain several Midnight infrastructure projects.

**Contributions to the Midnight ecosystem so far:**

- **kredz.xyz** Built a 5 circuit Compact contract on Midnight (`kredz_score_profile.compact`) that computes credit scores from private financial data without revealing the underlying inputs. Only score commitments are stored on chain. Integrated 1AM wallet for dust free ZK proving via ProofStation. Score is then bridged as ERC 8004 soulbound tokens on Base and ScoreBadge PDAs on Solana. Also includes a Canton Network integration (DAML contracts) for institutional compliance grade lending. Applied to Midnight Build Club Fellowship Cohort 2 (June 2026). GitHub: https://github.com/kredz-labs/kredz

- **midnight-agent-did-manager** A standalone Midnight Build Club project implementing an agent native identity standard (MAIS compatible) for AI agents to hold and manage DIDs and Verifiable Credentials on Midnight. Designed to enable agent to agent trust in multichain environments. GitHub: https://github.com/mzf11125/midnight-agent-did-manager

- **midnight-awesome-dapps PR #133** Listed kredz on the official Midnight ecosystem directory to help other builders discover privacy preserving credit infrastructure on Midnight.

- **midnight-docs contributions** Active contributor to documentation clarity around 1AM wallet integration, indexer query patterns, and cross network provider routing.

- **tabah-protocol** Built an AI powered emergency response module on Solana with ZK integration path to Midnight for privacy preserving aid distribution (applied to UNICEF Venture Fund).

I'm also maintaining several Midnight reference implementations (example hello world, example counter) as learning resources and building the **Tawf Foundation** ecosystem (tawf.foundation) which uses Midnight for ZK mustahik verification in zakat distribution.

---

## What are you planning to share during your 10 to 15 min spotlight?

I'd like to share a **technical walkthrough of building a multi chain ZK credit scoring protocol on Midnight**, specifically the architecture decisions, circuit design patterns, and hard won lessons that aren't in the documentation.

**What I'll cover:**

**1. Why credit scoring on Midnight? (2 min)**
The problem: 1.4 billion unbanked adults have meaningful financial behavior but no credit score. Existing solutions (Spectral, Cred Protocol) are web2 analytics hiding behind blockchain branding. Midnight's dual state architecture (public/private) makes true privacy preserving credit scoring possible, scores are computed from private witnesses, only commitments hit the ledger.

**2. Compact circuit design deep dive (5 min)**
Walk through `kredz_score_profile.compact`, 5 circuits for score computation, commitment persistence, tier attestation, selective disclosure, and credential revocation. Show how I used `BytesHash` commitments to store score hashes on chain while keeping raw scores as witnesses. Demonstrate the selective disclosure pattern: prove your credit tier (1/2/3) without revealing your exact 0 to 1000 score. Cover the witness scoping rules that tripped me up and how I structured multi attribute ZK proofs.

**3. The 1AM dust free proving loop (2 min)**
The 1AM wallet integration was the hardest piece. Share how I set up ProofStation to sponsor ZK proof generation so users never touch DUST. Walk through the proving pipeline: user action, Compact transaction, witness collection, ProofStation, 1AM, on chain commitment. Show the error patterns I hit (indexer offset/null bug, provider routing across undeployed/preview/preprod networks) and how I solved them.

**4. Cross chain score portability (2 min)**
How the score leaves Midnight and becomes useful: ERC 8004 soulbound ScoreBadge on Base, Anchor PDA on Solana, DAML contract on Canton for institutional lenders. The relayer architecture and why I chose per chain tokenization over a single cross chain messaging protocol.

**5. Lessons learned and open challenges (2 min)**
Honest assessment of what's hard: circuit compilation iteration speed (`--skip-zk` is essential), the Compact toolchain version sync problem, and the current gap around W3C Verifiable Credential support on Midnight. Where I think the ecosystem should go next.

**Format:** Live code walkthrough of the Compact contract plus deployed frontend at kredz.xyz. Not a product pitch, a technical architecture review for builders who want to understand how to structure multi circuit Compact contracts, integrate 1AM, and bridge ZK state across chains.

**Who this is for:** Builders working on ZK identity, selective disclosure, DeFi credit, or cross chain state portability on Midnight.
