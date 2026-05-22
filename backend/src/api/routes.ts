import { Router, Request, Response, NextFunction } from 'express';
import { apiKeyAuth, rateLimiter } from './middleware';
import { computeScore } from '../scoring/engine';
import { signAttestation } from '../attestation/signer';

export const scoreRouter = Router();

scoreRouter.use(apiKeyAuth);
scoreRouter.use(rateLimiter);

// GET /score/:did — query a borrower's current KREDZ Score
scoreRouter.get('/score/:did', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { did } = req.params;

    const score = await computeScore(did);

    res.json({
      did: score.did,
      score: score.score,
      tier: score.tier,
      score_floor: Math.max(0, score.score - 50),
      layer_breakdown: {
        onchain_pct: Math.round((score.layerBreakdown.layer1 / score.score) * 100),
        zk_kyc_pct: Math.round((score.layerBreakdown.layer2 / score.score) * 100),
        literacy_pct: Math.round((score.layerBreakdown.layer3 / score.score) * 100),
      },
      proof_hash: score.proofHash,
      midnight_attestation_id: score.attestationId,
      valid_until: score.validUntil,
      updated_at: score.updatedAt,
    });
  } catch (err) {
    next(err);
  }
});

// POST /score/refresh — trigger manual score recomputation
scoreRouter.post('/score/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { did } = req.body;
    if (!did) {
      res.status(400).json({ error: 'missing did in request body' });
      return;
    }

    const score = await computeScore(did);
    const attestation = signAttestation(score, 0); // 0 = Base

    res.json({
      status: 'ok',
      score,
      attestation_id: attestation.attestationId,
    });
  } catch (err) {
    next(err);
  }
});

// POST /score/attest — generate attestation proof for Base or Canton
scoreRouter.post('/score/attest', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { did, chain } = req.body; // chain: 0 = Base, 1 = Canton
    if (!did) {
      res.status(400).json({ error: 'missing did' });
      return;
    }

    const score = await computeScore(did);
    const attestation = signAttestation(score, chain ?? 0);

    res.json(attestation);
  } catch (err) {
    next(err);
  }
});
