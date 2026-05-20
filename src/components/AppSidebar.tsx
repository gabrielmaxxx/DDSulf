import { LayoutDashboard, Calculator, Receipt, ClipboardCheck, Package, History, Settings, LogOut, Menu, UserCircle, BrainCircuit } from 'lucide-react';
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
  { title: 'Histórico', icon: History, path: '/history' },
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
            <div className="w-4 h-4 border-2 border-white rotate-45"></div>
          </div>
          <div className="flex flex-col truncate">
            <span className="font-bold text-xl tracking-tight text-black">DDSulf</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        <SidebarGroup>
          <div className="px-4 mb-4 mt-2">
            <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest px-0">Operacional</span>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      render={<Link to={item.path} />}
                      isActive={isActive}
                      className={cn(
                        "transition-all duration-200 h-11 px-4 rounded-md",
                        isActive ? "bg-[#F3F4F6] text-black font-semibold" : "text-[#4B5563] hover:bg-[#F9FAFB]",
                        item.highlighted && !isActive && "group"
                      )}
                      tooltip={item.title}
                    >
                      <div className={cn(
                        "transition-transform",
                        item.highlighted && !isActive && "p-1 bg-black text-white rounded group-hover:scale-105 transition-transform"
                      )}>
                        <item.icon className="size-4 shrink-0" />
                      </div>
                      <span className="text-sm font-medium">{item.title}</span>
                      {item.highlighted && isActive && (
                        <div className="ml-auto size-1.5 rounded-full bg-black" />
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
                <SidebarMenuButton render={<Link to="/settings" />} tooltip="Configurações">
                    <Settings className="size-5" />
                    <span>Configurações</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <SidebarMenuButton className="h-12 w-full justify-start gap-3">
              <Avatar className="size-8 rounded-lg">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} />
                <AvatarFallback className="rounded-lg">{user?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate text-left">
                <span className="truncate font-semibold text-sm">{user?.name}</span>
                <span className="truncate text-xs text-muted-foreground uppercase">{user?.role}</span>
              </div>
              <LogOut className="ml-auto size-4 opacity-50" />
            </SidebarMenuButton>
          } />
          <DropdownMenuContent align="end" className="w-[--radix-dropdown-menu-trigger-width]">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link to="/profile" />}>
              Ver Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              Sair do Sistema
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
