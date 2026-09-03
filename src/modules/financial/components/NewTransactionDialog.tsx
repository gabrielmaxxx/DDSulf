import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSystemStore } from '@/store';

export const COST_CENTERS = ['Geral', 'Equipe Alfa', 'Equipe Beta', 'Veículo 01', 'Veículo 02'];

export const CATEGORY_NAMES = {
  'RECEITAS': 'Receitas de Operação',
  'CUSTOS DIRETOS': 'Custos Diretos (Químicos/Insumos)',
  'DESPESAS OPERACIONAIS': 'Despesas Operacionais (Frota/Campo)',
  'DESPESAS ADMINISTRATIVAS': 'Despesas Administrativas (Sede)',
  'DESPESAS FINANCEIRAS': 'Despesas Financeiras (Passivos)',
  'IMPOSTOS': 'Impostos Municipais/Federais'
};

export const GROUPS_STRUCTURE = {
  'RECEITAS': ['Dedetização', 'Desratização', 'Descupinização', 'Sanitização', 'Contratos Mensais', 'Contratos Anuais'],
  'CUSTOS DIRETOS': ['Produtos Químicos', 'Iscas', 'Gel Baraticida', 'Equipamentos', 'EPIs', 'Uniformes'],
  'DESPESAS OPERACIONAIS': ['Salários', 'Encargos', 'Pró-labore', 'Combustível', 'Pedágios', 'Manutenção de Veículos', 'Marketing', 'Telefonia', 'Internet'],
  'DESPESAS ADMINISTRATIVAS': ['Aluguel', 'Energia', 'Água', 'Material de Escritório', 'Sistemas', 'Contabilidade'],
  'DESPESAS FINANCEIRAS': ['Empréstimos', 'Juros', 'Tarifas Bancárias'],
  'IMPOSTOS': ['Simples Nacional', 'Taxas Municipais', 'Taxas Estaduais']
};

interface NewTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: 'RECEITAS' | 'DESPESAS';
}

