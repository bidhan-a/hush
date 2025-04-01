use anchor_lang::prelude::*;
use ark_bn254::G1Affine as G1;
use ark_serialize::{CanonicalDeserialize, CanonicalSerialize};
use groth16_solana::groth16::Groth16Verifier;

use crate::errors::Error;
use crate::zk::verifying_key::VERIFYINGKEY;

pub fn verify_proof(proof: [u8; 256], root: [u8; 32], nullifier_hash: [u8; 32]) -> Result<()> {
    let proof_a: G1 = <G1 as CanonicalDeserialize>::deserialize_uncompressed(
        &*[&change_endianness(&proof[0..64])[..], &[0u8][..]].concat(),
    )
    .map_err(|_| Error::InvalidProof)?;
    let mut proof_a_neg = [0u8; 65];
    <G1 as CanonicalSerialize>::serialize_uncompressed(&-proof_a, &mut proof_a_neg[..])
        .map_err(|_| Error::InvalidProof)?;
    let proof_a: [u8; 64] = change_endianness(&proof_a_neg[..64])
        .try_into()
        .map_err(|_| Error::InvalidProof)?;
    let proof_b: [u8; 128] = proof[64..192].try_into().map_err(|_| Error::InvalidProof)?;
    let proof_c: [u8; 64] = proof[192..256]
        .try_into()
        .map_err(|_| Error::InvalidProof)?;

    let root_be: [u8; 32] = change_endianness(&root[..32])
        .try_into()
        .map_err(|_| Error::InvalidProof)?;
    let nullifier_hash_be: [u8; 32] = change_endianness(&nullifier_hash[..32])
        .try_into()
        .map_err(|_| Error::InvalidProof)?;
    let public_inputs = [root_be, nullifier_hash_be];
    let mut verifier =
        Groth16Verifier::new(&proof_a, &proof_b, &proof_c, &public_inputs, &VERIFYINGKEY)
            .map_err(|_| Error::InvalidProof)?;
    verifier.verify().map_err(|_| Error::VerificationError)?;

    Ok(())
}

fn change_endianness(bytes: &[u8]) -> Vec<u8> {
    let mut vec = Vec::new();
    for b in bytes.chunks(32) {
        for byte in b.iter().rev() {
            vec.push(*byte);
        }
    }
    vec
}
