use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct DepositState {
    pub pool: Pubkey,
    pub from: Pubkey,
    pub amount: u64,
    pub commitment: [u8; 32],
    pub sibling_commitment: Option<[u8; 32]>,
    pub index: u32,
    pub bump: u8,
}
