use anchor_lang::error_code;

#[error_code]
pub enum Error {
    #[msg("Permission denied.")]
    PermissionDenied,
    #[msg("Merkle tree is full.")]
    MerkleTreeFull,
    #[msg("Merkle root is invalid.")]
    InvalidMerkleRoot,
    #[msg("Insufficient funds for deposit.")]
    InsufficientFunds,
    #[msg("The deposit is invalid.")]
    InvalidDeposit,
    #[msg("Nullier has already been used.")]
    NullifierAlreadyUsed,
    #[msg("The proof is invalid.")]
    InvalidProof,
    #[msg("The proof could not be verified.")]
    VerificationError,
}
