import crypto from "crypto";
import * as circomlibjs from "circomlibjs";
import * as ff from "ffjavascript";

export const generateRandomNumber = (nBytes: number): bigint => {
  return BigInt("0x" + crypto.randomBytes(nBytes).toString("hex"));
};

export const poseidonHash = async (vals: bigint[]): Promise<Uint8Array> => {
  const poseidon = await circomlibjs.buildPoseidon();
  const hash = poseidon(vals);
  const hashObj = poseidon.F.toObject(hash);
  const leBuff = ff.utils.leInt2Buff(hashObj, 32);
  return leBuff;
};

export const toHex = (bytes: Uint8Array, length: number): string =>
  Buffer.from(bytes)
    .toString("hex")
    .padStart(length * 2, "0");
