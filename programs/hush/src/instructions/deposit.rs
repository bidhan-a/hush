use anchor_lang::prelude::*;

use crate::helpers::transfer_sol;
use crate::state::Config;

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub depositor: Signer<'info>,

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

impl<'info> Deposit<'info> {
    pub fn deposit(&mut self, amount: u64) -> Result<()> {
        // Transfer SOL from depositor to vault.
        transfer_sol(
            self.depositor.to_account_info(),
            self.vault.to_account_info(),
            amount,
            self.system_program.to_account_info(),
            None,
        )
    }
}
