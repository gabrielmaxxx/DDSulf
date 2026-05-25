import { Shield, LayoutDashboard, Calculator, Receipt, ClipboardCheck, Package, Settings, LogOut, BrainCircuit } from 'lucide-react';
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
import { useAuth } from '@/contexts/AuthContext';
import { useSystemStore } from '@/store/systemStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function AppSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const { currentCompany, companies } = useSystemStore();

  const handleLogout = () => {
    useSystemStore.getState().logoutCompany();
    // Simulate logging out from current account view
    window.location.reload();
  };

  const currentCompanyName = currentCompany && companies?.[currentCompany]
    ? companies[currentCompany].displayName
    : (user?.name || 'DDSulf');

  const mainGroup = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { title: 'IA Operacional', icon: BrainCircuit, path: '/ai', aiBadge: true },
  ];

  const operationGroup = [
    { title: 'Calculadora', icon: Calculator, path: '/calculator' },
    { title: 'Financeiro', icon: Receipt, path: '/financial' },
    { title: 'POPs Operacionais', icon: ClipboardCheck, path: '/pops' },
    { title: 'Estoque', icon: Package, path: '/inventory' },
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
            "transition-all duration-200 h-10 px-4 rounded-xl flex items-center gap-3 w-full border border-transparent font-medium",
            isActive
              ? "bg-white text-[#1B3A2D] font-bold shadow-md shadow-emerald-950/10 hover:bg-white hover:text-[#1B3A2D]"
              : "text-[#E8F4EE]/90 hover:bg-[#2D6A4F] hover:text-white"
          )}
          tooltip={item.title}
        >
          <Icon className={cn("size-[18px] shrink-0", isActive ? "text-[#1B3A2D]" : "text-[#E8F4EE]/85")} />
          <span className="text-xs tracking-tight">{item.title}</span>
          {item.aiBadge && (
            <span className="ml-auto flex items-center justify-center">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4A017] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4A017]"></span>
              </span>
              <span className={cn(
                "text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded-md",
                isActive 
                  ? "bg-[#D4A017] text-white" 
                  : "bg-[#D4A017] text-slate-900"
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
    <Sidebar variant="sidebar" collapsible="icon" className="bg-[#1B3A2D] border-r border-[#2D6A4F]/60 text-[#E8F4EE]">
      {/* Header with Luxury Shield Logo */}
      <SidebarHeader className="px-6 py-6 border-b border-[#2D6A4F] bg-[#1B3A2D]">
        <div className="flex items-center gap-3.5 overflow-hidden">
          <div className="relative size-10 shrink-0 flex items-center justify-center bg-[#2D6A4F]/40 border border-[#D4A017]/55 rounded-xl text-[#D4A017] shadow-lg shadow-emerald-950/20">
            <Shield className="size-6 shrink-0 fill-[#D4A017]/5" />
            <span className="absolute text-[10px] font-black tracking-tighter text-[#D4A017] select-none">DD</span>
          </div>
          <div className="flex flex-col truncate">
            <span className="font-display font-extrabold text-lg text-white tracking-wide leading-tight">DDSulf</span>
            <span className="text-[9px] font-semibold text-[#82B29D] tracking-wider uppercase font-sans mt-0.5">Centro de Inteligência</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#1B3A2D] px-2.5 py-4 space-y-4">
        {/* GROUP 1: PRINCIPAL */}
        <SidebarGroup className="p-0">
          <div className="px-4 mb-2.5">
            <span className="text-[10px] font-black text-[#82B29D] uppercase tracking-wider font-sans">
              Principal
            </span>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {mainGroup.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Separator */}
        <div className="h-px bg-[#2D6A4F] my-4 mx-2" />

        {/* GROUP 2: OPERAÇÃO */}
        <SidebarGroup className="p-0">
          <div className="px-4 mb-2.5">
            <span className="text-[10px] font-black text-[#82B29D] uppercase tracking-wider font-sans">
              Operação
            </span>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {operationGroup.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-[#1B3A2D] mt-auto">
        {/* Separator, Config & User Controls in footer */}
        <div className="h-px bg-[#2D6A4F] my-2 mx-2" />

        <SidebarGroup className="p-1">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  render={<Link to="/settings" />} 
                  tooltip="Configurações"
                  className={cn(
                    "transition-all duration-200 h-10 px-4 rounded-xl flex items-center gap-3 w-full font-medium",
                    location.pathname === '/settings'
                      ? "bg-white text-[#1B3A2D] font-bold"
                      : "text-[#E8F4EE]/90 hover:bg-[#2D6A4F]"
                  )}
                >
                  <Settings className="size-[18px] shrink-0" />
                  <span className="text-xs">Configurações</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="h-px bg-[#2D6A4F] my-2 mx-2" />

        {/* Premium User Info and Logout bar */}
        <div className="p-3 mx-2.5 mb-2.5 rounded-2xl bg-[#2D6A4F]/30 border border-[#2D6A4F]/40 flex items-center justify-between gap-3.5 shadow-sm shadow-emerald-950/15">
          <div className="flex items-center gap-3.5 min-w-0">
            <Avatar className="size-9 rounded-full border-2 border-[#D4A017] shadow-inner shrink-0 bg-emerald-950/20">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentCompanyName}`} />
              <AvatarFallback className="rounded-full bg-slate-900 text-white font-semibold">
                {currentCompanyName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate text-left">
              <span className="truncate font-bold text-xs text-white leading-tight">
                {currentCompanyName}
              </span>
              <span className="truncate text-[9px] font-medium text-[#82B29D] capitalize mt-0.5">
                {user?.role || 'Diretoria'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sair do Sistema"
            className="p-1.5 rounded-lg bg-emerald-900/40 hover:bg-[#C1361A]/20 hover:text-red-400 text-[#E8F4EE] transition-all cursor-pointer shrink-0 border border-[#2D6A4F]/50 hover:border-[#C1361A]/50"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
