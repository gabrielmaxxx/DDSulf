import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/Sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { MobileNav } from '@/components/MobileNav';
import { NotificationsMenu } from '@/components/NotificationsMenu';
import { UserMenu } from '@/components/UserMenu';
import { QuickActions } from '@/components/QuickActions';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background font-sans selection:bg-black selection:text-white">
        {/* Responsive Desktop & Mobile Drawer-Sheet Sidebar */}
        <AppSidebar />
        
        <SidebarInset className="flex flex-col bg-transparent pb-20 md:pb-0">
          {/* Topbar Layout */}
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-white/70 backdrop-blur-md px-4 md:px-8">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1 text-slate-500 hover:text-black hover:bg-slate-100/55 transition-all rounded-lg size-10 flex items-center justify-center shrink-0" />
              <div className="h-4 w-px bg-border shrink-0" />
              
              <div className="flex items-center gap-2 font-display font-medium text-base tracking-tight shrink-0">
                <span className="text-black font-semibold">DDSulf</span>
                <span className="text-slate-300 font-normal">/</span>
                <span className="text-[10px] font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
                  SaaS Premium
                </span>
              </div>
            </div>

            {/* Topbar Operations, Alerts, Actions and User contextual profiles */}
            <div className="flex items-center gap-1.5 md:gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest font-mono select-none px-2 py-1 bg-slate-100/60 rounded-lg">
                <span className="size-1.5 rounded-full bg-success animate-pulse" />
                Offline Activado
              </span>
              
              <QuickActions />
              
              <NotificationsMenu />
              
              <div className="h-6 w-px bg-border hidden md:block" />
              
              <UserMenu />
            </div>
          </header>

          {/* Core dynamic content template */}
          <main className="flex-1 flex flex-col w-full relative">
            {children}
          </main>
        </SidebarInset>

        {/* Dynamic Mobile Bottom Bar Navigation */}
        <MobileNav />
      </div>
    </SidebarProvider>
  );
}
