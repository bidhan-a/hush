"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as anchor from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { toast } from "react-hot-toast";
import { TOKENS } from "@/constants";
import { Pool, PoolStats, Token } from "@/types";
import { generateRandomNumber } from "@/lib/utils";
import Deposit, { IDeposit } from "@/lib/deposit";
import { getHushProgram, Hush } from "@/lib/program";
import {
  AnchorWallet,
  useAnchorWallet,
  useConnection,
} from "@solana/wallet-adapter-react";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { getSnarkProof } from "@/lib/proof";
import { getCommitments, saveCommitment, saveTransaction } from "@/app/actions";

interface AppContext {
  selectedToken: Token;
  selectedPool: Pool;
  selectedPoolStats: PoolStats;
  selectedPoolStatsLoading: boolean;
  deposit?: IDeposit;
  depositNote: string;
  depositNoteGenerating: boolean;
  depositCreating: boolean;
  withdrawalRecipientAddress: string;
  withdrawalNote: string;
  withdrawalCreating: boolean;
  selectToken: (token: Token) => void;
  selectPool: (pool: Pool) => void;
  generateDepositNote: () => Promise<void>;
  createDeposit: () => Promise<void>;
  setWithdrawalRecipientAddress: (address: string) => void;
  setWithdrawalNote: (note: string) => void;
  createWithdrawal: () => void;
}

const initialState: AppContext = {
  selectedToken: TOKENS[0],
  selectedPool: TOKENS[0].pools[0],
  selectedPoolStats: { totalValue: 0, deposits: 0, withdrawals: 0 },
  selectedPoolStatsLoading: true,
  deposit: undefined,
  depositNote: "",
  depositNoteGenerating: false,
  depositCreating: false,
  withdrawalRecipientAddress: "",
  withdrawalNote: "",
  withdrawalCreating: false,
  selectToken: () => undefined,
  selectPool: () => undefined,
  generateDepositNote: async () => undefined,
  createDeposit: async () => undefined,
  setWithdrawalRecipientAddress: () => undefined,
  setWithdrawalNote: () => undefined,
  createWithdrawal: () => undefined,
};

