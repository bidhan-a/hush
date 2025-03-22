use anchor_lang::prelude::*;

use crate::errors::Error;
use crate::state::{ConfigState, PoolState};

use super::helpers::{compute_initial_filled_subtrees, compute_initial_merkle_root};

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
        let merkle_root = compute_initial_merkle_root();
        let filled_subtrees = compute_initial_filled_subtrees();
        self.pool.set_inner(PoolState {
            amount,
            next_index: 0,
            merkle_root,
            filled_subtrees,
            pool_bump: bumps.pool,
            vault_bump: bumps.vault,
        });
        Ok(())
    }
}
