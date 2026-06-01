import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Building2,
  Table,
  LineChart,
  Settings2,
  Trash2,
  Sparkles,
  Info,
  DollarSign,
  TrendingUp,
  Percent,
  PlayCircle,
  RotateCcw
} from 'lucide-react';
import { useSystemStore } from '@/store';
import { motion, AnimatePresence } from 'motion/react';

// Specialized sub-tabs & indicators
import { FinancialAlerts } from './components/FinancialAlerts';
import { PlanoContasTab } from './components/PlanoContasTab';
import { FinancialDashboardsTab } from './components/FinancialDashboardsTab';
import { SpreadsheetImportTab } from './components/SpreadsheetImportTab';

export function FinancialPage() {
  const { financial, updateFinancialCosts, resetSystemData } = useSystemStore();

  const [activeTab, setActiveTab] = useState<'dashboards' | 'planoContas' | 'spreadsheet_new' | 'costs'>('dashboards');

  // Form Inputs States matching pricing configuration parameters
  const [vehicleRental, setVehicleRental] = useState(financial.fixedCosts.vehicleRental || 0);
  const [salaries, setSalaries] = useState(financial.fixedCosts.salaries || 0);
  const [rent, setRent] = useState(financial.fixedCosts.rent || 0);
  const [fuel, setFuel] = useState(financial.fixedCosts.fuel || 0);
  const [insurance, setInsurance] = useState(financial.fixedCosts.insurance || 0);
  const [other, setOther] = useState(financial.fixedCosts.other || 0);

  const [productsPerService, setProductsPerService] = useState(financial.variableCosts.productsPerService || 0);
  const [laborPerHour, setLaborPerHour] = useState(financial.variableCosts.laborPerHour || 0);
  const [equipmentDepreciation, setEquipmentDepreciation] = useState(financial.variableCosts.equipmentDepreciation || 0);

  const [servicesPerMonth, setServicesPerMonth] = useState(financial.operational.servicesPerMonth || 120);
  const [avgServiceDurationHours, setAvgServiceDurationHours] = useState(financial.operational.avgServiceDurationHours || 3);
  const [minimumMarginPercent, setMinimumMarginPercent] = useState(financial.operational.minimumMarginPercent || 35);

  // Sync state when custom parameters change in store
  useEffect(() => {
    if (financial) {
      setVehicleRental(financial.fixedCosts.vehicleRental || 0);
      setSalaries(financial.fixedCosts.salaries || 0);
      setRent(financial.fixedCosts.rent || 0);
      setFuel(financial.fixedCosts.fuel || 0);
      setInsurance(financial.fixedCosts.insurance || 0);
      setOther(financial.fixedCosts.other || 0);
      setProductsPerService(financial.variableCosts.productsPerService || 0);
      setLaborPerHour(financial.variableCosts.laborPerHour || 0);
      setEquipmentDepreciation(financial.variableCosts.equipmentDepreciation || 0);
      setServicesPerMonth(financial.operational.servicesPerMonth || 120);
      setAvgServiceDurationHours(financial.operational.avgServiceDurationHours || 3);
      setMinimumMarginPercent(financial.operational.minimumMarginPercent || 35);
    }
  }, [financial]);

  const handleSaveCosts = (e: React.FormEvent) => {
    e.preventDefault();
    updateFinancialCosts({
      fixedCosts: { vehicleRental, salaries, rent, fuel, insurance, other },
      variableCosts: { productsPerService, laborPerHour, equipmentDepreciation },
      operational: { servicesPerMonth, avgServiceDurationHours, minimumMarginPercent }
    });
    toast.success('Parâmetros de custos salvos com sucesso!');
  };

  const handleResetForDemo = () => {
    if (window.confirm("🔴 APAGAR ABSOLUTAMENTE TUDO?\n\nEsta ação apagará todos os lançamentos financeiros, custos de frota, salários, precificadores e insumos de estoque para iniciar uma demonstração do absoluto zero.\n\nEsta operação é definitiva e ideal para apresentações de vendas.")) {
      resetSystemData();
      toast.success("Sistema resetado com sucesso!", {
        description: "Todos os custos e movimentações foram reduzidos a zero para sua demonstração técnica."
      });
    }
  };

  const tabsConfig = [
    { id: 'dashboards' as const, label: 'Dashboards Analíticos', icon: LineChart },
    { id: 'planoContas' as const, label: 'Plano de Contas Reconciliado', icon: Table },
    { id: 'spreadsheet_new' as const, label: 'Auditoria de Planilhas', icon: Sparkles },
    { id: 'costs' as const, label: 'Parâmetros de Precificação', icon: Settings2 }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
      
      {/* Top Header of page */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-[#E8E6E1] p-6 rounded-3xl shadow-xs">
        <div className="text-left space-y-1">
          <span className="bg-[#EBFDF5] text-[#065F46] font-bold text-[10px] px-3 py-1 rounded-md border border-[#A7F3D0] uppercase tracking-wider inline-block">
            Módulo Financeiro Integrado
          </span>
          <h1 className="font-display text-3xl font-black text-[#141410] mt-1.5">
            Plano de Contas <span className="text-[#2D6A4F] italic">Inteligente</span> (DDSulf)
          </h1>
          <p className="text-xs text-[#6B6B5F] font-semibold leading-none">
            Análise e reconciliação automática de faturamento e despesas do controle de pragas.
          </p>
        </div>

        {/* Floating Quick Action Demo Controller */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleResetForDemo}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold uppercase tracking-wider px-4 py-3 rounded-xl flex items-center gap-2 h-11 cursor-pointer transition-all"
            id="btn-demo-reset"
            title="Apaga os dados para iniciar a simulação comercial do absoluto zero"
          >
            <Trash2 className="size-4" />
            Zerar Tudo para Venda DDSulf
          </Button>
        </div>
      </div>

      {/* Reactive business signals & warning indicator blocks */}
      <FinancialAlerts />

      {/* Navigation Tabs - Pills Style */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-[#F0EDE8] rounded-2xl w-fit">
        {tabsConfig.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'bg-[#1B3A2D] text-white shadow-xs' 
                  : 'text-[#6B6B5F] hover:text-[#141410]'
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tabs Layout Handler with Motion AnimatePresence */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: DASHBOARDS */}
        {activeTab === 'dashboards' && (
          <motion.div
            key="dashboards-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            <FinancialDashboardsTab />
          </motion.div>
        )}

        {/* TAB 2: PLANO DE CONTAS */}
        {activeTab === 'planoContas' && (
          <motion.div
            key="plano-contas-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            <PlanoContasTab />
          </motion.div>
        )}

        {/* TAB 3: AUDITORIA DE PLANILHAS */}
        {activeTab === 'spreadsheet_new' && (
          <motion.div
            key="spreadsheet-import-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            <SpreadsheetImportTab />
          </motion.div>
        )}

        {/* TAB 4: MANUAL COST PRICING PARAMS FORM */}
        {activeTab === 'costs' && (
          <motion.div
            key="pricing-costs-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="grid gap-6 lg:grid-cols-12"
          >
            {/* Form Column - Left */}
            <form onSubmit={handleSaveCosts} className="lg:col-span-8 space-y-6 animate-in fade-in duration-300" id="pricing-costs-form">
              <div className="grid gap-6 md:grid-cols-2 items-start">
                
                {/* Fixed Costs Parameters */}
                <div className="bg-white rounded-2xl border border-[#E8E6E1] overflow-hidden shadow-xs">
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E8E6E1] bg-[#FAFAF9]">
                    <div className="size-8 rounded-lg bg-[#1B3A2D] flex items-center justify-center text-white font-bold">
                      $
                    </div>
                    <div>
                      <h3 className="font-bold text-[#141410] text-sm">Custos Fixos de Referência</h3>
                      <p className="text-[11px] text-[#6B6B5F]">Custos básicos estrutais para cálculo do Break-even</p>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4 text-xs">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block mb-1">Rent / Aluguel de Frota</label>
                      <input 
                        type="number"
                        min="0"
                        value={vehicleRental || ''}
                        onChange={(e) => setVehicleRental(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#FAFAF9] border border-[#E8E6E1] rounded-xl py-3 px-4 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block mb-1">Folha de Salários Totais</label>
                      <input 
                        type="number"
                        min="0"
                        value={salaries || ''}
                        onChange={(e) => setSalaries(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#FAFAF9] border border-[#E8E6E1] rounded-xl py-3 px-4 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block mb-1">Aluguel do Escritório / Sede</label>
                      <input 
                        type="number"
                        min="0"
                        value={rent || ''}
                        onChange={(e) => setRent(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#FAFAF9] border border-[#E8E6E1] rounded-xl py-3 px-4 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block mb-1">Previsão Mensal Combustíveis</label>
                      <input 
                        type="number"
                        min="0"
                        value={fuel || ''}
                        onChange={(e) => setFuel(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#FAFAF9] border border-[#E8E6E1] rounded-xl py-3 px-4 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block mb-1">Seguro de Frotas e Riscos</label>
                      <input 
                        type="number"
                        min="0"
                        value={insurance || ''}
                        onChange={(e) => setInsurance(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#FAFAF9] border border-[#E8E6E1] rounded-xl py-3 px-4 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block mb-1">Outras Taxas e Custos Diversos</label>
                      <input 
                        type="number"
                        min="0"
                        value={other || ''}
                        onChange={(e) => setOther(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#FAFAF9] border border-[#E8E6E1] rounded-xl py-3 px-4 font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Variable Costs & Operational Goals */}
                <div className="space-y-6">
                  
                  {/* Variable Costs Card */}
                  <div className="bg-white rounded-2xl border border-[#E8E6E1] overflow-hidden shadow-xs">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E8E6E1] bg-[#FAFAF9]">
                      <div className="size-8 rounded-lg bg-[#D4A017] flex items-center justify-center text-white font-bold">
                        V
                      </div>
                      <div>
                        <h3 className="font-bold text-[#141410] text-sm">Custos Variáveis por Chamado</h3>
                        <p className="text-[11px] text-[#6B6B5F]">Despesas diretas por execução da dedetização</p>
                      </div>
                    </div>

                    <div className="p-6 space-y-4 text-xs">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block mb-1">Média Insumos / Serviço (R$)</label>
                        <input 
                          type="number"
                          min="0"
                          value={productsPerService || ''}
                          onChange={(e) => setProductsPerService(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#FAFAF9] border border-[#E8E6E1] rounded-xl py-3 px-4 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block mb-1">Valor Unitário Mão de Obra Técnica / Hora</label>
                        <input 
                          type="number"
                          min="0"
                          value={laborPerHour || ''}
                          onChange={(e) => setLaborPerHour(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#FAFAF9] border border-[#E8E6E1] rounded-xl py-3 px-4 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block mb-1">Depreciação Proporcional de Equipamentos</label>
                        <input 
                          type="number"
                          min="0"
                          value={equipmentDepreciation || ''}
                          onChange={(e) => setEquipmentDepreciation(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#FAFAF9] border border-[#E8E6E1] rounded-xl py-3 px-4 font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Operational Settings Card */}
                  <div className="bg-white rounded-2xl border border-[#E8E6E1] overflow-hidden shadow-xs">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-[#E8E6E1] bg-[#FAFAF9]">
                      <div className="size-8 rounded-lg bg-zinc-800 flex items-center justify-center text-white font-bold">
                        O
                      </div>
                      <div>
                        <h3 className="font-bold text-[#141410] text-sm">Metas Operacionais DDSulf</h3>
                        <p className="text-[11px] text-[#6B6B5F]">Indicadores operacionais de referências para cálculos</p>
                      </div>
                    </div>

                    <div className="p-6 space-y-4 text-xs">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block mb-1">Quantidade Estimada Serviços / Mês</label>
                        <input 
                          type="number"
                          min="1"
                          value={servicesPerMonth || ''}
                          onChange={(e) => setServicesPerMonth(parseInt(e.target.value) || 0)}
                          className="w-full bg-[#FAFAF9] border border-[#E8E6E1] rounded-xl py-3 px-4 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block mb-1">Duração Média Atendimento (Horas)</label>
                        <input 
                          type="number"
                          min="1"
                          value={avgServiceDurationHours || ''}
                          onChange={(e) => setAvgServiceDurationHours(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#FAFAF9] border border-[#E8E6E1] rounded-xl py-3 px-4 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block mb-1">Margem Operacional Alvo Target (%)</label>
                        <input 
                          type="number"
                          min="1"
                          max="95"
                          value={minimumMarginPercent || ''}
                          onChange={(e) => setMinimumMarginPercent(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#FAFAF9] border border-[#E8E6E1] rounded-xl py-3 px-4 font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Submit trigger button */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E8E6E1]">
                <Button 
                  type="submit"
                  className="bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white px-8 py-4 text-xs uppercase tracking-wider font-extrabold rounded-xl h-11 cursor-pointer"
                >
                  Confirmar Parâmetros de Precificação
                </Button>
              </div>
            </form>

            {/* Quick documentation side panel - Right */}
            <div className="lg:col-span-4 space-y-6 text-left text-xs font-sans">
              <div className="bg-[#FAF9F5] rounded-3xl p-6 border border-[#E8E6E1] space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-[#141410] text-[13px]">Instruções de Auditoria de Custos</h4>
                  <p className="text-[11px] text-[#6B6B5F]">Esses valores definem a equação do Break-even do sistema e estabelecem a barreira de faturamento mínimo mensal da DDSulf.</p>
                </div>
                
                <div className="space-y-2 text-[#6B6B5F]">
                  <p><strong>Custo de Operação da Frota:</strong> Reúne despesas com manutenções preventivas, combustíveis semanais e seguros veiculares obrigatórios.</p>
                  <p><strong>Meta de Margem Alvo:</strong> Define o lucro líquido mínimo esperado após cobrir todos os insumos químicos estocados e despesas tributárias.</p>
                </div>

                <div className="bg-[#1B3A2D] text-white p-4 rounded-2xl flex items-start gap-2">
                  <PlayCircle className="size-5 shrink-0 text-[#A8CDB8] mt-0.5" />
                  <p className="text-[10px] font-medium leading-normal">
                    Para apresentações comerciais, certifique-se de zerar todos os parâmetros usando o painel superior para que sua audiência veja a IA categorizando em tempo real.
                  </p>
                </div>
              </div>
            </div>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