export const AppContext = createContext<AppContext>(initialState);

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { connection } = useConnection();
  const anchorWallet: AnchorWallet | undefined = useAnchorWallet();

  const anchorProvider: AnchorProvider | undefined = useMemo(() => {
    if (anchorWallet) {
      return new AnchorProvider(connection, anchorWallet, {
        commitment: "confirmed",
      });
    } else {
      return undefined;
    }
  }, [connection, anchorWallet]);

  const hushProgram: Program<Hush> | undefined = useMemo(() => {
    if (anchorProvider) {
      return getHushProgram(anchorProvider);
    } else {
      return undefined;
    }
  }, [anchorProvider]);

  const [selectedToken, setSelectedToken] = useState(
    initialState.selectedToken
  );
  const [selectedPool, setSelectedPool] = useState(initialState.selectedPool);
  const [selectedPoolStats, setSelectedPoolStats] = useState(
    initialState.selectedPoolStats
  );
  const [selectedPoolStatsLoading, setSelectedPoolStatsLoading] = useState(
    initialState.selectedPoolStatsLoading
  );

  const [deposit, setDeposit] = useState(initialState.deposit);
  const [depositNote, setDepositNote] = useState(initialState.depositNote);
  const [depositNoteGenerating, setDepositNoteGenerating] = useState(
    initialState.depositNoteGenerating
  );
  const [depositCreating, setDepositCreating] = useState(
    initialState.depositCreating
  );

  const [withdrawalRecipientAddress, setWithdrawalRecipientAddress] = useState(
    initialState.withdrawalRecipientAddress
  );
  const [withdrawalNote, setWithdrawalNote] = useState(
    initialState.withdrawalNote
  );
  const [withdrawalCreating, setWithdrawalCreating] = useState(
    initialState.withdrawalCreating
  );

  const fetchPoolStats = useCallback(async () => {
    setSelectedPoolStatsLoading(true);
    if (anchorProvider && hushProgram && selectedPool) {
      try {
        const poolAmount = new anchor.BN(selectedPool.type * LAMPORTS_PER_SOL);
        const [poolAccount] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("pool"), poolAmount.toArrayLike(Buffer, "le", 8)],
          hushProgram.programId
        );
        const poolState = await hushProgram.account.poolState.fetch(
          poolAccount
        );
        if (poolState) {
          setSelectedPoolStats({
            totalValue: poolState.totalValue.toNumber() / LAMPORTS_PER_SOL,
            deposits: poolState.deposits,
            withdrawals: poolState.withdrawals,
          });
        }
      } catch (error) {
        console.error("Error fetching pool stats:", error);
        toast.error("Could not fetch pool statistics.", { duration: 5000 });
      } finally {
        setSelectedPoolStatsLoading(false);
      }
    } else {
      setSelectedPoolStatsLoading(false);
    }
  }, [anchorProvider, hushProgram, selectedPool]);

  const generateDepositNote = async () => {
    try {
      setDepositNoteGenerating(true);

      if (hushProgram) {
        const poolAmount = new anchor.BN(selectedPool.type * LAMPORTS_PER_SOL);
        const [poolAccount] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("pool"), poolAmount.toArrayLike(Buffer, "le", 8)],
          hushProgram.programId
        );

        const nullifier = generateRandomNumber(31);
        const secret = generateRandomNumber(31);
        const deposit = await Deposit.create(poolAccount, nullifier, secret);
        const depositNote = Deposit.generateNote(deposit);

        setDeposit(deposit);
        setDepositNote(depositNote);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDepositNoteGenerating(false);
    }
  };

  const createDeposit = async () => {
    try {
      setDepositCreating(true);

      if (anchorProvider && hushProgram && deposit) {
        const poolAmount = new anchor.BN(selectedPool.type * LAMPORTS_PER_SOL);
        const [poolAccount] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("pool"), poolAmount.toArrayLike(Buffer, "le", 8)],
          hushProgram.programId
        );
        const poolState = await hushProgram.account.poolState.fetch(
          poolAccount
        );

        // Get the last deposit (if available).
        let lastDeposit = null;
        if (poolState.lastCommitment) {
          [lastDeposit] = anchor.web3.PublicKey.findProgramAddressSync(
            [
              Buffer.from("deposit"),
              poolAccount.toBuffer(),
              new Uint8Array(poolState.lastCommitment),
            ],
            hushProgram.programId
          );
        }

        // Create deposit.
        const txHash = await hushProgram.methods
          .deposit(poolAmount, Array.from(deposit.commitmentHash))
          .accountsPartial({
            depositor: anchorProvider.publicKey,
            lastDeposit,
            pool: poolAccount,
          })
          .rpc();

        // Save commit and transaction in DB.
        await saveCommitment(poolState.nextIndex, deposit.commitmentHash);
        await saveTransaction(
          anchorProvider.publicKey.toString(),
          txHash,
          true
        );

        // Clean up deposit.
        setDeposit(undefined);
        setDepositNote("");

        // Show toast notification.
        toast.success("Deposited to pool successfully.", { duration: 5000 });

        // Refresh pool state.
        fetchPoolStats();
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to deposit. Please try again.", { duration: 5000 });
    } finally {
      setDepositCreating(false);
    }
  };

  const createWithdrawal = async () => {
    try {
      setWithdrawalCreating(true);

      if (
        anchorProvider &&
        hushProgram &&
        withdrawalRecipientAddress &&
        withdrawalNote
      ) {
        const withdrawalRecipientPublicKey = new anchor.web3.PublicKey(
          withdrawalRecipientAddress
        );
        // Parse deposit note.
        const deposit = await Deposit.parseNote(withdrawalNote);

        // Fetch PDA states.
        const poolAmount = new anchor.BN(selectedPool.type * LAMPORTS_PER_SOL);
        const [poolAccount] = anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("pool"), poolAmount.toArrayLike(Buffer, "le", 8)],
          hushProgram.programId
        );
        const poolState = await hushProgram.account.poolState.fetch(
          poolAccount
        );

        const [depositAccount] = anchor.web3.PublicKey.findProgramAddressSync(
          [
            Buffer.from("deposit"),
            poolAccount.toBuffer(),
            deposit.commitmentHash,
          ],
          hushProgram.programId
        );
        const depositState = await hushProgram.account.depositState.fetch(
          depositAccount
        );

        // Get commitments.
        const commitments = await getCommitments();
        const leaves = commitments.map((c) => c.commitment);

        // Create ZK proof.
        const merkleRoot =
          poolState.merkleRoots[poolState.currentMerkleRootIndex];
        const proof = await getSnarkProof(
          deposit,
          new Uint8Array(merkleRoot),
          depositState.index,
          leaves
        );

        // Create withdrawal.
        const txHash = await hushProgram.methods
          .withdraw(
            poolAmount,
            Array.from(deposit.nullifierHash),
            Array.from(merkleRoot),
            Array.from(proof)
          )
          .accountsPartial({
            withdrawer: withdrawalRecipientPublicKey,
            pool: poolAccount,
          })
          .rpc();

        // Save transaction in DB.
        await saveTransaction(
          anchorProvider.publicKey.toString(),
          txHash,
          false
        );

        // Clean up withdrawal details.
        setWithdrawalRecipientAddress("");
        setWithdrawalNote("");

        // Show toast notification.
        toast.success("Withdrawn from pool successfully.", { duration: 5000 });

        // Refresh pool state.
        fetchPoolStats();
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to withdraw. Please try again.", { duration: 5000 });
    } finally {
      setWithdrawalCreating(false);
    }
  };

  const selectToken = (token: Token) => {
    setSelectedToken(token);
    setSelectedPool(token.pools[0]);
  };

  useEffect(() => {
    if (selectedPool && selectedToken) {
      fetchPoolStats();
    }
  }, [selectedPool, selectedToken, fetchPoolStats]);

  return (
    <AppContext.Provider
      value={{
        selectedToken,
        selectedPool,
        selectedPoolStats,
        selectedPoolStatsLoading,
        depositNote,
        depositNoteGenerating,
        depositCreating,
        withdrawalRecipientAddress,
        withdrawalNote,
        selectToken,
        selectPool: setSelectedPool,
        generateDepositNote,
        createDeposit,
        setWithdrawalRecipientAddress,
        setWithdrawalNote,
        withdrawalCreating,
        createWithdrawal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  return context;
}
