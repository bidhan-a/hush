"use client";

import { WalletError } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import React, { createContext, useContext, useCallback } from "react";
import "@solana/wallet-adapter-react-ui/styles.css";

const SolanaWalletContext = createContext<undefined>(undefined);

export function SolanaWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_API_URL!;

  const onError = useCallback((error: WalletError) => {
    console.error(error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} onError={onError} autoConnect={true}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export function useSolanaWallet() {
  const context = useContext(SolanaWalletContext);

  if (context === undefined) {
    throw new Error(
      "useSolanaWallet must be used within a SolanaWalletProvider"
    );
  }

  return context;
}
