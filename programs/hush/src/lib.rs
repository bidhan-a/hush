use anchor_lang::prelude::*;

declare_id!("CkevGEmkCSpN3SgS9ptG42qL42vV4aTS8NrhDx29sxF3");

mod instructions;
mod state;

use instructions::*;

#[program]
pub mod hush {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.initialize(&ctx.bumps)
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        ctx.accounts.deposit(amount)
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        ctx.accounts.withdraw(amount)
    }
}
