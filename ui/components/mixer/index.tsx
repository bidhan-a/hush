import { Copy, ArrowRight, Lock, Download } from "lucide-react";
import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { downloadNote } from "@/lib/utils";

const Mixer = () => {
  const {
    selectedToken,
    selectedPool,
    generateDepositNote,
    createDeposit,
    depositCreating,
    depositNote,
    depositNoteGenerating,
    withdrawalRecipientAddress,
    setWithdrawalRecipientAddress,
    withdrawalNote,
    setWithdrawalNote,
    createWithdrawal,
    withdrawalCreating,
  } = useApp();
  const [tab, setTab] = useState("deposit");

  // Generate a deposit note.
  const generateNote = () => {
    generateDepositNote();
  };

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden mb-8">
      {/* Tabs */}
      <div className="flex">
        <button
          className={`flex-1 py-4 text-center transition cursor-pointer ${
            tab === "deposit"
              ? "bg-gray-700 text-emerald-400"
              : "hover:bg-gray-750"
          }`}
          onClick={() => setTab("deposit")}
        >
          Deposit
        </button>
        <button
          className={`flex-1 py-4 text-center transition cursor-pointer ${
            tab === "withdraw"
              ? "bg-gray-700 text-emerald-400"
              : "hover:bg-gray-750"
          }`}
          onClick={() => setTab("withdraw")}
        >
          Withdraw
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {tab === "deposit" ? (
          <>
            <div className="mb-6">
              <div className="bg-gray-900 rounded-lg p-4">
                {depositNote ? (
                  <div className="flex justify-between items-center py-2">
                    <div className="truncate flex-1 font-mono text-emerald-400">
                      {depositNote}
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(depositNote)}
                      className="ml-2 text-gray-400 hover:text-white cursor-pointer"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => downloadNote(depositNote)}
                      className="ml-2 text-gray-400 hover:text-white cursor-pointer"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={generateNote}
                    className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center space-x-2 transition cursor-pointer"
                  >
                    <Lock size={16} className="text-emerald-400" />
                    <span>Generate Note</span>
                  </button>
                )}
              </div>
              <p className="text-amber-400 text-xs mt-2 text-center">
                Please save your deposit note securely. You will need it to
                withdraw funds.
              </p>
            </div>

            <div className="mb-6 bg-gray-900 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Protocol Fee</span>
                <span>1%</span>
              </div>
            </div>

            <button
              className={`w-full py-4 rounded-lg font-semibold transition flex items-center justify-center space-x-2 ${
                depositNote && !depositNoteGenerating && !depositCreating
                  ? "bg-emerald-500 hover:bg-emerald-600 cursor-pointer"
                  : "bg-gray-700 cursor-not-allowed"
              }`}
              onClick={createDeposit}
              disabled={
                !depositNote || depositNoteGenerating || depositCreating
              }
            >
              <span>
                Deposit {selectedPool.type} {selectedToken.type}
              </span>
              <ArrowRight size={16} />
            </button>
          </>
        ) : (
          <>
            <div className="mb-5">
              <label className="block text-gray-400 text-sm mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={withdrawalRecipientAddress}
                onChange={(e) => setWithdrawalRecipientAddress(e.target.value)}
                placeholder="Enter Solana wallet address"
                className="w-full bg-gray-900 rounded-lg p-3 outline-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">
                Your Note
              </label>
              <input
                type="text"
                value={withdrawalNote}
                onChange={(e) => setWithdrawalNote(e.target.value)}
                placeholder="Paste your deposit note here"
                className="w-full bg-gray-900 rounded-lg p-3 outline-none"
              />
            </div>

            <button
              className={`w-full py-4 rounded-lg font-semibold transition flex items-center justify-center space-x-2 ${
                withdrawalNote &&
                withdrawalRecipientAddress &&
                !withdrawalCreating
                  ? "bg-emerald-500 hover:bg-emerald-600 cursor-pointer"
                  : "bg-gray-700 cursor-not-allowed"
              }`}
              onClick={createWithdrawal}
              disabled={
                !withdrawalNote ||
                !withdrawalRecipientAddress ||
                withdrawalCreating
              }
            >
              <span>
                Withdraw {selectedPool.type} {selectedToken.type}
              </span>
              <ArrowRight size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Mixer;
