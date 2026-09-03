import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSystemStore, FinancialMovement } from '@/store';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  Sparkles, 
  Check, 
  AlertTriangle, 
  ShieldCheck,
  BrainCircuit,
  CornerDownRight,
  TrendingUp,
  TrendingDown,
  Info,
  Eye,
  ExternalLink,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { classifyFinancialMovement } from '@/utils/productClassifier';

const PAYMENT_METHODS = ['Pix', 'Boleto', 'Cartão de Crédito', 'Dinheiro', 'Transferência', 'Débito Automático', 'Sem Parar'];
const COST_CENTERS = ['Geral', 'Equipe Alfa', 'Equipe Beta', 'Veículo 01', 'Veículo 02'];

const GROUPS_STRUCTURE = {
  'RECEITAS': [
    'Dedetização',
    'Desratização',
    'Descupinização',
    'Sanitização',
    'Contratos Mensais',
    'Contratos Anuais'
  ],
  'CUSTOS DIRETOS': [
    'Produtos Químicos',
    'Iscas',
    'Gel Baraticida',
    'Equipamentos',
    'EPIs',
    'Uniformes'
  ],
  'DESPESAS OPERACIONAIS': [
    'Salários',
    'Encargos',
    'Pró-labore',
    'Combustível',
    'Pedágios',
    'Manutenção de Veículos',
    'Marketing',
    'Telefonia',
    'Internet'
  ],
  'DESPESAS ADMINISTRATIVAS': [
    'Aluguel',
    'Energia',
    'Água',
    'Material de Escritório',
    'Sistemas',
    'Contabilidade'
  ],
  'DESPESAS FINANCEIRAS': [
    'Empréstimos',
    'Juros',
    'Tarifas Bancárias'
  ],
  'IMPOSTOS': [
    'Simples Nacional',
    'Taxas Municipais',
    'Taxas Estaduais'
  ]
};

