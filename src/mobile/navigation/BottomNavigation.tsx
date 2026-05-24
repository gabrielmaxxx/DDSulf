/**
 * High-Contrast, Thumb-Friendly Mobile Sticky Navigation Bar
 * Optimized for rapid, single-handed field navigation.
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Calculator, 
  ClipboardCheck, 
  TrendingUp, 
  Briefcase,
  Wifi, 
  WifiOff 
} from 'lucide-react';
import { MobileTab } from '../types';
import { useOfflineMobile } from '../hooks/useOfflineMobile';

interface BottomNavigationProps {
  activeTab: MobileTab;
  onChangeTab: (tab: MobileTab) => void;
}

export function BottomNavigation({ activeTab, onChangeTab }: BottomNavigationProps) {
  const { isOnline, backlogCount } = useOfflineMobile();

  const navItems = [
    { id: 'dashboard' as MobileTab, label: 'Painel', icon: LayoutDashboard },
    { id: 'calculator' as MobileTab, label: 'Calculadora', icon: Calculator },
    { id: 'workflow' as MobileTab, label: 'Vistorias', icon: ClipboardCheck },
    { id: 'financial' as MobileTab, label: 'Finanças', icon: TrendingUp },
    { id: 'pops' as MobileTab, label: 'POPs', icon: Briefcase },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-900 border-t border-neutral-800 pb-safe shadow-2xl">
      {/* High-Resolution Sync Status Strip */}
      <div className={`h-1.5 w-full transition-colors duration-500 ${isOnline ? (backlogCount > 0 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-rose-500'}`} />
      
      <div className="max-w-md mx-auto h-16 px-4 flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className="relative flex flex-col items-center justify-center w-14 h-12 transition-all active:scale-95 text-neutral-400 select-none"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-neutral-800 text-emerald-400 scale-110 shadow-md' 
                  : 'hover:text-neutral-200'
              }`}>
                <Icon className="w-5 h-5 stroke-[2.25]" />
              </div>
              <span className={`text-[10px] tracking-wide mt-1 font-medium transition-colors ${
                isActive ? 'text-emerald-400 font-semibold' : 'text-neutral-500'
              }`}>
                {item.label}
              </span>

              {/* Backlog Alert Dot Indicator */}
              {item.id === 'workflow' && backlogCount > 0 && (
                <span className="absolute top-0 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-neutral-950 animate-pulse">
                  {backlogCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </footer>
  );
}

export default BottomNavigation;
