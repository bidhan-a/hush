"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import * as anchor from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKENS } from "@/constants";
import { Pool, PoolStats, Token } from "@/types";
import { generateRandomNumber } from "@/lib/utils";
import Deposit from "@/lib/deposit";
// import { getSnarkProof } from "../../lib/proof";
import { getHushProgramId } from "@/lib/program";

interface AppContext {
  selectedToken: Token;
  selectedPool: Pool;
  selectedPoolStats: PoolStats;
  selectedPoolStatsLoading: boolean;
  depositNote: string;
  depositNoteGenerating: boolean;
  withdrawRecipientAddress: string;
  withdrawNote: string;
  selectToken: (token: Token) => void;
  selectPool: (pool: Pool) => void;
  generateDepositNote: () => Promise<void>;
  setWithdrawRecipientAddress: (address: string) => void;
  setWithdrawNote: (note: string) => void;
}

const initialState: AppContext = {
  selectedToken: TOKENS[0],
  selectedPool: TOKENS[0].pools[0],
  selectedPoolStats: { totalValue: 0, deposits: 0, withdrawals: 0 },
  selectedPoolStatsLoading: true,
  depositNote: "",
  depositNoteGenerating: false,
  withdrawRecipientAddress: "",
  withdrawNote: "",
  selectToken: () => undefined,
  selectPool: () => undefined,
  generateDepositNote: async () => undefined,
  setWithdrawRecipientAddress: () => undefined,
  setWithdrawNote: () => undefined,
};

export const AppContext = createContext<AppContext>(initialState);

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
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

  const [depositNote, setDepositNote] = useState(initialState.depositNote);
  const [depositNoteGenerating, setDepositNoteGenerating] = useState(
    initialState.depositNoteGenerating
  );

  const [withdrawRecipientAddress, setWithdrawRecipientAddress] = useState(
    initialState.withdrawRecipientAddress
  );
  const [withdrawNote, setWithdrawNote] = useState(initialState.withdrawNote);

  const generateDepositNote = async () => {
    try {
      setDepositNoteGenerating(true);

      const programId = getHushProgramId("devnet");
      const poolAmount = new anchor.BN(selectedPool.type * LAMPORTS_PER_SOL);
      const [poolAccount] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("pool"), poolAmount.toArrayLike(Buffer, "le", 8)],
        programId
      );

      const nullifier = generateRandomNumber(31);
      const secret = generateRandomNumber(31);
      const deposit = await Deposit.create(poolAccount, nullifier, secret);
      const depositNote = Deposit.generateNote(deposit);

      setDepositNote(depositNote);
    } catch (e) {
      console.error(e);
    } finally {
      setDepositNoteGenerating(false);
    }
  };

  useEffect(() => {
    if (selectedPool) {
      const fetchPoolStats = async () => {
        setSelectedPoolStatsLoading(true);
        // TODO: Get pool stats from on-chain PDA.
        setTimeout(() => {
          setSelectedPoolStats({
            totalValue: Math.floor(Math.random() * 1000000),
            deposits: Math.floor(Math.random() * 1000),
            withdrawals: Math.floor(Math.random() * 1000),
          });
          setSelectedPoolStatsLoading(false);
        }, 5000);
      };

      fetchPoolStats();
    }
  }, [selectedPool, selectedToken]);

  const selectToken = (token: Token) => {
    setSelectedToken(token);
    setSelectedPool(token.pools[0]);
  };

  return (
    <AppContext.Provider
      value={{
        selectedToken,
        selectedPool,
        selectedPoolStats,
        selectedPoolStatsLoading,
        depositNote,
        depositNoteGenerating,
        withdrawRecipientAddress,
        withdrawNote,
        selectToken,
        selectPool: setSelectedPool,
        generateDepositNote,
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
