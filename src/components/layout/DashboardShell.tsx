import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileTabBar } from "./MobileTabBar";

/** Shell for Home / My Books / Stats — sidebar on lg+, bottom tab bar below it. */
export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col gap-6 bg-bg text-ink lg:flex-row lg:gap-8">
      <Sidebar />
      <main className="min-w-0 flex-1">{children}</main>
      <MobileTabBar />
    </div>
  );
}
