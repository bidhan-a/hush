#!/bin/sh

rm -rf ./circuits/build
mkdir ./circuits/build

echo "Compiling circuits.."
circom ./circuits/withdraw.circom  --r1cs --sym --wasm -o ./circuits/build -l node_modules