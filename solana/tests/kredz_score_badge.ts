import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { KredzScoreBadge } from "../target/types/kredz_score_badge";
import { Keypair, PublicKey, Ed25519Program, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import { assert } from "chai";

describe("kredz_score_badge", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.KredzScoreBadge as Program<KredzScoreBadge>;

  const relayer = Keypair.generate();
  const user = Keypair.generate();

  function buildMessage(userPubkey: PublicKey, score: number, tier: number, timestamp: number): Buffer {
    const buf = Buffer.alloc(43);
    userPubkey.toBuffer().copy(buf, 0);
    buf.writeUInt16BE(score, 32);
    buf.writeUInt8(tier, 34);
    buf.writeBigInt64BE(BigInt(timestamp), 35);
    return buf;
  }

  async function sendCreateScore(score: number, tier: number, timestamp: number) {
    const msg = buildMessage(user.publicKey, score, tier, timestamp);
    const ed25519Ix = Ed25519Program.createInstructionWithPrivateKey({
      privateKey: relayer.secretKey,
      message: msg,
    });

    const [badgePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("kredz"), user.publicKey.toBuffer()],
      program.programId
    );

    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("kredz-relayer-config")],
      program.programId
    );

    const createIx = await program.methods
      .createScore(score, tier, new anchor.BN(timestamp))
      .accounts({
        badge: badgePda,
        user: user.publicKey,
        payer: provider.wallet.publicKey,
        config: configPda,
      })
      .instruction();

    const { blockhash } = await provider.connection.getLatestBlockhash();
    const msg2 = new TransactionMessage({
      payerKey: provider.wallet.publicKey,
      recentBlockhash: blockhash,
      instructions: [ed25519Ix, createIx],
    }).compileToV0Message();

    const tx = new VersionedTransaction(msg2);
    await provider.wallet.signTransaction(tx);
    return provider.connection.sendTransaction(tx);
  }

  async function sendUpdateScore(score: number, tier: number, timestamp: number) {
    const msg = buildMessage(user.publicKey, score, tier, timestamp);
    const ed25519Ix = Ed25519Program.createInstructionWithPrivateKey({
      privateKey: relayer.secretKey,
      message: msg,
    });

    const [badgePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("kredz"), user.publicKey.toBuffer()],
      program.programId
    );

    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("kredz-relayer-config")],
      program.programId
    );

    const updateIx = await program.methods
      .updateScore(score, tier, new anchor.BN(timestamp))
      .accounts({
        badge: badgePda,
        user: user.publicKey,
        config: configPda,
      })
      .instruction();

    const { blockhash } = await provider.connection.getLatestBlockhash();
    const msg2 = new TransactionMessage({
      payerKey: provider.wallet.publicKey,
      recentBlockhash: blockhash,
      instructions: [ed25519Ix, updateIx],
    }).compileToV0Message();

    const tx = new VersionedTransaction(msg2);
    await provider.wallet.signTransaction(tx);
    return provider.connection.sendTransaction(tx);
  }

  before(async () => {
    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("kredz-relayer-config")],
      program.programId
    );

    const configAccount = await provider.connection.getAccountInfo(configPda);
    if (configAccount) return;

    const ix = await program.methods
      .initializeRelayerConfig([...relayer.publicKey.toBytes()])
      .accounts({
        config: configPda,
        admin: provider.wallet.publicKey,
      })
      .instruction();

    const { blockhash } = await provider.connection.getLatestBlockhash();
    const msg = new TransactionMessage({
      payerKey: provider.wallet.publicKey,
      recentBlockhash: blockhash,
      instructions: [ix],
    }).compileToV0Message();

    const tx = new VersionedTransaction(msg);
    await provider.wallet.signTransaction(tx);
    await provider.connection.sendTransaction(tx);
  });

  it("creates a score badge PDA", async () => {
    const score = 750;
    const tier = 2;
    const timestamp = Math.floor(Date.now() / 1000);

    await sendCreateScore(score, tier, timestamp);

    const [badgePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("kredz"), user.publicKey.toBuffer()],
      program.programId
    );
    const badge = await program.account.scoreBadge.fetch(badgePda);
    assert.equal(badge.score, score);
    assert.equal(badge.tier, tier);
    assert.equal(badge.user.toString(), user.publicKey.toString());
  });

  it("updates an existing score badge", async () => {
    const newScore = 820;
    const newTier = 1;
    const timestamp = Math.floor(Date.now() / 1000) + 100;

    await sendUpdateScore(newScore, newTier, timestamp);

    const [badgePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("kredz"), user.publicKey.toBuffer()],
      program.programId
    );
    const badge = await program.account.scoreBadge.fetch(badgePda);
    assert.equal(badge.score, newScore);
    assert.equal(badge.tier, newTier);
  });

  it("rejects a stale timestamp on update", async () => {
    const oldTimestamp = 1000;
    try {
      await sendUpdateScore(999, 2, oldTimestamp);
      assert.fail("should have thrown");
    } catch (err: unknown) {
      assert.include(String(err), "StaleAttestation");
    }
  });

  it("rejects wrong relayer signature", async () => {
    const wrongRelayer = Keypair.generate();
    const score = 500;
    const tier = 0;
    const timestamp = Math.floor(Date.now() / 1000) + 200;
    const msg = buildMessage(user.publicKey, score, tier, timestamp);
    const ed25519Ix = Ed25519Program.createInstructionWithPrivateKey({
      privateKey: wrongRelayer.secretKey,
      message: msg,
    });

    const [badgePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("kredz"), user.publicKey.toBuffer()],
      program.programId
    );
    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("kredz-relayer-config")],
      program.programId
    );

    const updateIx = await program.methods
      .updateScore(score, tier, new anchor.BN(timestamp))
      .accounts({
        badge: badgePda,
        user: user.publicKey,
        config: configPda,
      })
      .instruction();

    const { blockhash } = await provider.connection.getLatestBlockhash();
    const msg2 = new TransactionMessage({
      payerKey: provider.wallet.publicKey,
      recentBlockhash: blockhash,
      instructions: [ed25519Ix, updateIx],
    }).compileToV0Message();

    const tx = new VersionedTransaction(msg2);
    await provider.wallet.signTransaction(tx);

    try {
      await provider.connection.sendTransaction(tx);
      assert.fail("should have thrown");
    } catch (err: unknown) {
      assert.include(String(err), "WrongRelayer");
    }
  });
});
