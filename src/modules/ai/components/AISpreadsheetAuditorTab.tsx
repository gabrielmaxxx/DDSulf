import React from 'react';
import Markdown from 'react-markdown';
import {
  TrendingUp,
  RotateCcw,
  FileCheck,
  BrainCircuit,
  X,
  BookOpen,
  Search,
  Star,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SpreadsheetSubTab } from '../types';

interface AISpreadsheetAuditorTabProps {
  diagnosticLoading: boolean;
  onTriggerAudit: () => void;
  activeSheetTab: SpreadsheetSubTab;
  setActiveSheetTab: (tab: SpreadsheetSubTab) => void;
  runDiagnostic: boolean;
  onCloseDiagnostic: () => void;
  diagnosticReportText: string | null;
  popQuery: string;
  setPopQuery: (q: string) => void;
  popLoading: boolean;
  popAnswer: string | null;
  onQueryPop: () => void;
  onSavePopFavorite: () => void;
}

export const AISpreadsheetAuditorTab: React.FC<AISpreadsheetAuditorTabProps> = ({
  diagnosticLoading,
  onTriggerAudit,
  activeSheetTab,
  setActiveSheetTab,
  runDiagnostic,
  onCloseDiagnostic,
  diagnosticReportText,
  popQuery,
  setPopQuery,
  popLoading,
  popAnswer,
  onQueryPop,
  onSavePopFavorite,
}) => {
  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* SPREADSHEET MANAGER CENTER (XLSX SPREADSHEET AUDITOR AS PER RULE[AGENTS_md]) */}
      <div className="bg-white border border-[#E8E6E1] rounded-3xl p-6 shadow-xs text-left">
        {/* Top Bar Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4 mb-5">
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="size-5 text-[#2D6A4F]" />
              Central Unificada de Planilhas PestFlow
            </h2>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">
              Auditoria inteligente e conciliação matemática de dados financeiros e operacionais.
            </p>
          </div>

          <button
            type="button"
            onClick={onTriggerAudit}
            disabled={diagnosticLoading}
            className="px-4 py-2.5 bg-[#1B3A2D] text-white rounded-xl text-xs font-bold hover:bg-[#2D6A4F] transition-all flex items-center gap-2 cursor-pointer shadow-xs font-sans disabled:opacity-50"
          >
            {diagnosticLoading ? (
              <>
                <RotateCcw className="size-4 animate-spin" />
                <span>Auditando XLSX...</span>
              </>
            ) : (
              <>
                <FileCheck className="size-4" />
                <span>Auditar Planilha Consolidada</span>
              </>
            )}
          </button>
        </div>

        {/* Inventário do arquivo (REQUIRED BY RULE[AGENTS_md]) */}
        <div className="bg-[#FAF9F5] border border-slate-200 rounded-2xl p-4 mb-6">
          <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-sans">
            📋 INVENTÁRIO DO ARQUIVO CONSOLIDADO
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse bg-white border border-slate-200 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="p-2">Nome da Aba</th>
                  <th className="p-2">Descrição do Escopo e Conteúdo</th>
                  <th className="p-2 text-right">Linhas Estimadas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                <tr>
                  <td className="p-2 font-bold font-mono text-[#1B3A2D]">Premissas</td>
                  <td className="p-2">Indicadores de faturamento, ticket médio corporativo e metas operacionais.</td>
                  <td className="p-2 text-right font-mono">6 linhas</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold font-mono text-[#1B3A2D]">Folha de Pagamento</td>
                  <td className="p-2">Cargos, salários, encargos CLT (28%) e cálculo automatizado de custo total.</td>
                  <td className="p-2 text-right font-mono">5 linhas</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold font-mono text-[#1B3A2D]">Custos Fixos</td>
                  <td className="p-2">Desembolsos recorrentes: aluguel, veículos, combustível, contabilidade e ERP.</td>
                  <td className="p-2 text-right font-mono">8 linhas</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold font-mono text-[#1B3A2D]">Custos Variáveis</td>
                  <td className="p-2">Insumos químicos (lambda-cialotrina), comissões comerciais e deslocamentos extras.</td>
                  <td className="p-2 text-right font-mono">4 linhas</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold font-mono text-[#1B3A2D]">Empréstimos</td>
                  <td className="p-2">Contratos ativos, amortização de parcelas, juros de prazo residual.</td>
                  <td className="p-2 text-right font-mono">3 linhas</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold font-mono text-[#1B3A2D]">DRE Mensal</td>
                  <td className="p-2">Demonstrativo deduções da Receita Bruta acumulada e cálculo da margem operacional.</td>
                  <td className="p-2 text-right font-mono">9 linhas</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold font-mono text-[#1B3A2D]">Fluxo de Caixa</td>
                  <td className="p-2">Entradas e saídas de caixa mensalizadas com saldo final acumulativo.</td>
                  <td className="p-2 text-right font-mono">4 linhas</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold font-mono text-[#1B3A2D]">Indicadores Calculados</td>
                  <td className="p-2">Indicadores estratégicos: custo por serviço, MC, Break-even e comprometimentos.</td>
                  <td className="p-2 text-right font-mono">6 linhas</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* OFFICIAL TABS COMPONENT FOR THE 8 SPREADSHEET SUB-TABS */}
        <Tabs
          value={activeSheetTab}
          onValueChange={(val) => setActiveSheetTab(val as SpreadsheetSubTab)}
          className="w-full"
        >
          <TabsList className="bg-[#FAF9F5] border border-slate-200 p-1 rounded-xl h-auto flex flex-wrap gap-1 mb-4 justify-start">
            <TabsTrigger
              value="premissas"
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#1B3A2D] data-[state=active]:shadow-xs"
            >
              📝 Premissas
            </TabsTrigger>
            <TabsTrigger
              value="folha"
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#1B3A2D] data-[state=active]:shadow-xs"
            >
              👥 Folha de Pagamento
            </TabsTrigger>
            <TabsTrigger
              value="fixos"
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#1B3A2D] data-[state=active]:shadow-xs"
            >
              🏢 Custos Fixos
            </TabsTrigger>
            <TabsTrigger
              value="variaveis"
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#1B3A2D] data-[state=active]:shadow-xs"
            >
              🧪 Custos Variáveis
            </TabsTrigger>
            <TabsTrigger
              value="emprestimos"
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#1B3A2D] data-[state=active]:shadow-xs"
            >
              🏦 Empréstimos
            </TabsTrigger>
            <TabsTrigger
              value="dre"
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#1B3A2D] data-[state=active]:shadow-xs"
            >
              📊 DRE Mensal
            </TabsTrigger>
            <TabsTrigger
              value="fluxo"
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#1B3A2D] data-[state=active]:shadow-xs"
            >
              💰 Fluxo de Caixa
            </TabsTrigger>
            <TabsTrigger
              value="indicadores"
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#1B3A2D] data-[state=active]:shadow-xs"
            >
              📈 Indicadores
            </TabsTrigger>
          </TabsList>

          {/* TABS CONTAINER SHEET GRID */}
          <div className="bg-[#FAF9F5] border border-slate-200 p-4 rounded-2xl overflow-x-auto min-h-[200px]">
            <TabsContent value="premissas" className="mt-0">
              <table className="w-full text-left text-xs bg-white border border-slate-200 rounded-xl">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2.5">Indicador Balizador</th>
                    <th className="p-2.5">Referência Cadastrada</th>
                    <th className="p-2.5 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium font-sans">
                  <tr>
                    <td className="p-2.5 font-bold">Faturamento alvo mensal</td>
                    <td className="p-2.5">Meta comercial de campo</td>
                    <td className="p-2.5 text-right font-mono">R$ 66.000,00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Quantidade de serviços por mês</td>
                    <td className="p-2.5">Capacidade de atendimento operacional</td>
                    <td className="p-2.5 text-right font-mono">120 serviços</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Ticket médio por serviço</td>
                    <td className="p-2.5">Tabela orçamentária no CRM</td>
                    <td className="p-2.5 text-right font-mono">R$ 550,00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Carga tributária média</td>
                    <td className="p-2.5">Alíquota simples estimada</td>
                    <td className="p-2.5 text-right font-mono">8,50%</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Encargos sobre folha de pagamento</td>
                    <td className="p-2.5">Gargalo previdenciário e CLT</td>
                    <td className="p-2.5 text-right font-mono">28,00%</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Margem operacional esperada (Alvo)</td>
                    <td className="p-2.5 font-black text-[#1B3A2D]">Projeção ideal da gerência</td>
                    <td className="p-2.5 text-right font-mono text-emerald-800 font-extrabold">35,00%</td>
                  </tr>
                </tbody>
              </table>
            </TabsContent>

            <TabsContent value="folha" className="mt-0">
              <table className="w-full text-left text-xs bg-white border border-slate-200 rounded-xl">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2.5">Cargo / Função Técnica</th>
                    <th className="p-2.5 text-center">Quantidade</th>
                    <th className="p-2.5 text-right">Salário Base Unitário</th>
                    <th className="p-2.5 text-center">Encargos Incidentes (%)</th>
                    <th className="p-2.5 text-right">Custo Mensal Consolidado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium font-sans">
                  <tr>
                    <td className="p-2.5 font-bold">Diretor Técnico Responsável</td>
                    <td className="p-2.5 text-center font-mono font-bold">1 colab.</td>
                    <td className="p-2.5 text-right font-mono">R$ 8.500,00</td>
                    <td className="p-2.5 text-center font-mono text-rose-700">28,00%</td>
                    <td className="p-2.5 text-right font-mono font-bold">R$ 10.880,00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Técnico Operador de Campo Pleno</td>
                    <td className="p-2.5 text-center font-mono font-bold">3 colab.</td>
                    <td className="p-2.5 text-right font-mono">R$ 2.800,00</td>
                    <td className="p-2.5 text-center font-mono text-rose-700">28,00%</td>
                    <td className="p-2.5 text-right font-mono font-bold">R$ 10.752,00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Auxiliar Geral Logística e Inspeções</td>
                    <td className="p-2.5 text-center font-mono font-bold">2 colab.</td>
                    <td className="p-2.5 text-right font-mono">R$ 1.900,00</td>
                    <td className="p-2.5 text-center font-mono text-rose-700">28,05%</td>
                    <td className="p-2.5 text-right font-mono font-bold">R$ 4.864,00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Pró-labore de Gestão Sócios</td>
                    <td className="p-2.5 text-center font-mono font-bold">1 colab.</td>
                    <td className="p-2.5 text-right font-mono">R$ 5.000,00</td>
                    <td className="p-2.5 text-center font-mono">0,00%</td>
                    <td className="p-2.5 text-right font-mono font-bold">R$ 5.000,00</td>
                  </tr>
                  <tr className="bg-slate-50 font-black text-slate-800 border-t-2 border-slate-300">
                    <td className="p-3" colSpan={4}>TOTAL COMPROMETIDO DA FOLHA (Calculado)</td>
                    <td className="p-3 text-right font-mono text-[#C1361A] text-sm">R$ 31.496,00</td>
                  </tr>
                </tbody>
              </table>
            </TabsContent>

            <TabsContent value="fixos" className="mt-0">
              <table className="w-full text-left text-xs bg-white border border-slate-200 rounded-xl">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2.5">Desembolso Fixo Recorrente</th>
                    <th className="p-2.5 font-sans">Ramo de Aplicação</th>
                    <th className="p-2.5 text-right">Custo Mensal (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium font-sans">
                  <tr>
                    <td className="p-2.5 font-bold">Aluguel Sede Volta Redonda</td>
                    <td className="p-2.5">Infraestrutura física</td>
                    <td className="p-2.5 text-right font-mono">R$ 3.500,00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Aluguel e Manutenção de Frota (Veículos)</td>
                    <td className="p-2.5">Logística de campo</td>
                    <td className="p-2.5 text-right font-mono">R$ 3.500,00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Deslocamentos e Combustível Fixo</td>
                    <td className="p-2.5">Combustível veículos técnicos</td>
                    <td className="p-2.5 text-right font-mono">R$ 4.300,00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Seguros da Operação e Sinistros</td>
                    <td className="p-2.5">Licenças e seguros técnicos</td>
                    <td className="p-2.5 text-right font-mono">R$ 1.200,00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">ERP e Licenças de Gestão Operacional</td>
                    <td className="p-2.5">Sistemas e TI administrativo</td>
                    <td className="p-2.5 text-right font-mono">R$ 450,00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Honorários Assessoria Contábil</td>
                    <td className="p-2.5">Balanço fiscal mensal</td>
                    <td className="p-2.5 text-right font-mono">R$ 980,00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Mapeamento e Tráfego Ads (Marketing)</td>
                    <td className="p-2.5">Anúncios de cupins e pragas</td>
                    <td className="p-2.5 text-right font-mono">R$ 2.805,00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Provisão de Manutenção de Equipamentos</td>
                    <td className="p-2.5">Pulverizadores, EPIs e uniformes</td>
                    <td className="p-2.5 text-right font-mono">R$ 1.500,00</td>
                  </tr>
                  <tr className="bg-slate-50 font-black text-slate-800 border-t-2 border-slate-300">
                    <td className="p-3" colSpan={2}>TOTAL GERAL DE CUSTOS FIXOS (Soma Real)</td>
                    <td className="p-3 text-right font-mono text-slate-900 text-sm">R$ 18.235,01</td>
                  </tr>
                </tbody>
              </table>
            </TabsContent>

            <TabsContent value="variaveis" className="mt-0">
              <table className="w-full text-left text-xs bg-white border border-slate-200 rounded-xl">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2.5">Insumo / Custo Variável</th>
                    <th className="p-2.5">Proporção por Serviço</th>
                    <th className="p-2.5 text-right">Valor Consolidado Recorrência</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium font-sans">
                  <tr>
                    <td className="p-2.5 font-bold">Insumos Químicos de Imunização</td>
                    <td className="p-2.5">Média de R$ 15,00/atendimento para lambda-cialotrina e iscas bloco</td>
                    <td className="p-2.5 text-right font-mono">R$ 1.800,00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Comissões Comerciais de Vendas</td>
                    <td className="p-2.5">3,00% sobre receita líquida auferida</td>
                    <td className="p-2.5 text-right font-mono">R$ 1.810,50</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Deslocamento Extra e Laudos Críticos</td>
                    <td className="p-2.5">Visitas adicionais de vistoria de campo</td>
                    <td className="p-2.5 text-right font-mono">R$ 1.200,00</td>
                  </tr>
                  <tr className="bg-slate-50 font-black text-slate-800 border-t-2 border-slate-300">
                    <td className="p-3" colSpan={2}>TOTAL DE CUSTOS VARIÁVEIS (Soma Real)</td>
                    <td className="p-3 text-right font-mono text-slate-900 text-sm">R$ 4.810,50</td>
                  </tr>
                </tbody>
              </table>
            </TabsContent>

            <TabsContent value="emprestimos" className="mt-0">
              <table className="w-full text-left text-xs bg-white border border-slate-200 rounded-xl">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2.5">Nome do Contrato / Credor</th>
                    <th className="p-2.5 font-sans">Saldo Devedor Total</th>
                    <th className="p-2.5 text-center font-sans">Taxa de Juros Anual</th>
                    <th className="p-2.5 text-center font-sans">Prazo Restante</th>
                    <th className="p-2.5 text-right">Parcela Mensal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium font-sans">
                  <tr>
                    <td className="p-2.5 font-bold text-slate-700">Itaú Capital de Giro Corporativo</td>
                    <td className="p-2.5 font-mono">R$ 45.600,00</td>
                    <td className="p-2.5 text-center font-mono">14,50%</td>
                    <td className="p-2.5 text-center font-mono">12 meses</td>
                    <td className="p-2.5 text-right font-mono text-rose-800 font-bold">R$ 3.800,00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-slate-700 flex items-center gap-1">
                      BB Financiamento Equipamentos
                      <span className="px-1 py-0.2 bg-rose-50 text-[#C1361A] text-[8px] font-bold rounded">Atraso</span>
                    </td>
                    <td className="p-2.5 font-mono">R$ 36.800,00</td>
                    <td className="p-2.5 text-center font-mono">12,20%</td>
                    <td className="p-2.5 text-center font-mono">8 meses</td>
                    <td className="p-2.5 text-right font-mono text-rose-800 font-bold">R$ 4.600,00</td>
                  </tr>
                  <tr className="bg-slate-50 font-black text-slate-800 border-t-2 border-slate-300 font-sans">
                    <td className="p-3" colSpan={4}>TOTAL DE AMORTIZAÇÕES MENSAIS (Parcelas)</td>
                    <td className="p-3 text-right font-mono text-[#C1361A] text-sm">R$ 8.400,00</td>
                  </tr>
                </tbody>
              </table>
            </TabsContent>

            <TabsContent value="dre" className="mt-0">
              <table className="w-full text-left text-xs bg-white border border-slate-200 rounded-xl">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2.5" colSpan={2}>Estrutura Escalonada do DRE Mensal</th>
                    <th className="p-2.5 text-right">Valor Consolidado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium font-sans">
                  <tr className="bg-emerald-50/10">
                    <td className="p-2.5 font-black text-[#1B3A2D]" colSpan={2}>
                      RECEITA BRUTA ESTIMADA (Premissa 120 atendimentos)
                    </td>
                    <td className="p-2.5 text-right font-mono text-emerald-800 font-extrabold">R$ 66.000,00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-500 pl-4" colSpan={2}>
                      (-) Impostos operacionais cobrados (8,50%)
                    </td>
                    <td className="p-2.5 text-right font-mono text-rose-700">-R$ 5.610,00</td>
                  </tr>
                  <tr className="bg-slate-100 font-extrabold text-slate-800">
                    <td className="p-2.5" colSpan={2}>(=) RECEITA LÍQUIDA CALCULADA</td>
                    <td className="p-2.5 text-right font-mono">R$ 60.390,00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 pl-4" colSpan={2}>(-) Folha de Pagamento Pró-labore e CLT</td>
                    <td className="p-2.5 text-right font-mono text-rose-700">-R$ 31.496,00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 pl-4" colSpan={2}>(-) Custos Fixos recorrentes mapeados</td>
                    <td className="p-2.5 text-right font-mono text-rose-700">-R$ 18.235,01</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 pl-4" colSpan={2}>(-) Custos Variáveis faturáveis (Insumos, comissões)</td>
                    <td className="p-2.5 text-right font-mono text-rose-700">-R$ 4.810,50</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 pl-4" colSpan={2}>(-) Amortização mensal / Serviço de Dívida (BB + Itaú)</td>
                    <td className="p-2.5 text-right font-mono text-rose-700">-R$ 8.400,00</td>
                  </tr>
                  <tr className="bg-[#FAF9F5] border-t-2 border-rose-300 font-black text-rose-800">
                    <td className="p-3" colSpan={2}>(=) LUCRO OPERACIONAL LÍQUIDO OBTIDO</td>
                    <td className="p-3 text-right font-mono text-sm">-R$ 2.551,51</td>
                  </tr>
                  <tr className="bg-rose-50 font-black text-rose-800">
                    <td className="p-3" colSpan={2}>MARGEM OPERACIONAL CALCULADA (%)</td>
                    <td className="p-3 text-right font-mono text-sm">-3,87%</td>
                  </tr>
                </tbody>
              </table>
            </TabsContent>

            <TabsContent value="fluxo" className="mt-0">
              <table className="w-full text-left text-xs bg-white border border-slate-200 rounded-xl">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2.5">Mês de Referência</th>
                    <th className="p-2.5 text-right">Entradas Reais (R$)</th>
                    <th className="p-2.5 text-right">Saídas Reais (R$)</th>
                    <th className="p-2.5 text-right">Saldo Operacional Líquido</th>
                    <th className="p-2.5 text-right">Saldo Acumulado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium font-sans">
                  <tr>
                    <td className="p-2.5 font-bold">Competência Março</td>
                    <td className="p-2.5 text-right font-mono text-emerald-800">R$ 58.000,00</td>
                    <td className="p-2.5 text-right font-mono text-rose-700">-R$ 52.300,00</td>
                    <td className="p-2.5 text-right font-mono text-emerald-800 font-bold">+R$ 5.700,00</td>
                    <td className="p-2.5 text-right font-mono font-bold">R$ 5.700,00</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Competência Abril</td>
                    <td className="p-2.5 text-right font-mono text-emerald-800">R$ 64.500,00</td>
                    <td className="p-2.5 text-right font-mono text-rose-700">-R$ 59.100,00</td>
                    <td className="p-2.5 text-right font-mono text-emerald-800 font-bold">+R$ 5.400,00</td>
                    <td className="p-2.5 text-right font-mono font-bold text-emerald-800">R$ 11.100,00</td>
                  </tr>
                  <tr className="bg-rose-50/20">
                    <td className="p-2.5 font-bold flex items-center gap-1 text-[#C1361A]">
                      Competência Maio
                      <span className="px-1 py-0.2 bg-rose-100 text-[#C1361A] text-[8px] font-bold rounded">Prejuízo</span>
                    </td>
                    <td className="p-2.5 text-right font-mono text-emerald-800">R$ 66.000,00</td>
                    <td className="p-2.5 text-right font-mono text-rose-700">-R$ 68.551,51</td>
                    <td className="p-2.5 text-right font-mono text-rose-800 font-bold">-R$ 2.551,51</td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-800">R$ 8.548,49</td>
                  </tr>
                  <tr className="bg-slate-100 font-black text-slate-800 border-t-2 border-slate-300">
                    <td className="p-3" colSpan={4}>SALDO DE CAIXA OPERACIONAL ACUMULADO</td>
                    <td className="p-3 text-right font-mono text-emerald-800 text-sm">R$ 8.548,49</td>
                  </tr>
                </tbody>
              </table>
            </TabsContent>

            <TabsContent value="indicadores" className="mt-0">
              <table className="w-full text-left text-xs bg-white border border-slate-200 rounded-xl">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2.5">Indicador Financeiro Calculado</th>
                    <th className="p-2.5 font-sans">Fórmula Aplicada s/ Redundâncias</th>
                    <th className="p-2.5 text-right">Resultado Analítico Expresso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium font-sans">
                  <tr>
                    <td className="p-2.5 font-bold">1. Custo Total por Serviço Prestado</td>
                    <td className="p-2.5">(Total Folha + Custo Fixo + Custo Variável) ÷ Qtd Serviços Estimados</td>
                    <td className="p-2.5 text-right font-mono text-rose-800 font-bold">R$ 454,51 / Atendimento</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">2. Ponto de Equilíbrio Operacional (Break-even Express)</td>
                    <td className="p-2.5">Custos Totais ÷ (1 - % custos variáveis sobre receita Bruta)</td>
                    <td className="p-2.5 text-right font-mono text-[#D4A017] font-black">R$ 62.701,97 / Mês</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">3. Margem de Contribuição Agregada</td>
                    <td className="p-2.5 font-sans">Receita Líquida - Custos Variáveis</td>
                    <td className="p-2.5 text-right font-mono text-emerald-800 font-bold">R$ 55.579,50</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-rose-800 font-sans">4. Comprometimento da Folha de Pagamento</td>
                    <td className="p-2.5 text-rose-800">(Total da Folha ÷ Receita Bruta) * 100</td>
                    <td className="p-2.5 text-right font-mono text-rose-800 font-black">47,72% (Alerta &gt; 40%)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-rose-800 font-sans">5. Comprometimento da amortização de Empréstimos</td>
                    <td className="p-2.5 text-rose-800 font-sans">(Total Parcelas Empréstimos ÷ Receita Bruta) * 100</td>
                    <td className="p-2.5 text-right font-mono text-rose-800 font-black">12,73% (Alerta &gt; 10%)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">6. Ticket Médio Real da Operação</td>
                    <td className="p-2.5 font-sans">Faturamento Declarado ÷ Quantidade real de atendimentos executados</td>
                    <td className="p-2.5 text-right font-mono font-bold">R$ 550,00</td>
                  </tr>
                </tbody>
              </table>
            </TabsContent>
          </div>
        </Tabs>

        {/* COMPLIANCE ALERT BOXES (🔴 🟡 🟢) - REQUIRED BY RULE[AGENTS_md] */}
        <div className="mt-6 border-t border-slate-100 pt-5 space-y-4">
          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5 font-sans">
            ⚠️ SINALIZAÇÃO DE ALERTAS SENSORIAIS (COMPLIANCE COORDENAÇÃO)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CRITICAL ALERTS */}
            <div className="bg-rose-50/75 border border-rose-200 rounded-xl p-4 space-y-2 text-left">
              <h5 className="text-[11px] font-black uppercase text-[#C1361A] flex items-center gap-1 font-sans">
                🔴 ALERTAS CRÍTICOS (Foco Imediato)
              </h5>
              <ul className="text-[10.5px] text-slate-800 space-y-1.5 pl-3 list-disc font-medium leading-relaxed font-sans">
                <li>
                  Lucro operacional calculado negativo (Operação registrando prejuízo líquido de{' '}
                  <span className="font-bold text-[#C1361A]">-R$ 2.551,51</span> no DRE).
                </li>
                <li>
                  Serviço de dívida em empréstimos (<span className="font-bold text-[#C1361A]">12,73%</span>) consome
                  acima do limite de faturamento bruto de 10,00%.
                </li>
                <li>
                  Encargos e folha (<span className="font-bold text-[#C1361A]">47,72%</span>) absorvem mais que
                  40,00% do faturamento bruto nominal.
                </li>
                <li>
                  Competência de Maio com saldo operacional líquido negativo (
                  <span className="font-bold text-[#C1361A]">-R$ 2.551,51</span>).
                </li>
              </ul>
            </div>

            {/* WARNING ALERTS */}
            <div className="bg-amber-50/75 border border-amber-200 rounded-xl p-4 space-y-2 text-left">
              <h5 className="text-[11px] font-black uppercase text-amber-800 flex items-center gap-1 font-sans">
                🟡 ALERTAS DE ATENÇÃO (Monitoramento)
              </h5>
              <ul className="text-[10.5px] text-slate-800 space-y-1.5 pl-3 list-disc font-medium leading-relaxed font-sans">
                <li>
                  Margem operacional (-3,87%) inferior à margem de lucro alvo de{' '}
                  <span className="font-bold">35,00%</span> estipulada em Premissas.
                </li>
                <li>Deslocamento extra de pós-vendas por reincidência de assistência técnica no CRM consome insumos.</li>
                <li>Falta de reserva de capital para contingências operacionais ou provisão de inadimplência ativa.</li>
              </ul>
            </div>

            {/* POSITIVE POINTS */}
            <div className="bg-emerald-50/75 border border-emerald-200 rounded-xl p-4 space-y-2 text-left">
              <h5 className="text-[11px] font-black uppercase text-[#2D6A4F] flex items-center gap-1 font-sans">
                🟢 PONTOS POSITIVOS (Potencialidades)
              </h5>
              <ul className="text-[10.5px] text-slate-800 space-y-1.5 pl-3 list-disc font-medium leading-relaxed font-sans">
                <li>
                  Competências de Março <span className="text-emerald-800 font-bold">(+R$ 5.700,00)</span> e Abril{' '}
                  <span className="text-emerald-800 font-bold">(+R$ 5.400,00)</span> superaram saldo de contingência e
                  operaram estáveis.
                </li>
                <li>Receita recorrente e faturamento previsível com contratos de longo prazo homologados no CRM ativo.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ADVANCED IA AUDITING DISCOVERY REPORT OUT */}
      {runDiagnostic && (
        <div className="bg-white border border-[#E8E6E1] rounded-3xl p-6 shadow-xs text-left animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <BrainCircuit className="size-5 text-[#D4A017]" />
              <h3 className="text-sm font-bold text-slate-800">Laudo Operacional Emitido pela IA</h3>
            </div>
            <button
              type="button"
              onClick={onCloseDiagnostic}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          {diagnosticReportText ? (
            <div className="bg-[#FAF9F5] border border-slate-200 rounded-2xl p-5 text-[#44443F] leading-relaxed text-xs">
              <div className="markdown-body">
                <Markdown>{diagnosticReportText}</Markdown>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 text-slate-400 text-xs font-sans">
              <RotateCcw className="size-4 animate-spin mr-2" />
              Garantindo consistências cruzadas nas abas...
            </div>
          )}
        </div>
      )}

      {/* 3. BASE DE CONHECIMENTO (DEDICATED POP AREA) */}
      <div className="bg-white border border-[#E8E6E1] rounded-3xl p-6 text-left shadow-xs">
        <div className="border-b border-slate-100 pb-3 flex items-center gap-3">
          <div className="size-8 rounded-xl bg-[#FAF9F5] border border-slate-200 flex items-center justify-center">
            <BookOpen className="size-4.5 text-[#1B3A2D]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Pergunte à Base de Conhecimento (POPs)
            </h3>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">
              Explore manuais de campo, vigilância e receitas de dosagem de imunização cadastrados na empresa.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-4">
          {/* Search Side */}
          <div className="md:col-span-4 space-y-4">
            <div className="relative">
              <input
                type="text"
                value={popQuery}
                onChange={(e) => setPopQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onQueryPop()}
                placeholder="Pesquise por cupim, escorpião..."
                className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] font-sans"
              />
              <Search className="size-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>

            <div className="space-y-2 font-sans">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                Consultas frequentes:
              </p>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => setPopQuery('Como executar controle de cupins?')}
                  className="text-left text-[11px] font-semibold text-slate-600 hover:text-[#1B3A2D] transition-all cursor-pointer"
                >
                  → Como executar controle de cupins?
                </button>
                <button
                  type="button"
                  onClick={() => setPopQuery('Qual POP utilizar para escorpiões?')}
                  className="text-left text-[11px] font-semibold text-slate-600 hover:text-[#1B3A2D] transition-all cursor-pointer"
                >
                  → Qual POP utilizar para escorpiões?
                </button>
                <button
                  type="button"
                  onClick={() => setPopQuery('Qual procedimento para registrar serviço?')}
                  className="text-left text-[11px] font-semibold text-slate-600 hover:text-[#1B3A2D] transition-all cursor-pointer"
                >
                  → Qual procedimento para registrar serviço?
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={onQueryPop}
              disabled={popLoading || !popQuery.trim()}
              className="w-full py-2 bg-[#1B3A2D] text-white rounded-xl text-xs font-bold hover:bg-[#2D6A4F] transition-colors disabled:opacity-40 cursor-pointer font-sans"
            >
              {popLoading ? 'Consultando POP...' : 'Perguntar às Diretrizes'}
            </button>
          </div>

          {/* Response side */}
          <div className="md:col-span-8 bg-slate-50 border border-slate-200 p-4 rounded-2xl min-h-[140px] flex flex-col justify-between">
            {popAnswer ? (
              <div className="text-left space-y-2 animate-fade-in">
                <div className="markdown-body text-xs text-slate-700 leading-relaxed max-h-[180px] overflow-y-auto pr-1">
                  <Markdown>{popAnswer}</Markdown>
                </div>
                <div className="flex justify-end pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={onSavePopFavorite}
                    className="flex items-center gap-1.5 text-[10px] text-[#6B6B5F] hover:text-[#D4A017] font-bold cursor-pointer font-sans"
                  >
                    <Star className="size-3 text-[#D4A017] fill-[#D4A017]/10" />
                    Salvar nos Favoritos
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-6">
                <BookOpen className="size-6 text-slate-300 mb-1.5" />
                <p className="text-xs font-sans">
                  Digite uma dúvida acima para consultar os POPs e manuais sanitários.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
