import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { financialService } from '../services/financialService';
import { Loader2, Save, Calculator, Clock, MapPin, Percent, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

export function OperationalSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({
    costPerHour: 45,
    costPerKm: 2.5,
    minimumMargin: 30,
    baseOperationalCost: 80
  });

  useEffect(() => {
    async function load() {
      try {
        const settings = await financialService.getSettings();
        setValues({
          costPerHour: settings.costPerHour,
          costPerKm: settings.costPerKm,
          minimumMargin: settings.minimumMargin,
          baseOperationalCost: settings.baseOperationalCost
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await financialService.updateSettings(values);
      toast.success('Configurações operacionais atualizadas!');
    } catch (err) {
      toast.error('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-black rounded-2xl text-white">
            <Settings2 className="size-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-black">Inteligência de Precificação</h3>
            <p className="text-sm text-[#6B7280] font-medium">Estes valores alimentam a calculadora de orçamentos.</p>
          </div>
        </div>

        <div className="grid gap-4">
          <SettingField 
            icon={Clock} 
            label="Custo por Hora/Técnico" 
            value={values.costPerHour} 
            unit="R$/h"
            onChange={(v) => setValues(prev => ({ ...prev, costPerHour: v }))} 
          />
          <SettingField 
            icon={MapPin} 
            label="Custo por Km (Combustível/Pneus)" 
            value={values.costPerKm} 
            unit="R$/km"
            onChange={(v) => setValues(prev => ({ ...prev, costPerKm: v }))} 
          />
          <SettingField 
            icon={Calculator} 
            label="Taxa Operacional Base (Setup)" 
            value={values.baseOperationalCost} 
            unit="R$"
            onChange={(v) => setValues(prev => ({ ...prev, baseOperationalCost: v }))} 
          />
          <SettingField 
            icon={Percent} 
            label="Margem Mínima de Segurança" 
            value={values.minimumMargin} 
            unit="%"
            onChange={(v) => setValues(prev => ({ ...prev, minimumMargin: v }))} 
          />
        </div>

        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full h-14 bg-black text-white font-black uppercase tracking-widest rounded-2xl shadow-xl hover:opacity-90 active:scale-95 transition-all"
        >
          {saving ? <Loader2 className="animate-spin size-4" /> : <Save className="size-4 mr-2" />}
          Salvar Inteligência Financeira
        </Button>
      </div>

      <div className="bg-gray-50 rounded-[32px] p-8 flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-gray-200">
         <div className="size-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-black">
            <Calculator className="size-8" />
         </div>
         <div className="max-w-xs space-y-2">
            <h4 className="font-bold text-black uppercase text-[10px] tracking-[0.2em]">Otimização de Lucro</h4>
            <p className="text-sm text-[#6B7280] font-medium leading-relaxed">
              Manter estes valores atualizados garante que seus orçamentos cubram todos os custos e mantenham a viabilidade da empresa.
            </p>
         </div>
      </div>
    </div>
  );
}

function SettingField({ icon: Icon, label, value, unit, onChange }: { icon: any, label: string, value: number, unit: string, onChange: (v: number) => void }) {
  return (
    <div className="bg-white border border-[#E5E7EB] p-5 rounded-2xl flex items-center justify-between group hover:border-black transition-colors">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-[#F3F4F6] rounded-xl group-hover:bg-black group-hover:text-white transition-colors">
          <Icon className="size-4 text-gray-500 group-hover:text-white" />
        </div>
        <Label className="text-xs font-bold text-black uppercase tracking-widest">{label}</Label>
      </div>
      <div className="flex items-center gap-2">
        <Input 
          type="number" 
          value={value} 
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-20 text-right font-black border-none focus-visible:ring-0 shadow-none text-lg h-auto p-0"
        />
        <span className="text-sm font-bold text-gray-400">{unit}</span>
      </div>
    </div>
  );
}
