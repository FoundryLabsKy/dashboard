"use client";

import { ToastProvider } from "@/components/ui/Toast";
import { DataProvider } from "@/hooks/useCompanies";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <DataProvider>
        <Sidebar />
        <main className="min-h-screen px-4 pt-2 pb-24 sm:px-6 lg:ml-64 lg:px-10 lg:pt-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </DataProvider>
    </ToastProvider>
  );
}
