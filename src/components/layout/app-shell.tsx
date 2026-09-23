import React from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { SidebarProvider } from "@/components/ui/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen bg-background text-foreground relative">
        {/* Floating Sidebar (Fermable & fermée par défaut) */}
        <Sidebar />

        {/* Main Content Area - Pleine largeur fluide */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Sticky Top Header */}
          <TopBar />

          {/* Dynamic Page Content */}
          <main className="flex-1 p-3 sm:p-4 md:p-6 min-w-0 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