export function PlanoContasTab() {
  const { 
    financial, addFinancialMovement, updateFinancialMovement, removeFinancialMovement,
    clients, agenda, quotes
  } = useSystemStore();
  const navigate = useNavigate();
  const movements = financial.movements || [];

  // Inspect Transaction State
  const [inspectMoveId, setInspectMoveId] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('todos');
  const [selectedSub, setSelectedSub] = useState<string>('todas');
  const [selectedCostCenter, setSelectedCostCenter] = useState<string>('todos');

  // Form states (Add/Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('RECEITAS');
  const [subcategory, setSubcategory] = useState<string>('');
  const [valueStr, setValueStr] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Pix');
  const [costCenter, setCostCenter] = useState('Geral');
  const [dueDate, setDueDate] = useState('2026-06-01');
  const [isPaid, setIsPaid] = useState(true);

  // IA Suggested on-the-fly tracking
  const [iaSuggestion, setIaSuggestion] = useState<{ category: string; subcategory: string } | null>(null);
  const [userOverrodeIa, setUserOverrodeIa] = useState(false);

  // Trigger auto-classifier as user types in real-time
  useEffect(() => {
    if (description.trim().length > 2 && !userOverrodeIa) {
      const cls = classifyFinancialMovement(description, parseFloat(valueStr) || 0);
      setIaSuggestion({ category: cls.category, subcategory: cls.subcategory });
      
      // Auto assign if user hasn't explicitly customized yet
      setCategory(cls.category);
      setSubcategory(cls.subcategory);
    } else if (description.trim().length <= 2) {
      setIaSuggestion(null);
    }
  }, [description, userOverrodeIa]);

  // Adjust subcategories select when main group changes
  useEffect(() => {
    const list = GROUPS_STRUCTURE[category as keyof typeof GROUPS_STRUCTURE] || [];
    if (list.length > 0 && !list.includes(subcategory)) {
      setSubcategory(list[0]);
    }
  }, [category]);

  const handleOpenAddForm = () => {
    setEditingId(null);
    setDescription('');
    setCategory('RECEITAS');
    setSubcategory('Dedetização');
    setValueStr('');
    setPaymentMethod('Pix');
    setCostCenter('Geral');
    setDueDate('2026-06-01');
    setIsPaid(true);
    setIaSuggestion(null);
    setUserOverrodeIa(false);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (mov: FinancialMovement) => {
    setEditingId(mov.id);
    setDescription(mov.description);
    setCategory(mov.category);
    setSubcategory(mov.subcategory);
    setValueStr(Math.abs(mov.value).toString());
    setPaymentMethod(mov.paymentMethod || 'Pix');
    setCostCenter(mov.costCenter || 'Geral');
    setDueDate(mov.dueDate || '2026-06-01');
    setIsPaid(mov.isPaid !== undefined ? mov.isPaid : true);
    setIaSuggestion(null);
    setUserOverrodeIa(true); // Don't trigger auto smart overrides in editing
    setIsFormOpen(true);
  };

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error('Preencha a descrição.');
      return;
    }

    const numericVal = parseFloat(valueStr);
    if (isNaN(numericVal) || numericVal <= 0) {
      toast.error('Insira um valor numérico válido.');
      return;
    }

    // Direct cost or expense should be stored as negative! Receipts should be positive.
    const finalValue = category === 'RECEITAS' ? numericVal : -numericVal;

    const dataPayload: Omit<FinancialMovement, 'id'> = {
      date: new Date().toISOString().split('T')[0],
      description: description.trim(),
      category: category,
      subcategory: subcategory,
      value: finalValue,
      paymentMethod: paymentMethod,
      costCenter: costCenter,
      dueDate: dueDate,
      isPaid: isPaid
    };

    if (editingId) {
      updateFinancialMovement(editingId, dataPayload);
      toast.success('Movimentação atualizada com sucesso!');
    } else {
      addFinancialMovement(dataPayload);
      toast.success('Movimentação adicionada e catalogada no plano de contas!');
    }

    setIsFormOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza de que deseja excluir esta movimentação financeira?')) {
      removeFinancialMovement(id);
      toast.success('Lançamento removido do Plano de Contas.');
    }
  };

  const handleApplyIaSuggestion = () => {
    if (iaSuggestion) {
      setCategory(iaSuggestion.category);
      setSubcategory(iaSuggestion.subcategory);
      toast.info(`Sugestão automática aplicada: ${iaSuggestion.category} ➔ ${iaSuggestion.subcategory}`);
    }
  };

  // Diagnostic checklist validation for PestFlow
  const validateMovement = (mov: FinancialMovement) => {
    const missing = [];
    if (!mov.date) missing.push('Data');
    if (!mov.category) missing.push('Categoria');
    if (!mov.subcategory) missing.push('Subcategoria');
    if (mov.value === undefined || mov.value === 0) missing.push('Valor');
    if (!mov.paymentMethod) missing.push('Forma de Pagamento');
    if (!mov.costCenter) missing.push('Centro de Custo');
    return {
      isValid: missing.length === 0,
      missing
    };
  };

  // Filter movements
  const filtered = movements.filter(mov => {
    const term = searchTerm.toLowerCase();
    const descMatches = mov.description.toLowerCase().includes(term);
    const catMatches = mov.category.toLowerCase().includes(term);
    const subMatches = mov.subcategory.toLowerCase().includes(term);
    const searchCondition = descMatches || catMatches || subMatches;

    const groupCondition = selectedGroup === 'todos' || mov.category === selectedGroup;
    const subCondition = selectedSub === 'todas' || mov.subcategory === selectedSub;
    const costCondition = selectedCostCenter === 'todos' || mov.costCenter === selectedCostCenter;

    return searchCondition && groupCondition && subCondition && costCondition;
  });

  return (
    <div className="space-y-6" id="plano-contas-container">
      
      {/* Search and interactive actions */}
      <div className="bg-white rounded-3xl border border-[#E8E6E1] p-6 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#6B6B5F]" />
            <input 
              type="text" 
              placeholder="Pesquisar por descrição, grupo ou subgrupo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FAFAF9] border border-[#E8E6E1] rounded-2xl py-3 pl-10 pr-4 text-xs font-medium text-[#141410] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 placeholder:text-[#9D9D90]"
            />
          </div>

          {/* Group Filter */}
          <select
            value={selectedGroup}
            onChange={(e) => {
              setSelectedGroup(e.target.value);
              setSelectedSub('todas');
            }}
            className="bg-white border border-[#E8E6E1] text-[11px] font-sans font-bold uppercase tracking-wider py-3 px-4 rounded-xl text-[#6B6B5F] focus:outline-none"
          >
            <option value="todos">🗂️ TODOS OS GRUPOS</option>
            {Object.keys(GROUPS_STRUCTURE).map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>

          {/* Subcategory Filter */}
          <select
            value={selectedSub}
            onChange={(e) => setSelectedSub(e.target.value)}
            disabled={selectedGroup === 'todos'}
            className="bg-white border border-[#E8E6E1] text-[11px] font-sans font-bold uppercase tracking-wider py-3 px-4 rounded-xl text-[#6B6B5F] focus:outline-none disabled:opacity-55"
          >
            <option value="todas">📂 TODAS SUB-CATEGORIAS</option>
            {selectedGroup !== 'todos' && 
              GROUPS_STRUCTURE[selectedGroup as keyof typeof GROUPS_STRUCTURE]?.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))
            }
          </select>

          {/* Cost Center Filter */}
          <select
            value={selectedCostCenter}
            onChange={(e) => setSelectedCostCenter(e.target.value)}
            className="bg-white border border-[#E8E6E1] text-[11px] font-sans font-bold uppercase tracking-wider py-3 px-4 rounded-xl text-[#6B6B5F] focus:outline-none"
          >
            <option value="todos">🎯 CENTRO DE CUSTO: TODOS</option>
            {COST_CENTERS.map(cc => (
              <option key={cc} value={cc}>{cc}</option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleOpenAddForm}
          className="bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white font-bold text-xs uppercase tracking-wider px-5 py-3.5 rounded-xl h-fit flex items-center gap-2 cursor-pointer shrink-0"
          id="btn-add-movement"
        >
          <Plus className="size-4" />
          Novo Lançamento
        </Button>
      </div>

      {/* Real-time Dynamic AI Rule Validation Banner */}
      <div className="bg-[#F4F1EB] rounded-2xl p-4 border border-[#E8E6E1] flex flex-col md:flex-row justify-between items-center gap-3 text-xs">
        <div className="flex items-center gap-3 text-[#141410]">
          <div className="p-2.5 rounded-xl bg-white shadow-xs text-[#2D6A4F]">
            <BrainCircuit className="size-5" />
          </div>
          <div className="text-left">
            <h5 className="font-bold">Motor de Classificação PestFlow Inteligente</h5>
            <p className="text-[11px] text-[#6B6B5F]">Cadastre ou importe lançamentos para catalogar instantaneamente nos grupos do DRE e planos de contas.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="bg-[#EBFDF5] text-[#065F46] font-bold px-3 py-1.5 rounded-lg border border-[#A7F3D0] text-[10px] uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="size-3.5" />
            Taxonomia Ativa
          </span>
          <span className="bg-[#FFF5F5] text-[#900] font-bold px-3 py-1.5 rounded-lg border border-[#FFD8D8] text-[10px] uppercase tracking-wider">
            Revisão Automática
          </span>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-3xl border border-[#E8E6E1] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="plano-contas-table">
            <thead>
              <tr className="border-b border-[#E8E6E1] bg-[#FAFAF9] text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F]">
                <th className="py-4 px-6">Data</th>
                <th className="py-4 px-6">Lançamento / Descrição</th>
                <th className="py-4 px-6">Grupo Principal</th>
                <th className="py-4 px-6">Sub-categoria</th>
                <th className="py-4 px-6">Forma pgto.</th>
                <th className="py-4 px-6">Centro de custo</th>
                <th className="py-4 px-6 text-right">Valor</th>
                <th className="py-4 px-6 text-center">Status / Validação</th>
                <th className="py-2 px-6 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E6E1] text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#6B6B5F] font-medium font-sans">
                    Não foram encontradas movimentações financeiras com estes filtros.
                  </td>
                </tr>
              ) : (
                filtered.map((mov) => {
                  const diag = validateMovement(mov);
                  const isRev = mov.value > 0;

                  return (
                    <tr 
                      key={mov.id} 
                      id={`row-mov-${mov.id}`} 
                      className="hover:bg-[#FCFBF9] transition-colors"
                    >
                      <td className="py-4 px-6 font-mono font-bold text-[#6B6B5F]">
                        {mov.date ? new Date(mov.date).toLocaleDateString('pt-BR') : '⚠️ NÃO INFORMADO'}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-[#141410] max-w-xs truncate" title={mov.description}>
                          {mov.description}
                        </div>
                        {mov.dueDate && !mov.isPaid && (
                          <div className="text-[10px] font-semibold text-rose-600 mt-0.5 flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                            Vence em: {new Date(mov.dueDate).toLocaleDateString('pt-BR')} (Aberto)
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          mov.category === 'RECEITAS' ? 'bg-[#EBFDF5] border-[#A7F3D0] text-[#065F46]' :
                          mov.category === 'CUSTOS DIRETOS' ? 'bg-[#FFF5F5] border-[#FFD8D8] text-[#900]' :
                          'bg-[#FAFAF9] border-[#E8E6E1] text-[#6B6B5F]'
                        }`}>
                          {mov.category || '⚠️ NÃO INFORMADO'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-[#141410]">
                        {mov.subcategory || '⚠️ NÃO INFORMADO'}
                      </td>
                      <td className="py-4 px-6 font-medium text-[#6B6B5F]">
                        {mov.paymentMethod || '⚠️ NÃO INFORMADO'}
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-700">
                        {mov.costCenter || '⚠️ NÃO INFORMADO'}
                      </td>
                      <td className={`py-4 px-6 text-right font-mono font-bold ${
                        isRev ? 'text-emerald-700' : 'text-neutral-900'
                      }`}>
                        {isRev ? '+' : ''} R$ {mov.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center">
                          {diag.isValid ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <Check className="size-3" />
                              Completo
                            </span>
                          ) : (
                            <span 
                              className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-help"
                              title={`Incompleto! Faltando: ${diag.missing.join(', ')}`}
                            >
                              <AlertTriangle className="size-3" />
                              Inconsistente
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setInspectMoveId(mov.id)}
                            className="p-1.5 hover:bg-emerald-50 text-emerald-600 hover:text-emerald-800 rounded-lg transition-colors cursor-pointer animate-pulse-sub"
                            title="Visualizar Vínculos"
                          >
                            <Eye className="size-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditForm(mov)}
                            className="p-1.5 hover:bg-[#FAFAF9] text-[#6B6B5F] hover:text-[#141410] rounded-lg transition-colors cursor-pointer"
                            title="Editar lançamento"
                          >
                            <Edit className="size-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(mov.id)}
                            className="p-1.5 hover:bg-[#FFF5F5] text-rose-500 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                            title="Excluir lançamento"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog Oficial: Novo Lançamento Manual / Editar Lançamento */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent size="md" className="sm:max-w-xl p-6 md:p-8 text-left max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-[#E8E6E1] pb-4 pr-6">
            <DialogTitle className="font-display text-xl font-bold text-[#141410]">
              {editingId ? 'Editar Lançamento' : 'Novo Lançamento Manual'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6B6B5F]">
              Toda movimentação financeira deve ser automaticamente classificada.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveMovement} className="space-y-4 text-xs font-sans mt-2">
              
              {/* Lançamento / Descrição */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F]">
                  Lançamento / Descrição
                </label>
                <input 
                  type="text"
                  placeholder="Ex: Compra de BIFENTOL, Google Ads..."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setUserOverrodeIa(false); // Enable IA suggest as user modifies
                  }}
                  className="w-full bg-[#FAFAF9] border border-[#E8E6E1] rounded-xl py-3 px-4 font-medium"
                />
              </div>

              {/* Dynamic IA classification helper banner */}
              {iaSuggestion && (
                <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-3 flex justify-between items-center gap-3">
                  <div className="flex items-center gap-2 text-[#065F46]">
                    <Sparkles className="size-4 shrink-0 text-[#10B981] animate-pulse" />
                    <div>
                      <span className="font-extrabold leading-none block">🤖 IA Classificou Automaticamente</span>
                      <span className="text-[10px] opacity-90 leading-tight">Sugestão: {iaSuggestion.category} ➔ {iaSuggestion.subcategory}</span>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={handleApplyIaSuggestion}
                    className="bg-[#10B981] hover:bg-[#059669] text-white font-extrabold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Check className="size-3" /> Aplicar
                  </button>
                </div>
              )}

              {/* Category, Subcategory Pair */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F]">
                    Grupo Principal
                  </label>
                  <select 
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setUserOverrodeIa(true);
                    }}
                    className="w-full bg-[#FAFAF9] border border-[#E8E6E1] rounded-xl py-3 px-4 font-bold uppercase text-[11px]"
                  >
                    {Object.keys(GROUPS_STRUCTURE).map(grp => (
                      <option key={grp} value={grp}>{grp}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F]">
                    Sub-categoria
                  </label>
                  <select 
                    value={subcategory}
                    onChange={(e) => {
                      setSubcategory(e.target.value);
                      setUserOverrodeIa(true);
                    }}
                    className="w-full bg-[#FAFAF9] border border-[#E8E6E1] rounded-xl py-3 px-4 font-bold text-[11px]"
                  >
                    {(GROUPS_STRUCTURE[category as keyof typeof GROUPS_STRUCTURE] || []).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Value and Payment Method */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F]">
                    Valor (R$)
                  </label>
                  <input 
                    type="text"
                    placeholder="0.00"
                    value={valueStr}
                    onChange={(e) => setValueStr(e.target.value)}
                    className="w-full bg-[#FAFAF9] border border-[#E8E6E1] rounded-xl py-3 px-4 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F]">
                    Forma de Pagamento
                  </label>
                  <select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-[#FAFAF9] border border-[#E8E6E1] rounded-xl py-3 px-4 font-semibold"
                  >
                    {PAYMENT_METHODS.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cost Center and Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F]">
                    Centro de Custo
                  </label>
                  <select 
                    value={costCenter}
                    onChange={(e) => setCostCenter(e.target.value)}
                    className="w-full bg-[#FAFAF9] border border-[#E8E6E1] rounded-xl py-3 px-4 font-semibold"
                  >
                    {COST_CENTERS.map(cc => (
                      <option key={cc} value={cc}>{cc}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F]">
                    Data de Vencimento
                  </label>
                  <input 
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-[#FAFAF9] border border-[#E8E6E1] rounded-xl py-3 px-4 font-mono"
                  />
                </div>
              </div>

              {/* Status de Pagamento (isPaid) Checkbox */}
              <div className="flex items-center gap-2 pt-2 pb-2">
                <input 
                  type="checkbox"
                  id="checkbox-ispaid"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  className="size-4 hover:scale-105 cursor-pointer accent-[#2D6A4F]"
                />
                <label htmlFor="checkbox-ispaid" className="text-[11px] font-bold text-gray-700 cursor-pointer">
                  A movimentação já foi devidamente quitada / paga (Marcar como Pago)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E8E6E1]">
                <Button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-[#FAFAF9] border border-[#E8E6E1] text-[#6B6B5F] hover:text-[#141410] px-5 py-3 rounded-xl uppercase tracking-wider font-bold h-fit"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white px-6 py-3 rounded-xl uppercase tracking-wider font-extrabold h-fit cursor-pointer flex items-center gap-1.5"
                >
                  Confirmar Lançamento
                </Button>
              </div>

          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
