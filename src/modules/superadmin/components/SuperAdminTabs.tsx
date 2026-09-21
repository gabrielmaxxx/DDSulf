import React from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { Activity, Building2 } from 'lucide-react';

export interface SuperAdminTabsProps {
  activeTab: 'dashboard' | 'empresas';
  onTabChange: (tab: 'dashboard' | 'empresas') => void;
  empresasCount: number;
  dashboardContent: React.ReactNode;
  empresasContent: React.ReactNode;
}

export function SuperAdminTabs({
  activeTab,
  onTabChange,
  empresasCount,
  dashboardContent,
  empresasContent,
}: SuperAdminTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(val) => onTabChange(val as 'dashboard' | 'empresas')}
      className="w-full space-y-6"
    >
      <div className="flex overflow-x-auto p-1 bg-slate-900/90 border border-slate-800 rounded-2xl w-fit max-w-full">
        <TabsList className="h-10 bg-transparent p-0 gap-1">
          <TabsTrigger
            value="dashboard"
            id="tab-superadmin-dashboard"
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-400 hover:text-slate-200 flex items-center gap-2 cursor-pointer"
          >
            <Activity className="size-4" />
            Visão Geral da Plataforma
          </TabsTrigger>

          <TabsTrigger
            value="empresas"
            id="tab-superadmin-empresas"
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-400 hover:text-slate-200 flex items-center gap-2 cursor-pointer"
          >
            <Building2 className="size-4" />
            Empresas Cadastradas ({empresasCount})
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="dashboard" className="outline-none m-0">
        {dashboardContent}
      </TabsContent>

      <TabsContent value="empresas" className="outline-none m-0">
        {empresasContent}
      </TabsContent>
    </Tabs>
  );
}

export default SuperAdminTabs;
