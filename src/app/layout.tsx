import type { Metadata } from "next";
import { Source_Code_Pro } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { TerminalStoreProvider } from "./providers/TerminalStoreProvider";

const source_code_pro = Source_Code_Pro({ subsets: ["latin"] });

const myFont = localFont({
  src: "../../public/Gohu.ttf",
  display: "swap",
  variable: "--font-gohu",
});

import React from "react";
import ClientOnly from "./hooks/ClientWrapper";

export const metadata: Metadata = {
  title: "richen.sh",
  description: "rm -rf /",
};

console.log(myFont);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={myFont.className}>
        <ClientOnly>
          <TerminalStoreProvider>{children}</TerminalStoreProvider>
        </ClientOnly>
      </body>
    </html>
  );
}
