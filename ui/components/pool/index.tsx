"use client";

import { ChevronDown } from "lucide-react";
import React, { useState } from "react";

const Pool = () => {
  const pools = [1, 10, 100, 1000];
  const tokens = ["SOL", "USDC"];

  // Stats based on selected pool and token
  const [stats, setStats] = useState({
    tvl: "458,219",
    users: "2,874",
    transactions: "16,542",
  });
  const [selectedPool, setSelectedPool] = useState(10);
  const [selectedToken, setSelectedToken] = useState("SOL");
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);

  return (
    <div className="bg-gray-800 rounded-xl p-6 mb-8">
      <div className="grid gap-6 mb-6">
        <div>
          <label className="block text-gray-400 text-sm mb-2">Token</label>
          <div className="relative">
            <button
              className="w-full flex justify-between items-center py-3 px-4 bg-gray-900 rounded-lg hover:bg-gray-700"
              onClick={() => setShowTokenDropdown(!showTokenDropdown)}
            >
              <span>{selectedToken}</span>
              <ChevronDown size={16} />
            </button>

            {showTokenDropdown && (
              <div className="absolute z-10 w-full mt-2 bg-gray-800 rounded-lg shadow-lg">
                {tokens.map((token) => (
                  <button
                    key={token}
                    className="w-full text-left px-4 py-2 hover:bg-gray-700"
                    onClick={() => {
                      setSelectedToken(token);
                      setShowTokenDropdown(false);
                    }}
                  >
                    {token}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-gray-400 text-sm mb-2">
              Pool Size
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {pools.map((pool) => (
                <button
                  key={pool}
                  className={`py-3 rounded-lg transition ${
                    selectedPool === pool
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-900 hover:bg-gray-700"
                  }`}
                  onClick={() => setSelectedPool(pool)}
                >
                  {pool} {selectedToken === "USDC" ? "$" : ""}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-4">Pool Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Value Locked:</span>
              <span className="font-semibold">
                {stats.tvl} {selectedToken}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Unique Users:</span>
              <span className="font-semibold">{stats.users}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Transactions:</span>
              <span className="font-semibold">{stats.transactions}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pool;
