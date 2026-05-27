import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calculator, 
  Receipt, 
  ClipboardCheck, 
  Package,
  BrainCircuit,
  CheckSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { useSystemStore } from '@/store/systemStore';

const mobileItems = [
  { title: 'Home', icon: LayoutDashboard, path: '/' },
  { title: 'IA', icon: BrainCircuit, path: '/ai', highlighted: true },
  { title: 'Calc', icon: Calculator, path: '/calculator' },
  { title: 'Confirmar', icon: ClipboardCheck, path: '/confirmacoes' },
  { title: 'Finanças', icon: Receipt, path: '/financial' },
];

export function MobileNav() {
  const location = useLocation();
  const { quotes } = useSystemStore();
  const pendingCount = (quotes?.list || []).filter(q => q.status === 'enviado' || q.status === 'aprovado').length;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-t border-slate-200/60 z-30 px-4 flex items-center justify-around pb-1 shadow-lg">
      {mobileItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link 
            key={item.path} 
            to={item.path}
            className="flex flex-col items-center justify-center gap-1.5 relative select-none"
          >
            <motion.div 
              whileTap={{ scale: 0.9 }}
              className={cn(
                "p-2 rounded-xl transition-all duration-200 relative flex items-center justify-center",
                isActive 
                  ? "text-black scale-105" 
                  : "text-slate-400 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("size-4.5", item.highlighted && isActive ? "text-emerald-500" : "")} />
              {item.path === '/confirmacoes' && pendingCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white font-bold text-[8px] size-3.5 rounded-full flex items-center justify-center leading-none">
                  {pendingCount}
                </span>
              )}
              {isActive && (
                <motion.span 
                  layoutId="activeTabIndicator"
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-slate-900"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </motion.div>
            <span className={cn(
              "text-[8px] font-semibold tracking-tight transition-all leading-none",
              isActive ? "text-slate-900 font-bold" : "text-slate-400"
            )}>
              {item.title}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
