#!/bin/sh

#########################################################################
# This script compiles the circuits and generates the verification key. #
#########################################################################

echo "Compiling circuits.."
circom ./circuits/withdraw.circom  --r1cs --sym --wasm -o ./circuits -l node_modules

echo "Generating verifying key.."
cd ./circuits

# Start a new powers of tau ceremony
snarkjs powersoftau new bn128 14 pot14_0000.ptau -v

# Contribute to the ceremony
snarkjs powersoftau contribute pot14_0000.ptau pot14_0001.ptau --name="First contribution" -v
snarkjs powersoftau contribute pot14_0001.ptau pot14_0002.ptau --name="Second contribution" -v

# Prepare phase 2
snarkjs powersoftau prepare phase2 pot14_0002.ptau pot14_final.ptau -v

# Generate a zkey
snarkjs groth16 setup withdraw.r1cs pot14_final.ptau withdraw_0000.zkey

# Contribute to the phase 2 ceremony
snarkjs zkey contribute withdraw_0000.zkey withdraw_0001.zkey --name="First contribution" -v
snarkjs zkey contribute withdraw_0001.zkey withdraw_0002.zkey --name="Second contribution" -v

# Export the verification key
snarkjs zkey export verificationkey withdraw_0002.zkey verification_key.json

# Remove intermediate files
rm -f pot14_0000.ptau pot14_0001.ptau pot14_0002.ptau pot14_final.ptau
rm -f withdraw_0000.zkey withdraw_0001.zkey

## Generate the .rs file
echo "Parsing verification key to rust.."
cd ..
node ./scripts/parse_vk_to_rust.js ./circuits/verification_key.json ./programs/hush/src/zk

echo "Done."