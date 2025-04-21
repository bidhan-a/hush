import { Copy, ArrowRight, Lock } from "lucide-react";
import React, { useState } from "react";

const Mixer = () => {
  const [note, setNote] = useState("");
  const [tab, setTab] = useState("deposit");
  const [recipient, setRecipient] = useState("");
  const [noteGenerated, setNoteGenerated] = useState(false);
  const [selectedPool, setSelectedPool] = useState(10);
  const [selectedToken, setSelectedToken] = useState("SOL");

  // Generate a random note
  const generateNote = () => {
    const randomString =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    setNote(randomString);
    setNoteGenerated(true);
  };

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden mb-8">
      {/* Tabs */}
      <div className="flex">
        <button
          className={`flex-1 py-4 text-center transition ${
            tab === "deposit"
              ? "bg-gray-700 text-emerald-400"
              : "hover:bg-gray-750"
          }`}
          onClick={() => setTab("deposit")}
        >
          Deposit
        </button>
        <button
          className={`flex-1 py-4 text-center transition ${
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
              <label className="block text-gray-400 text-sm mb-2">
                Privacy Note
              </label>
              <div className="bg-gray-900 rounded-lg p-4">
                {noteGenerated ? (
                  <div className="flex justify-between items-center">
                    <div className="truncate flex-1 font-mono text-emerald-400">
                      {note}
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(note)}
                      className="ml-2 text-gray-400 hover:text-white"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={generateNote}
                    className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center space-x-2 transition"
                  >
                    <Lock size={16} className="text-emerald-400" />
                    <span>Generate Privacy Note</span>
                  </button>
                )}
              </div>
            </div>

            <div className="mb-6 bg-gray-900 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Protocol Fee</span>
                <span>0.1%</span>
              </div>
            </div>

            <button
              className={`w-full py-4 rounded-lg font-semibold transition flex items-center justify-center space-x-2 ${
                noteGenerated
                  ? "bg-emerald-500 hover:bg-emerald-600"
                  : "bg-gray-700 cursor-not-allowed"
              }`}
              disabled={!noteGenerated}
            >
              <span>
                Deposit {selectedPool} {selectedToken}
              </span>
              <ArrowRight size={16} />
            </button>
          </>
        ) : (
          <>
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Enter Solana wallet address"
                className="w-full bg-gray-900 rounded-lg p-3 outline-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">
                Your Privacy Note
              </label>
              <input
                type="text"
                placeholder="Paste your note from deposit"
                className="w-full bg-gray-900 rounded-lg p-3 outline-none font-mono"
              />
            </div>

            <button className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-semibold transition flex items-center justify-center space-x-2">
              <span>
                Withdraw {selectedPool} {selectedToken}
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
