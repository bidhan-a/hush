import React from "react";

const Footer = () => {
  return (
    <footer className="border-t border-gray-800 py-6">
      <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
        <p>
          Hush is a decentralized protocol for private transactions on Solana.
        </p>
        <p className="mt-2">
          It utilizes zero-knowledge proofs to ensure transaction privacy.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
