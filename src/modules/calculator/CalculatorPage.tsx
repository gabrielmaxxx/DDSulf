import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  MapPin, 
  Zap, 
  Repeat, 
  Users,
  Target,
  LayoutGrid,
  Maximize,
  ShieldAlert,
  FileText,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useCalculatorLogic } from './hooks/useCalculatorLogic';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';

type Step = 1 | 2 | 3;

export function CalculatorPage() {
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [clientName, setClientName] = useState('');
  const { user } = useAuth();
  
  const { state, pricing } = useCalculatorLogic();

  const handleSave = async () => {
    if (!clientName) {
      toast.error('Informe o nome do cliente para salvar o orçamento.');
      return;
    }

    setSaving(true);
    try {
      const quoteData = {
        clientName,
        clientId: 'manual-entry',
        pestType: state.pestType,
        environmentType: state.environmentType,
        areaSize: state.areaSize,
        infestationLevel: state.infestationLevel,
        operationalComplexity: state.complexity,
        recurrence: state.recurrence,
        urgency: state.urgency,
        displacement: state.displacement,
        estimatedTime: pricing.estimatedTime,
        suggestedPrice: pricing.suggestedPrice,
        estimatedCost: pricing.estimatedCost,
        estimatedMargin: pricing.estimatedMargin,
        suggestedTeam: pricing.suggestedTeam,
        status: 'Rascunho',
        createdBy: user?.uid || 'anonymous',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp()
      };

      await addDoc(collection(db, 'quotes'), quoteData);
      toast.success('Orçamento salvo com sucesso!');
      setStep(1);
      setClientName('');
    } catch (error) {
      console.error('Error saving quote:', error);
      toast.error('Erro ao salvar orçamento.');
    } finally {
      setSaving(false);
    }
  };

  const getAlert = () => {
    if (pricing.estimatedMargin < 30) {
      return {
        type: 'error',
        title: 'Margem Crítica',
        message: 'A margem estimada está abaixo do mínimo aceitável (30%). Considere revisar os custos ou aumentar o preço.',
        icon: ShieldAlert,
        color: 'text-rose-600 bg-rose-50 border-rose-100'
      };
    }
    if (state.displacement > 50) {
      return {
        type: 'warning',
        title: 'Deslocamento Elevado',
        message: 'O custo de deslocamento impacta severamente a operação. Verifique se há técnicos na região.',
        icon: AlertCircle,
        color: 'text-amber-600 bg-amber-50 border-amber-100'
      };
    }
    return null;
  };

  const activeAlert = getAlert();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-black tracking-tightest text-black">Calculadora de Orçamento</h1>
        <p className="text-[#6B7280] font-medium text-lg">Fluxo operacional inteligente para precificação premium.</p>
      </header>

      {/* Stepper Indicator */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <StepIndicator current={step} step={1} label="Contexto" />
        <div className="w-12 h-px bg-[#E5E7EB]" />
        <StepIndicator current={step} step={2} label="Operação" />
        <div className="w-12 h-px bg-[#E5E7EB]" />
        <StepIndicator current={step} step={3} label="Resultado" />
      </div>

      <div className="min-h-[600px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <OptionCard 
                  label="Tipo de Praga" 
                  value={state.pestType} 
                  options={['Baratas', 'Ratos', 'Cupins', 'Formigas', 'Escorpiões', 'Pulgas', 'Mosquitos', 'Percevejos']} 
                  onChange={state.setPestType}
                  icon={Target}
                />
                <OptionCard 
                  label="Ambiente" 
                  value={state.environmentType} 
                  options={['Residência', 'Comércio', 'Indústria', 'Restaurante', 'Condomínio', 'Hospital', 'Área Externa']} 
                  onChange={state.setEnvironmentType}
                  icon={LayoutGrid}
                />
                
                <div className="md:col-span-2 space-y-6">
                   <div className="bg-white border border-[#E5E7EB] p-8 rounded-3xl shadow-sm space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="space-y-1 flex-1">
                          <Label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em]">Área Total do Ambiente</Label>
                          <div className="flex items-center gap-3">
                            <Maximize className="size-6 text-[#D1D5DB]" />
                            <Input 
                              type="number" 
                              value={state.areaSize} 
                              onChange={(e) => state.setAreaSize(Number(e.target.value))} 
                              className="w-full border-none text-4xl font-black p-0 h-auto focus-visible:ring-0 shadow-none"
                            />
                            <span className="text-4xl font-black text-[#D1D5DB]">m²</span>
                          </div>
                          <input 
                            type="range" 
                            min="10" 
                            max="2000" 
                            step="10" 
                            value={state.areaSize}
                            onChange={(e) => state.setAreaSize(Number(e.target.value))}
                            className="w-full mt-4 accent-black"
                          />
                        </div>
                        
                        <div className="h-20 w-px bg-[#F3F4F6] hidden md:block" />

                        <div className="space-y-4">
                          <Label className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em]">Grau de Infestação</Label>
                          <div className="flex gap-2">
                            {['Baixo', 'Médio', 'Alto', 'Crítico'].map((opt) => (
                              <button
                                key={opt}
                                onClick={() => state.setInfestationLevel(opt as any)}
                                className={cn(
                                  "px-6 py-4 rounded-2xl text-xs font-bold border transition-all flex flex-col items-center gap-1",
                                  state.infestationLevel === opt ? "bg-black text-white border-black shadow-lg scale-105" : "bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB] hover:border-black"
                                )}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={() => setStep(2)} className="h-16 px-10 bg-black text-white font-black uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all active:scale-95 shadow-xl text-xs">
                  Detalhes Operacionais <ArrowRight className="ml-2 size-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white border border-[#E5E7EB] p-8 rounded-3xl shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-[#F3F4F6] rounded-xl">
                        <MapPin className="size-5 text-black" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Deslocamento</span>
                        <span className="text-xs font-bold text-black">Distância da Sede</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        value={state.displacement} 
                        onChange={(e) => state.setDisplacement(Number(e.target.value))}
                        className="w-20 font-black text-right border-none focus-visible:ring-0 shadow-none text-2xl h-auto p-0"
                      />
                      <span className="font-bold text-[#D1D5DB] text-xl">Km</span>
                    </div>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="150" 
                    value={state.displacement}
                    onChange={(e) => state.setDisplacement(Number(e.target.value))}
                    className="w-full accent-black"
                  />
                </div>

                <div className="bg-white border border-[#E5E7EB] p-8 rounded-3xl shadow-sm space-y-6">
                   <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-[#F3F4F6] rounded-xl">
                          <Repeat className="size-5 text-black" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Frequência</span>
                          <span className="text-xs font-bold text-black">Modelo de Contrato</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                         {['Único', 'Mensal', 'Trimestral', 'Semestral'].map(r => (
                           <button 
                            key={r}
                            onClick={() => state.setRecurrence(r as any)}
                            className={cn(
                              "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                              state.recurrence === r ? "bg-black border-black text-white shadow-md" : "bg-white border-[#E5E7EB] text-[#6B7280]"
                            )}
                           >
                            {r}
                           </button>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="bg-white border border-[#E5E7EB] p-8 rounded-3xl shadow-sm space-y-6">
                  <div className="flex flex-col gap-4">
                     <div className="flex items-center gap-3">
                        <div className="p-3 bg-[#F3F4F6] rounded-xl">
                          <Zap className="size-5 text-black" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Nível de Urgência</span>
                          <span className="text-xs font-bold text-black">Impacto no Agendamento</span>
                        </div>
                     </div>
                     <div className="grid grid-cols-3 gap-2">
                        {['Normal', 'Prioritário', 'Emergência'].map(u => (
                          <button 
                            key={u}
                            onClick={() => state.setUrgency(u as any)}
                            className={cn(
                              "py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
                              state.urgency === u ? "bg-black border-black text-white shadow-md" : "bg-white border-[#E5E7EB] text-[#6B7280]"
                            )}
                          >
                            {u}
                          </button>
                        ))}
                     </div>
                  </div>
                </div>

                <div className="bg-white border border-[#E5E7EB] p-8 rounded-3xl shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-[#F3F4F6] rounded-xl">
                        <Users className="size-5 text-black" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">Equipe Sugerida</span>
                        <span className="text-xs font-bold text-black">Total de Técnicos</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <button onClick={() => state.setTechnicians(Math.max(1, state.technicians - 1))} className="size-10 rounded-full border border-[#E5E7EB] flex items-center justify-center font-bold hover:bg-[#F3F4F6] text-xl">-</button>
                       <span className="font-black text-3xl w-8 text-center">{state.technicians}</span>
                       <button onClick={() => state.setTechnicians(state.technicians + 1)} className="size-10 rounded-full border border-[#E5E7EB] flex items-center justify-center font-bold hover:bg-[#F3F4F6] text-xl">+</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={() => setStep(1)} className="h-16 font-black uppercase tracking-widest text-[10px] text-[#6B7280]">
                  <ArrowLeft className="mr-2 size-4" /> Voltar
                </Button>
                <Button onClick={() => setStep(3)} className="h-16 px-10 bg-black text-white font-black uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all active:scale-95 shadow-xl text-xs">
                  Processar Precificação <ArrowRight className="ml-2 size-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="grid gap-8 md:grid-cols-12">
                <div className="md:col-span-8 flex flex-col gap-8">
                  <Card className="bg-white border-[#E5E7EB] shadow-2xl rounded-[32px] overflow-hidden">
                    <div className="p-10 border-b border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em]">Simulação Concluída</div>
                          <h2 className="text-2xl font-black text-black">Análise Operacional DDSulf</h2>
                        </div>
                        <ShieldAlert className="size-8 text-black opacity-10" />
                    </div>
                    <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.3em] opacity-60">Valor Final Sugerido</div>
                        <div className="text-8xl font-black text-black tracking-tightest">R$ {pricing.suggestedPrice.toFixed(0)},00</div>
                        
                        <div className="w-full max-w-md mt-16 space-y-8">
                          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                              <span className="text-[#9CA3AF]">Custo Operacional Total</span>
                              <span className="text-black font-black">R$ {pricing.estimatedCost.toFixed(2)}</span>
                          </div>
                          <div className="space-y-3">
                             <div className="h-2 w-full bg-[#F3F4F6] rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pricing.estimatedMargin}%` }}
                                  className={cn(
                                    "h-full rounded-full transition-all duration-1000",
                                    pricing.estimatedMargin < 30 ? "bg-rose-500" : "bg-black"
                                  )}
                                />
                             </div>
                             <div className="flex items-center justify-between">
                                <span className={cn(
                                  "text-[10px] font-black uppercase tracking-widest",
                                  pricing.estimatedMargin < 30 ? "text-rose-600" : "text-[#6B7280]"
                                )}>Margem Bruta Estimada</span>
                                <span className={cn(
                                  "text-3xl font-black",
                                  pricing.estimatedMargin < 30 ? "text-rose-600" : "text-emerald-600"
                                )}>{pricing.estimatedMargin.toFixed(1)}%</span>
                             </div>
                          </div>
                        </div>
                    </div>
                  </Card>
                  
                  {activeAlert && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn("p-6 rounded-3xl border flex items-start gap-4", activeAlert.color)}
                    >
                      <activeAlert.icon className="size-6 shrink-0 mt-1" />
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm uppercase tracking-wider">{activeAlert.title}</h4>
                        <p className="text-sm font-medium opacity-80 leading-relaxed">{activeAlert.message}</p>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="md:col-span-4 space-y-6">
                   <div className="bg-white border border-[#E5E7EB] p-8 rounded-3xl space-y-6 shadow-sm">
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em]">Identificação do Orçamento</Label>
                        <Input 
                          placeholder="Nome do Cliente / Empresa" 
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="h-14 border-[#E5E7EB] focus-visible:ring-black font-bold text-lg rounded-xl"
                        />
                      </div>
                      
                      <div className="pt-4 space-y-3">
                        <Button 
                          onClick={handleSave}
                          disabled={saving}
                          className="w-full h-14 bg-black text-white hover:bg-black/90 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          {saving ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
                          Salvar Orçamento Oficial
                        </Button>
                        <Button variant="outline" className="w-full h-14 border-[#E5E7EB] text-black font-bold text-[10px] uppercase tracking-widest rounded-2xl transition-all active:scale-95">
                          Gerar Proposta em PDF
                        </Button>
                      </div>
                   </div>

                   <div className="bg-black text-white p-8 rounded-3xl space-y-8 border-none shadow-2xl relative overflow-hidden">
                      <div className="relative z-10 space-y-6">
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Tempo Estimado</div>
                          <div className="text-4xl font-black">{pricing.estimatedTime.toFixed(1)} <span className="text-xl opacity-60">horas</span></div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Equipe Ideal</div>
                          <div className="text-4xl font-black">{pricing.suggestedTeam} <span className="text-xl opacity-60">técnicos</span></div>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                          <p className="text-[10px] opacity-40 font-medium leading-relaxed italic">
                            "Procurar maximizar a produtividade através da densidade de rotas na região de {state.displacement}km."
                          </p>
                        </div>
                      </div>
                      <div className="absolute -bottom-10 -right-10 size-40 bg-white/5 rounded-full blur-3xl" />
                   </div>
                </div>
              </div>

              <div className="flex justify-center pt-8">
                <Button variant="ghost" onClick={() => setStep(1)} className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.3em] hover:text-black">
                  Reiniciar Simulação Operacional
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepIndicator({ current, step, label }: { current: number, step: number, label: string }) {
  const active = current >= step;
  
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={cn(
        "size-12 rounded-2xl flex items-center justify-center transition-all duration-700 font-black text-base border-2",
        active ? "bg-black border-black text-white shadow-xl scale-110" : "bg-white border-[#E5E7EB] text-[#D1D5DB]"
      )}>
        {current > step ? <Check className="size-6" /> : step}
      </div>
      <span className={cn(
        "text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
        active ? "text-black" : "text-[#9CA3AF]"
      )}>
        {label}
      </span>
    </div>
  );
}

function OptionCard({ label, value, options, onChange, icon: Icon }: { label: string, value: string, options: string[], onChange: (v: any) => void, icon: any }) {
  return (
    <div className="bg-white border border-[#E5E7EB] p-8 rounded-[32px] shadow-sm space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-[#F3F4F6] rounded-xl">
          <Icon className="size-5 text-black" />
        </div>
        <Label className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em]">{label}</Label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              "p-4 rounded-2xl text-left transition-all border group relative overflow-hidden",
              value === opt ? "bg-black border-black shadow-lg" : "bg-white border-[#E5E7EB] hover:border-black"
            )}
          >
            <span className={cn(
              "text-xs font-black leading-tight block relative z-10",
              value === opt ? "text-white" : "text-[#111827]"
            )}>
              {opt}
            </span>
            {value === opt && (
              <motion.div 
                layoutId={`active-${label}`}
                className="absolute inset-0 bg-black"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

