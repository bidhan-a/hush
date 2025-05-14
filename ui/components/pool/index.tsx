"use client";

import { ChevronDown } from "lucide-react";
import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { TOKENS } from "@/constants";

const StatLoader = () => (
  <div className="h-4 w-24 bg-gray-700 rounded animate-pulse"></div>
);

const Pool = () => {
  const {
    selectedToken,
    selectedPool,
    selectedPoolStats,
    selectedPoolStatsLoading,
    selectToken,
    selectPool,
  } = useApp();
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);

  return (
    <div className="bg-gray-800 rounded-xl p-6 mb-8 font-onest">
      <div className="grid gap-6 mb-6">
        <div>
          <label className="block text-gray-400 text-sm mb-2">Token</label>
          <div className="relative">
            <button
              className="w-full flex justify-between items-center py-3 px-4 bg-gray-900 rounded-lg hover:bg-gray-700"
              onClick={() => setShowTokenDropdown(!showTokenDropdown)}
            >
              <span>{selectedToken.type}</span>
              <ChevronDown size={16} />
            </button>

            {showTokenDropdown && (
              <div className="absolute z-10 w-full mt-2 bg-gray-800 rounded-lg shadow-lg">
                {TOKENS.map((token) => (
                  <button
                    key={token.type}
                    className="w-full text-left px-4 py-2 hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      selectToken(token);
                      setShowTokenDropdown(false);
                    }}
                  >
                    {token.type}
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
              {selectedToken.pools.map((pool) => {
                const disabled = !pool.available;
                let buttonClasses = "py-3 rounded-lg transition ";

                if (disabled) {
                  buttonClasses +=
                    "bg-gray-700 text-gray-500 opacity-50 cursor-not-allowed";
                } else if (selectedPool.type === pool.type) {
                  buttonClasses += "bg-emerald-600 text-white cursor-pointer";
                } else {
                  buttonClasses +=
                    "bg-gray-900 hover:bg-gray-700 cursor-pointer";
                }

                return (
                  <button
                    key={pool.type}
                    className={buttonClasses}
                    onClick={() => !disabled && selectPool(pool)}
                    disabled={disabled}
                  >
                    {pool.type}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-4">Pool Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Deposits:</span>
              {selectedPoolStatsLoading ? (
                <StatLoader />
              ) : (
                <span className="font-semibold">
                  {selectedPoolStats.deposits}
                </span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Withdrawals:</span>
              {selectedPoolStatsLoading ? (
                <StatLoader />
              ) : (
                <span className="font-semibold">
                  {selectedPoolStats.withdrawals}
                </span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Value:</span>
              {selectedPoolStatsLoading ? (
                <StatLoader />
              ) : (
                <span className="font-semibold">
                  {selectedPoolStats.totalValue} {selectedToken.type}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pool;
