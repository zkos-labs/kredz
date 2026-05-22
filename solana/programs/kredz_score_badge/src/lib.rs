use anchor_lang::prelude::*;

declare_id!("x6MWmEFP2dDNepzXjyZngt5EvQqBDy6Vry6svcaXXMM");

const RELAYER_PUBKEY_BYTES: [u8; 32] = [0u8; 32];

#[program]
pub mod kredz_score_badge {
    use super::*;

    pub fn upsert_score(
        ctx: Context<UpsertScore>,
        score: u16,
        tier: u8,
        timestamp: i64,
    ) -> Result<()> {
        let ed25519_id = anchor_lang::solana_program::ed25519_program::ID;
        let ix = &ctx.accounts.ix_sysvar;
        let ix_data = anchor_lang::solana_program::sysvar::instructions::load_instruction_at_checked(0, ix)?;
        require_keys_eq!(ix_data.program_id, ed25519_id, KredzError::BadSigInstruction);

        let ix_bytes = ix_data.data.as_slice();
        require!(ix_bytes.len() >= 70, KredzError::BadSigInstruction);
        require!(&ix_bytes[2..34] == &RELAYER_PUBKEY_BYTES, KredzError::WrongRelayer);

        let msg_offset = u16::from_le_bytes([ix_bytes[66], ix_bytes[67]]) as usize;
        let msg_size = u16::from_le_bytes([ix_bytes[68], ix_bytes[69]]) as usize;
        require!(msg_size == 43, KredzError::BadMessage);
        let msg = &ix_bytes[msg_offset..msg_offset + msg_size];

        let user_key = ctx.accounts.user.key().to_bytes();
        require!(&msg[0..32] == user_key.as_ref(), KredzError::BadMessage);
        require!(u16::from_be_bytes([msg[32], msg[33]]) == score, KredzError::BadMessage);
        require!(msg[34] == tier, KredzError::BadMessage);

        let mut ts_bytes = [0u8; 8];
        ts_bytes.copy_from_slice(&msg[35..43]);
        require!(i64::from_be_bytes(ts_bytes) == timestamp, KredzError::BadMessage);

        let badge = &mut ctx.accounts.badge;
        require!(timestamp > badge.timestamp, KredzError::StaleAttestation);

        badge.user = ctx.accounts.user.key();
        badge.score = score;
        badge.tier = tier;
        badge.timestamp = timestamp;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct UpsertScore<'info> {
    #[account(init, payer = payer, space = 8 + 32 + 2 + 1 + 8,
              seeds = [b"kredz", user.key().as_ref()], bump)]
    pub badge: Account<'info, ScoreBadge>,

    /// CHECK: user whose score is being attested
    pub user: UncheckedAccount<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,

    /// CHECK: Instructions sysvar
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub ix_sysvar: UncheckedAccount<'info>,
}

#[account]
pub struct ScoreBadge {
    pub user: Pubkey,
    pub score: u16,
    pub tier: u8,
    pub timestamp: i64,
}

#[error_code]
pub enum KredzError {
    #[msg("Ed25519 pre-instruction missing or wrong program")]
    BadSigInstruction,
    #[msg("Ed25519 pubkey does not match relayer")]
    WrongRelayer,
    #[msg("Signed message does not match expected format")]
    BadMessage,
    #[msg("Attestation timestamp is not newer than stored value")]
    StaleAttestation,
}
