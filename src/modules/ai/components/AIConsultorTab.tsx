import React from 'react';
import { ArrowUpRight, BrainCircuit } from 'lucide-react';

interface AIConsultorTabProps {
  simVendas: number;
  setSimVendas: (v: number) => void;
  simTicket: number;
  setSimTicket: (v: number) => void;
  simCustoVariavel: number;
  setSimCustoVariavel: (v: number) => void;
  simImpostoPerc: number;
  setSimImpostoPerc: (v: number) => void;
  onNavigate: (path: string) => void;
}

export const AIConsultorTab: React.FC<AIConsultorTabProps> = ({
  simVendas,
  setSimVendas,
  simTicket,
  setSimTicket,
  simCustoVariavel,
  setSimCustoVariavel,
  simImpostoPerc,
  setSimImpostoPerc,
  onNavigate,
}) => {
  // Scenario simulation calculations
  const faturamentoSimulado = simVendas * simTicket;
  const impostosCalc = faturamentoSimulado * (simImpostoPerc / 100);
  const receitaLiquidaSimulada = faturamentoSimulado - impostosCalc;
  const custosVariaveisCalc = simVendas * simCustoVariavel;

  // Fixed operational totals
  const folhaFixa = 31496;
  const outrosCustosFixos = 18235;
  const parcelasEmprestimos = 8400;
  const custoFixoGeralSimulado = folhaFixa + outrosCustosFixos + parcelasEmprestimos; // R$ 58.131

  const custoTotalSimulado = custosVariaveisCalc + custoFixoGeralSimulado;
  const lucroSimulado = receitaLiquidaSimulada - custoTotalSimulado;
  const margemSimulada = faturamentoSimulado > 0 ? (lucroSimulado / faturamentoSimulado) * 100 : 0;

  // Simulated PEO (services quantity)
  const margemLiquidaUnitariaSimulada = simTicket * (1 - simImpostoPerc / 100) - simCustoVariavel;
  const peoSimulado =
    margemLiquidaUnitariaSimulada > 0
      ? Math.ceil(custoFixoGeralSimulado / margemLiquidaUnitariaSimulada)
      : -1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fade-in text-left">
      {/* LEFT SIDE: PRIORITIZED RECOMMENDATION ALERT CARDS */}
      <div className="lg:col-span-6 space-y-4">
        <div className="bg-white border border-[#E8E6E1] rounded-3xl p-5 md:p-6 shadow-xs h-full">
          <div className="border-b border-slate-100 pb-2 mb-4 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider font-sans">
              Ações Corretivas Ordenadas
            </h3>
            <span className="text-[10px] bg-rose-50 text-[#C1361A] px-2 py-0.5 border border-rose-200 rounded font-black uppercase font-sans">
              Prioridade
            </span>
          </div>

          <div className="space-y-4">
            {/* Red High Card */}
            <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-[#C1361A] font-sans">
                  Financeiro / Preços
                </span>
                <span className="text-[9px] font-black uppercase bg-rose-100 px-1.5 py-0.5 text-[#C1361A] rounded font-sans">
                  Alerta Alta
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 leading-tight">
                Déficit Operacional de R$ -2.551,51
              </h4>
              <p className="text-[11px] text-slate-500 font-medium leading-normal font-sans">
                A estrutura fixa e juros de empréstimos cobrados estão consumindo toda a margem líquida da empresa no DRE.
              </p>
              <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-[10.5px] text-rose-900 leading-relaxed font-sans font-medium">
                <span className="font-bold block mb-0.5">Procedimento de Correção:</span>
                Elevar o ticket médio do CRM para R$ 630,00 ou pactuar a amortização do Financiamento BB para diminuir o serviço da dívida.
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('/financial')}
                  className="text-xs font-bold text-[#1B3A2D] hover:underline flex items-center gap-0.5 cursor-pointer font-sans"
                >
                  Corrigir em Finanças <ArrowUpRight className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Amber Medium Card */}
            <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-amber-800 font-sans">
                  Estoque / Lambda-cialotrina
                </span>
                <span className="text-[9px] font-black uppercase bg-amber-100 px-1.5 py-0.5 text-amber-800 rounded font-sans">
                  Alerta Média
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 leading-tight">
                Demand 2.5 CS em Ruptura Imediata
              </h4>
              <p className="text-[11px] text-slate-500 font-medium leading-normal font-sans">
                Estoque de calda do microencapsulado residual atingiu limite abaixo de segurança restando apenas 1 frasco em Volta Redonda.
              </p>
              <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-[10.5px] text-amber-900 leading-relaxed font-sans font-medium">
                <span className="font-bold block mb-0.5">Procedimento de Correção:</span>
                Aprovar requisição de faturamento e compras para reposição emergencial direta do fornecedor homologado Syngenta hoje.
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('/inventory')}
                  className="text-xs font-bold text-[#1B3A2D] hover:underline flex items-center gap-0.5 cursor-pointer font-sans"
                >
                  Comprar Insumo <ArrowUpRight className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Blue Low Card */}
            <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-blue-800 font-sans">
                  Clientes / Recorrência
                </span>
                <span className="text-[9px] font-black uppercase bg-blue-100 px-1.5 py-0.5 text-blue-800 rounded font-sans">
                  Alerta Baixa
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 leading-tight">
                Contratos comerciais atingindo expiração
              </h4>
              <p className="text-[11px] text-slate-500 font-medium leading-normal font-sans">
                Identificados contratos corporativos de longa recorrência com prazos de vigência inferiores a 30 dias na base.
              </p>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('/clientes')}
                  className="text-xs font-bold text-[#1B3A2D] hover:underline flex items-center gap-0.5 cursor-pointer font-sans"
                >
                  Ver Contratos no CRM <ArrowUpRight className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: SCENARIO WHAT-IF SLIDER SIMULATOR */}
      <div className="lg:col-span-6 space-y-4 font-sans text-left">
        <div className="bg-white border border-[#E8E6E1] rounded-3xl p-5 md:p-6 shadow-xs h-full flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-2 mb-4 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5 font-sans">
                <BrainCircuit className="size-4 text-[#D4A017]" />
                Simulador de Cenários What-If
              </h3>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200 rounded font-black uppercase font-sans">
                Interativo
              </span>
            </div>

            {/* Sliders Block */}
            <div className="space-y-4">
              {/* Slider 1: Volume de Serviços */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 font-sans">
                  <span>Quantidade de Atendimentos ao Mês</span>
                  <span className="text-[#1B3A2D] font-mono font-bold">{simVendas} serviços</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={200}
                  value={simVendas}
                  onChange={(e) => setSimVendas(Number(e.target.value))}
                  className="w-full accent-[#1B3A2D] h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider 2: Ticket Médio */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 font-sans">
                  <span>Ticket Médio por Atendimento (R$)</span>
                  <span className="text-[#1B3A2D] font-mono font-bold">R$ {simTicket.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={300}
                  max={1500}
                  step={25}
                  value={simTicket}
                  onChange={(e) => setSimTicket(Number(e.target.value))}
                  className="w-full accent-[#1B3A2D] h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider 3: Custo Variável por Serviço */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 font-sans">
                  <span>Custo Variável Médio por Atendimento (R$)</span>
                  <span className="text-[#1B3A2D] font-mono font-bold">R$ {simCustoVariavel.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={simCustoVariavel}
                  onChange={(e) => setSimCustoVariavel(Number(e.target.value))}
                  className="w-full accent-[#1B3A2D] h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                />
              </div>

              {/* Slider 4: Imposto e Comissões */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 font-sans">
                  <span>Impostos e Taxas (%)</span>
                  <span className="text-[#1B3A2D] font-mono font-bold">{simImpostoPerc.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={20}
                  step={0.5}
                  value={simImpostoPerc}
                  onChange={(e) => setSimImpostoPerc(Number(e.target.value))}
                  className="w-full accent-[#1B3A2D] h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Simulation Math Calculations Outputs */}
          <div className="border-t border-slate-100 pt-4 mt-5 space-y-3 shrink-0">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-sans">
              RESULTADOS SIMULADOS EM TEMPO REAL
            </p>

            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-3 text-xs leading-none">
                <div className="p-3 bg-[#FAF9F5] border border-slate-200 rounded-2xl flex flex-col justify-between">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider font-sans">
                    Faturamento Estimado
                  </span>
                  <span className="text-xs font-black font-mono text-slate-800 mt-2">
                    R$ {faturamentoSimulado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-3 bg-[#FAF9F5] border border-slate-200 rounded-2xl flex flex-col justify-between">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider font-sans">
                    Custo Total da Operação
                  </span>
                  <span className="text-xs font-bold font-mono text-slate-700 mt-2">
                    R$ {custoTotalSimulado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div
                className={`p-4 rounded-3xl border ${
                  lucroSimulado >= 0
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-rose-50/40 border-rose-200'
                } text-left space-y-2.5`}
              >
                <div className="flex justify-between items-center text-xs font-bold font-sans">
                  <span className="uppercase text-[9px] font-black text-slate-400 tracking-wider">
                    LUCRO / MARGEM OPERACIONAL
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 font-bold uppercase rounded-full border font-sans ${
                      lucroSimulado >= 0
                        ? 'bg-emerald-100 text-[#2D6A4F] border-emerald-200'
                        : 'bg-rose-100 text-[#C1361A] border-rose-200'
                    }`}
                  >
                    {lucroSimulado >= 0 ? 'Superavitário 🟢' : 'Operação Prejuízo 🔴'}
                  </span>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p
                      className={`text-base font-black font-mono leading-none ${
                        lucroSimulado >= 0 ? 'text-emerald-800' : 'text-rose-800'
                      }`}
                    >
                      R$ {lucroSimulado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium font-sans">
                      Projeção Operacional do Período
                    </p>
                  </div>
                  <span
                    className={`text-lg font-black font-mono ${
                      lucroSimulado >= 0 ? 'text-emerald-800' : 'text-rose-800'
                    }`}
                  >
                    {margemSimulada.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Simulated PEO results */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs font-sans">
                <div>
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                    Break-even de Serviços
                  </p>
                  <p className="text-[10px] text-slate-500 leading-snug mt-0.5">
                    Mínimo de atendimentos mensais para zerar toda a operação.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {peoSimulado > 0 ? (
                    <>
                      <p className="text-sm font-black font-mono text-slate-800 leading-none">
                        {peoSimulado}
                      </p>
                      <p className="text-[8px] font-bold text-slate-400 mt-0.5">atendimentos</p>
                    </>
                  ) : (
                    <p className="text-xs font-bold text-rose-700 leading-none font-sans">Ajustar Ticket</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
