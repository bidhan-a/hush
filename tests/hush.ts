import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Hush } from "../target/types/hush";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert } from "chai";
import { generateRandomNumber } from "../ui/lib/utils";
import Deposit, { IDeposit } from "../ui/lib/deposit";
import { getSnarkProof } from "../ui/lib/proof";

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
  let withdrawAccount: anchor.web3.PublicKey;
  let deposit2Account: anchor.web3.PublicKey;
  let withdraw2Account: anchor.web3.PublicKey;
  let deposit3Account: anchor.web3.PublicKey;
  let withdraw3Account: anchor.web3.PublicKey;
  let deposit4Account: anchor.web3.PublicKey;
  let withdraw4Account: anchor.web3.PublicKey;

  // Test values.
  const feeBasisPoints = 100; // 1%.
  const poolAmount = new anchor.BN(1 * LAMPORTS_PER_SOL); // 1 SOL pool.
  let testDeposit: IDeposit;
  let testDeposit2: IDeposit;
  let testDeposit3: IDeposit;
  let testDeposit4: IDeposit;

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

    const withdrawerXAirdrop = await provider.connection.requestAirdrop(
      withdrawerXKeypair.publicKey,
      100 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction({
      signature: withdrawerXAirdrop,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });

    const depositorYAirdrop = await provider.connection.requestAirdrop(
      depositorYKeypair.publicKey,
      100 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction({
      signature: depositorYAirdrop,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });

    const withdrawerYAirdrop = await provider.connection.requestAirdrop(
      withdrawerYKeypair.publicKey,
      100 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction({
      signature: withdrawerYAirdrop,
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

    // Deposit 1.
    const nullifier1 = generateRandomNumber(31);
    const secret1 = generateRandomNumber(31);
    testDeposit = await Deposit.create(poolAccount, nullifier1, secret1);
    [depositAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("deposit"),
        poolAccount.toBuffer(),
        testDeposit.commitmentHash,
      ],
      program.programId
    );

    [withdrawAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("withdraw"),
        poolAccount.toBuffer(),
        testDeposit.nullifierHash,
      ],
      program.programId
    );

    // Deposit 2.
    const nullifier2 = generateRandomNumber(31);
    const secret2 = generateRandomNumber(31);
    testDeposit2 = await Deposit.create(poolAccount, nullifier2, secret2);
    [deposit2Account] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("deposit"),
        poolAccount.toBuffer(),
        testDeposit2.commitmentHash,
      ],
      program.programId
    );

    [withdraw2Account] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("withdraw"),
        poolAccount.toBuffer(),
        testDeposit2.nullifierHash,
      ],
      program.programId
    );

    // Deposit 3.
    const nullifier3 = generateRandomNumber(31);
    const secret3 = generateRandomNumber(31);
    testDeposit3 = await Deposit.create(poolAccount, nullifier3, secret3);
    [deposit3Account] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("deposit"),
        poolAccount.toBuffer(),
        testDeposit3.commitmentHash,
      ],
      program.programId
    );

    // Deposit 4.
    const nullifier4 = generateRandomNumber(31);
    const secret4 = generateRandomNumber(31);
    testDeposit4 = await Deposit.create(poolAccount, nullifier4, secret4);
    [deposit4Account] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("deposit"),
        poolAccount.toBuffer(),
        testDeposit4.commitmentHash,
      ],
      program.programId
    );
  });

  it("[initialize] admin initializes the config", async () => {
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

  it("[create_pool] admin creates a pool for the given amount", async () => {
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

  it("[deposit] depositor X creates a deposit", async () => {
    const vaultBalanceBefore = new anchor.BN(
      await provider.connection.getBalance(vaultAccount)
    );

    await program.methods
      .deposit(poolAmount, Array.from(testDeposit.commitmentHash))
      .accountsPartial({
        depositor: depositorXKeypair.publicKey,
        lastDeposit: null,
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
        Buffer.from(pool.lastCommitment)
      ) === 0
    );
    assert.ok(pool.deposits === 1);
    assert.ok(pool.totalValue.eq(vaultBalanceAfter));

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

  it("[deposit] depositor X is not allowed to create a duplicate deposit with the same commitment hash", async () => {
    try {
      await program.methods
        .deposit(poolAmount, Array.from(testDeposit.commitmentHash))
        .accountsPartial({
          depositor: depositorXKeypair.publicKey,
          lastDeposit: null,
          config: configAccount,
          pool: poolAccount,
        })
        .signers([depositorXKeypair])
        .rpc();
    } catch (err) {
      assert.match(err.toString(), /already in use/);
    }
  });

  it("[deposit] depositor Y creates a deposit", async () => {
    const vaultBalanceBefore = new anchor.BN(
      await provider.connection.getBalance(vaultAccount)
    );

    let lastDeposit = null;
    let pool = await program.account.poolState.fetch(poolAccount);
    if (pool.lastCommitment) {
      [lastDeposit] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("deposit"),
          poolAccount.toBuffer(),
          new Uint8Array(pool.lastCommitment),
        ],
        program.programId
      );
    }

    await program.methods
      .deposit(poolAmount, Array.from(testDeposit2.commitmentHash))
      .accountsPartial({
        depositor: depositorYKeypair.publicKey,
        lastDeposit: lastDeposit,
        config: configAccount,
        pool: poolAccount,
      })
      .signers([depositorYKeypair])
      .rpc();

    // Check if amount was transferred to vault.
    const vaultBalanceAfter = new anchor.BN(
      await provider.connection.getBalance(vaultAccount)
    );
    assert.ok(vaultBalanceAfter.eq(vaultBalanceBefore.add(poolAmount)));

    // Check pool state.
    pool = await program.account.poolState.fetch(poolAccount);
    assert.ok(pool.nextIndex === 2);
    assert.ok(
      Buffer.compare(
        Buffer.from(testDeposit2.commitmentHash),
        Buffer.from(pool.lastCommitment)
      ) === 0
    );
    assert.ok(pool.deposits === 2);
    assert.ok(pool.totalValue.eq(vaultBalanceAfter));

    // Check deposit state.
    const deposit = await program.account.depositState.fetch(deposit2Account);
    assert.ok(deposit.pool.toString() === poolAccount.toString());
    assert.ok(
      deposit.from.toString() === depositorYKeypair.publicKey.toString()
    );
    assert.ok(deposit.amount.eq(pool.amount));
    assert.ok(
      Buffer.compare(
        Buffer.from(deposit.commitment),
        Buffer.from(testDeposit2.commitmentHash)
      ) === 0
    );
    assert.ok(deposit.index === 1);
  });

  it("[deposit] depositor Y creates a second deposit", async () => {
    const vaultBalanceBefore = new anchor.BN(
      await provider.connection.getBalance(vaultAccount)
    );

    let lastDeposit = null;
    let pool = await program.account.poolState.fetch(poolAccount);
    if (pool.lastCommitment) {
      [lastDeposit] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("deposit"),
          poolAccount.toBuffer(),
          new Uint8Array(pool.lastCommitment),
        ],
        program.programId
      );
    }

    await program.methods
      .deposit(poolAmount, Array.from(testDeposit3.commitmentHash))
      .accountsPartial({
        depositor: depositorYKeypair.publicKey,
        lastDeposit: lastDeposit,
        config: configAccount,
        pool: poolAccount,
      })
      .signers([depositorYKeypair])
      .rpc();

    // Check if amount was transferred to vault.
    const vaultBalanceAfter = new anchor.BN(
      await provider.connection.getBalance(vaultAccount)
    );
    assert.ok(vaultBalanceAfter.eq(vaultBalanceBefore.add(poolAmount)));

    // Check pool state.
    pool = await program.account.poolState.fetch(poolAccount);
    assert.ok(pool.nextIndex === 3);
    assert.ok(
      Buffer.compare(
        Buffer.from(testDeposit3.commitmentHash),
        Buffer.from(pool.lastCommitment)
      ) === 0
    );
    assert.ok(pool.deposits === 3);
    assert.ok(pool.totalValue.eq(vaultBalanceAfter));

    // Check deposit state.
    const deposit = await program.account.depositState.fetch(deposit3Account);
    assert.ok(deposit.pool.toString() === poolAccount.toString());
    assert.ok(
      deposit.from.toString() === depositorYKeypair.publicKey.toString()
    );
    assert.ok(deposit.amount.eq(pool.amount));
    assert.ok(
      Buffer.compare(
        Buffer.from(deposit.commitment),
        Buffer.from(testDeposit3.commitmentHash)
      ) === 0
    );
    assert.ok(deposit.index === 2);
  });

  it("[deposit] depositor Y creates a third deposit", async () => {
    const vaultBalanceBefore = new anchor.BN(
      await provider.connection.getBalance(vaultAccount)
    );

    let lastDeposit = null;
    let pool = await program.account.poolState.fetch(poolAccount);
    if (pool.lastCommitment) {
      [lastDeposit] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("deposit"),
          poolAccount.toBuffer(),
          new Uint8Array(pool.lastCommitment),
        ],
        program.programId
      );
    }

    await program.methods
      .deposit(poolAmount, Array.from(testDeposit4.commitmentHash))
      .accountsPartial({
        depositor: depositorYKeypair.publicKey,
        lastDeposit: lastDeposit,
        config: configAccount,
        pool: poolAccount,
      })
      .signers([depositorYKeypair])
      .rpc();

    // Check if amount was transferred to vault.
    const vaultBalanceAfter = new anchor.BN(
      await provider.connection.getBalance(vaultAccount)
    );
    assert.ok(vaultBalanceAfter.eq(vaultBalanceBefore.add(poolAmount)));

    // Check pool state.
    pool = await program.account.poolState.fetch(poolAccount);
    assert.ok(pool.nextIndex === 4);
    assert.ok(
      Buffer.compare(
        Buffer.from(testDeposit4.commitmentHash),
        Buffer.from(pool.lastCommitment)
      ) === 0
    );
    assert.ok(pool.deposits === 4);
    assert.ok(pool.totalValue.eq(vaultBalanceAfter));

    // Check deposit state.
    const deposit = await program.account.depositState.fetch(deposit4Account);
    assert.ok(deposit.pool.toString() === poolAccount.toString());
    assert.ok(
      deposit.from.toString() === depositorYKeypair.publicKey.toString()
    );
    assert.ok(deposit.amount.eq(pool.amount));
    assert.ok(
      Buffer.compare(
        Buffer.from(deposit.commitment),
        Buffer.from(testDeposit4.commitmentHash)
      ) === 0
    );
    assert.ok(deposit.index === 3);
  });

  it("[withdraw] withdrawer X creates a withdrawal", async () => {
    const vaultBalanceBefore = new anchor.BN(
      await provider.connection.getBalance(vaultAccount)
    );
    let pool = await program.account.poolState.fetch(poolAccount);
    const deposit = await program.account.depositState.fetch(depositAccount);
    const merkleRoot = pool.merkleRoots[pool.currentMerkleRootIndex];

    const proof = await getSnarkProof(
      testDeposit,
      new Uint8Array(merkleRoot),
      pool.filledSubtrees.map((v) => new Uint8Array(v)),
      deposit.index,
      new Uint8Array(deposit.siblingCommitment)
    );

    await program.methods
      .withdraw(
        poolAmount,
        Array.from(testDeposit.nullifierHash),
        Array.from(merkleRoot),
        Array.from(proof)
      )
      .accountsPartial({
        withdrawer: withdrawerXKeypair.publicKey,
        config: configAccount,
        pool: poolAccount,
      })
      .signers([withdrawerXKeypair])
      .rpc();

    // Check if amount was transferred to withdrawer.
    const vaultBalanceAfter = new anchor.BN(
      await provider.connection.getBalance(vaultAccount)
    );
    assert.ok(vaultBalanceAfter.eq(vaultBalanceBefore.sub(poolAmount)));

    // Re-fetch pool.

    pool = await program.account.poolState.fetch(poolAccount);
    assert.ok(pool.withdrawals === 1);
    assert.ok(pool.totalValue.eq(vaultBalanceAfter));

    // Check withdraw state.
    const withdraw = await program.account.withdrawState.fetch(withdrawAccount);
    assert.ok(withdraw.pool.toString() === poolAccount.toString());
    assert.ok(
      withdraw.to.toString() === withdrawerXKeypair.publicKey.toString()
    );
    assert.ok(withdraw.amount.eq(pool.amount));
    assert.ok(
      Buffer.compare(
        Buffer.from(withdraw.nullifierHash),
        Buffer.from(testDeposit.nullifierHash)
      ) === 0
    );
  });

  it("[withdraw] withdrawer X is not allowed to create a duplicate withdrawal with the same nullifier hash", async () => {
    try {
      const pool = await program.account.poolState.fetch(poolAccount);
      const deposit = await program.account.depositState.fetch(depositAccount);
      const merkleRoot = pool.merkleRoots[pool.currentMerkleRootIndex];

      const proof = await getSnarkProof(
        testDeposit,
        new Uint8Array(merkleRoot),
        pool.filledSubtrees.map((v) => new Uint8Array(v)),
        deposit.index,
        new Uint8Array(deposit.siblingCommitment)
      );

      await program.methods
        .withdraw(
          poolAmount,
          Array.from(testDeposit.nullifierHash),
          Array.from(merkleRoot),
          Array.from(proof)
        )
        .accountsPartial({
          withdrawer: withdrawerXKeypair.publicKey,
          config: configAccount,
          pool: poolAccount,
        })
        .signers([withdrawerXKeypair])
        .rpc();
    } catch (err) {
      assert.match(err.toString(), /already in use/);
    }
  });

  it("[withdraw] withdrawer X is not allowed to create a withdrawal using an invalid proof", async () => {
    try {
      const pool = await program.account.poolState.fetch(poolAccount);
      const merkleRoot = pool.merkleRoots[pool.currentMerkleRootIndex];

      // Random byte array.
      const proof = new Uint8Array(Array.from({ length: 256 }, () => 1));

      await program.methods
        .withdraw(
          poolAmount,
          Array.from(testDeposit2.nullifierHash),
          Array.from(merkleRoot),
          Array.from(proof)
        )
        .accountsPartial({
          withdrawer: withdrawerXKeypair.publicKey,
          config: configAccount,
          pool: poolAccount,
        })
        .signers([withdrawerXKeypair])
        .rpc();
    } catch (err) {
      assert.match(err.toString(), /InvalidProof/);
    }
  });

  it("[withdraw] withdrawer X is not allowed to create a withdrawal using a valid but incorrect proof", async () => {
    try {
      const pool = await program.account.poolState.fetch(poolAccount);
      const deposit = await program.account.depositState.fetch(depositAccount);
      const merkleRoot = pool.merkleRoots[pool.currentMerkleRootIndex];

      // Proof created using testDeposit.
      const proof = await getSnarkProof(
        testDeposit,
        new Uint8Array(merkleRoot),
        pool.filledSubtrees.map((v) => new Uint8Array(v)),
        deposit.index,
        new Uint8Array(deposit.siblingCommitment)
      );

      await program.methods
        .withdraw(
          poolAmount,
          // nullifierHash belongs to testDeposit2.
          Array.from(testDeposit2.nullifierHash),
          Array.from(merkleRoot),
          Array.from(proof)
        )
        .accountsPartial({
          withdrawer: withdrawerXKeypair.publicKey,
          config: configAccount,
          pool: poolAccount,
        })
        .signers([withdrawerXKeypair])
        .rpc();
    } catch (err) {
      assert.match(err.toString(), /VerificationError/);
    }
  });

  it("[withdraw] withdrawer Y creates a withdrawal", async () => {
    const vaultBalanceBefore = new anchor.BN(
      await provider.connection.getBalance(vaultAccount)
    );
    let pool = await program.account.poolState.fetch(poolAccount);
    const deposit = await program.account.depositState.fetch(deposit2Account);
    const merkleRoot = pool.merkleRoots[pool.currentMerkleRootIndex];

    const proof = await getSnarkProof(
      testDeposit2,
      new Uint8Array(merkleRoot),
      pool.filledSubtrees.map((v) => new Uint8Array(v)),
      deposit.index,
      new Uint8Array(deposit.siblingCommitment)
    );

    await program.methods
      .withdraw(
        poolAmount,
        Array.from(testDeposit2.nullifierHash),
        Array.from(merkleRoot),
        Array.from(proof)
      )
      .accountsPartial({
        withdrawer: withdrawerYKeypair.publicKey,
        config: configAccount,
        pool: poolAccount,
      })
      .signers([withdrawerYKeypair])
      .rpc();

    // Check if amount was transferred to withdrawer.
    const vaultBalanceAfter = new anchor.BN(
      await provider.connection.getBalance(vaultAccount)
    );
    assert.ok(vaultBalanceAfter.eq(vaultBalanceBefore.sub(poolAmount)));

    // Re-fetch pool.
    pool = await program.account.poolState.fetch(poolAccount);
    assert.ok(pool.withdrawals === 2);
    assert.ok(pool.totalValue.eq(vaultBalanceAfter));

    // Check withdraw state.
    const withdraw = await program.account.withdrawState.fetch(
      withdraw2Account
    );
    assert.ok(withdraw.pool.toString() === poolAccount.toString());
    assert.ok(
      withdraw.to.toString() === withdrawerYKeypair.publicKey.toString()
    );
    assert.ok(withdraw.amount.eq(pool.amount));
    assert.ok(
      Buffer.compare(
        Buffer.from(withdraw.nullifierHash),
        Buffer.from(testDeposit2.nullifierHash)
      ) === 0
    );
  });

  after(async () => {
    try {
      await globalThis.curve_bn128.terminate();
    } catch (error) {
      // ignore
    }
  });
});