export function NewTransactionDialog({
  open,
  onOpenChange,
  defaultType = 'RECEITAS'
}: NewTransactionDialogProps) {
  const { addFinancialMovement } = useSystemStore();

  const [txDescription, setTxDescription] = useState('');
  const [txCategory, setTxCategory] = useState('RECEITAS');
  const [txSubcategory, setTxSubcategory] = useState('');
  const [txValue, setTxValue] = useState('');
  const [txPaymentMethod, setTxPaymentMethod] = useState('Pix');
  const [txCostCenter, setTxCostCenter] = useState('Geral');
  const [txDueDate, setTxDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [txIsPaid, setTxIsPaid] = useState(true);

  // Sync category & subcategory when dialog opens or defaultType changes
  useEffect(() => {
    if (open) {
      if (defaultType === 'RECEITAS') {
        setTxCategory('RECEITAS');
        setTxSubcategory('Dedetização');
      } else {
        setTxCategory('DESPESAS OPERACIONAIS');
        setTxSubcategory('Combustível');
      }
    }
  }, [open, defaultType]);

  // Adjust subcategory whenever category switches
  useEffect(() => {
    const list = GROUPS_STRUCTURE[txCategory as keyof typeof GROUPS_STRUCTURE] || [];
    if (list.length > 0 && !list.includes(txSubcategory)) {
      setTxSubcategory(list[0]);
    }
  }, [txCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const valueNum = parseFloat(txValue);
    if (!txDescription.trim() || isNaN(valueNum) || valueNum <= 0) {
      toast.error('Preencha todos os campos obrigatórios corretamente.');
      return;
    }

    // Deduct direct expenses in backend standard (Despesa is negative)
    const signedValue = txCategory === 'RECEITAS' ? valueNum : -valueNum;

    addFinancialMovement({
      date: new Date().toISOString().split('T')[0],
      description: txDescription.trim(),
      category: txCategory,
      subcategory: txSubcategory,
      value: signedValue,
      paymentMethod: txPaymentMethod,
      costCenter: txCostCenter,
      dueDate: txDueDate,
      isPaid: txIsPaid
    });

    toast.success('Fluxo Reconciliado com Sucesso!', {
      description: `Lançamento "${txDescription.trim()}" no valor de R$ ${valueNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} computado ao Plano de Contas.`
    });

    // Reset Form
    setTxDescription('');
    setTxValue('');
    onOpenChange(false);
  };

  const isReceita = txCategory === 'RECEITAS';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md ${
                isReceita
                  ? 'bg-[#EBFDF5] text-[#2D6A4F]'
                  : 'bg-rose-50 text-rose-800'
              }`}
            >
              {isReceita ? 'CONCILIAÇÃO ENTRADA' : 'CONCILIAÇÃO SAÍDA'}
            </span>
          </div>
          <DialogTitle className="mt-1 text-base font-extrabold text-slate-800">
            {isReceita ? 'Novo Faturamento Recebido' : 'Nova Baixa de Conta / Despesa'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Preencha os dados do lançamento para conciliação instantânea no livro financeiro.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs mt-2">
          {/* Description */}
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Descrição Comercial (Histórico)
            </label>
            <input
              type="text"
              placeholder="Ex: Serviço de Dedetização - Shopping das Flores"
              value={txDescription}
              onChange={(e) => setTxDescription(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 px-3.5 font-sans font-bold text-slate-800 outline-none focus:border-slate-800 focus:bg-white text-xs"
              required
            />
          </div>

          {/* Group Category & Subcategory */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Grupo Geral de Contas
              </label>
              <select
                value={txCategory}
                onChange={(e) => setTxCategory(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 px-3 font-semibold text-slate-700 text-xs"
              >
                {Object.keys(GROUPS_STRUCTURE).map((key) => (
                  <option key={key} value={key}>
                    {CATEGORY_NAMES[key as keyof typeof CATEGORY_NAMES] || key}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Subgrupo Técnico
              </label>
              <select
                value={txSubcategory}
                onChange={(e) => setTxSubcategory(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 font-semibold text-slate-700 text-xs"
              >
                {(GROUPS_STRUCTURE[txCategory as keyof typeof GROUPS_STRUCTURE] || []).map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Value & Payment Method */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Valor Bruto R$
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="2500,00"
                value={txValue}
                onChange={(e) => setTxValue(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 px-3.5 font-mono font-bold text-slate-800 outline-none focus:border-slate-800 focus:bg-white text-xs"
                required
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Meio de Recomutação
              </label>
              <select
                value={txPaymentMethod}
                onChange={(e) => setTxPaymentMethod(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 font-semibold text-slate-700 text-xs"
              >
                {['Pix', 'Boleto', 'Cartão de Crédito', 'Dinheiro', 'Transferência'].map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cost Center & Due Date */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Centro de Custo Ativo
              </label>
              <select
                value={txCostCenter}
                onChange={(e) => setTxCostCenter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 font-semibold text-slate-700 text-xs"
              >
                {COST_CENTERS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Data Limite / Competência
              </label>
              <input
                type="date"
                value={txDueDate}
                onChange={(e) => setTxDueDate(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 px-3.5 font-semibold text-slate-800 text-xs"
              />
            </div>
          </div>

          {/* Instant paid toggler */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="chk-is-paid-dialog"
              checked={txIsPaid}
              onChange={(e) => setTxIsPaid(e.target.checked)}
              className="size-4 accent-[#1B3A2D] shrink-0 cursor-pointer"
            />
            <label htmlFor="chk-is-paid-dialog" className="font-bold text-slate-700 select-none cursor-pointer">
              Marcar como Liquidado / Pago imediatamente em conta principal.
            </label>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer h-10"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="px-5 py-2 bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer h-10"
            >
              Registrar Lançamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
