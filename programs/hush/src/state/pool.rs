use anchor_lang::prelude::*;

use crate::constants::TREE_HEIGHT;

#[account]
#[derive(InitSpace)]
pub struct PoolState {
    pub amount: u64,
    pub next_index: u32,
    pub merkle_root: [u8; 32],
    pub filled_subtrees: [[u8; 32]; TREE_HEIGHT],
    pub pool_bump: u8,
    pub vault_bump: u8,
}
