"use client";

import React from "react";
import Footer from "@/components/footer";
import Pool from "@/components/pool";
import Mixer from "@/components/mixer";
import TransactionHistory from "@/components/txHistory";

const Hush = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-xl mx-auto">
          <h3 className="text-lg font-semibold mb-4">Select Pool</h3>
          <Pool />

          <h3 className="text-lg font-semibold mb-4">Deposit / Withdraw</h3>
          <Mixer />

          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <TransactionHistory />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default function Home() {
  return <Hush />;
}
