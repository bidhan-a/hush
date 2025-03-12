use anchor_lang::error_code;

#[error_code]
pub enum Error {
    #[msg("Permission denied.")]
    PermissionDenied,
    #[msg("Merkle tree is full.")]
    MerkleTreeFull,
    #[msg("Insufficient funds for deposit.")]
    InsufficientFunds,
    #[msg("Nullier has already been used.")]
    NullifierAlreadyUsed,
}
