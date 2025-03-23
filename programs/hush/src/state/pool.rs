use anchor_lang::prelude::*;
use ark_bn254::Fr;
use light_poseidon::{Poseidon, PoseidonBytesHasher};

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

impl PoolState {
    /// Updates the Merkle tree by adding a new leaf.
    /// The algorithm iterates over each level of the tree, updating the stored “filled subtree”
    /// and computing the new root based on whether the new leaf is inserted as a left or right child.
    pub fn update_merkle_tree(&mut self, leaf: [u8; 32]) -> Result<[u8; 32]> {
        let mut current_index = self.next_index;
        let mut current_hash = leaf;
        for i in 0..TREE_HEIGHT {
            if current_index % 2 == 0 {
                // Left child: store this hash in the filled subtree.
                self.filled_subtrees[i] = current_hash;
                // Compute parent hash with a default right sibling.
                current_hash = PoolState::hash_pair(&current_hash, &PoolState::default_zero(i));
            } else {
                // Right child: combine with the previously stored left sibling.
                let left = self.filled_subtrees[i];
                current_hash = PoolState::hash_pair(&left, &current_hash);
            }
            current_index /= 2;
        }
        Ok(current_hash)
    }

    /// Initializes the Merkle root and the filled subtrees array (one entry per tree level).
    pub fn initialize_merkle_tree(&mut self) {
        let mut current = PoolState::default_zero(0);
        let mut subtrees = [[0u8; 32]; TREE_HEIGHT];
        for i in 0..TREE_HEIGHT {
            let zero_value = PoolState::default_zero(i);
            current = PoolState::hash_pair(&current, &zero_value);
            subtrees[i] = zero_value;
        }
        self.merkle_root = current;
        self.filled_subtrees = subtrees;
    }

    /// Computes the “default” zero value for a given level.
    /// For level 0 this is [0; 32]. For higher levels it is computed recursively.
    /// TODO: Create a list of zero values instead of dynamically calculating them.
    fn default_zero(level: usize) -> [u8; 32] {
        let mut zero = [0u8; 32];
        for _ in 0..level {
            zero = PoolState::hash_pair(&zero, &zero);
        }
        zero
    }

    /// Hashes a pair of 32-byte arrays using Poseiden hash.
    fn hash_pair(a: &[u8; 32], b: &[u8; 32]) -> [u8; 32] {
        let mut poseidon = Poseidon::<Fr>::new_circom(2).unwrap();
        poseidon.hash_bytes_le(&[a, b]).unwrap()
    }
}
