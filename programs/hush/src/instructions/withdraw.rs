use anchor_lang::prelude::*;

use crate::errors::Error;
use crate::helpers::transfer_sol;
use crate::state::{ConfigState, PoolState, WithdrawState};

#[derive(Accounts)]
#[instruction(amount: u64, nullifier: [u8; 32])]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub withdrawer: Signer<'info>,

    #[account(
        seeds=[b"config"],
        bump=config.bump,
    )]
    pub config: Box<Account<'info, ConfigState>>,

    #[account(
        seeds=[b"pool", amount.to_le_bytes().as_ref()],
        bump=pool.pool_bump,
    )]
    pub pool: Box<Account<'info, PoolState>>,

    #[account(
        mut,
        seeds=[b"vault", pool.key().as_ref()],
        bump=pool.vault_bump
    )]
    pub vault: SystemAccount<'info>,

    #[account(
        init,
        payer=withdrawer,
        seeds=[b"withdraw", pool.key().as_ref(), nullifier.as_ref()],
        bump,
        space=WithdrawState::INIT_SPACE + 8
    )]
    pub withdraw: Box<Account<'info, WithdrawState>>,

    pub system_program: Program<'info, System>,
}

impl<'info> Withdraw<'info> {
    pub fn withdraw(
        &mut self,
        amount: u64,
        nullifier: [u8; 32],
        bumps: &WithdrawBumps,
    ) -> Result<()> {
        // TODO: ZK verification.

        // Transfer funds from the vault to the receiver.
        let seeds = &[
            b"vault",
            self.pool.to_account_info().key.as_ref(),
            &[self.pool.vault_bump],
        ];
        let signer_seeds = &[&seeds[..]];
        transfer_sol(
            self.vault.to_account_info(),
            self.withdrawer.to_account_info(),
            amount,
            self.system_program.to_account_info(),
            Some(signer_seeds),
        )?;

        // Set withdraw state.
        self.withdraw.set_inner(WithdrawState {
            pool: self.pool.key(),
            to: self.withdrawer.key(),
            amount,
            nullifier,
            bump: bumps.withdraw,
        });

        Ok(())
    }
}
