import { Transaction, TransactionType } from "@/app/generated/prisma";
import { Copy, ExternalLink } from "lucide-react";
import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import toast from "react-hot-toast";

dayjs.extend(relativeTime);

const TransactionHistory = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return "";
    return (
      address.substring(0, 6) + "..." + address.substring(address.length - 4)
    );
  };

  return (
    <div className="mb-8 font-onest">
      <div className="space-y-3">
        {transactions.length > 0 ? (
          transactions.map((tx, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-gray-800 p-4 rounded-lg"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-sm ${
                      tx.txType === TransactionType.DEPOSIT
                        ? "text-green-400"
                        : "text-blue-400"
                    }`}
                  >
                    {tx.txType === TransactionType.DEPOSIT
                      ? "Deposit"
                      : "Withdraw"}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {formatAddress(tx.address)}
                  </span>
                  <Copy
                    size={14}
                    className="text-gray-500 cursor-pointer hover:text-gray-300"
                    onClick={() => {
                      navigator.clipboard.writeText(tx.address);
                      toast.success("Copied to clipboard.", {
                        duration: 3000,
                      });
                    }}
                  />
                </div>
                <p className="text-sm text-gray-400">
                  {dayjs().to(dayjs(tx.createdAt))}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <ExternalLink
                  size={14}
                  className="text-gray-500 cursor-pointer hover:text-gray-300"
                  onClick={() =>
                    window.open(
                      `${process.env.NEXT_PUBLIC_SOLANA_EXPLORER_URL}/${tx.txHash}?cluster=devnet`
                    )
                  }
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">No transactions</p>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
