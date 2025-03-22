use anchor_lang::{
    prelude::*,
    solana_program::hash::hashv,
    system_program::{transfer, Transfer},
};

use crate::{constants::TREE_HEIGHT, state::PoolState};

pub fn transfer_sol<'info>(
    from: AccountInfo<'info>,
    to: AccountInfo<'info>,
    amount: u64,
    system_program: AccountInfo<'info>,
    signer_seeds: Option<&[&[&[u8]]; 1]>,
) -> Result<()> {
    let cpi_accounts = Transfer { from, to };
    match signer_seeds {
        Some(seeds) => {
            let cpi_context =
                CpiContext::new_with_signer(system_program, cpi_accounts, seeds).with_signer(seeds);
            transfer(cpi_context, amount)
        }
        None => {
            let cpi_context = CpiContext::new(system_program, cpi_accounts);
            transfer(cpi_context, amount)
        }
    }
}

/// ----------------------------
/// Merkle Tree Helper Functions
/// ----------------------------

/// Hashes a pair of 32-byte arrays using SHA-256.
pub fn hash_pair(a: &[u8; 32], b: &[u8; 32]) -> [u8; 32] {
    let data = [a.as_ref(), b.as_ref()].concat();
    let hash_result = hashv(&[&data]);
    hash_result.to_bytes()
}

/// Computes the “default” zero value for a given level.
/// For level 0 this is [0; 32]. For higher levels it is computed recursively.
pub fn default_zero(level: usize) -> [u8; 32] {
    let mut zero = [0u8; 32];
    for _ in 0..level {
        zero = hash_pair(&zero, &zero);
    }
    zero
}

/// Computes the initial filled subtrees array (one entry per tree level).
pub fn compute_initial_filled_subtrees() -> [[u8; 32]; TREE_HEIGHT] {
    let mut subtrees = [[0u8; 32]; TREE_HEIGHT];
    for i in 0..TREE_HEIGHT {
        subtrees[i] = default_zero(i);
    }
    subtrees
}

/// Computes the initial Merkle root from the default zeros.
pub fn compute_initial_merkle_root() -> [u8; 32] {
    let mut current = default_zero(0);
    for i in 1..TREE_HEIGHT {
        current = hash_pair(&current, &default_zero(i));
    }
    current
}

/// Updates the incremental Merkle tree with a new leaf.
/// The algorithm iterates over each level of the tree, updating the stored “filled subtree”
/// and computing the new root based on whether the new leaf is inserted as a left or right child.
pub fn update_merkle_tree(pool: &mut PoolState, leaf: [u8; 32]) -> Result<[u8; 32]> {
    let mut current_index = pool.next_index;
    let mut current_hash = leaf;
    for i in 0..TREE_HEIGHT {
        if current_index % 2 == 0 {
            // Left child: store this hash in the filled subtree.
            pool.filled_subtrees[i] = current_hash;
            // Compute parent hash with a default right sibling.
            current_hash = hash_pair(&current_hash, &default_zero(i));
        } else {
            // Right child: combine with the previously stored left sibling.
            let left = pool.filled_subtrees[i];
            current_hash = hash_pair(&left, &current_hash);
        }
        current_index /= 2;
    }
    Ok(current_hash)
}
