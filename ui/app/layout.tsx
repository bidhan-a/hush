import type { Metadata } from "next";
import { Onest } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Navbar from "@/components/navbar";
import { AppContextProvider } from "@/context/AppContext";
import { SolanaWalletProvider } from "@/context/SolanaWalletContext";
import { Analytics } from "@vercel/analytics/next";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hush",
  description: "Solana privacy protocol",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${onest.variable} antialiased`}>
        <Toaster position="bottom-right" />
        <SolanaWalletProvider>
          <AppContextProvider>
            <Navbar />
            {children}
          </AppContextProvider>
        </SolanaWalletProvider>
        <Analytics />
      </body>
    </html>
  );
}
