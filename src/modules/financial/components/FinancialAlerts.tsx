import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Calendar, 
  Package, 
  AlertCircle 
} from 'lucide-react';
import { useSystemStore } from '@/store';

export function FinancialAlerts() {
  const { financial, inventory } = useSystemStore();
  const movements = financial.movements || [];
  const products = inventory.products || [];

  // 1. Stock below minimum alert
  const lowStockProducts = products.filter(p => p.quantity <= p.minQuantity);
  const lowStockAlert = lowStockProducts.length > 0 ? {
    id: 'stock-alert',
    type: 'danger' as const,
    title: 'Estoque Crítico Detectado',
    message: `${lowStockProducts.length} produto(s) com estoque abaixo do mínimo necessário (${lowStockProducts.map(p => p.name).join(', ')}). Abasteça imediatamente.`,
    icon: Package
  } : null;

  // 2. Overdue accounts (contas vencidas)
  const todayStr = new Date().toISOString().split('T')[0];
  const overduePayments = movements.filter(m => {
    if (m.isPaid === false && m.dueDate && m.value < 0) {
      return m.dueDate < todayStr;
    }
    return false;
  });
  const overdueTotalVal = Math.abs(overduePayments.reduce((acc, current) => acc + current.value, 0));
  const overdueAlert = overduePayments.length > 0 ? {
    id: 'overdue-alert',
    type: 'danger' as const,
    title: 'Contas Vencidas e Pendentes',
    message: `Você possui ${overduePayments.length} conta(s) vencida(s) totalizando R$ ${overdueTotalVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Atrasos geram multas e juros.`,
    icon: AlertCircle
  } : null;

  // 3. Contracts close to expiration (receitas/contratos a vencer nos próximos 15 dias)
  const incomingContracts = movements.filter(m => {
    if (m.isPaid === false && m.dueDate && m.category === 'RECEITAS') {
      const diffMs = new Date(m.dueDate).getTime() - new Date(todayStr).getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 15;
    }
    return false;
  });
  const incomingContractsAlert = incomingContracts.length > 0 ? {
    id: 'contracts-alert',
    type: 'warning' as const,
    title: 'Contratos Próximos do Vencimento',
    message: `Existe(m) ${incomingContracts.length} contrato(s) / receita(s) próximo(s) do vencimento nos próximos 15 dias: ${incomingContracts.map(c => `${c.description} em ${c.dueDate}`).join('; ')}.`,
    icon: Calendar
  } : null;

  // 4. Expenses above historical average (despesas com aumento anormal)
  const currentMonthPrefix = todayStr.substring(0, 7);
  const currentMonthExpenses = movements.filter(m => m.date.startsWith(currentMonthPrefix) && m.value < 0);
  const previousExpenses = movements.filter(m => !m.date.startsWith(currentMonthPrefix) && m.value < 0);

  const overheadAlerts: Array<{ title: string; message: string; sub: string }> = [];
  if (previousExpenses.length >= 3) {
    const categoriesToCompare = Array.from(new Set(currentMonthExpenses.map(m => m.subcategory).filter(Boolean)));
    categoriesToCompare.forEach(sub => {
      const currentSum = Math.abs(currentMonthExpenses.filter(m => m.subcategory === sub).reduce((sum, current) => sum + current.value, 0));
      const pastItems = previousExpenses.filter(m => m.subcategory === sub);
      if (pastItems.length > 0) {
        const pastAverage = Math.abs(pastItems.reduce((sum, current) => sum + current.value, 0)) / Math.max(1, new Set(pastItems.map(m => m.date.substring(0, 7))).size);
        if (pastAverage > 0 && currentSum > pastAverage * 1.25) {
          const percentage = ((currentSum - pastAverage) / pastAverage) * 100;
          overheadAlerts.push({
            title: `Despesa com ${sub} Elevada`,
            message: `Os gastos da competência atual com ${sub} (R$ ${currentSum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) estão ${percentage.toFixed(1)}% acima da média histórica (R$ ${pastAverage.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`,
            sub
          });
        }
      }
    });
  }

  const expenseAlert = overheadAlerts.length > 0 ? {
    id: 'expense-alert',
    type: 'warning' as const,
    title: 'Despesas Acima da Média Histórica',
    message: overheadAlerts.map(a => a.message).join(' | '),
    icon: AlertTriangle
  } : null;

  // Extra positive points list when movements exist
  let healthAlert: { id: string; type: 'success' | 'warning'; title: string; message: string; icon: any } | null = null;
  if (movements.length > 0) {
    const totalRevenue = movements.filter(m => m.value > 0 && m.isPaid).reduce((sum, curr) => sum + curr.value, 0);
    const totalExpense = Math.abs(movements.filter(m => m.value < 0 && m.isPaid).reduce((sum, curr) => sum + curr.value, 0));
    
    if (totalRevenue > totalExpense * 1.2) {
      healthAlert = {
        id: 'health-ok',
        type: 'success' as const,
        title: 'Potencialidade Financeira Consistente',
        message: 'Seu faturamento acumulado supera suas despesas operacionais, indicando tendências saudáveis de lucratividade.',
        icon: CheckCircle2
      };
    } else if (totalExpense > totalRevenue && totalRevenue > 0) {
      healthAlert = {
        id: 'health-warn',
        type: 'warning' as const,
        title: 'Alerta de Provisão de Capital',
        message: 'A soma dos custos operacionais no período superou o faturamento liquidado. Acompanhe a margem de contribuição.',
        icon: AlertTriangle
      };
    }
  }

  const allAlerts = [
    lowStockAlert,
    overdueAlert,
    incomingContractsAlert,
    expenseAlert,
    healthAlert
  ].filter((a): a is NonNullable<typeof a> => a !== null);

  if (allAlerts.length === 0) {
    return (
      <div className="space-y-4" id="financial-alerts-box">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[#6B6B5F]">
            Sinalizadores de Conformidade e Alertas de Controle
          </h3>
        </div>
        <div className="border border-dashed border-[#E8E6E1] bg-white rounded-2xl p-6 text-center text-slate-400">
          <CheckCircle2 className="size-6 mx-auto opacity-30 text-emerald-600 mb-1" />
          <p className="font-bold text-[#141410] text-xs">Nenhum Alerta Crítico no Momento</p>
          <p className="text-[11px] text-slate-500 mt-1 max-w-md mx-auto">
            O fluxo financeiro e níveis de estoque operam em conformidade. Alertas de vencimentos e médias serão gerados automaticamente conforme a movimentação.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" id="financial-alerts-box">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[#6B6B5F]">
          Sinalizadores de Conformidade e Alertas de Controle
        </h3>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
        {allAlerts.map((alert) => {
          const Icon = alert.icon;
          const bgClass = 
            alert.type === 'danger' ? 'bg-[#FFF5F5] border-[#FFD8D8] text-[#900]' :
            alert.type === 'warning' ? 'bg-[#FFFDEB] border-[#FFE9A3] text-[#865C00]' :
            'bg-[#EBFDF5] border-[#A7F3D0] text-[#065F46]';
          
          const iconBg = 
            alert.type === 'danger' ? 'bg-red-200' :
            alert.type === 'warning' ? 'bg-amber-200' :
            'bg-emerald-200';

          return (
            <div 
              key={alert.id}
              id={`alert-card-${alert.id}`}
              className={`border rounded-2xl p-4 flex gap-3 shadow-xs items-start animate-in fade-in duration-300 ${bgClass}`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${iconBg} text-current`}>
                <Icon className="size-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black uppercase tracking-wider leading-none">
                  {alert.title}
                </h4>
                <p className="text-[11px] font-medium leading-normal opacity-90">
                  {alert.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
