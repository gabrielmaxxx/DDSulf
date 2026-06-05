import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/Sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { MobileNav } from '@/components/MobileNav';
import { NotificationsMenu } from '@/components/NotificationsMenu';
import { UserMenu } from '@/components/UserMenu';
import { useAuth } from '@/contexts/AuthContext';
import { useSystemStore } from '@/store/systemStore';
import { Search, HelpCircle, ChevronRight } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { currentCompany, companies } = useSystemStore();

  const currentCompanyName = currentCompany && companies?.[currentCompany]
    ? companies[currentCompany].displayName
    : (user?.name || 'DDSulf');

  const matchPathToName = (pathname: string) => {
    const segment = pathname.split('/').filter(Boolean)[0];
    if (!segment) return 'Dashboard';
    
    const map: Record<string, string> = {
      'calculator': 'Calculadora',
      'financial': 'Financeiro',
      'pops': 'POPs e Procedimentos',
      'inventory': 'Estoque',
      'confirmacoes': 'Confirmação de Serviços',
      'agenda': 'Agenda e Serviços',
      'clientes': 'Clientes',
      'ai': 'IA Operacional',
      'settings': 'Configurações'
    };
    
    return map[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const pathname = location.pathname;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#F8FAFC] font-sans selection:bg-black selection:text-white">
        {/* Sidebar fixa à esquerda */}
        <AppSidebar />
        
        <SidebarInset className="flex flex-col bg-[#F8FAFC] pb-20 md:pb-0 min-w-0">
          {/* HEADER GLOBAL - Altura: 72px */}
          <header className="sticky top-0 z-40 flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200/40 bg-white/85 backdrop-blur-md px-10">
            {/* Esquerda: Breadcrumb */}
            <div className="flex items-center gap-3">
              {/* SidebarTrigger para mobile */}
              <SidebarTrigger className="text-slate-500 hover:text-black hover:bg-slate-100 transition-all rounded-lg size-10 flex md:hidden items-center justify-center shrink-0" />
              
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <Link to="/" className="text-slate-400 hover:text-slate-900 transition-colors font-semibold">
                  Dashboard
                </Link>
                {pathname !== '/' && (
                  <>
                    <ChevronRight className="size-4 text-slate-300 shrink-0" />
                    <span className="text-slate-900 font-semibold font-sans truncate">
                      {matchPathToName(pathname)}
                    </span>
                  </>
                )}
              </nav>
            </div>

            {/* Centro: Espaço vazio */}
            <div className="flex-1" />

            {/* Direita: Busca Global, Notificações, Ajuda, Perfil */}
            <div className="flex items-center gap-4 shrink-0">
              {/* Busca Global: Largura 320px, Altura 44px */}
              <div className="relative w-[320px] h-[44px] hidden sm:block">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar clientes, serviços, produtos ou POPs..."
                  className="w-full h-full pl-10 pr-4 bg-slate-50 border border-slate-200 focus:border-[#1B3A2D] focus:bg-white rounded-xl text-xs placeholder:text-slate-400 outline-none transition-all"
                  id="global-search-input"
                />
              </div>

              {/* Notificações: Botão circular */}
              <div className="relative flex items-center justify-center">
                <NotificationsMenu />
              </div>

              {/* Ajuda: Botão circular */}
              <button 
                title="Ajuda"
                className="size-10 rounded-full border border-slate-200/60 bg-white text-slate-500 hover:text-black hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
              >
                <HelpCircle className="size-5" />
              </button>

              {/* Perfil: Avatar, Nome, Cargo */}
              <div className="flex items-center gap-3 border-l border-slate-200/60 pl-4">
                <div className="flex flex-col text-right hidden lg:flex">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {user?.name || currentCompanyName}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {user?.role || 'Gestor'}
                  </span>
                </div>
                
                <UserMenu />
              </div>
            </div>
          </header>

          {/* Área Principal - Padding: 40px, max-w: 1600px */}
          <main className="flex-1 flex flex-col w-full relative bg-[#F8FAFC]">
            <div className="w-full max-w-[1600px] mx-auto p-10">
              {children}
            </div>
          </main>
        </SidebarInset>

        {/* Dynamic Mobile Bottom Bar Navigation */}
        <MobileNav />
      </div>
    </SidebarProvider>
  );
}
