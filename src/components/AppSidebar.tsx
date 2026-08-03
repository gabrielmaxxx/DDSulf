import { 
  Shield, 
  LayoutDashboard, 
  Calculator, 
  Receipt, 
  ClipboardCheck, 
  Package, 
  Settings, 
  LogOut, 
  BrainCircuit, 
  CheckSquare, 
  CalendarDays, 
  Users 
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from './ui/Sidebar';
import { useAuth } from '@/auth/hooks/useAuth';
import { useSystemStore } from '@/store/systemStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function AppSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { quotes } = useSystemStore();
  const pendingCount = (quotes?.list || []).filter(q => q.status === 'enviado' || q.status === 'aprovado').length;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Error logging out:", e);
    }
  };

  const currentCompanyName = user?.name || user?.empresaId || 'PestFlow';

  const mainGroup = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { title: 'IA Operacional', icon: BrainCircuit, path: '/ai', aiBadge: true },
    { title: 'Financeiro', icon: Receipt, path: '/financial' },
  ];

  const operationGroup = [
    { title: 'Calculadora', icon: Calculator, path: '/calculator' },
    { title: 'Agenda e Serviços', icon: CalendarDays, path: '/agenda' },
    { title: 'Confirmações (OS)', icon: ClipboardCheck, path: '/confirmacoes' },
    { title: 'Clientes', icon: Users, path: '/clientes' },
    { title: 'Equipe e Técnicos', icon: Users, path: '/funcionarios' },
    { title: 'POPs e Procedimentos', icon: CheckSquare, path: '/pops' },
    { title: 'Estoque', icon: Package, path: '/inventory' },
  ];

  const configGroup = [
    { title: 'Configurações', icon: Settings, path: '/settings' },
  ];

  const renderMenuItem = (item: { title: string; icon: any; path: string; aiBadge?: boolean }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    return (
      <SidebarMenuItem key={item.path}>
        <SidebarMenuButton
          render={<Link to={item.path} />}
          isActive={isActive}
          className={cn(
            "transition-all duration-200 h-12 w-full flex items-center px-4 rounded-xl cursor-pointer border border-transparent font-semibold tracking-wide text-sm select-none",
            isActive
              ? "bg-white text-[#1B3A2D] shadow-md shadow-emerald-950/20 hover:bg-white hover:text-[#1B3A2D]"
              : "bg-transparent text-white hover:bg-white/10 text-white/90 hover:text-white"
          )}
          tooltip={item.title}
        >
          <Icon className={cn("size-5 shrink-0 transition-colors", isActive ? "text-[#1B3A2D]" : "text-white/80")} />
          <span className="ml-3 text-sm truncate">{item.title}</span>
          {(item.path === '/agenda' || item.path === '/confirmacoes') && pendingCount > 0 && (
            <span className={cn(
              "ml-auto text-[10px] font-black px-2 py-0.5 rounded-full transition-all shrink-0",
              isActive ? "bg-[#1B3A2D] text-white" : "bg-rose-500 text-white"
            )}>
              {pendingCount}
            </span>
          )}
          {item.aiBadge && (
            <span className="ml-auto inline-flex items-center justify-center shrink-0">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4A017] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4A017]"></span>
              </span>
              <span className={cn(
                "text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded-md",
                isActive 
                  ? "bg-[#D4A017] text-white" 
                  : "bg-[#D4A017]/20 text-[#D4A017] border border-[#D4A017]/30"
              )}>
                IA
              </span>
            </span>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="bg-gradient-to-b from-[#1B3A2D] to-[#12271E] border-r border-[#2D6A4F]/20 text-[#E8F4EE]">
      {/* Top Sidebar: Padding 32px top (pt-8), 24px horizontal (px-6) */}
      <SidebarHeader className="px-6 pt-8 pb-6 bg-transparent">
        <div className="flex items-center gap-3.5 overflow-hidden">
          <div className="relative size-11 shrink-0 rounded-xl overflow-hidden bg-emerald-950/60 border border-emerald-500/30 p-1.5 shadow-md shadow-emerald-950/30 flex items-center justify-center">
            <img src="/brand/logo-icon.svg" alt="PestFlow" className="size-full object-contain" />
          </div>
          <div className="flex flex-col truncate text-left">
            <span className="font-sans font-black text-xl text-white tracking-wide leading-tight">PestFlow</span>
            <span className="text-[10px] font-bold text-[#82B29D] tracking-wide uppercase font-mono mt-0.5">
              Sistema Operacional Inteligente
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-transparent px-4 py-4 space-y-6">
        {/* GRUPO PRINCIPAL */}
        <SidebarGroup className="p-0 space-y-2">
          <div className="px-3">
            <span className="text-[10px] font-bold text-[#82B29D] uppercase tracking-wider font-sans">
              Principal
            </span>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {mainGroup.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Separator Line */}
        <div className="h-px bg-[#2D6A4F]/20 mx-2" />

        {/* GRUPO OPERAÇÃO */}
        <SidebarGroup className="p-0 space-y-2">
          <div className="px-3">
            <span className="text-[10px] font-bold text-[#82B29D] uppercase tracking-wider font-sans">
              Operação
            </span>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {operationGroup.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Separator Line */}
        <div className="h-px bg-[#2D6A4F]/20 mx-2" />

        {/* GRUPO CONFIGURAÇÕES */}
        <SidebarGroup className="p-0 space-y-2">
          <div className="px-3">
            <span className="text-[10px] font-bold text-[#82B29D] uppercase tracking-wider font-sans">
              Configurações
            </span>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {configGroup.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer Slack-style */}
      <SidebarFooter className="bg-transparent p-4 mt-auto">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 text-[#E8F4EE] shadow-inner gap-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="size-10 rounded-xl border-2 border-[#D4A017] shrink-0 bg-emerald-950/20">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentCompanyName}`} />
              <AvatarFallback className="rounded-xl bg-[#2D6A4F] text-white font-bold text-xs">
                {currentCompanyName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate text-left">
              <span className="truncate font-bold text-xs text-white leading-tight">
                {user?.name || currentCompanyName}
              </span>
              <span className="truncate text-[10px] font-semibold text-[#82B29D] mt-0.5 capitalize leading-none">
                {user?.role || 'Gestor'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sair do Sistema"
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/10 hover:text-rose-400 text-white/80 transition-all cursor-pointer shrink-0 border border-white/10 hover:border-rose-500/30"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
