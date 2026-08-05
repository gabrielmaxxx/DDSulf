import React from 'react';
import { AuthProvider as EnterpriseAuthProvider } from '@/auth/providers/AuthProvider';
import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';
import { TooltipProvider } from '@/components/ui/tooltip';

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <EnterpriseAuthProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </EnterpriseAuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}


