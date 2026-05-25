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
}

const DEFAULT_SETTINGS: SettingsData = {
  companyName: 'DDSulf Dedetizadora',
  cnpj: '00.000.000/0001-00',
  address: 'Rua Principal, 100 - Bairro Industrial',
  cityState: 'Passo Fundo / RS',
  phone: '(54) 3333-4444',
  minMargin: 35,
  monthlyServiceTarget: 150,
  costPerKm: 2.50
};

export function SettingsPage() {
  const { settings: globalSettings, updateSettings } = useSystemStore();
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);

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
          cityState: `${globalSettings.city || 'Passo Fundo'} / ${globalSettings.state || 'RS'}`,
          phone: globalSettings.phone || DEFAULT_SETTINGS.phone,
          minMargin: globalSettings.operationalGoals?.minimumMarginPercent ?? DEFAULT_SETTINGS.minMargin,
          monthlyServiceTarget: globalSettings.operationalGoals?.targetServicesPerMonth ?? DEFAULT_SETTINGS.monthlyServiceTarget,
          costPerKm: globalSettings.operationalGoals?.costPerKm ?? DEFAULT_SETTINGS.costPerKm
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
            costPerKm: settings.costPerKm
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
