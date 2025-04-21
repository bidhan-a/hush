import { Copy, ExternalLink } from "lucide-react";
import React from "react";

const TransactionHistory = () => {
  // Format address for display
  const formatAddress = (address) => {
    if (!address) return "";
    return (
      address.substring(0, 6) + "..." + address.substring(address.length - 4)
    );
  };

  return (
    <div className="mb-8">
      <div className="space-y-3">
        {[1, 2, 3].map((_, i) => (
          <div
            key={i}
            className="flex justify-between items-center bg-gray-800 p-4 rounded-lg"
          >
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-sm ${
                    i % 2 === 0 ? "text-green-400" : "text-blue-400"
                  }`}
                >
                  {i % 2 === 0 ? "Deposit" : "Withdraw"}
                </span>
                <span className="text-gray-400 text-sm">
                  {formatAddress(
                    "8xFghT6vDS4LhwHRDQZ4NmT6UJCveKCJLxcv5XYCrsNm"
                  )}
                </span>
                <Copy
                  size={14}
                  className="text-gray-500 cursor-pointer hover:text-gray-300"
                />
              </div>
              <p className="text-sm text-gray-400">2 minutes ago</p>
            </div>
            <div className="flex items-center space-x-2">
              <ExternalLink
                size={14}
                className="text-gray-500 cursor-pointer hover:text-gray-300"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionHistory;
