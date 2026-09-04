import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Package, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { CATEGORIES_LIST, UNITS_LIST } from '../types';
import { scanProductSmartly } from '@/utils/productClassifier';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  product?: any | null;
  onSave: (data: {
    id?: string;
    name: string;
    category: string;
    unit: string;
    quantity: number;
    minQuantity: number;
    costPerUnit: number;
    supplier: string;
    chemicalGroup: string;
    activeIngredient: string;
    productGroup: string;
    lot: string;
    expiryDate: string;
  }) => void;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  mode,
  product,
  onSave,
}: ProductFormDialogProps) {
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('inseticida');
  const [formUnit, setFormUnit] = useState('ml');
  const [formQty, setFormQty] = useState(0);
  const [formMinQty, setFormMinQty] = useState(0);
  const [formCost, setFormCost] = useState(0);
  const [formSupplier, setFormSupplier] = useState('');
  const [formChemicalGroup, setFormChemicalGroup] = useState('');
  const [formActiveIngredient, setFormActiveIngredient] = useState('');
  const [formProductGroup, setFormProductGroup] = useState('Inseticidas');
  const [formLot, setFormLot] = useState('LT-2026-INI');
  const [formExpiryDate, setFormExpiryDate] = useState('');

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && product) {
        setFormName(product.name || '');
        setFormCategory(product.category || 'inseticida');
        setFormUnit(product.unit || 'ml');
        setFormQty(product.quantity || 0);
        setFormMinQty(product.minQuantity || 0);
        setFormCost(product.costPerUnit || 0);
        setFormSupplier(product.supplier || '');
        setFormChemicalGroup(product.chemicalGroup || '');
        setFormActiveIngredient(product.activeIngredient || '');
        setFormProductGroup(product.productGroup || 'Inseticidas');
        setFormLot(product.lot || 'LOTE-PADRAO');
        setFormExpiryDate(product.expiryDate || '');
      } else {
        setFormName('');
        setFormCategory('inseticida');
        setFormUnit('ml');
        setFormQty(0);
        setFormMinQty(0);
        setFormCost(0);
        setFormSupplier('');
        setFormChemicalGroup('');
        setFormActiveIngredient('');
        setFormProductGroup('Inseticidas');
        setFormLot('LT-2026-INI');
        setFormExpiryDate(
          new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0]
        );
      }
    }
  }, [open, mode, product]);

  // Intelligent auto-classification on name change in create mode
  useEffect(() => {
    if (mode === 'create' && formName.trim().length > 3) {
      const match = scanProductSmartly(formName);
      if (match.isOfficialMatch && match.officialProduct) {
        setFormCategory(match.officialProduct.categoryCode);
        setFormUnit(match.officialProduct.unit);
        setFormSupplier(match.officialProduct.supplier);
        setFormProductGroup(match.officialProduct.productGroup);
        setFormChemicalGroup(match.officialProduct.chemicalGroup);
        setFormActiveIngredient(match.officialProduct.activeIngredient);
      } else {
        setFormProductGroup(match.classification.productGroup);
        setFormChemicalGroup(match.classification.chemicalGroup);
        setFormActiveIngredient(match.classification.activeIngredient);
        setFormCategory(match.classification.categoryCode);
        setFormUnit(match.classification.unit);
      }
    }
  }, [formName, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Nome do produto é requerido');
      return;
    }

    onSave({
      id: product?.id,
      name: formName.trim(),
      category: formCategory,
      unit: formUnit,
      quantity: formQty,
      minQuantity: formMinQty,
      costPerUnit: formCost,
      supplier: formSupplier.trim() || 'Fornecedor',
      chemicalGroup: formChemicalGroup.trim() || 'NÃO DESIGNADO',
      activeIngredient: formActiveIngredient.trim() || 'NÃO ESPECIFICADO',
      productGroup: formProductGroup,
      lot: formLot.trim(),
      expiryDate: formExpiryDate,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="p-0 overflow-hidden rounded-3xl border-slate-200 max-h-[90vh] flex flex-col">
        <div className="p-5 bg-[#1B3A2D] text-white flex items-center justify-between text-left shrink-0">
          <div>
            <DialogHeader>
              <DialogTitle className="text-base font-extrabold uppercase tracking-tight font-display text-white flex items-center gap-2">
                <Package className="size-4 text-emerald-400" />
                {mode === 'create' ? 'Cadastrar Insumo Manual' : 'Ficha Cadastral de Produto'}
              </DialogTitle>
              <DialogDescription className="text-[11px] text-[#A8CDB8] mt-0.5">
                Informe as especificações toxicológicas exigidas.
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 text-xs font-semibold text-slate-700 text-left overflow-y-auto flex-1"
        >
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase font-black text-slate-450 block">
                Nome Comercial *
              </span>
              {mode === 'create' && (
                <span className="text-[9px] text-[#1B3A2D] font-bold flex items-center gap-1">
                  <Sparkles className="size-3 text-emerald-600" /> Autoclassificação ativa
                </span>
              )}
            </div>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Ex: OPTIGARD LT WG"
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-black text-slate-450 block">
                Grupo de Produto
              </span>
              <input
                type="text"
                value={formProductGroup}
                onChange={(e) => setFormProductGroup(e.target.value)}
                placeholder="Ex: Inseticidas"
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-black text-slate-450 block">
                Princípio Ativo *
              </span>
              <input
                type="text"
                required
                value={formActiveIngredient}
                onChange={(e) => setFormActiveIngredient(e.target.value)}
                placeholder="Ex: Tiametoxam"
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-black text-slate-450 block">
                Grupo Químico
              </span>
              <input
                type="text"
                value={formChemicalGroup}
                onChange={(e) => setFormChemicalGroup(e.target.value)}
                placeholder="Ex: Neonicotinóide"
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-black text-slate-450 block">
                Fabricante *
              </span>
              <input
                type="text"
                required
                value={formSupplier}
                onChange={(e) => setFormSupplier(e.target.value)}
                placeholder="Ex: Syngenta"
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-black text-slate-450 block">
                Categoria
              </span>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full h-10 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]"
              >
                {CATEGORIES_LIST.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-black text-slate-450 block">
                Unidade de Medida
              </span>
              <select
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
                className="w-full h-10 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]"
              >
                {UNITS_LIST.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-black text-slate-450 block">
                Qtd Estoque
              </span>
              <input
                type="number"
                value={formQty}
                onChange={(e) => setFormQty(parseFloat(e.target.value) || 0)}
                className="w-full h-10 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-center font-bold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-black text-slate-450 block">
                Segurança Mínima
              </span>
              <input
                type="number"
                value={formMinQty}
                onChange={(e) => setFormMinQty(parseFloat(e.target.value) || 0)}
                className="w-full h-10 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-center font-bold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-black text-slate-450 block">
                Custo (R$)
              </span>
              <input
                type="number"
                step="ANY"
                value={formCost}
                onChange={(e) => setFormCost(parseFloat(e.target.value) || 0)}
                className="w-full h-10 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-center font-bold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-black text-slate-450 block">
                Lote / Fabricação
              </span>
              <input
                type="text"
                value={formLot}
                onChange={(e) => setFormLot(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-black text-slate-450 block">
                Validade Sanitária
              </span>
              <input
                type="date"
                value={formExpiryDate}
                onChange={(e) => setFormExpiryDate(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-slate-400 font-bold uppercase hover:text-slate-700 text-[10px] cursor-pointer"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              className="bg-[#1B3A2D] hover:bg-[#1B3A2D]/95 text-white font-black uppercase text-[10px] py-2 px-4 rounded-xl cursor-pointer"
            >
              Registrar e Persistir
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
