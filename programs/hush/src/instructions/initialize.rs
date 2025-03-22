use anchor_lang::prelude::*;

use crate::state::ConfigState;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer=admin,
        seeds=[b"config"],
        bump,
        space=ConfigState::INIT_SPACE + 8
    )]
    pub config: Box<Account<'info, ConfigState>>,

    pub system_program: Program<'info, System>,
}

impl<'info> Initialize<'info> {
    pub fn initialize(&mut self, fee_basis_points: u16, bumps: &InitializeBumps) -> Result<()> {
        self.config.set_inner(ConfigState {
            admin: self.admin.key(),
            fee_basis_points,
            bump: bumps.config,
        });

        Ok(())
    }
}
