import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Cluster, PublicKey } from "@solana/web3.js";
import HushIDL from "./idl.json";
import type { Hush } from "./types";

// Re-export the generated IDL and type
export { Hush, HushIDL };

// The programId is imported from the program IDL.
export const HUSH_PROGRAM_ID = new PublicKey(HushIDL.address);

// Helper function to get the Hush Anchor program.
export function getHushProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program(
    {
      ...HushIDL,
      address: address ? address.toBase58() : HushIDL.address,
    } as Hush,
    provider
  );
}

// Helper function to get the program ID for the Hush program depending on the cluster.
export function getHushProgramId(cluster: Cluster) {
  switch (cluster) {
    case "devnet":
    case "testnet":
    case "mainnet-beta":
    default:
      return HUSH_PROGRAM_ID;
  }
}
