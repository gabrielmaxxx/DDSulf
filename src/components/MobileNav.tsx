import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calculator, 
  Wallet, 
  ClipboardCheck, 
  Package,
  BrainCircuit
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

const mobileItems = [
  { title: 'Home', icon: LayoutDashboard, path: '/' },
  { title: 'IA', icon: BrainCircuit, path: '/ai' },
  { title: 'Calc', icon: Calculator, path: '/calculator' },
  { title: '💰', icon: Wallet, path: '/financial' },
  { title: 'Box', icon: Package, path: '/inventory' },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t border-[#E5E7EB] z-50 px-6 flex items-center justify-between pb-4">
      {mobileItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link 
            key={item.path} 
            to={item.path}
            className="relative flex flex-col items-center justify-center gap-1 min-w-[50px]"
          >
            <div className={cn(
              "p-2 rounded-xl transition-all duration-300",
              isActive ? "bg-black text-white shadow-lg -translate-y-1" : "text-[#9CA3AF]"
            )}>
              <item.icon className="size-5" />
            </div>
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest",
              isActive ? "text-black" : "text-[#9CA3AF] opacity-0"
            )}>
              {item.title}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
