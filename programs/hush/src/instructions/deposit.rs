use anchor_lang::prelude::*;

use crate::constants::TREE_HEIGHT;
use crate::errors::Error;
use crate::helpers::transfer_sol;
use crate::state::{ConfigState, DepositState, PoolState};

#[derive(Accounts)]
#[instruction(amount: u64, commitment: [u8; 32])]
pub struct Deposit<'info> {
    #[account(mut)]
    pub depositor: Signer<'info>,

    #[account(
        seeds=[b"config"],
        bump=config.bump,
    )]
    pub config: Box<Account<'info, ConfigState>>,

    #[account(
        mut,
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
        mut,
        seeds=[b"deposit", pool.key().as_ref(), pool.previous_commitment.unwrap_or([0u8; 32]).as_ref()],
        bump=previous_deposit.bump,
    )]
    pub previous_deposit: Option<Box<Account<'info, DepositState>>>,

    #[account(
        init,
        payer=depositor,
        seeds=[b"deposit", pool.key().as_ref(), commitment.as_ref()],
        bump,
        space=DepositState::INIT_SPACE + 8
    )]
    pub deposit: Box<Account<'info, DepositState>>,

    pub system_program: Program<'info, System>,
}

impl<'info> Deposit<'info> {
    pub fn deposit(
        &mut self,
        amount: u64,
        commitment: [u8; 32],
        bumps: &DepositBumps,
    ) -> Result<()> {
        // Ensure the merkle tree is not full.
        require!(
            self.pool.next_index < (1 << TREE_HEIGHT),
            Error::MerkleTreeFull
        );

        let current_index = self.pool.next_index;

        // Previous deposit should be present for all deposits except the first one.
        if current_index != 0 {
            require!(!self.previous_deposit.is_none(), Error::InvalidDeposit);
            require!(
                self.previous_deposit.as_mut().unwrap().index == current_index - 1,
                Error::InvalidDeposit
            );
        }

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
        self.pool.update_merkle_tree(commitment)?;
        self.pool.next_index += 1;

        // Set deposit state.
        self.deposit.set_inner(DepositState {
            pool: self.pool.key(),
            from: self.depositor.key(),
            amount,
            commitment,
            sibling_commitment: None,
            index: current_index,
            bump: bumps.deposit,
        });

        // Store sibling commitments.
        let is_right_leaf = current_index % 2 == 1;
        if is_right_leaf {
            let previous_deposit = self.previous_deposit.as_mut().unwrap();
            // Store left leaf commitment in the right leaf.
            self.deposit.sibling_commitment = Some(previous_deposit.commitment);
            // Store right leaf commitment in the left leaf.
            previous_deposit.sibling_commitment = Some(self.deposit.commitment);
        }

        Ok(())
    }
}
