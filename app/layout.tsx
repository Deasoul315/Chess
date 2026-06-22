import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chess",
  description: "Chess",
};

import "@mantine/core/styles.css";

import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import { theme } from "@/shared/constants/constants";
import { MatchContextProvider } from "@/shared/contexts/Match";
import Shell from "@/shared/components/Shell/Shell";
import { UserDataContextProvider } from "@/shared/contexts/UserData";
import LocalQueryClientProvider from "@/shared/lib/tanstack";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      {...mantineHtmlProps}
    >
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <ColorSchemeScript></ColorSchemeScript>
      </head>
      <body className="min-h-full flex flex-col">
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <LocalQueryClientProvider>
            <UserDataContextProvider>
              <MatchContextProvider>
                <Shell>{children}</Shell>
              </MatchContextProvider>
            </UserDataContextProvider>
          </LocalQueryClientProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
