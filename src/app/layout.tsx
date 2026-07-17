import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";

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

const SITE_URL = "https://foundrylabs.ky";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Foundry Labs — Websites & hosting for Cayman businesses",
    template: "%s · Foundry Labs",
  },
  description:
    "Foundry Labs builds and hosts fast, modern websites for small businesses in Grand Cayman — beautifully designed, fully managed, and priced better than anyone on the island.",
  keywords: [
    "Cayman Islands web design",
    "Grand Cayman website",
    "website hosting Cayman",
    "small business websites",
    "Foundry Labs",
  ],
  authors: [{ name: "Foundry Labs" }],
  openGraph: {
    type: "website",
    locale: "en_KY",
    url: SITE_URL,
    siteName: "Foundry Labs",
    title: "Foundry Labs — Websites & hosting for Cayman businesses",
    description:
      "Beautiful, fast websites for Grand Cayman businesses. Designed, built, and hosted for you — for less than you'd expect.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Foundry Labs — Websites & hosting for Cayman businesses",
    description:
      "Beautiful, fast websites for Grand Cayman businesses. Designed, built, and hosted for you — for less than you'd expect.",
  },
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
        {children}
      </body>
    </html>
  );
}
