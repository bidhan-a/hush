"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { TOKENS } from "@/constants";
import { Pool, PoolStats, Token } from "@/types";

interface AppContext {
  selectedToken: Token;
  selectedPool: Pool;
  selectedPoolStats: PoolStats;
  selectedPoolStatsLoading: boolean;
  selectToken: (token: Token) => void;
  selectPool: (pool: Pool) => void;
}

const initialState: AppContext = {
  selectedToken: TOKENS[0],
  selectedPool: TOKENS[0].pools[0],
  selectedPoolStats: { totalValue: 0, deposits: 0, withdrawals: 0 },
  selectedPoolStatsLoading: true,
  selectToken: () => undefined,
  selectPool: () => undefined,
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
        }, 2000);
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
        selectToken,
        selectPool: setSelectedPool,
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
