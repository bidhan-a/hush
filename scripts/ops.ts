import { AnchorProvider, BN, Program, Wallet } from "@coral-xyz/anchor";
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import wallet from "./keypair.json";
import { Hush } from "../target/types/hush";
import IDL from "../target/idl/hush.json";

const CLUSTER_URL = "http://localhost:8899";

const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));
const connection = new Connection(CLUSTER_URL);
const provider = new AnchorProvider(connection, new Wallet(keypair), {
  commitment: "confirmed",
});
const program: Program<Hush> = new Program(IDL, provider);

const createConfig = async () => {
  try {
    const feeBasisPoints = 100; // 1%.

    await program.methods
      .initialize(feeBasisPoints)
      .accountsPartial({
        admin: keypair.publicKey,
      })
      .signers([keypair])
      .rpc();
  } catch (err) {
    if (err.message.includes("already in use")) {
      console.warn("The config account already exists.");
    } else {
      console.error(err);
    }
  }
};

const createPool = async (poolAmount: number) => {
  try {
    const poolAmountBN = new BN(poolAmount * LAMPORTS_PER_SOL);
    await program.methods
      .createPool(poolAmountBN)
      .accountsPartial({})
      .signers([keypair])
      .rpc();
  } catch (err) {
    if (err.message.includes("already in use")) {
      console.warn("The pool account already exists.");
    } else {
      console.error(err);
    }
  }
};

const initialSetup = async () => {
  await createConfig();
  await createPool(1);
  await createPool(2);
};

initialSetup();
