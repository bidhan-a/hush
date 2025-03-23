import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Hush } from "../target/types/hush";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert } from "chai";

describe("hush", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Hush as Program<Hush>;

  // Accounts.
  const adminKeypair = anchor.web3.Keypair.generate();
  const depositorXKeypair = anchor.web3.Keypair.generate();
  const withdrawerXKeypair = anchor.web3.Keypair.generate();
  const depositorYKeypair = anchor.web3.Keypair.generate();
  const withdrawerYKeypair = anchor.web3.Keypair.generate();

  // PDAs.
  let config: anchor.web3.PublicKey;
  let pool: anchor.web3.PublicKey;

  // Test values.
  const feeBasisPoints = 100; // 1%.
  const poolAmount = new anchor.BN(1 * LAMPORTS_PER_SOL); // 1 SOL pool.

  before(async () => {
    const latestBlockhash = await provider.connection.getLatestBlockhash();

    const adminAirdrop = await provider.connection.requestAirdrop(
      adminKeypair.publicKey,
      100 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction({
      signature: adminAirdrop,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });

    const depositorXAirdrop = await provider.connection.requestAirdrop(
      depositorXKeypair.publicKey,
      100 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction({
      signature: depositorXAirdrop,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });

    [config] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    );
    [pool] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("pool"), poolAmount.toBuffer("le", 8)],
      program.programId
    );
  });

  it("[initialize] initializes config", async () => {
    await program.methods
      .initialize(feeBasisPoints)
      .accountsPartial({
        admin: adminKeypair.publicKey,
        config,
      })
      .signers([adminKeypair])
      .rpc();

    const configAccount = await program.account.configState.fetch(config);
    assert.ok(configAccount.admin.equals(adminKeypair.publicKey));
    assert.ok(configAccount.feeBasisPoints === feeBasisPoints);
  });

  it("[create_pool] creates a pool for the given amount", async () => {
    await program.methods
      .createPool(poolAmount)
      .accountsPartial({
        admin: adminKeypair.publicKey,
        config,
        pool,
      })
      .signers([adminKeypair])
      .rpc();

    const poolAccount = await program.account.poolState.fetch(pool);
    assert.ok(poolAccount.amount.eq(poolAmount));
    assert.ok(poolAccount.nextIndex === 0);
  });
});
