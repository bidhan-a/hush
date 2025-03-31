use anchor_lang::prelude::*;

use crate::errors::Error;
use crate::state::{ConfigState, PoolState};

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct CreatePool<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        seeds=[b"config"],
        bump=config.bump,
        constraint=config.admin.key() == admin.key() @ Error::PermissionDenied
    )]
    pub config: Box<Account<'info, ConfigState>>,

    #[account(
        init,
        payer=admin,
        seeds=[b"pool", amount.to_le_bytes().as_ref()],
        bump,
        space=PoolState::INIT_SPACE + 8
    )]
    pub pool: Box<Account<'info, PoolState>>,

    #[account(
        seeds=[b"vault", pool.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> CreatePool<'info> {
    pub fn create_pool(&mut self, amount: u64, bumps: &CreatePoolBumps) -> Result<()> {
        self.pool.amount = amount;
        self.pool.next_index = 0;
        self.pool.previous_commitment = None;
        self.pool.pool_bump = bumps.pool;
        self.pool.vault_bump = bumps.vault;
        self.pool.initialize_merkle_tree();
        Ok(())
    }
}
