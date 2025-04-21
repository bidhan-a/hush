import React from "react";
import Pool from "../pool";

const Deposit = () => {
  return (
    <div>
      <Pool token="SOL" />

      <div className="mb-6">
        <label className="block text-gray-400 text-sm mb-2">Privacy Note</label>
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
        <p className="text-amber-400 text-sm mt-2">
          Save this note securely! You will need it to withdraw funds.
        </p>
      </div>

      <div className="mb-6 bg-gray-900 p-4 rounded-lg">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Protocol Fee</span>
          <span>0.1%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Relayer Fee</span>
          <span>{fee} SOL</span>
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
          Deposit {selectedPool} {token}
        </span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
};

export default Deposit;
