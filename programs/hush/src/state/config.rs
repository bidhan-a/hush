use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct ConfigState {
    pub admin: Pubkey,
    pub fee_basis_points: u16,
    pub bump: u8,
    pub treasury_bump: u8,
}
