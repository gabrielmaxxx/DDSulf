import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRealtimePricing } from '../hooks/useRealtimePricing';
import { usePricingSimulation } from '../hooks/usePricingSimulation';
import { pricingService } from '../services/pricingService';
import { PricingSteps } from './PricingSteps';
import { PricingAlert } from './PricingAlert';
import { MarginDisplay } from './MarginDisplay';
import { CostBreakdown } from './CostBreakdown';
import { CostCompositionCard } from './CostCompositionCard';
import { SimulationPanel } from './SimulationPanel';
import { PricingCard } from './PricingCard';
import { OperationalSummary } from './OperationalSummary';
import { FinancialSummary } from './FinancialSummary';
import { toast } from 'sonner';
import { 
  ArrowRight, 
  ArrowLeft, 
  Target, 
  LayoutGrid, 
  Maximize, 
  MapPin, 
  Users, 
  Zap, 
  RefreshCcw, 
  FileText 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PestType, EnvironmentType } from '@/types/database';

export function RealtimeCalculator() {
  const [step, setStep] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [scenarioName, setScenarioName] = useState('');

  const {
    state,
    inputs,
    breakdown,
    errors,
    alerts,
    resetForm
  } = useRealtimePricing();

  const {
    scenarios,
    addScenario,
    removeScenario,
    clearScenarios
  } = usePricingSimulation();

  const stepsList = [
    { number: 1, label: 'Contexto', desc: 'Praga & Dimensões' },
    { number: 2, label: 'Operação', desc: 'Logística & Insumos' },
    { number: 3, label: 'Resultados', desc: 'Preço & Margem' }
  ];

  const handleSaveQuote = async () => {
    if (!state.clientName.trim()) {
      toast.error('Informe o nome do cliente na ficha lateral antes de salvar!');
      return;
    }

    setSaving(true);
    try {
      const quoteId = await pricingService.saveQuote(inputs, breakdown);
      toast.success(`Orçamento para '${state.clientName}' salvo com sucesso!`);
      // Optional draft clean up or reset
      state.setClientName('');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao registrar orçamento. Operação salva localmente para sincronização futura.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateScenario = (name: string) => {
    addScenario(name, inputs, breakdown);
    toast.success(`Cenário '${name}' fixado para comparação!`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border border-[#E5E7EB] rounded-[32px] p-6.5 shadow-xs">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em] block leading-none">
            DDSulf Pricing Engine v4
          </span>
          <h2 className="text-3xl font-black text-black tracking-tight leading-tight">
            Calculadora Operacional e Analítica
          </h2>
          <p className="text-xs text-[#6B7280] font-medium">
            Preços matemáticos ponderados por perigos, químicos, e faturamento recorrente recorrente.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setStep(1);
            toast.info('Formulário operacional de precificação resetado.');
          }}
          className="flex items-center gap-2 border border-[#E5E7EB] hover:border-black rounded-2xl px-5 py-3 text-xs font-bold text-black bg-white transition-all select-none hover:bg-[#FAFAFA]"
        >
          <RefreshCcw className="size-3.5" /> Limpar Filtros
        </button>
      </div>

      {/* Stepper Status Indicators */}
      <PricingSteps currentStep={step} setStep={setStep} steps={stepsList} />

      {/* Error/Alert Tracker Panel */}
      {errors.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 px-5 py-4 rounded-2xl space-y-1">
          <span className="text-xs font-black uppercase tracking-wider block">Inconsistências Identificadas:</span>
          <ul className="list-disc pl-5 text-xs font-medium space-y-1">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Step controls container */}
        <div className="lg:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Base Context Inputs */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  
                  {/* Pest Selector Card */}
                  <div className="bg-white border border-[#E5E7EB] p-6.5 rounded-[32px] space-y-5 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-[#F3F4F6] rounded-xl text-black">
                        <Target className="size-5" />
                      </div>
                      <span className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em]">Praga Alvo</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {['Baratas', 'Ratos', 'Cupins', 'Formigas', 'Escorpiões', 'Pulgas', 'Mosquitos', 'Percevejos'].map((p) => (
                        <button
                          key={p}
                          onClick={() => state.setPestType(p as any)}
                          className={cn(
                            "py-3.5 px-4 rounded-2xl text-left text-xs font-black border transition-all truncate leading-tight",
                            state.pestType === p 
                              ? "bg-black text-white border-black shadow-md scale-102"
                              : "bg-white text-[#111827] border-[#E5E7EB] hover:border-black"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Environment Type Card */}
                  <div className="bg-white border border-[#E5E7EB] p-6.5 rounded-[32px] space-y-5 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-[#F3F4F6] rounded-xl text-black">
                        <LayoutGrid className="size-5" />
                      </div>
                      <span className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em]">Características do Espaço</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {['Residência', 'Comércio', 'Indústria', 'Restaurante', 'Condomínio', 'Hospital', 'Área Externa'].map((env) => (
                        <button
                          key={env}
                          onClick={() => state.setEnvironmentType(env as any)}
                          className={cn(
                            "py-3.5 px-4 rounded-2xl text-left text-xs font-black border transition-all truncate leading-tight",
                            state.environmentType === env 
                              ? "bg-black text-white border-black shadow-md scale-102"
                              : "bg-white text-[#111827] border-[#E5E7EB] hover:border-black"
                          )}
                        >
                          {env}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Area slider input */}
                  <div className="md:col-span-2 bg-white border border-[#E5E7EB] p-8 rounded-[32px] space-y-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-1.5 flex-1">
                        <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em]">Dimensão do Local</span>
                        <div className="flex items-center gap-3">
                          <Maximize className="size-6 text-[#9CA3AF]" />
                          <input
                            type="number"
                            value={state.areaSize}
                            onChange={(e) => state.setAreaSize(Math.max(1, Number(e.target.value)))}
                            className="w-full border-none text-4xl font-black p-0 h-auto focus-visible:ring-0 shadow-none outline-none focus:outline-none focus:ring-0"
                          />
                          <span className="text-4xl font-black text-[#D1D5DB]">m²</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="3000"
                          step="10"
                          value={state.areaSize}
                          onChange={(e) => state.setAreaSize(Number(e.target.value))}
                          className="w-full accent-black mt-4 cursor-pointer"
                        />
                      </div>

                      <div className="h-20 w-px bg-[#F3F4F6] hidden md:block" />

                      {/* Infestation level selector */}
                      <div className="space-y-4">
                        <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em] block">Grau de Infestação</span>
                        <div className="flex gap-2">
                          {['Baixo', 'Médio', 'Alto', 'Crítico'].map((level) => (
                            <button
                              key={level}
                              onClick={() => state.setInfestationLevel(level as any)}
                              className={cn(
                                "px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-wider border transition-all",
                                state.infestationLevel === level
                                  ? "bg-black border-black text-white shadow-lg scale-103"
                                  : "bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB] hover:border-black"
                              )}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Footer buttons Step 1 */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setStep(2)}
                    disabled={errors.length > 0}
                    className="h-16 px-10 bg-black text-white disabled:opacity-40 font-black uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all active:scale-95 shadow-lg text-xs flex items-center gap-2"
                  >
                    Prosseguir para Logística <ArrowRight className="size-4.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Logistical, recurrence & chemicals */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid gap-6 md:grid-cols-2">

                  {/* Route Distance Slider */}
                  <div className="bg-white border border-[#E5E7EB] p-6.5 rounded-[32px] space-y-4.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#F3F4F6] rounded-xl text-black">
                          <MapPin className="size-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em] block">Raio Logístico</span>
                          <span className="text-xs font-bold text-black block leading-none mt-0.5">Kilometros Ida & Volta</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={state.displacement}
                          onChange={(e) => state.setDisplacement(Math.max(0, Number(e.target.value)))}
                          className="w-16 font-black text-right border-none outline-none focus:outline-none focus:ring-0 text-xl"
                        />
                        <span className="font-extrabold text-[#D1D5DB] text-lg">Km</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="180"
                      value={state.displacement}
                      onChange={(e) => state.setDisplacement(Number(e.target.value))}
                      className="w-full accent-black cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] font-semibold text-[#9CA3AF] uppercase">
                      <span>Próximo (Sede)</span>
                      <span>Viagem Média</span>
                      <span>Fronteira Operacional</span>
                    </div>
                  </div>

                  {/* Crew technicians picker */}
                  <div className="bg-white border border-[#E5E7EB] p-6.5 rounded-[32px] space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[#F3F4F6] rounded-xl text-black">
                          <Users className="size-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em] block">Equipe de Técnicos</span>
                          <span className="text-xs font-bold text-black block leading-none mt-0.5">Total de Alocados</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => state.setTechnicians(Math.max(1, state.technicians - 1))}
                          className="size-9 rounded-full border border-[#E5E7EB] flex items-center justify-center font-bold hover:bg-[#F3F4F6] text-lg select-none"
                        >
                          -
                        </button>
                        <span className="font-black text-2xl w-6 text-center">{state.technicians}</span>
                        <button
                          onClick={() => state.setTechnicians(state.technicians + 1)}
                          className="size-9 rounded-full border border-[#E5E7EB] flex items-center justify-center font-bold hover:bg-[#F3F4F6] text-lg select-none"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#9CA3AF] font-medium leading-relaxed mt-1">
                      Nota: Cada técnico representa um acréscimo operacional direto na diária por hora de serviço.
                    </p>
                  </div>

                  {/* Recurrence Selector */}
                  <div className="bg-white border border-[#E5E7EB] p-6.5 rounded-[32px] space-y-4 shadow-sm">
                    <div>
                      <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em] block">Periodicidade do Contrato</span>
                      <span className="text-xs font-bold text-black block leading-none mt-0.5">Modelo recorrente da carteira</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {['Único', 'Mensal', 'Trimestral', 'Semestral'].map((recVal) => (
                        <button
                          key={recVal}
                          onClick={() => state.setRecurrence(recVal as any)}
                          className={cn(
                            "py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                            state.recurrence === recVal
                              ? "bg-black text-white border-black shadow-md"
                              : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-black"
                          )}
                        >
                          {recVal}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Set Urgency and Complexity levels */}
                  <div className="bg-white border border-[#E5E7EB] p-6.5 rounded-[32px] space-y-4 shadow-sm">
                    <div>
                      <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em] block">Nível de Urgência</span>
                      <span className="text-xs font-bold text-black block leading-none mt-0.5">Defina velocidade de resposta</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      {['Normal', 'Prioritário', 'Emergência'].map((urgLevel) => (
                        <button
                          key={urgLevel}
                          onClick={() => state.setUrgency(urgLevel as any)}
                          className={cn(
                            "py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-wider border transition-all",
                            state.urgency === urgLevel
                              ? "bg-black text-white border-black shadow-md"
                              : "bg-white border-[#E5E7EB] text-[#6B7280]"
                          )}
                        >
                          {urgLevel}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chemical product custom composition list */}
                  <div className="md:col-span-2">
                    <CostCompositionCard
                      chemicalDatabase={state.chemicalDatabase}
                      selectedProducts={state.selectedProducts}
                      toggleProduct={state.toggleProduct}
                      updateProductDosage={state.updateProductDosage}
                      areaSize={state.areaSize}
                    />
                  </div>

                </div>

                {/* Navigation Buttons for Step 2 */}
                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="h-16 px-6 font-black uppercase tracking-widest text-[10px] text-[#6B7280] flex items-center gap-1.5"
                  >
                    <ArrowLeft className="size-4" /> Voltar
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={errors.length > 0}
                    className="h-16 px-10 bg-black text-white disabled:opacity-40 font-black uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all active:scale-95 shadow-lg text-xs flex items-center gap-2"
                  >
                    Calcular Valores Finais <ArrowRight className="size-4.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Analytics dashboard and suggested prices */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-8"
              >
                
                {/* Financial KPI stats and summary indicators */}
                <FinancialSummary breakdown={breakdown} recurrence={state.recurrence} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Margin gauge sliders overlayed with pre-sets */}
                  <MarginDisplay
                    actualMargin={breakdown.actualMarginPercent}
                    suggestedPrice={breakdown.suggestedPrice}
                    totalCost={breakdown.totalOperationalCost}
                    customMargin={state.customMargin}
                    setCustomMargin={state.setCustomMargin}
                  />

                  {/* Detailed operational cost itemized elements */}
                  <CostBreakdown breakdown={breakdown} />
                </div>

                {/* Render evaluation system visual warnings */}
                {alerts.length > 0 && (
                  <div className="space-y-3.5">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">Recomendações e Alertas de Lucro</h5>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {alerts.map((al, idx) => (
                        <PricingAlert key={idx} alert={al} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Back controls */}
                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="h-16 px-6 font-black uppercase tracking-widest text-[10px] text-[#6B7280] flex items-center gap-1.5"
                  >
                    <ArrowLeft className="size-4" /> Ajustar Operação
                  </button>
                  <button
                    onClick={() => {
                      setStep(1);
                      toast.info('Navegando de volta ao contexto inicial.');
                    }}
                    className="border border-[#E5E7EB] hover:border-black rounded-2xl px-6 h-16 font-bold text-xs text-black"
                  >
                    Reiniciar Simulação
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Dynamic Context sidebar */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Client identification metadata profile */}
          <div className="bg-white border border-[#E5E7EB] p-6.5 rounded-[32px] space-y-4 shadow-sm">
            <div>
              <span className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em] block">
                Ficha Cadastral do Cliente
              </span>
              <span className="text-xs text-[#6B7280] font-semibold block mt-0.5">Associe um faturamento ao orçamento</span>
            </div>

            <input
              type="text"
              placeholder="Ex: Gabriel Max Pest Control S/A"
              value={state.clientName}
              onChange={(e) => state.setClientName(e.target.value)}
              className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-4 py-3.5 text-xs font-bold text-black placeholder:text-[#9CA3AF] focus:ring-1 focus:ring-black outline-none"
            />
          </div>

          {/* Pricing breakdown center card */}
          <PricingCard
            breakdown={breakdown}
            inputs={inputs}
            saving={saving}
            onSave={handleSaveQuote}
            recurrence={state.recurrence}
          />

          {/* Side-by-side versions comparison snapshot deck */}
          <SimulationPanel
            scenarios={scenarios}
            onRemove={removeScenario}
            onClear={clearScenarios}
            onAddCurrent={handleCreateScenario}
            currentName={scenarioName}
            setCurrentName={setScenarioName}
            isAddDisabled={scenarios.length >= 4}
          />

          {/* Helper consolidated context block */}
          <OperationalSummary inputs={inputs} estimatedHours={breakdown.estimatedTimeHours} />

        </div>

      </div>
    </div>
  );
}
