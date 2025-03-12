use anchor_lang::prelude::*;

use crate::errors::Error;
use crate::helpers::transfer_sol;
use crate::state::{Config, Pool};

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub withdrawer: Signer<'info>,

    #[account(
        seeds=[b"config"],
        bump=config.bump,
    )]
    pub config: Box<Account<'info, Config>>,

    #[account(
        seeds=[b"pool", amount.to_le_bytes().as_ref()],
        bump,
    )]
    pub pool: Box<Account<'info, Pool>>,

    #[account(
        seeds=[b"vault", pool.key().as_ref()],
        bump
    )]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> Withdraw<'info> {
    pub fn withdraw(&mut self, amount: u64, nullifier: [u8; 32]) -> Result<()> {
        // Transfer SOL from vault to withdrawer.
        let seeds = &[
            b"vault",
            self.pool.to_account_info().key.as_ref(),
            &[self.config.bump],
        ];
        let signer_seeds = &[&seeds[..]];

        // Check if nullifier has already been used.
        require!(
            !self.pool.nullifiers.contains(&nullifier),
            Error::NullifierAlreadyUsed
        );

        // Mark the nullifier as used.
        self.pool.nullifiers.push(nullifier);

        // Transfer funds from the vault to the receiver.
        transfer_sol(
            self.vault.to_account_info(),
            self.withdrawer.to_account_info(),
            amount,
            self.system_program.to_account_info(),
            Some(signer_seeds),
        )?;

        Ok(())
    }
}
