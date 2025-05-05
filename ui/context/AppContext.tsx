"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as anchor from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKENS } from "@/constants";
import { Pool, PoolStats, Token } from "@/types";
import { generateRandomNumber } from "@/lib/utils";
import Deposit, { IDeposit } from "@/lib/deposit";
// import { getSnarkProof } from "../../lib/proof";
import { getHushProgram, Hush } from "@/lib/program";
import {
  AnchorWallet,
  useAnchorWallet,
  useConnection,
} from "@solana/wallet-adapter-react";
import { AnchorProvider, Program } from "@coral-xyz/anchor";

interface AppContext {
  selectedToken: Token;
  selectedPool: Pool;
  selectedPoolStats: PoolStats;
  selectedPoolStatsLoading: boolean;
  deposit?: IDeposit;
  depositNote: string;
  depositNoteGenerating: boolean;
  depositCreating: boolean;
  withdrawRecipientAddress: string;
  withdrawNote: string;
  selectToken: (token: Token) => void;
  selectPool: (pool: Pool) => void;
  generateDepositNote: () => Promise<void>;
  createDeposit: () => Promise<void>;
  setWithdrawRecipientAddress: (address: string) => void;
  setWithdrawNote: (note: string) => void;
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
  withdrawRecipientAddress: "",
  withdrawNote: "",
  selectToken: () => undefined,
  selectPool: () => undefined,
  generateDepositNote: async () => undefined,
  createDeposit: async () => undefined,
  setWithdrawRecipientAddress: () => undefined,
  setWithdrawNote: () => undefined,
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

  const [withdrawRecipientAddress, setWithdrawRecipientAddress] = useState(
    initialState.withdrawRecipientAddress
  );
  const [withdrawNote, setWithdrawNote] = useState(initialState.withdrawNote);

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

        // Get the last deposit (if available).
        let lastDeposit = null;
        const poolState = await hushProgram.account.poolState.fetch(
          poolAccount
        );
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
        await hushProgram.methods
          .deposit(poolAmount, Array.from(deposit.commitmentHash))
          .accountsPartial({
            depositor: anchorProvider.publicKey,
            lastDeposit,
            pool: poolAccount,
          })
          .rpc();

        // Clean up deposit.
        setDeposit(undefined);
        setDepositNote("");

        // TODO: Show toast notification.

        // TODO: Refresh pool state.
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDepositCreating(false);
    }
  };

  const selectToken = (token: Token) => {
    setSelectedToken(token);
    setSelectedPool(token.pools[0]);
  };

  useEffect(() => {
    if (selectedPool) {
      const fetchPoolStats = async () => {
        setSelectedPoolStatsLoading(true);
        if (anchorProvider && hushProgram) {
          const poolAmount = new anchor.BN(
            selectedPool.type * LAMPORTS_PER_SOL
          );
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
          setSelectedPoolStatsLoading(false);
        }
      };

      fetchPoolStats();
    }
  }, [selectedPool, selectedToken, anchorProvider, hushProgram]);

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
        withdrawRecipientAddress,
        withdrawNote,
        selectToken,
        selectPool: setSelectedPool,
        generateDepositNote,
        createDeposit,
        setWithdrawRecipientAddress,
        setWithdrawNote,
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
