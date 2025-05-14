import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Navbar from "@/components/navbar";
import { AppContextProvider } from "@/context/AppContext";
import { SolanaWalletProvider } from "@/context/SolanaWalletContext";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
