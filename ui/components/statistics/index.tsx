import React from "react";

const Statistics = () => {
  return (
    <div className="bg-gray-800 rounded-xl p-6 mb-8">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-gray-400 text-sm">Total Value Locked</p>
          <p className="text-xl font-bold">458,219 SOL</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Unique Users</p>
          <p className="text-xl font-bold">2,874</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Transactions</p>
          <p className="text-xl font-bold">16,542</p>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
