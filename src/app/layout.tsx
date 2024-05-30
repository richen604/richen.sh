import type { Metadata } from "next";
import { Source_Code_Pro } from "next/font/google";
import "./globals.css";
import { TerminalStoreProvider } from "./_store/TerminalStoreProvider";

const source_code_pro = Source_Code_Pro({ subsets: ["latin"] });

import React from "react";
import ClientOnly from "./_store/ClientOnly";

export const metadata: Metadata = {
  title: "richen.sh",
  description: "rm -rf /",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={source_code_pro.className}>
        <ClientOnly>
          <TerminalStoreProvider>{children}</TerminalStoreProvider>
        </ClientOnly>
      </body>
    </html>
  );
}
