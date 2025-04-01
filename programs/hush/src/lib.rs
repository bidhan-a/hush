use anchor_lang::prelude::*;

declare_id!("CkevGEmkCSpN3SgS9ptG42qL42vV4aTS8NrhDx29sxF3");

mod constants;
mod errors;
mod instructions;
mod state;
mod zk;

use instructions::*;

#[program]
pub mod hush {

    use super::*;

    pub fn initialize(ctx: Context<Initialize>, fee_basis_points: u16) -> Result<()> {
        ctx.accounts.initialize(fee_basis_points, &ctx.bumps)
    }

    pub fn create_pool(ctx: Context<CreatePool>, amount: u64) -> Result<()> {
        ctx.accounts.create_pool(amount, &ctx.bumps)
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64, commitment: [u8; 32]) -> Result<()> {
        ctx.accounts.deposit(amount, commitment, &ctx.bumps)
    }

    pub fn withdraw(
        ctx: Context<Withdraw>,
        amount: u64,
        nullifier_hash: [u8; 32],
        root: [u8; 32],
        proof: [u8; 256],
    ) -> Result<()> {
        ctx.accounts
            .withdraw(amount, nullifier_hash, root, proof, &ctx.bumps)
    }
}
