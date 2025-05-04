use anchor_lang::prelude::*;
use solana_poseidon::{hashv, Endianness, Parameters};

use crate::constants::{ROOT_HISTORY_SIZE, TREE_HEIGHT};

#[account]
#[derive(InitSpace)]
pub struct PoolState {
    pub amount: u64,
    pub next_index: u32,
    pub deposits: u32,
    pub withdrawals: u32,
    pub total_value: u64,
    pub merkle_roots: [[u8; 32]; ROOT_HISTORY_SIZE],
    pub current_merkle_root_index: u8,
    pub filled_subtrees: [[u8; 32]; TREE_HEIGHT],
    pub last_commitment: Option<[u8; 32]>,
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
        self.add_merkle_root(current_hash);
        Ok(current_hash)
    }

    /// Initializes the Merkle root and the filled subtrees array (one entry per tree level).
    pub fn initialize_merkle_tree(&mut self) {
        let mut filled_subtrees = [[0u8; 32]; TREE_HEIGHT];
        for i in 0..TREE_HEIGHT {
            let zero_value = PoolState::default_zero(i);
            filled_subtrees[i] = zero_value;
        }
        self.filled_subtrees = filled_subtrees;

        // Initialize merkle root history.
        let merkle_roots = [[0u8; 32]; ROOT_HISTORY_SIZE];
        self.merkle_roots = merkle_roots;
        self.current_merkle_root_index = 0;

        // The merkle root is the hash of the second-last level’s zero values.
        let merkle_root = PoolState::hash_pair(
            &filled_subtrees[TREE_HEIGHT - 1],
            &filled_subtrees[TREE_HEIGHT - 1],
        );
        self.add_merkle_root(merkle_root);
    }

    pub fn add_merkle_root(&mut self, root: [u8; 32]) {
        if self.current_merkle_root_index == ROOT_HISTORY_SIZE as u8 - 1 {
            self.current_merkle_root_index = 0
        } else {
            self.current_merkle_root_index += 1;
        }
        self.merkle_roots[self.current_merkle_root_index as usize] = root;
    }

    /// Returns the pre-calculated “default” zero value for a given level.
    fn default_zero(level: usize) -> [u8; 32] {
        match level {
            0 => [0u8; 32],
            1 => [
                100, 72, 182, 70, 132, 238, 57, 168, 35, 213, 254, 95, 213, 36, 49, 220, 129, 228,
                129, 123, 242, 195, 234, 60, 171, 158, 35, 158, 251, 245, 152, 32,
            ],
            2 => [
                225, 241, 177, 96, 68, 119, 164, 103, 240, 141, 198, 157, 203, 68, 26, 38, 236,
                167, 132, 245, 111, 26, 48, 223, 99, 34, 177, 205, 61, 103, 105, 16,
            ],
            3 => [
                56, 210, 86, 184, 178, 126, 213, 40, 213, 29, 55, 80, 234, 110, 124, 70, 6, 33,
                247, 80, 141, 117, 61, 46, 175, 226, 126, 83, 49, 51, 244, 24,
            ],
            4 => [
                42, 149, 188, 157, 85, 151, 172, 202, 101, 130, 86, 26, 87, 40, 183, 241, 69, 35,
                165, 59, 233, 255, 32, 99, 211, 176, 23, 203, 55, 216, 249, 7,
            ],
            5 => [
                85, 63, 24, 57, 22, 236, 92, 123, 77, 173, 178, 148, 140, 197, 153, 166, 7, 41,
                243, 93, 76, 31, 99, 201, 245, 179, 70, 135, 94, 207, 148, 43,
            ],
            6 => [
                120, 157, 160, 46, 163, 221, 17, 29, 97, 83, 185, 81, 105, 30, 215, 254, 188, 225,
                169, 204, 34, 125, 234, 70, 150, 69, 102, 166, 197, 147, 238, 45,
            ],
            7 => [
                157, 52, 135, 60, 190, 170, 164, 168, 127, 172, 181, 140, 168, 21, 5, 139, 123, 89,
                57, 182, 30, 96, 207, 130, 233, 132, 43, 162, 229, 149, 130, 7,
            ],
            8 => [
                97, 204, 243, 153, 58, 190, 76, 68, 26, 33, 65, 74, 39, 46, 107, 97, 42, 71, 100,
                69, 134, 236, 27, 80, 166, 39, 96, 143, 241, 229, 165, 47,
            ],
            9 => [
                71, 215, 252, 20, 166, 86, 33, 62, 171, 40, 226, 227, 204, 122, 94, 228, 102, 31,
                148, 158, 56, 128, 183, 236, 33, 253, 216, 208, 118, 67, 136, 14,
            ],
            10 => [
                242, 10, 25, 218, 229, 117, 97, 222, 51, 53, 113, 87, 249, 146, 88, 249, 105, 180,
                46, 165, 209, 122, 113, 40, 30, 79, 73, 114, 218, 1, 114, 27,
            ],
            11 => [
                54, 118, 125, 206, 250, 107, 188, 190, 181, 8, 8, 101, 228, 225, 230, 166, 25, 152,
                36, 1, 178, 192, 0, 82, 56, 54, 94, 114, 34, 136, 141, 31,
            ],
            12 => [
                90, 248, 181, 113, 4, 154, 135, 208, 168, 136, 207, 42, 161, 176, 98, 97, 251, 252,
                140, 186, 137, 21, 112, 185, 175, 75, 145, 108, 246, 130, 93, 44,
            ],
            13 => [
                208, 191, 191, 224, 112, 242, 88, 100, 100, 244, 19, 161, 170, 196, 245, 78, 19,
                161, 63, 223, 90, 127, 149, 32, 184, 11, 148, 160, 72, 65, 197, 20,
            ],
            14 => [
                12, 232, 235, 244, 75, 142, 17, 22, 212, 137, 173, 140, 88, 37, 190, 17, 175, 185,
                216, 68, 238, 192, 16, 30, 150, 111, 152, 47, 177, 51, 13, 25,
            ],
            15 => [
                146, 108, 224, 37, 147, 100, 179, 165, 10, 81, 175, 150, 101, 174, 103, 17, 237,
                115, 173, 20, 73, 53, 23, 172, 82, 65, 112, 206, 169, 138, 249, 34,
            ],
            16 => [
                35, 115, 186, 139, 211, 83, 183, 248, 238, 204, 110, 198, 41, 111, 82, 90, 87, 106,
                191, 114, 141, 34, 111, 159, 11, 136, 229, 108, 155, 124, 124, 42,
            ],
            17 => [
                146, 185, 54, 63, 100, 221, 117, 77, 149, 139, 152, 194, 201, 67, 0, 71, 252, 63,
                70, 77, 193, 249, 122, 198, 193, 142, 105, 88, 229, 134, 129, 46,
            ],
            18 => [
                15, 241, 31, 28, 157, 36, 70, 53, 39, 146, 115, 100, 173, 110, 239, 138, 148, 174,
                13, 5, 207, 200, 226, 73, 171, 78, 154, 30, 87, 197, 87, 15,
            ],
            19 => [
                202, 44, 247, 52, 97, 227, 156, 60, 228, 70, 125, 105, 16, 227, 120, 254, 28, 14,
                128, 136, 67, 61, 246, 213, 74, 85, 251, 181, 103, 238, 48, 24,
            ],
            _ => panic!("Index out of bounds"), // This should never happen.
        }
    }

    /// Hashes a pair of 32-byte arrays using Poseiden hash.
    fn hash_pair(a: &[u8; 32], b: &[u8; 32]) -> [u8; 32] {
        let hash = hashv(Parameters::Bn254X5, Endianness::LittleEndian, &[a, b]).unwrap();
        hash.to_bytes()
    }
}
