import { useState, useCallback } from 'react';
import { Connection, PublicKey, Ed25519Program, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { toast } from '../components/Toast';

const PROGRAM_ID = new PublicKey(
  (import.meta.env.VITE_SOLANA_PROGRAM_ID as string | undefined) ?? '24KqR89h5SMLvV4QCKw4HAcYxVjovZU73SMyYvjETZ7E'
);
const SOLANA_RPC = (import.meta.env.VITE_SOLANA_RPC as string | undefined) ?? 'https://api.devnet.solana.com';

// ScoreBadge account layout (after 8-byte discriminator):
// pubkey (32) | score u16 (2) | tier u8 (1) | timestamp i64 (8) = 43 bytes
function parseScoreBadge(data: Buffer) {
  const score = data.readUInt16BE(40);   // 8 disc + 32 pubkey = offset 40
  const tier = data.readUInt8(42);
  const timestamp = Number(data.readBigInt64BE(43));
  return { score, tier, timestamp };
}

export interface SolanaScoreData {
  score: number;
  tier: number;
  timestamp: number;
}

export function useSolanaScore() {
  const [data, setData] = useState<SolanaScoreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = useCallback(async (userAddress: string) => {
    setLoading(true);
    setError(null);
    try {
      const connection = new Connection(SOLANA_RPC, 'confirmed');
      const userPubkey = new PublicKey(userAddress);
      const [badgePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('kredz'), userPubkey.toBuffer()],
        PROGRAM_ID
      );
      const accountInfo = await connection.getAccountInfo(badgePda);
      if (!accountInfo) { setData(null); return; }
      setData(parseScoreBadge(Buffer.from(accountInfo.data)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Solana score');
    } finally {
      setLoading(false);
    }
  }, []);

  // mintBadge: builds Ed25519 pre-instruction + upsert_score instruction,
  // signs with Phantom, and sends to devnet.
  // Note: In production, relayer API provides Ed25519 signature. For dev, this is a demo function.
  const mintBadge = useCallback(async (
    userAddress: string,
    score: number,
    tier: number,
    timestamp: number,
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const provider = (window as any)?.phantom?.solana ?? (window as any)?.solana;
    if (!provider) throw new Error('Phantom not found');

    setMinting(true);
    try {
      const connection = new Connection(SOLANA_RPC, 'confirmed');
      const userPubkey = new PublicKey(userAddress);
      const payerPubkey = new PublicKey(provider.publicKey.toString());

      // Build the message that would be signed by the relayer
      const msg = Buffer.alloc(43);
      userPubkey.toBuffer().copy(msg, 0);
      msg.writeUInt16BE(score, 32);
      msg.writeUInt8(tier, 34);
      msg.writeBigInt64BE(BigInt(timestamp), 35);

      // Encode upsert_score instruction manually
      // Run: `anchor build && anchor keys list` to get the actual discriminator
      const disc = Buffer.from([0x70, 0x81, 0xbf, 0xd3, 0x16, 0x55, 0x24, 0x96]); // sha256("global:upsert_score")[..8]
      const args = Buffer.alloc(11);
      args.writeUInt16BE(score, 0);
      args.writeUInt8(tier, 2);
      args.writeBigInt64BE(BigInt(timestamp), 3);
      const data = Buffer.concat([disc, args]);

      const ed25519Ix = Ed25519Program.createInstructionWithPublicKey({
        publicKey: userPubkey.toBytes(),
        message: msg,
        signature: Buffer.alloc(64), // placeholder
      });

      const [badgePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('kredz'), userPubkey.toBuffer()],
        PROGRAM_ID
      );

      const { blockhash } = await connection.getLatestBlockhash();
      const txMsg = new TransactionMessage({
        payerKey: payerPubkey,
        recentBlockhash: blockhash,
        instructions: [
          ed25519Ix,
          {
            programId: PROGRAM_ID,
            keys: [
              { pubkey: badgePda, isSigner: false, isWritable: true },
              { pubkey: userPubkey, isSigner: false, isWritable: false },
              { pubkey: payerPubkey, isSigner: true, isWritable: true },
              { pubkey: new PublicKey('11111111111111111111111'), isSigner: false, isWritable: false },
              ],
              data,
            },
          ],
        }).compileToV0Message();

      const tx = new VersionedTransaction(txMsg);
      const signed = await provider.signTransaction(tx);
      await connection.sendRawTransaction(signed.serialize());
      await fetchScore(userAddress);
    } catch (err) {
      console.error('Mint badge error:', err);
      toast('Failed to mint Solana badge', 'error');
    } finally {
      setMinting(false);
    }
  }, [fetchScore]);

  return { data, loading, minting, error, fetchScore, mintBadge };
}
