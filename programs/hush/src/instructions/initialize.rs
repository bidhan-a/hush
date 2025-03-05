use anchor_lang::prelude::*;

use crate::state::Config;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer=admin,
        seeds=[b"config"],
        bump,
        space=Config::INIT_SPACE + 8
    )]
    pub config: Box<Account<'info, Config>>,

    #[account(
        seeds=[b"vault"],
        bump
    )]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> Initialize<'info> {
    pub fn initialize(&mut self, bumps: &InitializeBumps) -> Result<()> {
        self.config.set_inner(Config {
            admin: self.admin.key(),
            config_bump: bumps.config,
            vault_bump: bumps.vault,
        });

        Ok(())
    }
}
