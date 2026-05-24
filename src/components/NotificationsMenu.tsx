import React, { useState } from 'react';
import { Bell, Check, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  time: Date;
  read: boolean;
}

export function NotificationsMenu() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Estoque Baixo',
      message: 'Fluon-100 está abaixo do limite de segurança.',
      type: 'warning',
      time: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
      read: false
    },
    {
      id: '2',
      title: 'Procedimento POP Criado',
      message: 'O POP para Desinsetização de Baratas foi atualizado.',
      type: 'success',
      time: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      read: false
    },
    {
      id: '3',
      title: 'Sincronização offline realizada',
      message: 'Todos os registros de campo foram sincronizados localmente.',
      type: 'info',
      time: new Date(Date.now() - 1000 * 60 * 600), // 10 hours ago
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <Popover>
      <PopoverTrigger render={
        <Button 
          variant="ghost" 
          size="icon-sm"
          className="relative text-slate-500 hover:text-black hover:bg-slate-100 rounded-lg size-10 flex items-center justify-center transition-colors"
        >
          <Bell className="size-4.5" />
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
          )}
        </Button>
      } />
      <PopoverContent align="end" className="w-80 p-0 rounded-2xl border-slate-100 shadow-xl bg-white z-50">
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center gap-1.5">
            <h4 className="font-sans font-semibold text-sm text-slate-900">Notificações</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-slate-100 text-slate-800 text-[10px] h-4.5 py-0 px-1.5 font-semibold">
                {unreadCount} novas
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead} 
              className="text-xs text-slate-500 hover:text-black font-medium transition-colors"
            >
              Marcar lidas
            </button>
          )}
        </div>
        <Separator />
        
        <div className="max-h-[300px] overflow-y-auto no-scrollbar py-1">
          {notifications.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400">
              <Check className="size-8 stroke-[1.5] mb-2 text-slate-300" />
              <p className="text-xs font-medium font-sans">Tudo limpo por aqui!</p>
              <p className="text-[10px] text-slate-400">Nenhuma notificação encontrada.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n.id} 
                onClick={() => handleMarkRead(n.id)}
                className={`flex gap-3 p-3.5 hover:bg-slate-50/50 cursor-pointer transition-all border-b border-slate-100/30 relative ${!n.read ? 'bg-slate-50/30' : ''}`}
              >
                {!n.read && (
                  <div className="absolute left-1.5 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-rose-500" />
                )}
                <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                  n.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                  n.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  <AlertCircle className="size-4" />
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className={`text-xs font-sans font-semibold truncate ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>
                    {n.title}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-normal">
                    {n.message}
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono">
                    {formatDistanceToNow(n.time, { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2 bg-slate-50/50 rounded-b-2xl">
              <button
                onClick={handleClearAll}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold text-slate-500 hover:text-black transition-colors"
              >
                <Trash2 className="size-3.5" />
                Limpar todas as notificações
              </button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
