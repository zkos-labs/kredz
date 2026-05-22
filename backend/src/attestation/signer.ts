import { createHash, createSign, createVerify } from 'crypto';
import { config } from '../config';
import { KREDZScore, ScoreAttestation } from '../types';
import { v4 as uuid } from 'uuid';

export function signAttestation(score: KREDZScore, recipientChain: 0 | 1): ScoreAttestation {
  const attestationId = uuid();
  const payload = {
    attestationId,
    did: score.did,
    score: score.score,
    tier: score.tier,
    layerBreakdown: score.layerBreakdown,
    recipientChain,
    signedAt: new Date().toISOString(),
  };

  const payloadJson = JSON.stringify(payload);
  const payloadHash = createHash('sha256').update(payloadJson).digest('hex');

  const signer = createSign('SHA256');
  signer.update(payloadJson);
  signer.end();
  const signature = signer.sign(config.SCORING_ENGINE_KEY, 'hex');

  return {
    ...payload,
    proofHash: signature,
  };
}

export function verifyAttestation(attestation: ScoreAttestation): boolean {
  const { proofHash, ...payload } = attestation;
  const payloadJson = JSON.stringify(payload);

  const verify = createVerify('SHA256');
  verify.update(payloadJson);
  verify.end();
  return verify.verify(config.SCORING_ENGINE_PUBKEY, proofHash, 'hex');
}
