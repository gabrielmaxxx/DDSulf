/**
 * Premium Native-Like Mobile App Shell
 * Centers workflows, manages connection drops, notch safe margins, and inline PWA installs.
 */

import React from 'react';
import { Wifi, WifiOff, Download, RefreshCw, Smartphone } from 'lucide-react';
import { useSafeArea } from '../hooks/useSafeArea';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOfflineMobile } from '../hooks/useOfflineMobile';
import { SyncEngineService } from '../../offline/sync';

interface MobileAppShellProps {
  children: React.ReactNode;
  headerTitle?: string;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

export function MobileAppShell({ 
  children, 
  headerTitle = 'DDSulf', 
  onRefresh, 
  isRefreshing = false 
}: MobileAppShellProps) {
  const { isOnline, backlogCount, isDegraded } = useOfflineMobile();
  const { isInstallable, triggerInstall } = usePWAInstall();
  const viewport = useSafeArea();

  const handleSyncButton = async () => {
    await SyncEngineService.syncNow();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans select-none antialiased overflow-x-hidden">
      {/* Top Embedded Status Banner */}
      <header 
        className="sticky top-0 z-40 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800"
        style={{ paddingTop: `${viewport.statusBarHeight}px` }}
      >
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-neutral-950 text-base">
              D
            </div>
            <span className="font-semibold tracking-tight text-neutral-100">{headerTitle}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Refresh Icon if available */}
            {onRefresh && (
              <button 
                onClick={onRefresh}
                disabled={isRefreshing}
                className={`p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 active:scale-95 transition-all ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}

            {/* Offline Backlog Indicator */}
            {backlogCount > 0 && (
              <button 
                onClick={handleSyncButton}
                className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-amber-500/20 active:scale-95 transition-all animate-pulse"
              >
                <span>{backlogCount} pendentes</span>
              </button>
            )}

            {/* Realtime Connection Status Dot */}
            <div className="flex items-center gap-1.5 bg-neutral-950/40 border border-neutral-800/80 rounded-full px-2.5 py-1">
              {isOnline ? (
                <>
                  <Wifi className={`w-3.5 h-3.5 ${isDegraded ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
                  <span className="text-[10px] font-semibold text-neutral-400 tracking-wider">
                    {isDegraded ? 'SINAL FRÁCIL' : 'ONLINE'}
                  </span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-rose-400 tracking-wider">OFFLINE</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* PWA Direct Contextual Install Banner */}
      {isInstallable && (
        <div className="mx-4 mt-3 bg-gradient-to-r from-emerald-500/20 to-neutral-900 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500 text-neutral-950">
              <Smartphone className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-neutral-100">Instalar DDSulf</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">Operação ágil em campo com acesso ultra veloz offline.</p>
            </div>
          </div>
          <button 
            onClick={triggerInstall}
            className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition-all shadow-md shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar</span>
          </button>
        </div>
      )}

      {/* Primary Page Canvas */}
      <main className="flex-1 pb-24 overflow-y-auto px-4 pt-4 max-w-md mx-auto w-full">
        {children}
      </main>
    </div>
  );
}

export default MobileAppShell;
