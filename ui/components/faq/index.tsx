import { useState } from "react";
import { HelpCircle, X } from "lucide-react";

const FAQ = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* FAQ Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-4 bottom-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-3 shadow-lg transition-all duration-300 cursor-pointer"
        aria-label="Open FAQ"
      >
        <HelpCircle size={24} />
      </button>

      {/* FAQ Slider */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full overflow-y-auto p-6 text-white">
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>

          {/* FAQ Content */}
          <div className="space-y-6 mt-8">
            <h2 className="text-2xl font-semibold mb-6">FAQ</h2>

            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold text-emerald-400 mb-2">
                  How to Deposit
                </h3>
                <div className="space-y-2 text-gray-300">
                  <p>1. Connect your Solana wallet</p>
                  <p>2. Select a pool</p>
                  <p>3. Switch to the &quot;Deposit&quot; tab</p>
                  <p>4. Generate a deposit note</p>
                  <p>5. Save your deposit note securely</p>
                  <p>
                    6. Click &quot;Deposit&quot; and approve the transaction
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-emerald-400 mb-2">
                  How to Withdraw
                </h3>
                <div className="space-y-2 text-gray-300">
                  <p>1. Connect your Solana wallet</p>
                  <p>2. Select a pool</p>
                  <p>3. Switch to the &quot;Withdraw&quot; tab</p>
                  <p>4. Enter the recipient address</p>
                  <p>5. Enter your deposit note</p>
                  <p>
                    6. Click &quot;Withdraw&quot; and approve the transaction
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-emerald-400 mb-2">
                  Important Notes
                </h3>
                <div className="space-y-2 text-gray-300">
                  <p>• Keep your deposit note secure</p>
                  <p>• Each note can only be used once</p>
                  <p>• Transactions cannot be reversed</p>
                </div>
              </section>

              <div className="mt-8 pt-4 border-t border-gray-700">
                <p className="text-sm text-yellow-400">
                  ⚠️ This application is currently only available on Solana
                  Devnet. Please use the{" "}
                  <a
                    href="https://faucet.solana.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-yellow-300"
                  >
                    faucet
                  </a>{" "}
                  to get some devnet SOL.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQ;
