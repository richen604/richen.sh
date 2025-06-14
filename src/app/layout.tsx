import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { TerminalStoreProvider } from "./providers/TerminalStoreProvider";

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
