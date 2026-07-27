import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSystemStore, FinancialMovement, InventoryProduct } from '@/store';
import { 
  Upload, 
  FileSpreadsheet, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  HelpCircle,
  CornerDownRight,
  RefreshCcw,
  Plus,
  Package,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { classifyFinancialMovement } from '@/utils/productClassifier';

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

interface ImportedRow {
  id: string;
  date: string;
  description: string;
  category: string;
  subcategory: string;
  value: number;
  paymentMethod: string;
  costCenter: string;
  dueDate: string;
  isPaid: boolean;
}

interface ParsedSupplierProduct {
  id: string;
  name: string;
  activeIngredient: string;
  supplier: string;
  costPerUnit: number;
  quantity: number;
  category: string;
  unit: string;
  exists: boolean;
  matchedId?: string;
  chemicalGroup?: string;
  productGroup?: string;
}

export function SpreadsheetImportTab() {
  const { 
    addFinancialMovement, 
    inventory, 
    addInventoryProduct, 
    updateInventoryProduct, 
    addInventoryMovement,
    purchases
  } = useSystemStore();
  
  const products = inventory?.products || [];

  const [importMode, setImportMode] = useState<'financial' | 'supplier_quote'>('financial');
  const [file, setFile] = useState<File | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);

  // Financial Column Mappings
  const [mappedDescCol, setMappedDescCol] = useState<string>('');
  const [mappedValCol, setMappedValCol] = useState<string>('');
  const [mappedDateCol, setMappedDateCol] = useState<string>('');
  const [mappedPayCol, setMappedPayCol] = useState<string>('');
  const [mappedCcCol, setMappedCcCol] = useState<string>('');
  
  const [financialRows, setFinancialRows] = useState<ImportedRow[]>([]);

  // Supplier Quote Column Mappings (Fluxo 12)
  const [mappedProdName, setMappedProdName] = useState<string>('');
  const [mappedActiveIng, setMappedActiveIng] = useState<string>('');
  const [mappedSupplier, setMappedSupplier] = useState<string>('');
  const [mappedCost, setMappedCost] = useState<string>('');
  const [mappedQty, setMappedQty] = useState<string>('');
  const [mappedCategory, setMappedCategory] = useState<string>('');
  const [mappedUnit, setMappedUnit] = useState<string>('');

  const [supplierProducts, setSupplierProducts] = useState<ParsedSupplierProduct[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // File change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        setWorkbook(wb);
        setSheetNames(wb.SheetNames);
        setSelectedSheet(wb.SheetNames[0]);
        
        loadSheetHeaders(wb, wb.SheetNames[0]);
        toast.success(`Planilha carregada. Escolha a aba para análise.`);
      } catch (err) {
        toast.error('Erro ao ler arquivo da planilha. Certifique-se de que é um .xlsx válido.');
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const loadSheetHeaders = (wb: XLSX.WorkBook, sheetName: string) => {
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
    if (data.length > 0) {
      const firstRowHeaders = data[0] as string[];
      setHeaders(firstRowHeaders);
      
      // Auto mapping guesses based on mode
      guessMappings(firstRowHeaders);
    }
  };

  const guessMappings = (hList: string[]) => {
    hList.forEach(col => {
      const name = String(col).toLowerCase();
      
      // Standard financial mappings
      if (name.includes('desc') || name.includes('hist') || name.includes('trans')) {
        setMappedDescCol(col);
      } else if (name.includes('val') || name.includes('total') || name.includes('quant')) {
        setMappedValCol(col);
      } else if (name.includes('dat') || name.includes('competê')) {
        setMappedDateCol(col);
      } else if (name.includes('form') || name.includes('pag') || name.includes('meio')) {
        setMappedPayCol(col);
      } else if (name.includes('cent') || name.includes('equi') || name.includes('veíc')) {
        setMappedCcCol(col);
      }

      // Supplier Quote mappings
      if (name.includes('prod') || name.includes('nome') || name.includes('comerc')) {
        setMappedProdName(col);
      } else if (name.includes('ativ') || name.includes('princ') || name.includes('quim')) {
        setMappedActiveIng(col);
      } else if (name.includes('fabr') || name.includes('forn') || name.includes('sup') || name.includes('marca')) {
        setMappedSupplier(col);
      } else if (name.includes('cust') || name.includes('preç') || name.includes('val') || name.includes('unit')) {
        setMappedCost(col);
      } else if (name.includes('qtd') || name.includes('quant') || name.includes('vol')) {
        setMappedQty(col);
      } else if (name.includes('categ') || name.includes('grupo') || name.includes('tipo')) {
        setMappedCategory(col);
      } else if (name.includes('unid') || name.includes('med')) {
        setMappedUnit(col);
      }
    });
  };

  const handleSheetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sName = e.target.value;
    setSelectedSheet(sName);
    if (workbook) {
      loadSheetHeaders(workbook, sName);
    }
  };

  // Process data spreadsheet
  const handleProcessSpreadsheet = () => {
    if (!workbook || !selectedSheet) return;

    if (importMode === 'financial') {
      if (!mappedDescCol || !mappedValCol) {
        toast.error('Você deve selecionar pelo menos a coluna de Descrição e a coluna de Valor.');
        return;
      }

      setIsProcessing(true);
      try {
        const ws = workbook.Sheets[selectedSheet];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        const parsedRows: ImportedRow[] = data.map((raw: any, index: number) => {
          const rawDesc = raw[mappedDescCol] || '';
          const rawVal = parseFloat(raw[mappedValCol]) || 0;
          
          const classification = classifyFinancialMovement(rawDesc, rawVal);

          const rawDate = raw[mappedDateCol] || new Date().toISOString().split('T')[0];
          const rawPay = raw[mappedPayCol] || 'Pix';
          const rawCc = raw[mappedCcCol] || 'Geral';

          return {
            id: `imp-${index}-${Math.random().toString(36).substring(2, 6)}`,
            date: String(rawDate).includes('/') ? swapDateFormat(String(rawDate)) : String(rawDate),
            description: String(rawDesc),
            category: classification.category,
            subcategory: classification.subcategory,
            value: rawVal,
            paymentMethod: String(rawPay),
            costCenter: String(rawCc),
            dueDate: new Date().toISOString().split('T')[0],
            isPaid: true
          };
        });

        setFinancialRows(parsedRows);
        setSupplierProducts([]);
        toast.success(`${parsedRows.length} lançamentos financeiros mapeados com IA!`);
      } catch (err) {
        toast.error('Erro ao processar as linhas da planilha.');
      } finally {
        setIsProcessing(false);
      }
    } else {
      // MODE: Supplier Quota / Products Quote (Fluxo 12)
      if (!mappedProdName || !mappedCost) {
        toast.error('Selecione pelo menos a coluna de Nome do Produto e Custo Unitário R$.');
        return;
      }

      setIsProcessing(true);
      try {
        const ws = workbook.Sheets[selectedSheet];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        const parsedProducts: ParsedSupplierProduct[] = data.map((raw: any, index: number) => {
          const pName = String(raw[mappedProdName] || '').trim();
          const pCost = parseFloat(raw[mappedCost]) || 0;
          const pActive = String(raw[mappedActiveIng] || pName).trim();
          const pSupplier = String(raw[mappedSupplier] || file?.name || 'Fornecedor Importado').trim();
          const pQty = parseFloat(raw[mappedQty]) || 1; // Default purchase 1 if specified
          const pCategory = String(raw[mappedCategory] || 'inseticida').toLowerCase().trim();
          const pUnit = String(raw[mappedUnit] || 'ml').trim();

          // Match Principle Active + Manufacturer (Supplier)
          const matchedItem = products.find(op => 
            (op.activeIngredient || '').toLowerCase() === pActive.toLowerCase() &&
            (op.supplier || '').toLowerCase() === pSupplier.toLowerCase()
          );

          return {
            id: `prod-imp-${index}-${Math.random().toString(36).substring(2, 6)}`,
            name: pName,
            activeIngredient: pActive,
            supplier: pSupplier,
            costPerUnit: pCost,
            quantity: pQty,
            category: pCategory.includes('rat') ? 'raticida' : pCategory.includes('fung') ? 'fungicida' : 'inseticida',
            unit: pUnit || 'ml',
            exists: !!matchedItem,
            matchedId: matchedItem?.id
          };
        });

        setSupplierProducts(parsedProducts);
        setFinancialRows([]);
        toast.success(`${parsedProducts.length} itens do orçamento fornecedor pré-importados!`);
      } catch (err) {
        toast.error('Erro ao processar as linhas de produtos do fornecedor.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const swapDateFormat = (str: string) => {
    const pts = str.split('/');
    if (pts.length === 3) {
      const d = pts[0].padStart(2, '0');
      const m = pts[1].padStart(2, '0');
      let y = pts[2];
      if (y.length === 2) y = '20' + y;
      return `${y}-${m}-${d}`;
    }
    return str;
  };

  const handleRowCategoryChange = (rowId: string, value: string) => {
    setFinancialRows(prev => prev.map(r => {
      if (r.id === rowId) {
        const subs = GROUPS_STRUCTURE[value as keyof typeof GROUPS_STRUCTURE] || [];
        return { ...r, category: value, subcategory: subs[0] || '' };
      }
      return r;
    }));
  };

  const handleRowSubcategoryChange = (rowId: string, value: string) => {
    setFinancialRows(prev => prev.map(r => (r.id === rowId ? { ...r, subcategory: value } : r)));
  };

  const handleRowValueChange = (rowId: string, value: number) => {
    setFinancialRows(prev => prev.map(r => (r.id === rowId ? { ...r, value: value } : r)));
  };

  const handleRowDescriptionChange = (rowId: string, value: string) => {
    setFinancialRows(prev => prev.map(r => (r.id === rowId ? { ...r, description: value } : r)));
  };

  // Parsed product field modifications
  const handleSupplierProductChange = (id: string, field: keyof ParsedSupplierProduct, value: any) => {
    setSupplierProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // Bulk commit financial movements
  const handleCommitFinancialImport = () => {
    if (financialRows.length === 0) return;
    
    financialRows.forEach(r => {
      addFinancialMovement({
        date: r.date,
        description: r.description,
        category: r.category,
        subcategory: r.subcategory,
        value: r.value,
        paymentMethod: r.paymentMethod,
        costCenter: r.costCenter,
        dueDate: r.dueDate,
        isPaid: r.isPaid
      });
    });

    toast.success(`Importação Concluída! ${financialRows.length} lançamentos adicionados ao Plano de Contas.`);
    resetState();
  };

  // Bulk commit supplier quote (Fluxo 12)
  const handleCommitSupplierImport = () => {
    if (supplierProducts.length === 0) return;

    let addedCount = 0;
    let updatedCount = 0;
    let totalFinancialOutflow = 0;

    supplierProducts.forEach(item => {
      totalFinancialOutflow += (item.costPerUnit * item.quantity);

      if (item.exists && item.matchedId) {
        // Exists: Overwrite costPerUnit, increase quantity, log movement
        const original = products.find(p => p.id === item.matchedId);
        if (original) {
          const nextQty = original.quantity + item.quantity;
          
          updateInventoryProduct(original.id, {
            costPerUnit: item.costPerUnit,
            quantity: nextQty
          });

          addInventoryMovement({
            id: `mov-supplier-${Math.random().toString(36).substring(2, 11)}`,
            date: new Date().toISOString().split('T')[0],
            productId: original.id,
            type: 'entrada',
            quantity: item.quantity,
            reason: `Importação de Orçamento de Fornecedor (${item.supplier})`,
            lot: 'LOTE-IMPORTADO',
            expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0]
          });

          updatedCount++;
        }
      } else {
        // Create new chemical product (PestFlow matching principle: Principle Active + Manufacturer)
        const newId = `prod-gen-${Math.random().toString(36).substring(2, 11)}`;
        const newProd: InventoryProduct = {
          id: newId,
          name: item.name,
          category: item.category,
          unit: item.unit,
          quantity: item.quantity,
          minQuantity: 5,
          idealQuantity: 15,
          costPerUnit: item.costPerUnit,
          supplier: item.supplier,
          activeIngredient: item.activeIngredient,
          chemicalGroup: 'Não Especificado',
          productGroup: 'Geral',
          lastUpdated: new Date().toISOString()
        };

        addInventoryProduct(newProd);

        addInventoryMovement({
          id: `mov-supplier-${Math.random().toString(36).substring(2, 11)}`,
          date: new Date().toISOString().split('T')[0],
          productId: newId,
          type: 'entrada',
          quantity: item.quantity,
          reason: `Auto-criação por orçamento fornecedor (${item.supplier})`,
          lot: 'LOTE-IMPORTADO'
        });

        addedCount++;
      }

      // Check for matching "Pendente" purchases to approve them automatically!
      const matchingPendings = (purchases || []).filter(p => 
        p.status === 'Pendente' && 
        p.productName.toLowerCase().includes(item.name.toLowerCase())
      );
      matchingPendings.forEach(pending => {
        // Fulfilling pending
        toast.info(`Requisição de Compra Pendente atendida para o item: ${pending.productName}`);
      });
    });

    // AUTOMATION: Log Purchase transaction in financial ledger!
    if (totalFinancialOutflow > 0) {
      addFinancialMovement({
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        description: `Entrada Consolidada - Orçamentos de Fornecedores (${supplierProducts[0]?.supplier || 'Importado'})`,
        category: 'CUSTOS DIRETOS',
        subcategory: 'Produtos Químicos',
        value: totalFinancialOutflow,
        paymentMethod: 'Boleto',
        costCenter: 'Estoque / Compras',
        isPaid: true
      });
    }

    toast.success(`Fluxo 12 Executado! ${addedCount} novos insumos cadastrados, ${updatedCount} atualizados. Custo total lançado.`);
    resetState();
  };

  const resetState = () => {
    setFile(null);
    setFinancialRows([]);
    setSupplierProducts([]);
    setHeaders([]);
    setWorkbook(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in" id="spreadsheet-import-tab">
      
      {/* MODE SELECTOR */}
      <div className="flex bg-[#FAFAF9] p-1.5 rounded-2xl border border-[#E8E6E1] w-full sm:w-max">
        <button
          onClick={() => { setImportMode('financial'); resetState(); }}
          className={`flex-1 sm:flex-initial py-2.5 px-5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer ${
            importMode === 'financial' 
              ? 'bg-[#1B3A2D] text-white shadow-xs' 
              : 'text-[#6B6B5F] hover:text-[#141410]'
          }`}
        >
          Plano de Contas (DRE)
        </button>
        <button
          onClick={() => { setImportMode('supplier_quote'); resetState(); }}
          className={`flex-1 sm:flex-initial py-2.5 px-5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer ${
            importMode === 'supplier_quote' 
              ? 'bg-[#1B3A2D] text-white shadow-xs' 
              : 'text-[#6B6B5F] hover:text-[#141410]'
          }`}
        >
          Orçamentos Fornecedores (Fluxo 12)
        </button>
      </div>

      {/* File Upload Selector Panel */}
      <div className="grid gap-6 md:grid-cols-12 text-xs">
        
        {/* Loader controls */}
        <div className="bg-white border border-[#E8E6E1] rounded-3xl p-6 md:col-span-5 text-left space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#141410] flex items-center gap-2">
              <FileSpreadsheet className="size-4 text-[#2D6A4F]" />
              {importMode === 'financial' ? 'Importação DRE Inteligente' : 'Importador de Fornecedores'}
            </h3>
            <p className="text-xs text-[#6B6B5F]">
              {importMode === 'financial' 
                ? 'Carregue faturamento e despesas externas de qualquer período para organizar em tempo real no dashboard financeiro.'
                : 'Carregue cotações de piretróides, iscas, raticidas enviadas por representantes comerciais para recalibrar custos comerciais.'}
            </p>
          </div>

          <div className="border-2 border-dashed border-[#E8E6E1] rounded-2xl p-6 text-center hover:bg-[#FAFAF9] transition-colors relative cursor-pointer">
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center gap-2 text-[#6B6B5F]">
              <Upload className="size-7 text-[#2D6A4F] animate-bounce" />
              <span className="font-bold uppercase tracking-wider text-[10px] text-zinc-800">
                {file ? file.name : "Arraste ou Escolha arquivo .xlsx"}
              </span>
              <span className="text-[10px]">Formatos: .xlsx / .xls / .csv</span>
            </div>
          </div>

          {sheetNames.length > 0 && (
            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block">
                Escolha a Aba da Planilha
              </label>
              <select 
                value={selectedSheet}
                onChange={handleSheetChange}
                className="w-full bg-[#FAFAF9] border border-[#E8E6E1] py-3 px-4 rounded-xl font-semibold uppercase text-[#141410]"
              >
                {sheetNames.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Dynamic Column Mapper matches schema */}
        <div className="bg-white border border-[#E8E6E1] rounded-3xl p-6 md:col-span-7 text-left space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#141410]">Mapeamento de Colunas</h3>
            <p className="text-xs text-[#6B6B5F]">Associe as colunas identificadas na sua planilha com os campos oficiais de Auditoria PestFlow.</p>
          </div>

          {headers.length === 0 ? (
            <div className="py-12 bg-[#FAFAF9] rounded-2xl border border-dashed border-[#E8E6E1] text-center text-[#6B6B5F] font-bold uppercase tracking-wider text-[10px]">
              Carregue uma planilha ao lado para realizar o mapeamento
            </div>
          ) : importMode === 'financial' ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Descrição mapping */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block">Descrição / Lançamento (Obrigatório)</span>
                <select 
                  value={mappedDescCol}
                  onChange={(e) => setMappedDescCol(e.target.value)}
                  className="w-full bg-[#FAFAF9] border border-[#E8E6E1] py-2.5 px-3 rounded-lg font-bold text-gray-700 font-sans"
                >
                  <option value="">-- Escolha a coluna --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Valor mapping */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block">Valor Financeiro R$ (Obrigatório)</span>
                <select 
                  value={mappedValCol}
                  onChange={(e) => setMappedValCol(e.target.value)}
                  className="w-full bg-[#FAFAF9] border border-[#E8E6E1] py-2.5 px-3 rounded-lg font-bold text-gray-700"
                >
                  <option value="">-- Escolha a coluna --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Data mapping */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block">Data do Lançamento</span>
                <select 
                  value={mappedDateCol}
                  onChange={(e) => setMappedDateCol(e.target.value)}
                  className="w-full bg-[#FAFAF9] border border-[#E8E6E1] py-2.5 px-3 rounded-lg font-bold text-gray-700"
                >
                  <option value="">-- Escolha a coluna (Opcional) --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Meio de pagamento mapping */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block">Meio de Pagamento</span>
                <select 
                  value={mappedPayCol}
                  onChange={(e) => setMappedPayCol(e.target.value)}
                  className="w-full bg-[#FAFAF9] border border-[#E8E6E1] py-2.5 px-3 rounded-lg font-bold text-gray-700"
                >
                  <option value="">-- Escolha a coluna (Opcional) --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Centro de Custo mapping */}
              <div className="space-y-1 sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block">Centro de Custo / Operador</span>
                <select 
                  value={mappedCcCol}
                  onChange={(e) => setMappedCcCol(e.target.value)}
                  className="w-full bg-[#FAFAF9] border border-[#E8E6E1] py-2.5 px-3 rounded-lg font-bold text-gray-700"
                >
                  <option value="">-- Escolha a coluna (Opcional) --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2 pt-2 flex justify-end">
                <Button
                  onClick={handleProcessSpreadsheet}
                  disabled={isProcessing}
                  className="bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white font-extrabold text-[11px] uppercase tracking-wider py-3.5 px-6 rounded-xl w-full sm:w-fit cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="size-4 animate-spin-slow" />
                  Mapear e Classificar com IA
                </Button>
              </div>
            </div>
          ) : (
            // SUPPLIER QUOTE MAPPER
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block">Nome Comercial (Obrigatório)</span>
                <select 
                  value={mappedProdName}
                  onChange={(e) => setMappedProdName(e.target.value)}
                  className="w-full bg-[#FAFAF9] border border-[#E8E6E1] py-2.5 px-3 rounded-lg font-bold text-gray-700 text-xs"
                >
                  <option value="">-- Escolha a coluna --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block">Custo Unitário R$ (Obrigatório)</span>
                <select 
                  value={mappedCost}
                  onChange={(e) => setMappedCost(e.target.value)}
                  className="w-full bg-[#FAFAF9] border border-[#E8E6E1] py-2.5 px-3 rounded-lg font-bold text-gray-700"
                >
                  <option value="">-- Escolha a coluna --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block">Princípio Ativo</span>
                <select 
                  value={mappedActiveIng}
                  onChange={(e) => setMappedActiveIng(e.target.value)}
                  className="w-full bg-[#FAFAF9] border border-[#E8E6E1] py-2.5 px-3 rounded-lg font-bold text-gray-700"
                >
                  <option value="">-- Mesma do Nome --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block">Fabricante / Fornecedor</span>
                <select 
                  value={mappedSupplier}
                  onChange={(e) => setMappedSupplier(e.target.value)}
                  className="w-full bg-[#FAFAF9] border border-[#E8E6E1] py-2.5 px-3 rounded-lg font-bold text-gray-700"
                >
                  <option value="">-- Definido por Arquivo --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block">Quantidade Adquirida</span>
                <select 
                  value={mappedQty}
                  onChange={(e) => setMappedQty(e.target.value)}
                  className="w-full bg-[#FAFAF9] border border-[#E8E6E1] py-2.5 px-3 rounded-lg font-bold text-gray-700"
                >
                  <option value="">-- Padrão (1) --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block">Categoria do Insumo</span>
                <select 
                  value={mappedCategory}
                  onChange={(e) => setMappedCategory(e.target.value)}
                  className="w-full bg-[#FAFAF9] border border-[#E8E6E1] py-2.5 px-3 rounded-lg font-bold text-gray-700"
                >
                  <option value="">-- Padrão (Inseticida) --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2 pt-2 flex justify-end">
                <Button
                  onClick={handleProcessSpreadsheet}
                  disabled={isProcessing}
                  className="bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white font-extrabold text-[11px] uppercase tracking-wider py-3.5 px-6 rounded-xl w-full sm:w-fit cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="size-4 animate-spin-slow" />
                  Mapear Orçamento de Fornecedor
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Financial Previews */}
      {financialRows.length > 0 && (
        <Card className="bg-white border border-[#E8E6E1] p-6 rounded-3xl animate-in slide-in-from-bottom duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E8E6E1] pb-4 mb-4 gap-3 text-left">
            <div>
              <h4 className="text-base font-bold text-[#141410] flex items-center gap-2">
                <Check className="size-5 text-[#2D6A4F]" />
                Auditar Lançamentos Pré-Importação (IA Audit)
              </h4>
              <p className="text-xs text-[#6B6B5F] font-medium">Reconcilie as categorias geradas pela inteligência preditiva PestFlow antes de migrar ao Plano de Contas.</p>
            </div>
            
            <Button
              onClick={handleCommitFinancialImport}
              className="bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white font-black text-xs uppercase tracking-wider py-4 px-6 rounded-xl cursor-pointer flex items-center gap-2 shrink-0 self-stretch sm:self-auto"
            >
              <Plus className="size-4" />
              Importar {financialRows.length} Lançamentos
            </Button>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left font-sans">
              <thead>
                <tr className="bg-[#FAFAF9] text-[9px] font-bold uppercase tracking-wider text-[#6B6B5F] border-b border-[#E8E6E1]">
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">Grupo Classificado</th>
                  <th className="py-3 px-4">Subgrupo Recomendado</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-1 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E6E1]">
                {financialRows.map((row) => (
                  <tr key={row.id} className="hover:bg-amber-50/15">
                    <td className="py-2.5 px-4">
                      <input 
                        type="text" 
                        value={row.description} 
                        onChange={(e) => handleRowDescriptionChange(row.id, e.target.value)}
                        className="bg-transparent border-0 focus:bg-white focus:ring-1 focus:ring-[#E8E6E1] p-1.5 rounded-md font-semibold text-gray-800 w-full min-w-[150px] text-xs"
                      />
                    </td>

                    <td className="py-2.5 px-4">
                      <select
                        value={row.category}
                        onChange={(e) => handleRowCategoryChange(row.id, e.target.value)}
                        className="bg-white border border-[#E8E6E1] py-1.5 px-2 rounded-md font-bold uppercase text-[10px] text-[#6B6B5F]"
                      >
                        {Object.keys(GROUPS_STRUCTURE).map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </td>

                    <td className="py-2.5 px-4">
                      <select
                        value={row.subcategory}
                        onChange={(e) => handleRowSubcategoryChange(row.id, e.target.value)}
                        className="bg-white border border-[#E8E6E1] py-1.5 px-2 rounded-md font-bold text-[10px] text-[#2D6A4F]"
                      >
                        {(GROUPS_STRUCTURE[row.category as keyof typeof GROUPS_STRUCTURE] || []).map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <input 
                        type="number"
                        value={row.value}
                        onChange={(e) => handleRowValueChange(row.id, parseFloat(e.target.value) || 0)}
                        className="bg-transparent border-0 focus:bg-white focus:ring-1 focus:ring-[#E8E6E1] p-1 rounded-md font-mono font-extrabold text-right text-[#141410] w-24"
                      />
                    </td>

                    <td className="py-2.5 px-1 text-center">
                      <span className="bg-[#D8EDE3] text-[#1B3A2D] font-bold text-[9px] px-2 py-1 rounded-md border border-[#2D6A4F]/10 uppercase tracking-wider flex items-center justify-center gap-1 w-fit mx-auto">
                        <Sparkles className="size-2.5 text-emerald-700" />
                        Classificado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Supplier Items Previews (Fluxo 12) */}
      {supplierProducts.length > 0 && (
        <Card className="bg-white border border-[#E8E6E1] p-6 rounded-3xl animate-in slide-in-from-bottom duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E8E6E1] pb-4 mb-4 gap-3 text-left">
            <div>
              <h4 className="text-base font-bold text-[#141410] flex items-center gap-2">
                <Package className="size-5 text-[#2D6A4F]" />
                Auditar Insumos do Orçamento Fornecedor (Fluxo 12)
              </h4>
              <p className="text-xs text-[#6B6B5F] font-medium">
                Vínculo inteligente por <span className="font-bold underline text-[#141410]">Princípio Ativo + Fabricante</span>. Novos produtos serão gerados e os custos dos existentes serão calibrados.
              </p>
            </div>
            
            <Button
              onClick={handleCommitSupplierImport}
              className="bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white font-extrabold text-xs uppercase tracking-widest h-12 px-6 rounded-xl cursor-pointer flex items-center gap-2 shrink-0 self-stretch sm:self-auto shadow-xs"
            >
              <Check className="size-4" />
              Efetivar e Atualizar Estoque ({supplierProducts.length} itens)
            </Button>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left font-sans">
              <thead>
                <tr className="bg-[#FAFAF9] text-[9px] font-bold uppercase tracking-wider text-[#6B6B5F] border-b border-[#E8E6E1]">
                  <th className="py-3 px-4">Cód Comercial</th>
                  <th className="py-3 px-4">Princípio Ativo</th>
                  <th className="py-3 px-4">Fabricante / Fornecedor</th>
                  <th className="py-3 px-4 text-center">Unidade</th>
                  <th className="py-3 px-4 text-right">Novo Custo Unitário (R$)</th>
                  <th className="py-3 px-4 text-right">Qtd Adquirida</th>
                  <th className="py-3 px-2 text-center">Vínculo Identificado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E6E1]">
                {supplierProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-amber-50/15">
                    <td className="py-2.5 px-4 font-semibold">
                      <input 
                        type="text" 
                        value={p.name} 
                        onChange={(e) => handleSupplierProductChange(p.id, 'name', e.target.value)}
                        className="bg-transparent border-0 focus:bg-white focus:ring-1 focus:ring-[#E8E6E1] p-1.5 rounded-md font-bold text-gray-800 w-full min-w-[120px] text-xs"
                      />
                    </td>

                    <td className="py-2.5 px-4">
                      <input 
                        type="text" 
                        value={p.activeIngredient} 
                        onChange={(e) => handleSupplierProductChange(p.id, 'activeIngredient', e.target.value)}
                        className="bg-transparent border-0 focus:bg-white focus:ring-1 focus:ring-[#E8E6E1] p-1.5 rounded-md text-gray-600 w-full min-w-[120px] text-xs"
                      />
                    </td>

                    <td className="py-2.5 px-4">
                      <input 
                        type="text" 
                        value={p.supplier} 
                        onChange={(e) => handleSupplierProductChange(p.id, 'supplier', e.target.value)}
                        className="bg-transparent border-0 focus:bg-white focus:ring-1 focus:ring-[#E8E6E1] p-1.5 rounded-md text-gray-600 w-full text-xs"
                      />
                    </td>

                    <td className="py-2.5 px-4 text-center">
                      <select
                        value={p.unit}
                        onChange={(e) => handleSupplierProductChange(p.id, 'unit', e.target.value)}
                        className="bg-white border border-[#E8E6E1] py-1 px-1.5 rounded-md font-bold text-[10px]"
                      >
                        <option value="ml">ml</option>
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="L">L</option>
                        <option value="unidade">unidade</option>
                      </select>
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <input 
                        type="number"
                        value={p.costPerUnit}
                        onChange={(e) => handleSupplierProductChange(p.id, 'costPerUnit', parseFloat(e.target.value) || 0)}
                        className="bg-transparent border-0 focus:bg-white focus:ring-1 focus:ring-[#E8E6E1] p-1 rounded-md font-mono font-black text-right text-gray-900 w-20 text-xs"
                      />
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <input 
                        type="number"
                        value={p.quantity}
                        onChange={(e) => handleSupplierProductChange(p.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="bg-transparent border-0 focus:bg-white focus:ring-1 focus:ring-[#E8E6E1] p-1 rounded-md font-mono font-bold text-right text-green-700 w-16 text-xs"
                      />
                    </td>

                    <td className="py-2.5 px-2 text-center">
                      {p.exists ? (
                        <span className="bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md border border-indigo-200">
                          Atualização de Custo
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md border border-emerald-200">
                          Novo Cadastro
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

    </div>
  );
}
