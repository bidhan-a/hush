import React from "react";
import { LockIcon } from "lucide-react";

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
            <button className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              Connect Wallet
            </button>
            <button className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
              Devnet
            </button>
          </div>
        </div>
      </header>
    </nav>
  );
};

export default Navbar;
