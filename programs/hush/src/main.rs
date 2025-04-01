use hex::{FromHex, ToHex};
use std::fmt::Write;

use solana_poseidon::{hashv, Endianness, Parameters};

fn main() {
    println!("Hello, world!");

    let zero_1 = [0u8; 32];
    println!("{:?}", zero_1);
    let zero_2 = [0u8; 32];
    println!("{:?}", zero_2);

    // let mut poseidon = Poseidon::<Fr>::new_circom(2).unwrap();
    // let hash = poseidon.hash_bytes_le(&[&zero_1, &zero_2]).unwrap();
    // println!("{:?}", hash);

    let hash = hashv(
        Parameters::Bn254X5,
        Endianness::LittleEndian,
        &[&zero_1, &zero_1],
    )
    .unwrap();
    let hash_bytes = hash.to_bytes();
    println!("{:?}", hash_bytes);
    let mut hex_str = String::with_capacity(64); // 32 bytes → 64 hex chars
    for byte in &hash_bytes {
        write!(&mut hex_str, "{:02x}", byte).unwrap();
    }

    println!("{}", hex_str);

    let decoded = <[u8; 32]>::from_hex(hex_str).unwrap();
    println!("{:?}", decoded);

    let encoded = hash_bytes.encode_hex::<String>();
    println!("{}", encoded);

    // let changed_endianness = change_endianness(&hash_bytes);
    // let array: [u8; 32] = changed_endianness.try_into().unwrap();
    // println!("{:?}", array);
    // let l1_hash: [u8; 32] = [
    //     100, 72, 182, 70, 132, 238, 57, 168, 35, 213, 254, 95, 213, 36, 49, 220, 129, 228, 129,
    //     123, 242, 195, 234, 60, 171, 158, 35, 158, 251, 245, 152, 32,
    // ];

    // let second_last_hash_1: [u8; 32] = [
    //     202, 44, 247, 52, 97, 227, 156, 60, 228, 70, 125, 105, 16, 227, 120, 254, 28, 14, 128, 136,
    //     67, 61, 246, 213, 74, 85, 251, 181, 103, 238, 48, 24,
    // ];
    // let second_last_hash_2: [u8; 32] = [
    //     202, 44, 247, 52, 97, 227, 156, 60, 228, 70, 125, 105, 16, 227, 120, 254, 28, 14, 128, 136,
    //     67, 61, 246, 213, 74, 85, 251, 181, 103, 238, 48, 24,
    // ];

    // let mut poseidon = Poseidon::<Fr>::new_circom(2).unwrap();
    // let hash = poseidon
    //     .hash_bytes_le(&[&second_last_hash_1, &second_last_hash_2])
    //     .unwrap();
    // println!("{:?}", hash);

    // let mut poseidon = Poseidon::<Fr>::new_circom(2).unwrap();
    // let hash = poseidon.hash_bytes_le(&[&zero_1, &zero_2]).unwrap();
    // println!("{:?}", hash);
    // println!("{:?}", hash == l1_hash);

    // for i in 0..20 {
    //     let zero_value = default_zero(i);
    //     println!("{:?}", zero_value);
    // }

    // initialize_merkle_tree();

    // let a = 1 / 2;
    // println!("{:?}", a);
}

fn hash(a: &[u8; 32], b: &[u8; 32]) -> [u8; 32] {
    // let mut poseidon = Poseidon::<Fr>::new_circom(2).unwrap();
    // let hash = poseidon.hash_bytes_le(&[a, b]).unwrap();
    // return hash;

    let hash = hashv(Parameters::Bn254X5, Endianness::LittleEndian, &[a, b]).unwrap();
    let hash_bytes = hash.to_bytes();
    return hash_bytes;
}

fn default_zero(level: usize) -> [u8; 32] {
    let mut zero = [0u8; 32];
    for _ in 0..level {
        zero = hash(&zero, &zero);
    }
    zero
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

pub fn initialize_merkle_tree() {
    let mut current = default_zero(0);
    let mut subtrees = [[0u8; 32]; 20];
    for i in 0..20 {
        let zero_value = default_zero(i);
        current = hash(&current, &zero_value);
        subtrees[i] = zero_value;
    }
    println!("{:?}", current);
    println!("{:?}", subtrees);
}
