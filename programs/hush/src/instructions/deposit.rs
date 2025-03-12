use anchor_lang::prelude::*;

use crate::constants::TREE_HEIGHT;
use crate::errors::Error;
use crate::helpers::transfer_sol;
use crate::instructions::helpers::update_merkle_tree;
use crate::state::{Config, Pool};

#[derive(Accounts)]
#[instruction(amount: u64)]
#[instruction(amount: u64)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub depositor: Signer<'info>,

    #[account(
        seeds=[b"config"],
        bump=config.bump,
    )]
    pub config: Box<Account<'info, Config>>,

    #[account(
        seeds=[b"pool", amount.to_le_bytes().as_ref()],
        bump=pool.pool_bump,
    )]
    pub pool: Box<Account<'info, Pool>>,

    #[account(
        seeds=[b"vault", pool.key().as_ref()],
        bump=pool.vault_bump
    )]
    pub vault: SystemAccount<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> Deposit<'info> {
    pub fn deposit(&mut self, amount: u64, commitment: [u8; 32]) -> Result<()> {
        // Ensure the merkle tree is not full.
        require!(
            self.pool.next_index < (1 << TREE_HEIGHT),
            Error::MerkleTreeFull
        );

        // Ensure the user has enough funds for deposit.
        require!(self.depositor.lamports() > amount, Error::InsufficientFunds);

        // Transfer funds from depositor to vault.
        transfer_sol(
            self.depositor.to_account_info(),
            self.vault.to_account_info(),
            amount,
            self.system_program.to_account_info(),
            None,
        )?;

        // Update the incremental Merkle tree with the new leaf.
        let new_root = update_merkle_tree(&mut self.pool, commitment)?;
        self.pool.merkle_root = new_root;
        self.pool.next_index += 1;

        Ok(())
    }
}
