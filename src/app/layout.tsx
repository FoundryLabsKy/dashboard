import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
});

const splineMono = Spline_Sans_Mono({
  variable: "--font-spline-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Foundry Dashboard",
  description: "The internal operating system for Foundry Labs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${instrument.variable} ${splineMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="forge-atmosphere" aria-hidden />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
