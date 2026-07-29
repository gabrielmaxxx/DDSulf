/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Vercel build fix
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AppProvider } from './providers/AppProvider';
import { AppShell } from '@/components/AppShell';
import { useSystemStore } from '@/store/systemStore';

// Pages - I'll create these files soon
import { DashboardPage } from '@/modules/dashboard/DashboardPage';
import { CalculatorPage } from '@/modules/calculator/CalculatorPage';
import { FinancialPage } from '@/modules/financial/FinancialPage';
import { POPsPage } from '@/modules/pops/POPsPage';
import { InventoryPage } from '@/modules/inventory/InventoryPage';
import { AIPage } from '@/modules/ai/AIPage';
import { SettingsPage } from '@/modules/settings/SettingsPage';
import { ServicoConfirmacaoPage } from '@/modules/confirmacoes/ServicoConfirmacaoPage';
import { AgendaPage } from '@/modules/agenda/AgendaPage';
import { ClientesPage } from '@/modules/clientes/ClientesPage';
import { FuncionariosPage } from '@/modules/funcionarios/FuncionariosPage';

import { AuthGuard } from '@/auth/guards/AuthGuard';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useSystemStore.getState().checkContractRenewals();
  }, []);

  return (
    <AuthGuard>
      <AppShell>
        <div className="flex-1 w-full bg-transparent overflow-y-auto">
          {children}
        </div>
      </AppShell>
    </AuthGuard>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Navigate to="/" replace />} />
          
          <Route path="/" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
          <Route path="/calculator" element={<ProtectedLayout><CalculatorPage /></ProtectedLayout>} />
          <Route path="/financial" element={<ProtectedLayout><FinancialPage /></ProtectedLayout>} />
          <Route path="/pops" element={<ProtectedLayout><POPsPage /></ProtectedLayout>} />
          <Route path="/inventory" element={<ProtectedLayout><InventoryPage /></ProtectedLayout>} />
          <Route path="/confirmacoes" element={<ProtectedLayout><ServicoConfirmacaoPage /></ProtectedLayout>} />
          <Route path="/agenda" element={<ProtectedLayout><AgendaPage /></ProtectedLayout>} />
          <Route path="/clientes" element={<ProtectedLayout><ClientesPage /></ProtectedLayout>} />
          <Route path="/funcionarios" element={<ProtectedLayout><FuncionariosPage /></ProtectedLayout>} />
          <Route path="/ai" element={<ProtectedLayout><AIPage /></ProtectedLayout>} />
          <Route path="/settings" element={<ProtectedLayout><SettingsPage /></ProtectedLayout>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" duration={4000} />
    </AppProvider>
  );
}
