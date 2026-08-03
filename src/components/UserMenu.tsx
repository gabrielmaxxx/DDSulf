import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, User as UserIcon, ShieldAlert, CheckCircle, Smartphone } from 'lucide-react';
import { useAuth } from '@/auth/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function UserMenu() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button variant="ghost" className="relative size-10 rounded-full shrink-0 p-0 overflow-hidden focus-visible:ring-black">
          <Avatar className="size-10 rounded-full border border-slate-200 hover:scale-105 transition-transform">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Administrator'}`} />
            <AvatarFallback className="rounded-full font-mono bg-slate-900 text-white font-semibold">
              {(user?.name || 'AD').substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      } />
      <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-2xl border-slate-100 shadow-xl bg-white z-50">
        <DropdownMenuLabel className="p-2 pb-1 font-sans">
          <div className="flex flex-col space-y-0.5">
            <span className="font-semibold text-sm text-slate-900 leading-tight">{user?.name || 'Coordenador Operacional'}</span>
            <span className="text-xs text-slate-500 font-mono truncate leading-none">{user?.email || 'operador@pestflow.com'}</span>
          </div>
        </DropdownMenuLabel>
        
        <div className="px-2 py-1.5 flex flex-wrap gap-1">
          <span className="text-[9px] font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded-md uppercase font-mono tracking-wider">
            {user?.role || 'Admin'}
          </span>
          <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md uppercase font-mono tracking-wider flex items-center gap-0.5">
            <CheckCircle className="size-2.5" /> Sincronizado
          </span>
        </div>
        
        <DropdownMenuSeparator className="bg-slate-100/80 my-1" />
        
        <DropdownMenuItem render={
          <Link to="/" className="w-full h-9 rounded-lg px-2 flex items-center gap-2 text-xs text-slate-700 hover:text-black cursor-pointer">
            <UserIcon className="size-4 opacity-70" />
            Minhas Atividades
          </Link>
        } />

        <DropdownMenuItem render={
          <Link to="/ai" className="w-full h-9 rounded-lg px-2 flex items-center gap-2 text-xs text-slate-700 hover:text-black cursor-pointer">
            <ShieldAlert className="size-4 text-slate-500" />
            IA Consultas
          </Link>
        } />
        
        <DropdownMenuItem render={
          <div className="w-full h-9 rounded-lg px-2 flex items-center gap-2 text-xs text-slate-700 hover:text-black cursor-not-allowed opacity-50">
            <Smartphone className="size-4" />
            Modo offline instalado
          </div>
        } />
        
        <DropdownMenuSeparator className="bg-slate-100/80 my-1" />
        
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="w-full h-9 rounded-lg px-2 flex items-center gap-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50/50 cursor-pointer font-medium"
        >
          <LogOut className="size-4 shrink-0" />
          Sair do Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
