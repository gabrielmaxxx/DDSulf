import React from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  LayoutDashboard,
  ScanLine,
  History,
  ShoppingCart,
  FileSpreadsheet,
} from 'lucide-react';
import { InventoryTabType } from '../types';

interface InventoryTabsProps {
  activeTab: InventoryTabType;
  onTabChange: (tab: InventoryTabType) => void;
  purchasesCount: number;
  dashboardContent: React.ReactNode;
  uploadContent: React.ReactNode;
  movementsContent: React.ReactNode;
  purchasesContent: React.ReactNode;
  supplierContent: React.ReactNode;
}

export function InventoryTabs({
  activeTab,
  onTabChange,
  purchasesCount,
  dashboardContent,
  uploadContent,
  movementsContent,
  purchasesContent,
  supplierContent,
}: InventoryTabsProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => onTabChange(v as InventoryTabType)}
      className="space-y-6 w-full"
    >
      <div className="flex overflow-x-auto p-1 bg-slate-100/70 border border-slate-200/60 rounded-2xl w-fit">
        <TabsList className="h-10 bg-transparent p-0 gap-1">
          <TabsTrigger
            value="dashboard"
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all data-[state=active]:bg-[#1B3A2D] data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
          >
            <LayoutDashboard className="size-3.5" />
            Painel Central
          </TabsTrigger>

          <TabsTrigger
            value="upload_entry"
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all data-[state=active]:bg-[#1B3A2D] data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
          >
            <ScanLine className="size-3.5" />
            Scanner Inteligente (Upload)
          </TabsTrigger>

          <TabsTrigger
            value="movements_log"
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all data-[state=active]:bg-[#1B3A2D] data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
          >
            <History className="size-3.5" />
            Timeline de Movimentações
          </TabsTrigger>

          <TabsTrigger
            value="purchase_requisitions"
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all data-[state=active]:bg-[#1B3A2D] data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
          >
            <ShoppingCart className="size-3.5" />
            Requisições de Compra
            {purchasesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-500/20 text-emerald-800 rounded-full text-[10px] font-black">
                {purchasesCount}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger
            value="supplier_import"
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all data-[state=active]:bg-[#1B3A2D] data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
          >
            <FileSpreadsheet className="size-3.5" />
            Orçamentos de Fornecedor
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="dashboard" className="mt-0 focus-visible:outline-none">
        {dashboardContent}
      </TabsContent>

      <TabsContent value="upload_entry" className="mt-0 focus-visible:outline-none">
        {uploadContent}
      </TabsContent>

      <TabsContent value="movements_log" className="mt-0 focus-visible:outline-none">
        {movementsContent}
      </TabsContent>

      <TabsContent value="purchase_requisitions" className="mt-0 focus-visible:outline-none">
        {purchasesContent}
      </TabsContent>

      <TabsContent value="supplier_import" className="mt-0 focus-visible:outline-none">
        {supplierContent}
      </TabsContent>
    </Tabs>
  );
}
