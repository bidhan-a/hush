/* eslint-disable @typescript-eslint/no-explicit-any */
import * as snarkjs from "snarkjs";
// @ts-expect-error: ffjavascript does not have type definition.
import * as ff from "ffjavascript";
import { IDeposit } from "./deposit";

const TREE_HEIGHT = 20;

const ZERO_VALUES: Uint8Array[] = [
  new Uint8Array([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0,
  ]),
  new Uint8Array([
    100, 72, 182, 70, 132, 238, 57, 168, 35, 213, 254, 95, 213, 36, 49, 220,
    129, 228, 129, 123, 242, 195, 234, 60, 171, 158, 35, 158, 251, 245, 152, 32,
  ]),
  new Uint8Array([
    225, 241, 177, 96, 68, 119, 164, 103, 240, 141, 198, 157, 203, 68, 26, 38,
    236, 167, 132, 245, 111, 26, 48, 223, 99, 34, 177, 205, 61, 103, 105, 16,
  ]),
  new Uint8Array([
    56, 210, 86, 184, 178, 126, 213, 40, 213, 29, 55, 80, 234, 110, 124, 70, 6,
    33, 247, 80, 141, 117, 61, 46, 175, 226, 126, 83, 49, 51, 244, 24,
  ]),
  new Uint8Array([
    42, 149, 188, 157, 85, 151, 172, 202, 101, 130, 86, 26, 87, 40, 183, 241,
    69, 35, 165, 59, 233, 255, 32, 99, 211, 176, 23, 203, 55, 216, 249, 7,
  ]),
  new Uint8Array([
    85, 63, 24, 57, 22, 236, 92, 123, 77, 173, 178, 148, 140, 197, 153, 166, 7,
    41, 243, 93, 76, 31, 99, 201, 245, 179, 70, 135, 94, 207, 148, 43,
  ]),
  new Uint8Array([
    120, 157, 160, 46, 163, 221, 17, 29, 97, 83, 185, 81, 105, 30, 215, 254,
    188, 225, 169, 204, 34, 125, 234, 70, 150, 69, 102, 166, 197, 147, 238, 45,
  ]),
  new Uint8Array([
    157, 52, 135, 60, 190, 170, 164, 168, 127, 172, 181, 140, 168, 21, 5, 139,
    123, 89, 57, 182, 30, 96, 207, 130, 233, 132, 43, 162, 229, 149, 130, 7,
  ]),
  new Uint8Array([
    97, 204, 243, 153, 58, 190, 76, 68, 26, 33, 65, 74, 39, 46, 107, 97, 42, 71,
    100, 69, 134, 236, 27, 80, 166, 39, 96, 143, 241, 229, 165, 47,
  ]),
  new Uint8Array([
    71, 215, 252, 20, 166, 86, 33, 62, 171, 40, 226, 227, 204, 122, 94, 228,
    102, 31, 148, 158, 56, 128, 183, 236, 33, 253, 216, 208, 118, 67, 136, 14,
  ]),
  new Uint8Array([
    242, 10, 25, 218, 229, 117, 97, 222, 51, 53, 113, 87, 249, 146, 88, 249,
    105, 180, 46, 165, 209, 122, 113, 40, 30, 79, 73, 114, 218, 1, 114, 27,
  ]),
  new Uint8Array([
    54, 118, 125, 206, 250, 107, 188, 190, 181, 8, 8, 101, 228, 225, 230, 166,
    25, 152, 36, 1, 178, 192, 0, 82, 56, 54, 94, 114, 34, 136, 141, 31,
  ]),
  new Uint8Array([
    90, 248, 181, 113, 4, 154, 135, 208, 168, 136, 207, 42, 161, 176, 98, 97,
    251, 252, 140, 186, 137, 21, 112, 185, 175, 75, 145, 108, 246, 130, 93, 44,
  ]),
  new Uint8Array([
    208, 191, 191, 224, 112, 242, 88, 100, 100, 244, 19, 161, 170, 196, 245, 78,
    19, 161, 63, 223, 90, 127, 149, 32, 184, 11, 148, 160, 72, 65, 197, 20,
  ]),
  new Uint8Array([
    12, 232, 235, 244, 75, 142, 17, 22, 212, 137, 173, 140, 88, 37, 190, 17,
    175, 185, 216, 68, 238, 192, 16, 30, 150, 111, 152, 47, 177, 51, 13, 25,
  ]),
  new Uint8Array([
    146, 108, 224, 37, 147, 100, 179, 165, 10, 81, 175, 150, 101, 174, 103, 17,
    237, 115, 173, 20, 73, 53, 23, 172, 82, 65, 112, 206, 169, 138, 249, 34,
  ]),
  new Uint8Array([
    35, 115, 186, 139, 211, 83, 183, 248, 238, 204, 110, 198, 41, 111, 82, 90,
    87, 106, 191, 114, 141, 34, 111, 159, 11, 136, 229, 108, 155, 124, 124, 42,
  ]),
  new Uint8Array([
    146, 185, 54, 63, 100, 221, 117, 77, 149, 139, 152, 194, 201, 67, 0, 71,
    252, 63, 70, 77, 193, 249, 122, 198, 193, 142, 105, 88, 229, 134, 129, 46,
  ]),
  new Uint8Array([
    15, 241, 31, 28, 157, 36, 70, 53, 39, 146, 115, 100, 173, 110, 239, 138,
    148, 174, 13, 5, 207, 200, 226, 73, 171, 78, 154, 30, 87, 197, 87, 15,
  ]),
  new Uint8Array([
    202, 44, 247, 52, 97, 227, 156, 60, 228, 70, 125, 105, 16, 227, 120, 254,
    28, 14, 128, 136, 67, 61, 246, 213, 74, 85, 251, 181, 103, 238, 48, 24,
  ]),
];

