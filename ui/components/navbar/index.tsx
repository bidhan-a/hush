"use client";

import React from "react";
import { LockIcon } from "lucide-react";
import dynamic from "next/dynamic";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const Navbar = () => {
  return (
    <nav className="bg-gray-900">
      <header className="p-4 border-b border-gray-800">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <LockIcon className="text-emerald-400" size={24} />
            <h1 className="text-xl font-bold">Hush</h1>
          </div>
          <div className="flex space-x-4 items-center">
            <WalletMultiButtonDynamic />
          </div>
        </div>
      </header>
    </nav>
  );
};

export default Navbar;
