import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthProvider as EnterpriseAuthProvider } from '@/auth/providers/AuthProvider';
import { ThemeProvider } from './ThemeProvider';
import { QueryProvider } from './QueryProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { OrganizationalProvider } from '@/organization';

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <EnterpriseAuthProvider>
          <AuthProvider>
            <OrganizationalProvider>
              <TooltipProvider>
                {children}
              </TooltipProvider>
            </OrganizationalProvider>
          </AuthProvider>
        </EnterpriseAuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}

