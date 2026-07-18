import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Foundry Dashboard",
  description: "The internal operating system for Foundry Labs",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="forge-scope">
      <div className="forge-atmosphere" aria-hidden />
      <AppShell>{children}</AppShell>
    </div>
  );
}
