import { LayoutDashboard, Calculator, Receipt, ClipboardCheck, Package, Settings, LogOut, BrainCircuit } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from './ui/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { auth } from '@/services/firebase';

const menuItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { title: 'IA Operacional', icon: BrainCircuit, path: '/ai', highlighted: true },
  { title: 'Calculadora', icon: Calculator, path: '/calculator' },
  { title: 'Financeiro', icon: Receipt, path: '/financial' },
  { title: 'POPs Operacionais', icon: ClipboardCheck, path: '/pops' },
  { title: 'Estoque', icon: Package, path: '/inventory' },
];

export function AppSidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b px-6 py-6 font-sans">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white font-display font-semibold text-sm">DD</span>
          </div>
          <div className="flex flex-col truncate">
            <span className="font-bold text-xl tracking-tight text-black leading-none">DDSulf</span>
            <span className="text-[8px] font-mono text-slate-400 mt-1 uppercase tracking-widest font-semibold">Sistema v1.0</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        <SidebarGroup>
          <div className="px-4 mb-4 mt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-0 font-mono">Operacional</span>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      render={<Link to={item.path} />}
                      isActive={isActive}
                      className={cn(
                        "transition-all duration-200 h-10 px-4 rounded-xl font-sans",
                        isActive ? "bg-slate-900 text-white font-semibold" : "text-slate-600 hover:bg-slate-100",
                        item.highlighted && !isActive && "group bg-slate-50 border border-slate-200/50"
                      )}
                      tooltip={item.title}
                    >
                      <div className={cn(
                        "transition-transform rounded-md flex items-center justify-center shrink-0 size-5.5",
                        item.highlighted && !isActive && "p-1 bg-black text-white rounded-md group-hover:scale-105 transition-transform"
                      )}>
                        <item.icon className="size-4 shrink-0" />
                      </div>
                      <span className="text-xs font-semibold tracking-tight">{item.title}</span>
                      {item.highlighted && !isActive && (
                        <div className="ml-auto text-[8px] font-bold bg-black text-white px-1.5 py-0.5 rounded font-mono uppercase tracking-wider scale-90">
                          IA
                        </div>
                      )}
                      {isActive && !item.highlighted && (
                        <div className="ml-auto size-1.5 rounded-full bg-slate-400" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  render={<Link to="/settings" />} 
                  tooltip="Configurações"
                  className="rounded-xl h-10 px-4 text-slate-500 hover:text-slate-900 font-sans font-medium"
                >
                    <Settings className="size-4 shrink-0" />
                    <span className="text-xs">Configurações</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-3 bg-slate-50/50">
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <SidebarMenuButton className="h-12 w-full justify-start gap-3 rounded-xl hover:bg-white border border-transparent hover:border-slate-200/50 hover:shadow-xs transition-all">
              <Avatar className="size-8 rounded-lg border border-slate-200">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Administrator'}`} />
                <AvatarFallback className="rounded-lg bg-slate-900 text-white font-semibold">
                  {(user?.name || 'AD').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate text-left font-sans">
                <span className="truncate font-semibold text-xs text-slate-900 leading-tight">{user?.name || 'Administrador'}</span>
                <span className="truncate text-[9px] font-mono text-slate-400 capitalize">{user?.role || 'Admin'}</span>
              </div>
              <LogOut className="ml-auto size-3.5 text-slate-400 shrink-0" />
            </SidebarMenuButton>
          } />
          <DropdownMenuContent align="end" className="w-[--radix-dropdown-menu-trigger-width] p-1.5 rounded-2xl shadow-xl border-slate-100 bg-white">
            <DropdownMenuLabel className="text-xs font-sans text-slate-500 font-normal">Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem render={<Link to="/" />} className="text-xs rounded-lg cursor-pointer h-9 px-2">
              Ver Painel Geral
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-xs text-rose-600 rounded-lg font-medium cursor-pointer h-9 px-2">
              Sair do Sistema
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
