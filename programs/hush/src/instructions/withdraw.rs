use anchor_lang::prelude::*;

use crate::helpers::transfer_sol;
use crate::state::Config;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub withdrawer: Signer<'info>,

    #[account(
        seeds=[b"config"],
        bump=config.config_bump,
    )]
    pub config: Box<Account<'info, Config>>,

    #[account(
        seeds=[b"vault"],
        bump=config.vault_bump
    )]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> Withdraw<'info> {
    pub fn withdraw(&mut self, amount: u64) -> Result<()> {
        // Transfer SOL from vault to withdrawer.
        let seeds: &[&[u8]] = &[b"vault", &[self.config.vault_bump]];
        let signer_seeds = &[&seeds[..]];
        transfer_sol(
            self.vault.to_account_info(),
            self.withdrawer.to_account_info(),
            amount,
            self.system_program.to_account_info(),
            Some(signer_seeds),
        )
    }
}
