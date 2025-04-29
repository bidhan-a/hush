import crypto from "crypto";
import * as circomlibjs from "circomlibjs";
// @ts-expect-error: ffjavascript does not have type definition.
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

export const toBigInt = (bytes: Uint8Array): bigint =>
  BigInt("0x" + Buffer.from(bytes).toString("hex"));

export const downloadNote = (note: string) => {
  const fileName = `hush-${Date.now()}.txt`;
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(note)
  );
  element.setAttribute("download", fileName);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
