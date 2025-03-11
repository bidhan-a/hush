use anchor_lang::prelude::*;

/// Merkle tree height.
const TREE_HEIGHT: usize = 20;
/// Maximum number of nullifiers.
const MAX_NULLIFIERS: usize = 1000;

#[account]
#[derive(InitSpace)]
pub struct Pool {
    pub amount: u64,
    pub next_index: u32,
    pub merkle_root: [u8; 32],
    pub filled_subtrees: [[u8; 32]; TREE_HEIGHT],
    #[max_len(MAX_NULLIFIERS)]
    pub nullifiers: Vec<[u8; 32]>,
}
