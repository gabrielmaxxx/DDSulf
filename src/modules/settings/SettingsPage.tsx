import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Building2, Settings2, ShieldCheck, Landmark, Compass, PhoneCall, Sliders, Target, DollarSign, Check } from 'lucide-react';
import { useSystemStore } from '@/store';

interface SettingsData {
  companyName: string;
  cnpj: string;
  address: string;
  cityState: string;
  phone: string;
  minMargin: number;
  monthlyServiceTarget: number;
  costPerKm: number;
  variableExpensesPercent: number;
  minMarginPercent: number;
  targetMarginPercent: number;
  costPerHour: number;
  equipmentAmortization: number;
}

const DEFAULT_SETTINGS: SettingsData = {
  companyName: 'DDSulf Dedetizadora',
  cnpj: '00.000.000/0001-00',
  address: 'Rua 33, 120 - Vila Santa Cecília, Volta Redonda - RJ',
  cityState: 'Volta Redonda / RJ',
  phone: '(24) 3344-5566',
  minMargin: 35,
  monthlyServiceTarget: 120,
  costPerKm: 2.40,
  variableExpensesPercent: 15,
  minMarginPercent: 20,
  targetMarginPercent: 35,
  costPerHour: 45,
  equipmentAmortization: 35
};

export function SettingsPage() {
  const { settings: globalSettings, updateSettings, resetSystemData } = useSystemStore();
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Load from localStorage on mount, falling back to global settings
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ddsulf_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed
        });
      } else if (globalSettings) {
        setSettings({
          companyName: globalSettings.companyName || DEFAULT_SETTINGS.companyName,
          cnpj: globalSettings.cnpj || DEFAULT_SETTINGS.cnpj,
          address: globalSettings.headquartersAddress || DEFAULT_SETTINGS.address,
          cityState: `${globalSettings.city || 'Volta Redonda'} / ${globalSettings.state || 'RJ'}`,
          phone: globalSettings.phone || DEFAULT_SETTINGS.phone,
          minMargin: globalSettings.operationalGoals?.minimumMarginPercent ?? DEFAULT_SETTINGS.minMargin,
          monthlyServiceTarget: globalSettings.operationalGoals?.targetServicesPerMonth ?? DEFAULT_SETTINGS.monthlyServiceTarget,
          costPerKm: globalSettings.operationalGoals?.costPerKm ?? DEFAULT_SETTINGS.costPerKm,
          variableExpensesPercent: globalSettings.operationalGoals?.variableExpensesPercent ?? DEFAULT_SETTINGS.variableExpensesPercent,
          minMarginPercent: globalSettings.operationalGoals?.minMarginPercent ?? DEFAULT_SETTINGS.minMarginPercent,
          targetMarginPercent: globalSettings.operationalGoals?.targetMarginPercent ?? DEFAULT_SETTINGS.targetMarginPercent,
          costPerHour: globalSettings.operationalGoals?.costPerHour ?? DEFAULT_SETTINGS.costPerHour,
          equipmentAmortization: globalSettings.operationalGoals?.equipmentAmortization ?? DEFAULT_SETTINGS.equipmentAmortization
        });
      }
    } catch (e) {
      console.error('Error loading settings', e);
    }
  }, [globalSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      minMargin: parseInt(e.target.value) || 0
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    setTimeout(() => {
      try {
        // Save to localStorage
        localStorage.setItem('ddsulf_settings', JSON.stringify(settings));

        // Sync with useSystemStore
        const parts = settings.cityState.split('/');
        const city = parts[0]?.trim() || '';
        const stateArg = parts[1]?.trim() || '';

        updateSettings({
          companyName: settings.companyName,
          cnpj: settings.cnpj,
          headquartersAddress: settings.address,
          city,
          state: stateArg,
          phone: settings.phone,
          operationalGoals: {
            targetServicesPerMonth: settings.monthlyServiceTarget,
            minimumMarginPercent: settings.minMargin,
            costPerKm: settings.costPerKm,
            variableExpensesPercent: settings.variableExpensesPercent,
            minMarginPercent: settings.minMarginPercent,
            targetMarginPercent: settings.targetMarginPercent,
            costPerHour: settings.costPerHour,
            equipmentAmortization: settings.equipmentAmortization
          }
        });

        toast.success('Configurações salvas!', {
          description: 'Os parâmetros operacionais foram atualizados com sucesso.',
        });
      } catch (err) {
        toast.error('Erro ao salvar as configurações.');
      } finally {
        setSaving(false);
      }
    }, 600);
  };


  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="size-2 bg-black rounded-full" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Painel Administrativo</span>
          </div>
          <h1 className="text-5xl font-black tracking-tightest text-black">Configurações do Sistema</h1>
          <p className="text-xl text-[#6B7280] font-medium max-w-2xl">Defina as diretrizes financeiras, teto operacional e informações cadastrais da empresa.</p>
        </div>
      </header>

      <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
        {/* Seção 1 — Empresa */}
        <Card className="bg-white border-[#E5E7EB] shadow-sm rounded-[32px] p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="p-2.5 bg-slate-100 rounded-xl">
              <Building2 className="size-5 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-black text-black">Seção 1 — Empresa</h3>
              <p className="text-xs text-gray-400">Dados do cadastro geral da dedetizadora usados em orçamentos, relatórios e automações.</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                <Building2 className="size-3" /> Nome da Empresa
              </label>
              <input
                type="text"
                name="companyName"
                required
                value={settings.companyName}
                onChange={handleChange}
                placeholder="Ex: DDSulf Dedetizadora Ltda"
                className="w-full h-11 border border-gray-200 rounded-xl px-4 text-xs font-semibold focus:outline-hidden focus:border-black transition-all bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                <Landmark className="size-3" /> CNPJ
              </label>
              <input
                type="text"
                name="cnpj"
                required
                value={settings.cnpj}
                onChange={handleChange}
                placeholder="Ex: 00.000.000/0001-00"
                className="w-full h-11 border border-gray-200 rounded-xl px-4 text-xs font-semibold focus:outline-hidden focus:border-black transition-all bg-white"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                <Compass className="size-3" /> Endereço da Sede (usado para cálculo de rotas operacionais)
              </label>
              <input
                type="text"
                name="address"
                required
                value={settings.address}
                onChange={handleChange}
                placeholder="Rua, número, bairro..."
                className="w-full h-11 border border-gray-200 rounded-xl px-4 text-xs font-semibold focus:outline-hidden focus:border-black transition-all bg-white"
              />
            </div>

            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cidade / Estado</label>
                <input
                  type="text"
                  name="cityState"
                  required
                  value={settings.cityState}
                  onChange={handleChange}
                  placeholder="Cidade / UF"
                  className="w-full h-11 border border-gray-200 rounded-xl px-4 text-xs font-semibold focus:outline-hidden focus:border-black transition-all bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                  <PhoneCall className="size-3" /> Telefone
                </label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={settings.phone}
                  onChange={handleChange}
                  placeholder="Telefone"
                  className="w-full h-11 border border-gray-200 rounded-xl px-4 text-xs font-semibold focus:outline-hidden focus:border-black transition-all bg-white"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Seção 2 — Operacional */}
        <Card className="bg-white border-[#E5E7EB] shadow-sm rounded-[32px] p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="p-2.5 bg-slate-100 rounded-xl">
              <Sliders className="size-5 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-black text-black">Seção 2 — Operacional</h3>
              <p className="text-xs text-gray-400">Metas operacionais inteligentes e premissas financeiras de trânsito e lucratividade.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                  <Sliders className="size-3" /> Margem mínima desejada
                </label>
                <span className="text-sm font-black text-black bg-slate-100 px-3 py-1 rounded-lg">
                  {settings.minMargin}%
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-slate-400">10%</span>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="1"
                  value={settings.minMargin}
                  onChange={handleSliderChange}
                  className="flex-1 accent-black h-1 bg-gray-150 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10px] font-bold text-slate-400">90%</span>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                  <Target className="size-3" /> Meta de Serviços por Mês
                </label>
                <input
                  type="number"
                  name="monthlyServiceTarget"
                  required
                  min="1"
                  value={settings.monthlyServiceTarget}
                  onChange={handleChange}
                  placeholder="Insira a meta numérica"
                  className="w-full h-11 border border-gray-200 rounded-xl px-4 text-xs font-semibold focus:outline-hidden focus:border-black transition-all bg-white"
                />
                <span className="text-[9px] text-[#9CA3AF] block font-mono">Usado para cálculo de metas diárias de produtividade</span>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                  <DollarSign className="size-3" /> Custo Médio por KM Rodado (R$)
                </label>
                <input
                  type="number"
                  name="costPerKm"
                  required
                  step="0.01"
                  min="0"
                  value={settings.costPerKm}
                  onChange={handleChange}
                  placeholder="Insira o valor em R$"
                  className="w-full h-11 border border-gray-200 rounded-xl px-4 text-xs font-semibold focus:outline-hidden focus:border-black transition-all bg-white"
                />
                <span className="text-[9px] text-[#9CA3AF] block font-mono">Calculado automaticamente nas rotas de deslocamentos operacionais</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Seção 3 — Configurações de Precificação — Markup */}
        <Card className="bg-white border-[#E5E7EB] shadow-sm rounded-[32px] p-8 space-y-6" id="pricing-markup-section">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="p-2.5 bg-slate-100 rounded-xl">
              <DollarSign className="size-5 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-black text-black">Seção 3 — Configurações de Precificação e Markup</h3>
              <p className="text-xs text-gray-400">Configure as alíquotas, taxas e parâmetros de cálculo para precificar seus serviços automaticamente.</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Esquerda: Campos do Formulário */}
            <div className="space-y-4">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                  Impostos e taxas sobre faturamento (%)
                </label>
                <input
                  type="number"
                  name="variableExpensesPercent"
                  required
                  min="0"
                  max="50"
                  step="0.01"
                  value={settings.variableExpensesPercent}
                  onChange={handleChange}
                  placeholder="Ex: 15"
                  className="w-full h-11 border border-gray-200 rounded-xl px-4 text-xs font-semibold focus:outline-hidden focus:border-black transition-all bg-white text-black"
                />
                <span className="text-[9px] text-[#9CA3AF] block font-mono">Inclui Simples Nacional, ISS, comissões. (Faixa: 0 a 50%)</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                    Margem lucro mínima (%)
                  </label>
                  <input
                    type="number"
                    name="minMarginPercent"
                    required
                    min="0"
                    max="80"
                    step="0.1"
                    value={settings.minMarginPercent}
                    onChange={handleChange}
                    placeholder="Ex: 20"
                    className="w-full h-11 border border-gray-200 rounded-xl px-4 text-xs font-semibold focus:outline-hidden focus:border-black transition-all bg-white text-black"
                  />
                  <span className="text-[9px] text-[#9CA3AF] block font-mono">Gera alerta abaixo disto.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                    Margem lucro alvo (%)
                  </label>
                  <input
                    type="number"
                    name="targetMarginPercent"
                    required
                    min="0"
                    max="80"
                    step="0.1"
                    value={settings.targetMarginPercent}
                    onChange={handleChange}
                    placeholder="Ex: 35"
                    className="w-full h-11 border border-gray-200 rounded-xl px-4 text-xs font-semibold focus:outline-hidden focus:border-black transition-all bg-white text-black"
                  />
                  <span className="text-[9px] text-[#9CA3AF] block font-mono">Margem ideal de ganho.</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                  Custo por hora de técnico (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 font-mono">R$</span>
                  <input
                    type="number"
                    name="costPerHour"
                    required
                    min="0"
                    step="0.01"
                    value={settings.costPerHour}
                    onChange={handleChange}
                    placeholder="Ex: 45.00"
                    className="w-full h-11 border border-gray-200 rounded-xl pl-10 pr-4 text-xs font-semibold focus:outline-hidden focus:border-black transition-all bg-white text-black"
                  />
                </div>
                <span className="text-[9px] text-[#9CA3AF] block font-mono">Salário + encargos / horas trabalhadas.</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                    Custo por km (R$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 font-mono">R$</span>
                    <input
                      type="number"
                      name="costPerKm"
                      required
                      min="0"
                      step="0.01"
                      value={settings.costPerKm}
                      onChange={handleChange}
                      placeholder="Ex: 2.40"
                      className="w-full h-11 border border-gray-200 rounded-xl pl-10 pr-4 text-xs font-semibold focus:outline-hidden focus:border-black transition-all bg-white text-black"
                    />
                  </div>
                  <span className="text-[9px] text-[#9CA3AF] block font-mono">Deslocamento técnico.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                    Custo equipamentos/serviço (R$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 font-mono">R$</span>
                    <input
                      type="number"
                      name="equipmentAmortization"
                      required
                      min="0"
                      step="0.01"
                      value={settings.equipmentAmortization}
                      onChange={handleChange}
                      placeholder="Ex: 35.00"
                      className="w-full h-11 border border-gray-200 rounded-xl pl-10 pr-4 text-xs font-semibold focus:outline-hidden focus:border-black transition-all bg-white text-black"
                    />
                  </div>
                  <span className="text-[9px] text-[#9CA3AF] block font-mono">EPIs e pulverizadores.</span>
                </div>
              </div>

            </div>

            {/* Direita: Pré-visualização do Markup */}
            <div className="flex flex-col justify-between bg-slate-50 border border-slate-100 rounded-2xl p-6 relative overflow-hidden">
              <div className="space-y-4 z-10">
                <div className="flex items-center gap-1.5 text-[#1B3A2D] font-bold text-xs uppercase tracking-wider">
                  <Sliders className="size-4 animate-pulse" />
                  Markup em Tempo Real
                </div>

                {(() => {
                  const dv = settings.variableExpensesPercent ?? 15;
                  const mlAlvo = settings.targetMarginPercent ?? 35;
                  const markupDivisor = 1 - (dv + mlAlvo) / 100;
                  const markupMultiplicador = markupDivisor > 0 ? 1 / markupDivisor : 0;

                  return (
                    <>
                      <div className="space-y-4 py-2">
                        <div className="flex justify-between items-center border-b border-slate-200/50 pb-3">
                          <span className="text-xs font-bold text-[#6B6B5F]">Markup Divisor:</span>
                          <span className="font-mono text-xs font-bold text-[#141410] bg-white border border-slate-200/60 px-2 py-1 rounded">
                            {`1 - (${dv}% + ${mlAlvo}%) = ${markupDivisor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                          </span>
                        </div>

                        <div className="flex justify-between items-center border-b border-slate-200/50 pb-3">
                          <span className="text-xs font-bold text-[#6B6B5F]">Markup Multiplicador:</span>
                          <span className="font-mono text-base font-black text-[#2D6A4F] bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-xl">
                            {markupMultiplicador.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}×
                          </span>
                        </div>
                      </div>

                      <div className="bg-[#1B3A2D] text-[#A8CDB8] p-4 rounded-xl text-xs font-semibold leading-relaxed space-y-1">
                        <p className="text-white text-sm font-bold flex items-center gap-1">
                          <Check className="size-4 text-emerald-400 shrink-0" />
                          Regra Multiplicadora Aplicada
                        </p>
                        <p className="text-xs">
                          {`Para cada R$1,00 de custo, cobrar R$ ${markupMultiplicador.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="text-[10px] text-slate-400 leading-relaxed mt-4 pt-4 border-t border-slate-200/50">
                O markup divisor é obtido por: <code className="bg-slate-100 font-mono px-1 rounded">1 - (%DV + %ML_alvo)</code>. Multiplicando as despesas diretas pelo inverso desse divisor, você obtém o preço de venda técnico correto.
              </div>
              <div className="absolute -bottom-16 -right-16 size-48 bg-emerald-100/20 rounded-full blur-2xl pointer-events-none" />
            </div>

          </div>
        </Card>

        {/* Zona de Perigo */}
        <Card className="border border-red-200 bg-red-50/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-red-700">
            <span className="text-lg">⚠️</span>
            <span className="text-xs font-black uppercase tracking-widest font-display">ZONA DE PERIGO — APAGAR DADOS</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-red-900">Zerar Todos os Dados do Sistema e POPs</h3>
              <p className="text-xs text-red-700 font-medium">Isso apagará permanentemente todos os orçamentos, procedimentos POPs, estoque de produtos, histórico de movimentações e lançamentos financeiros.</p>
            </div>
            <div className="shrink-0">
              {!showConfirmReset ? (
                <Button
                  type="button"
                  onClick={() => setShowConfirmReset(true)}
                  className="bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-xl h-11 px-5 transition-all text-center cursor-pointer shadow-sm"
                >
                  Zerar Dados & POPs
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => {
                      resetSystemData();
                      // Clear settings inside setSettings & localStorage as well
                      localStorage.removeItem('ddsulf_settings');
                      setSettings(DEFAULT_SETTINGS);
                      setShowConfirmReset(false);
                      toast.success('Todos os dados foram completamente apagados!', {
                        description: 'Orçamentos, POPs, Estoque, Movimentações e Históricos foram zerados.',
                      });
                    }}
                    className="bg-red-800 hover:bg-red-900 text-white font-black text-xs uppercase tracking-widest rounded-xl h-11 px-5 transition-all text-center cursor-pointer shadow-md"
                  >
                    Confirmar Exclusão?
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowConfirmReset(false)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-850 font-bold text-xs rounded-xl h-11 px-4 transition-all text-center cursor-pointer"
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Submit action */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Button
            type="submit"
            disabled={saving}
            className="h-14 bg-black text-white hover:bg-zinc-800 font-black text-xs uppercase tracking-widest rounded-2xl px-10 transition-all active:scale-95 flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            {saving ? (
              <>Salvando...</>
            ) : (
              <>
                <Check className="size-4" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
