/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AppSidebar } from '@/components/AppSidebar';
import { MobileNav } from '@/components/MobileNav';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

// Pages - I'll create these files soon
import { DashboardPage } from '@/modules/dashboard/DashboardPage';
import { CalculatorPage } from '@/modules/calculator/CalculatorPage';
import { FinancialPage } from '@/modules/financial/FinancialPage';
import { POPsPage } from '@/modules/pops/POPsPage';
import { InventoryPage } from '@/modules/inventory/InventoryPage';
import { HistoryPage } from '@/modules/dashboard/HistoryPage';
import { AIPage } from '@/modules/ai/AIPage';
import { LoginPage } from '@/modules/auth/LoginPage';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#F9FAFB] font-sans selection:bg-black selection:text-white">
        <AppSidebar />
        <SidebarInset className="flex flex-col bg-transparent pb-20 md:pb-0">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-white/80 backdrop-blur-md px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-1 text-[#6B7280] hover:text-black transition-colors" />
              <div className="h-4 w-px bg-[#E5E7EB]" />
              <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
                <span className="text-black">DDSulf</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Servidor Online</span>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto px-4 py-8 md:px-10">
            <div className="mx-auto max-w-6xl">
              {children}
            </div>
          </main>
          <MobileNav />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
            <Route path="/calculator" element={<ProtectedLayout><CalculatorPage /></ProtectedLayout>} />
            <Route path="/financial" element={<ProtectedLayout><FinancialPage /></ProtectedLayout>} />
            <Route path="/pops" element={<ProtectedLayout><POPsPage /></ProtectedLayout>} />
            <Route path="/inventory" element={<ProtectedLayout><InventoryPage /></ProtectedLayout>} />
            <Route path="/history" element={<ProtectedLayout><HistoryPage /></ProtectedLayout>} />
            <Route path="/ai" element={<ProtectedLayout><AIPage /></ProtectedLayout>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <Toaster />
      </TooltipProvider>
    </AuthProvider>
  );
}
