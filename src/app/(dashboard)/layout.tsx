'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { FloatingNav } from '@/components/dashboard/floating-nav';
import { PageTransition } from '@/components/ui/motion';
import { FloatingCopilotLauncher } from '@/components/shared/floating-copilot-launcher';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-steel-950 text-foreground flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300">
        <FloatingNav />
        <Header onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {/* Floating AI Copilot Launcher */}
      <FloatingCopilotLauncher />
    </div>
  );
}