const concatenateUint8Arrays = (arrays: any[]) => {
  // Calculate total length
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  // Create new array with total length
  const result = new Uint8Array(totalLength);
  // Copy each array into result
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
};

const convertProofToBytes = (proof: {
  pi_a: any[];
  pi_b: any[][];
  pi_c: any[];
}) => {
  // Convert pi_a components
  const pi_a: Uint8Array[] = [
    ff.utils.beInt2Buff(BigInt(proof.pi_a[0]), 32),
    ff.utils.beInt2Buff(BigInt(proof.pi_a[1]), 32),
  ];

  // Convert pi_b components (note the reversed order within pairs)
  const pi_b = [
    // First pair
    ff.utils.beInt2Buff(BigInt(proof.pi_b[0][1]), 32), // Reversed order
    ff.utils.beInt2Buff(BigInt(proof.pi_b[0][0]), 32),
    // Second pair
    ff.utils.beInt2Buff(BigInt(proof.pi_b[1][1]), 32), // Reversed order
    ff.utils.beInt2Buff(BigInt(proof.pi_b[1][0]), 32),
  ];

  // Convert pi_c components
  const pi_c = [
    ff.utils.beInt2Buff(BigInt(proof.pi_c[0]), 32),
    ff.utils.beInt2Buff(BigInt(proof.pi_c[1]), 32),
  ];

  // Concatenate all components
  const allBytes = concatenateUint8Arrays([...pi_a, ...pi_b, ...pi_c]);
  return allBytes;
};

const getMerklePath = (
  leafIndex: number,
  siblingCommitment: Uint8Array | null,
  filledSubtrees: Uint8Array[]
) => {
  let index = leafIndex;

  const pathElements: Uint8Array[] = [];
  const pathIndices: number[] = [];

  for (let level = 0; level < TREE_HEIGHT; level++) {
    const isRightNode = index % 2 === 1;

    if (level === 0 && siblingCommitment && siblingCommitment.length !== 0) {
      // Use siblingCommitment at level 0
      pathElements.push(siblingCommitment);
    } else if (isRightNode) {
      // If the node is RIGHT, use precomputed `filledSubtrees[level]`.
      pathElements.push(filledSubtrees[level]);
    } else {
      // If the node is LEFT, its right sibling is not in `filledSubtrees`, so use ZERO_VALUES instead
      pathElements.push(ZERO_VALUES[level]);
    }

    pathIndices.push(isRightNode ? 1 : 0);
    index = Math.floor(index / 2);
  }

  return { pathElements, pathIndices };
};

export const getSnarkProof = async (
  deposit: IDeposit,
  merkleRoot: Uint8Array,
  filledSubtrees: Uint8Array[],
  leafIndex: number,
  siblingCommitment: Uint8Array | null
) => {
  const { pathElements, pathIndices } = getMerklePath(
    leafIndex,
    siblingCommitment,
    filledSubtrees
  );

  const input = {
    // Public inputs.
    root: ff.utils.leBuff2int(merkleRoot),
    nullifierHash: ff.utils.leBuff2int(deposit.nullifierHash),
    // Private inputs.
    nullifier: deposit.nullifier,
    secret: deposit.secret,
    pathElements: pathElements.map((p) => ff.utils.leBuff2int(p)),
    pathIndices,
  };

  const { proof } = await snarkjs.groth16.fullProve(
    input,
    "./circuits/withdraw_js/withdraw.wasm",
    "./circuits/withdraw_0002.zkey"
  );

  const proofBytes = convertProofToBytes(proof);
  return proofBytes;
};
