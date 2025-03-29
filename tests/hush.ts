import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Hush } from "../target/types/hush";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert } from "chai";
import { generateRandomNumber } from "../lib/utils";
import Deposit, { IDeposit } from "../lib/deposit";

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
  let configAccount: anchor.web3.PublicKey;
  let poolAccount: anchor.web3.PublicKey;
  let vaultAccount: anchor.web3.PublicKey;
  let depositAccount: anchor.web3.PublicKey;

  // Test values.
  const feeBasisPoints = 100; // 1%.
  const poolAmount = new anchor.BN(1 * LAMPORTS_PER_SOL); // 1 SOL pool.
  let testDeposit: IDeposit;

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

    [configAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    );
    [poolAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("pool"), poolAmount.toBuffer("le", 8)],
      program.programId
    );
    [vaultAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), poolAccount.toBuffer()],
      program.programId
    );

    const nullifier = generateRandomNumber(31);
    const secret = generateRandomNumber(31);
    testDeposit = await Deposit.create(poolAccount, nullifier, secret);
    [depositAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("deposit"),
        poolAccount.toBuffer(),
        testDeposit.commitmentHash,
      ],
      program.programId
    );
  });

  it("[initialize] initializes config", async () => {
    await program.methods
      .initialize(feeBasisPoints)
      .accountsPartial({
        admin: adminKeypair.publicKey,
        config: configAccount,
      })
      .signers([adminKeypair])
      .rpc();

    const config = await program.account.configState.fetch(configAccount);
    assert.ok(config.admin.equals(adminKeypair.publicKey));
    assert.ok(config.feeBasisPoints === feeBasisPoints);
  });

  it("[create_pool] creates a pool for the given amount", async () => {
    await program.methods
      .createPool(poolAmount)
      .accountsPartial({
        admin: adminKeypair.publicKey,
        config: configAccount,
        pool: poolAccount,
      })
      .signers([adminKeypair])
      .rpc();

    const pool = await program.account.poolState.fetch(poolAccount);
    assert.ok(pool.amount.eq(poolAmount));
    assert.ok(pool.nextIndex === 0);
  });

  it("[deposit] creates a deposit", async () => {
    const vaultBalanceBefore = new anchor.BN(
      await provider.connection.getBalance(vaultAccount)
    );

    await program.methods
      .deposit(poolAmount, Array.from(testDeposit.commitmentHash))
      .accountsPartial({
        depositor: depositorXKeypair.publicKey,
        config: configAccount,
        pool: poolAccount,
      })
      .signers([depositorXKeypair])
      .rpc();

    // Check if amount was transferred to vault.
    const vaultBalanceAfter = new anchor.BN(
      await provider.connection.getBalance(vaultAccount)
    );
    assert.ok(vaultBalanceAfter.eq(vaultBalanceBefore.add(poolAmount)));

    // Check pool state.
    const pool = await program.account.poolState.fetch(poolAccount);
    assert.ok(pool.nextIndex === 1);
    assert.ok(
      Buffer.compare(
        Buffer.from(testDeposit.commitmentHash),
        Buffer.from(pool.filledSubtrees[0])
      ) === 0
    );
    // TODO: Merkle tree tests.

    // Check deposit state.
    const deposit = await program.account.depositState.fetch(depositAccount);
    assert.ok(deposit.pool.toString() === poolAccount.toString());
    assert.ok(
      deposit.from.toString() === depositorXKeypair.publicKey.toString()
    );
    assert.ok(deposit.amount.eq(pool.amount));
    assert.ok(
      Buffer.compare(
        Buffer.from(deposit.commitment),
        Buffer.from(testDeposit.commitmentHash)
      ) === 0
    );
    assert.ok(deposit.index === 0);
  });
});
