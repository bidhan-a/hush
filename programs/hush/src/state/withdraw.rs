use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct WithdrawState {
    pub pool: Pubkey,
    pub to: Pubkey,
    pub amount: u64,
    pub nullifier_hash: [u8; 32],
    pub bump: u8,
}
