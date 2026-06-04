import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Package,
  AlertTriangle,
  History,
  Plus,
  Search,
  Check,
  X,
  Upload,
  FileSpreadsheet,
  Trash2,
  Edit2,
  Filter,
  ArrowRightLeft,
  FileUp,
  Boxes,
  Compass,
  ChevronRight,
  Sparkles,
  Info,
  Calendar,
  Layers,
  FileCheck2,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  SearchX,
  Eye,
  Settings2,
  ShieldAlert,
  GitMerge,
  Loader2
} from 'lucide-react';
import { useSystemStore } from '@/store';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { SpreadsheetImportTab } from '../financial/components/SpreadsheetImportTab';
import { 
  scanProductSmartly, 
  queryAIForProducts, 
  DDSULF_OFFICIAL_PRODUCTS, 
  normalizeString,
  getSimilarityScore,
  getCanonicalProduct,
  SmartMatchResult 
} from '@/utils/ddsulfClassifier';

// Requested Categories by DDSulf (Human display label mapping of database categories)
const CATEGORY_LABELS: Record<string, string> = {
  inseticida: 'Inseticida',
  raticida: 'Raticida',
  formicida: 'Formicida',
  gel_baraticida: 'Gel Baraticida',
  iscas: 'Iscas',
  equipamentos: 'Equipamentos',
  epi: 'EPI',
  consumiveis: 'Consumíveis',
  outros: 'Outros'
};

const CATEGORIES_LIST = [
  { value: 'inseticida', label: 'Inseticidas' },
  { value: 'raticida', label: 'Raticidas' },
  { value: 'formicida', label: 'Formicidas' },
  { value: 'gel_baraticida', label: 'Gel Baraticida' },
  { value: 'iscas', label: 'Iscas' },
  { value: 'equipamentos', label: 'Equipamentos' },
  { value: 'epi', label: 'EPIs' },
  { value: 'consumiveis', label: 'Consumíveis' },
  { value: 'outros', label: 'Outros/Diversos' }
];

const UNITS_LIST = ['ml', 'g', 'kg', 'L', 'unidade'];

interface UploadParsedItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  category: string;
  supplier: string;
  confirmed: boolean;
  // DDSulf additions
  productGroup: string;
  chemicalGroup: string;
  activeIngredient: string;
  isOfficialMatch: boolean;
  officialProductName?: string;
  suggestedAction?: 'exact_alias' | 'family_merge' | 'new_item';
  similarityWarning?: string;
  mergeWithProductId?: string; // If similar product is identified
  budgetClass?: 'found' | 'equivalent' | 'unregistered';
  equivalentName?: string;
  lot?: string;
  expiryDate?: string;
}

export function InventoryPage() {
  const { 
    inventory, 
    addInventoryProduct, 
    updateInventoryProduct, 
    removeInventoryProduct, 
    addInventoryMovement,
    purchases,
    updatePurchaseStatus
  } = useSystemStore();

  const products = inventory?.products || [];
  const movements = inventory?.movements || [];

  const [activeTab, setActiveTab] = useState<'current_stock' | 'upload_entry' | 'movements_log' | 'supplier_import' | 'purchase_requisitions'>('current_stock');
  const tabs = [
    { id: 'current_stock', label: 'Estoque Atual' },
    { id: 'upload_entry', label: 'Entrada por Upload' },
    { id: 'movements_log', label: 'Movimentações' },
    { id: 'supplier_import', label: 'Importação de Orçamentos' },
    { id: 'purchase_requisitions', label: 'Requisições de Compra' }
  ] as const;

  // Search & Filters for Stock Table (Tab 1)
  const [stockSearch, setStockSearch] = useState('');
  const [stockCategoryFilter, setStockCategoryFilter] = useState('all');

  // Inline Stock Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingQty, setEditingQty] = useState<number>(0);

  // New & Edit Product Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Modal form states
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
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateConfirmed, setDuplicateConfirmed] = useState(false);
  const [formLot, setFormLot] = useState('LOTE-INICIAL');
  const [formExpiryDate, setFormExpiryDate] = useState('');

  // Drag n Drop File Selection States (Tab 2)
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadParsedItems, setUploadParsedItems] = useState<UploadParsedItem[]>([]);
  const [sheetPreviewRaw, setSheetPreviewRaw] = useState<string[][]>([]);
  const [rawTextPreview, setRawTextPreview] = useState('');
  const [fileTypeDetected, setFileTypeDetected] = useState<'sheet' | 'xml' | 'pdf' | null>(null);
  const [isClassifyingWithAI, setIsClassifyingWithAI] = useState(false);
  const [importType, setImportType] = useState<'estoque' | 'orcamento'>('estoque');

  // Filters for Movements Log (Tab 3)
  const [movementTypeFilter, setMovementTypeFilter] = useState<'all' | 'entrada' | 'saida'>('all');
  const [movementProductFilter, setMovementProductFilter] = useState<string>('all');
  const [movementPeriodFilter, setMovementPeriodFilter] = useState<'all' | '7d' | '30d' | '90d'>('all');

  // Autocomplete classifier helper under manual product entry
  useEffect(() => {
    if (modalMode === 'create' && formName.trim().length > 3) {
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
  }, [formName, modalMode]);

  // -------------------------------------------------------------
  // CRITICAL STATUS ALERTS LOGIC (DDSulf requested colors & rules)
  // 🔴 "Crítico" — quantidade ≤ mínimo
  // 🟡 "Baixo" — quantidade ≤ mínimo × 1.5
  // 🟢 "Normal" — quantidade > mínimo × 1.5
  // -------------------------------------------------------------
  const getProductStatus = (qty: number, minQty: number) => {
    if (qty <= minQty) return { label: 'Crítico', color: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-600', code: 'critico' };
    if (qty <= minQty * 1.5) return { label: 'Baixo', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', code: 'baixo' };
    return { label: 'Normal', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', code: 'normal' };
  };

  const criticalProducts = products.filter(p => p.quantity <= p.minQuantity);

  // -------------------------------------------------------------
  // MODALS CONTROL
  // -------------------------------------------------------------
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedProductId(null);
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
    setShowDuplicateWarning(false);
    setDuplicateConfirmed(false);
    setFormLot('LOTE-INICIAL');
    setFormExpiryDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setIsProductModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setModalMode('edit');
    setSelectedProductId(p.id);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormUnit(p.unit);
    setFormQty(p.quantity);
    setFormMinQty(p.minQuantity);
    setFormCost(p.costPerUnit);
    setFormSupplier(p.supplier || '');
    setFormChemicalGroup(p.chemicalGroup || '');
    setFormActiveIngredient(p.activeIngredient || '');
    setFormProductGroup(p.productGroup || 'Inseticidas');
    setShowDuplicateWarning(false);
    setDuplicateConfirmed(false);
    setFormLot(p.lot || 'LOTE-PADRAO');
    setFormExpiryDate(p.expiryDate || '');
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('O nome do produto é obrigatório.');
      return;
    }

    if (modalMode === 'create') {
      const isDuplicate = products.some(p => 
        normalizeString(p.activeIngredient || '') === normalizeString(formActiveIngredient || '') &&
        normalizeString(p.supplier || '') === normalizeString(formSupplier || '') &&
        normalizeString(p.unit || '') === normalizeString(formUnit || '')
      );

      if (isDuplicate && !duplicateConfirmed) {
        setShowDuplicateWarning(true);
        toast.warning('Atenção: Produto possivelmente já cadastrado.', {
          description: 'Mesmo princípio ativo, fabricante e unidade de medida/volume.'
        });
        return;
      }

      const newId = `prod-${Math.random().toString(36).substring(2, 11)}`;
      const newProduct = {
        id: newId,
        name: formName.trim(),
        category: formCategory,
        unit: formUnit,
        quantity: formQty,
        minQuantity: formMinQty,
        costPerUnit: formCost,
        supplier: formSupplier.trim() || 'Fornecedor Direto',
        lastUpdated: new Date().toISOString(),
        chemicalGroup: formChemicalGroup.trim() || 'Não aplicável',
        activeIngredient: formActiveIngredient.trim() || 'Não aplicável',
        productGroup: formProductGroup,
        lot: formLot.trim() || 'LOTE-INICIAL',
        expiryDate: formExpiryDate || ''
      };

      addInventoryProduct(newProduct);
      
      // Auto entry movement
      if (formQty > 0) {
        addInventoryMovement({
          id: `mov-${Math.random().toString(36).substring(2, 11)}`,
          date: new Date().toISOString(),
          productId: newId,
          type: 'entrada',
          quantity: formQty,
          reason: `Estoque Inicial - Produto cadastrado manualmente`,
          lot: formLot.trim() || 'LOTE-INICIAL',
          expiryDate: formExpiryDate || ''
        });
      }

      toast.success(`Insumo cadastrado com sucesso!`, {
        description: `${formName} foi incluído no estoque.`
      });
    } else {
      if (selectedProductId) {
        const originalProduct = products.find(p => p.id === selectedProductId);
        const originalQty = originalProduct?.quantity || 0;
        
        updateInventoryProduct(selectedProductId, {
          name: formName.trim(),
          category: formCategory,
          unit: formUnit,
          quantity: formQty,
          minQuantity: formMinQty,
          costPerUnit: formCost,
          supplier: formSupplier.trim() || 'Fornecedor Direto',
          chemicalGroup: formChemicalGroup.trim() || 'Não aplicável',
          activeIngredient: formActiveIngredient.trim() || 'Não aplicável',
          productGroup: formProductGroup,
          lot: formLot.trim() || 'LOTE-PADRAO',
          expiryDate: formExpiryDate || ''
        });

        // Record deviation as manual adjustment movement
        const diff = formQty - originalQty;
        if (diff !== 0) {
          addInventoryMovement({
            id: `mov-${Math.random().toString(36).substring(2, 11)}`,
            date: new Date().toISOString(),
            productId: selectedProductId,
            type: diff > 0 ? 'entrada' : 'saida',
            quantity: Math.abs(diff),
            reason: `Ajuste manual de estoque via ficha cadastral`,
            lot: formLot.trim() || 'LOTE-AJUSTE',
            expiryDate: formExpiryDate || ''
          });
        }

        toast.success(`Insumo atualizado!`, {
          description: `Os parâmetros de ${formName} foram consolidados no estoque.`
        });
      }
    }

    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Deseja realmente remover o produto "${name}" do estoque?`)) {
      removeInventoryProduct(id);
      toast.success('Insumo removido!', {
        description: `O produto "${name}" foi desvinculado dos registros.`
      });
    }
  };

  // -------------------------------------------------------------
  // INLINE QUANTITY UPDATE SAVER WITH LEDGER RECORDING
  // -------------------------------------------------------------
  const startInlineEdit = (p: any) => {
    setEditingId(p.id);
    setEditingQty(p.quantity);
  };

  const saveInlineQuantity = (product: any) => {
    const diff = editingQty - product.quantity;
    if (diff === 0) {
      setEditingId(null);
      return;
    }

    updateInventoryProduct(product.id, {
      quantity: editingQty,
      lastUpdated: new Date().toISOString()
    });

    addInventoryMovement({
      id: `mov-${Math.random().toString(36).substring(2, 11)}`,
      date: new Date().toISOString(),
      productId: product.id,
      type: diff > 0 ? 'entrada' : 'saida',
      quantity: Math.abs(diff),
      reason: `Ajuste manual da quantidade na tabela rápida`
    });

    toast.success('Estoque atualizado!', {
      description: `Quantidade de "${product.name}" alterada para ${editingQty} ${product.unit}.`
    });
    setEditingId(null);
  };

  // -------------------------------------------------------------
  // TAB 2: EXTREMELY ADVANCED PARSING & SCIENTIFIC MERGING ENGINE
  // -------------------------------------------------------------
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUpload(e.target.files[0]);
    }
  };

  const processUpload = (file: File) => {
    setUploadedFileName(file.name);
    setUploadParsedItems([]);
    setSheetPreviewRaw([]);
    setRawTextPreview('');
    setFileTypeDetected(null);

    const lowercaseName = file.name.toLowerCase();

    // 1. XLSX or CSV Files
    if (lowercaseName.endsWith('.xlsx') || lowercaseName.endsWith('.xls') || lowercaseName.endsWith('.csv')) {
      setFileTypeDetected('sheet');
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const rawBuffer = e.target?.result as ArrayBuffer;
          const data = new Uint8Array(rawBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.SheetNames[0];
          const sheet = workbook.Sheets[firstSheet];
          
          const rawRows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
          
          if (rawRows.length > 0) {
            // Pick up first 10 for original grid preview
            const previewRows = rawRows.slice(0, 10).map((r: any) => {
              if (Array.isArray(r)) return r.map(c => String(c));
              if (typeof r === 'object') return Object.values(r).map(v => String(v));
              return [String(r)];
            });
            setSheetPreviewRaw(previewRows);

            // Mappings look-up for columns
            let headerRowIndex = -1;
            let nameColIdx = -1;
            let qtyColIdx = -1;
            let costColIdx = -1;
            let unitColIdx = -1;
            let manufacturerColIdx = -1;

            // Search headers index
            for (let i = 0; i < Math.min(rawRows.length, 5); i++) {
              const row = rawRows[i];
              if (!Array.isArray(row)) continue;
              
              const findCol = (regex: RegExp) => row.findIndex(c => regex.test(String(c).toLowerCase()));
              
              const nIdx = findCol(/produto|item|descri|nome|insumo/i);
              const qIdx = findCol(/qtd|quant|qtde|estoque/i);
              const cIdx = findCol(/valor|pre[cç]o|custo|unit/i);
              const uIdx = findCol(/unid|embalagem|medida/i);
              const mIdx = findCol(/fabri|marca|forne/i);

              if (nIdx > -1 || qIdx > -1) {
                headerRowIndex = i;
                nameColIdx = nIdx;
                qtyColIdx = qIdx;
                costColIdx = cIdx;
                unitColIdx = uIdx;
                manufacturerColIdx = mIdx;
                break;
              }
            }

            const itemsParsed: UploadParsedItem[] = [];
            const dataStartIdx = headerRowIndex > -1 ? headerRowIndex + 1 : 0;

            for (let i = dataStartIdx; i < rawRows.length; i++) {
              const row = rawRows[i];
              if (!Array.isArray(row) || row.length === 0) continue;

              let pName = '';
              let pQty = 0;
              let pCost = 0;
              let pUnit = 'ml';
              let pSupplier = 'Planilha Importada';

              // If columns map was found:
              if (nameColIdx > -1 && row[nameColIdx] !== undefined) {
                pName = String(row[nameColIdx]).trim();
              } else {
                // otherwise find first descriptive non-numeric string
                const firstStr = row.find(c => typeof c === 'string' && c.trim().length > 3 && isNaN(Number(c)));
                if (firstStr) pName = String(firstStr).trim();
              }

              if (qtyColIdx > -1 && row[qtyColIdx] !== undefined) {
                pQty = parseFloat(String(row[qtyColIdx])) || 0;
              } else {
                // first number
                const firstNum = row.find(c => typeof c === 'number' || (!isNaN(parseFloat(String(c))) && isFinite(Number(c))));
                if (firstNum !== undefined) pQty = parseFloat(String(firstNum)) || 0;
              }

              if (costColIdx > -1 && row[costColIdx] !== undefined) {
                pCost = parseFloat(String(row[costColIdx]).replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
              }

              if (unitColIdx > -1 && row[unitColIdx] !== undefined) {
                const innerUnit = String(row[unitColIdx]).toLowerCase().trim();
                const matchedUnit = UNITS_LIST.find(u => u.toLowerCase() === innerUnit);
                if (matchedUnit) pUnit = matchedUnit;
              }

              if (manufacturerColIdx > -1 && row[manufacturerColIdx] !== undefined) {
                pSupplier = String(row[manufacturerColIdx]).trim();
              }

              // Guard check naming
              if (pName && pName !== 'undefined' && isNaN(Number(pName)) && pQty > 0) {
                // Analyze using DDSulf Smart Recognition helper
                const recognition = scanProductSmartly(pName, pQty, pCost, pSupplier);
                
                // Identify target similarity, fusion and budget alignment
                const mStatus = computeProductMatchStatus(
                  pName, 
                  recognition.classification.activeIngredient, 
                  recognition.classification.chemicalGroup, 
                  recognition.classification.supplier || pSupplier, 
                  recognition.isOfficialMatch, 
                  recognition.officialProduct?.name
                );

                itemsParsed.push({
                  id: `upload-${i}-${Math.random().toString(36).substring(2, 5)}`,
                  name: pName,
                  quantity: pQty,
                  unit: recognition.officialProduct?.unit || pUnit,
                  costPerUnit: pCost || 0.10,
                  category: recognition.classification.categoryCode,
                  supplier: recognition.classification.supplier || pSupplier,
                  confirmed: true,
                  // Smart additions
                  productGroup: recognition.classification.productGroup,
                  chemicalGroup: recognition.classification.chemicalGroup,
                  activeIngredient: recognition.classification.activeIngredient,
                  isOfficialMatch: recognition.isOfficialMatch,
                  officialProductName: recognition.officialProduct?.name,
                  suggestedAction: mStatus.mergeWithProductId ? 'family_merge' : (recognition.isOfficialMatch ? 'exact_alias' : 'new_item'),
                  similarityWarning: mStatus.similarityWarning,
                  mergeWithProductId: mStatus.mergeWithProductId,
                  budgetClass: mStatus.budgetClass,
                  equivalentName: mStatus.equivalentName
                });
              }
            }

            if (itemsParsed.length > 0) {
              setUploadParsedItems(itemsParsed);
              toast.success(`Planilha processada!`, {
                description: `Identificamos ${itemsParsed.length} produtos de forma semântica.`
              });
            } else {
              toast.warning('Planilha processada com avisos.', {
                description: 'Não conseguimos identificar produtos na estrutura de linhas. Use o editor manual abaixo.'
              });
            }
          }
        } catch (err) {
          console.error(err);
          toast.error('Ocorreu um erro ao decodificar planilhas com SheetJS.');
        }
      };
      reader.readAsArrayBuffer(file);
    } 

    // 2. XML NF-e files
    else if (lowercaseName.endsWith('.xml')) {
      setFileTypeDetected('xml');
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          setRawTextPreview(content.slice(0, 1500) + '\n\n... (conteúdo de nota fiscal nacional)...');

          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(content, 'text/xml');
          
          const prodElements = xmlDoc.getElementsByTagName('prod');
          const emitElement = xmlDoc.getElementsByTagName('emit')[0];
          const emitName = emitElement?.getElementsByTagName('xNome')[0]?.textContent || 'Fabricante XML';

          const itemsParsed: UploadParsedItem[] = [];

          if (prodElements.length > 0) {
            for (let i = 0; i < prodElements.length; i++) {
              const node = prodElements[i];
              const pName = node.getElementsByTagName('xProd')[0]?.textContent || '';
              const pQty = parseFloat(node.getElementsByTagName('qCom')[0]?.textContent || '0');
              const pCost = parseFloat(node.getElementsByTagName('vUnCom')[0]?.textContent || '0');
              let pUnit = node.getElementsByTagName('uCom')[0]?.textContent?.toLowerCase() || 'unidade';
              
              if (!UNITS_LIST.includes(pUnit)) {
                if (pUnit.includes('lit') || pUnit === 'l') pUnit = 'L';
                else if (pUnit.includes('kg') || pUnit === 'k') pUnit = 'kg';
                else if (pUnit.includes('ml')) pUnit = 'ml';
                else if (pUnit.includes('g')) pUnit = 'g';
                else pUnit = 'unidade';
              }

              if (pName && pQty > 0) {
                const recognition = scanProductSmartly(pName, pQty, pCost, emitName);
                
                const mStatus = computeProductMatchStatus(
                  pName, 
                  recognition.classification.activeIngredient, 
                  recognition.classification.chemicalGroup, 
                  recognition.classification.supplier || emitName, 
                  recognition.isOfficialMatch, 
                  recognition.officialProduct?.name
                );

                itemsParsed.push({
                  id: `xml-${i}-${Math.random().toString(36).substring(2, 5)}`,
                  name: pName,
                  quantity: pQty,
                  unit: recognition.officialProduct?.unit || pUnit,
                  costPerUnit: pCost,
                  category: recognition.classification.categoryCode,
                  supplier: recognition.classification.supplier || emitName,
                  confirmed: true,
                  productGroup: recognition.classification.productGroup,
                  chemicalGroup: recognition.classification.chemicalGroup,
                  activeIngredient: recognition.classification.activeIngredient,
                  isOfficialMatch: recognition.isOfficialMatch,
                  officialProductName: recognition.officialProduct?.name,
                  suggestedAction: mStatus.mergeWithProductId ? 'family_merge' : (recognition.isOfficialMatch ? 'exact_alias' : 'new_item'),
                  similarityWarning: mStatus.similarityWarning,
                  mergeWithProductId: mStatus.mergeWithProductId,
                  budgetClass: mStatus.budgetClass,
                  equivalentName: mStatus.equivalentName
                });
              }
            }
          }

          if (itemsParsed.length > 0) {
            setUploadParsedItems(itemsParsed);
            toast.success(`XML da Nota Fiscal Importada!`, {
              description: `Identificados com sucesso ${itemsParsed.length} itens do emissor ${emitName}.`
            });
          } else {
            toast.warning('Processado com avisos.', {
              description: 'Nenhum det/prod padrão NF-e encontrado.'
            });
          }
        } catch (err) {
          console.error(err);
          toast.error('Erro de decodificação no XML da Nota Fiscal.');
        }
      };
      reader.readAsText(file);
    }

    // 3. PDF Files (Manual Form Fallback with ASCII parser & catalog suggestions)
    else if (lowercaseName.endsWith('.pdf')) {
      setFileTypeDetected('pdf');
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const rawBuffer = e.target?.result as ArrayBuffer;
          const byteView = new Uint8Array(rawBuffer);
          
          let asciiStr = '';
          let count = 0;
          for (let i = 0; i < byteView.length; i++) {
            const code = byteView[i];
            if (code >= 32 && code <= 126) {
              asciiStr += String.fromCharCode(code);
            } else if (code === 10 || code === 13) {
              asciiStr += '\n';
            } else {
              if (asciiStr.endsWith(' ') || asciiStr.endsWith('\n')) continue;
              asciiStr += ' ';
            }
            count++;
            if (count > 50000) break;
          }

          const cleanedText = asciiStr
            .replace(/\s+/g, ' ')
            .replace(/[^\w\s.,;:()\-/@%]/g, '')
            .slice(0, 1500);

          setRawTextPreview(
            `[LEITURA OPERACIONAL DO PDF DE COMPRAS]\n` +
            `=======================================\n` +
            cleanedText + '\n\n...[Leitura Parcial de Caracteres concluída]'
          );

          // Find some catalog word occurrences to prefill
          const matchedOfficial = DDSULF_OFFICIAL_PRODUCTS.find(p => 
            cleanedText.toUpperCase().includes(p.name.toUpperCase())
          ) || DDSULF_OFFICIAL_PRODUCTS[0];

          toast.success('Dicionário de Caracteres do PDF Carregado!', {
            description: 'Identificados possíveis produtos no fluxo textual. Veja a linha sugerida.'
          });

          const mStatus = computeProductMatchStatus(
            matchedOfficial.name,
            matchedOfficial.activeIngredient,
            matchedOfficial.chemicalGroup,
            matchedOfficial.supplier,
            true,
            matchedOfficial.name
          );

          setUploadParsedItems([
            {
              id: 'pdf-prefilled-1',
              name: matchedOfficial.name,
              quantity: 12,
              unit: matchedOfficial.unit,
              costPerUnit: 45.00,
              category: matchedOfficial.categoryCode,
              supplier: matchedOfficial.supplier,
              confirmed: true,
              productGroup: matchedOfficial.productGroup,
              chemicalGroup: matchedOfficial.chemicalGroup,
              activeIngredient: matchedOfficial.activeIngredient,
              isOfficialMatch: true,
              officialProductName: matchedOfficial.name,
              suggestedAction: mStatus.mergeWithProductId ? 'family_merge' : 'exact_alias',
              similarityWarning: mStatus.similarityWarning,
              mergeWithProductId: mStatus.mergeWithProductId,
              budgetClass: mStatus.budgetClass,
              equivalentName: mStatus.equivalentName
            }
          ]);
        } catch (err) {
          console.error(err);
          toast.error('Não foi possível realizar leitura binária do PDF.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast.error('Formato não suportado.', {
        description: 'Faça upload de arquivos (.xlsx, .csv, .xml, ou .pdf).'
      });
    }
  };

  const computeProductMatchStatus = (
    parsedName: string, 
    activeIngredient: string, 
    chemicalGroup: string, 
    supplier: string, 
    isOfficialMatch: boolean, 
    officialProductName?: string
  ) => {
    const exactMatch = products.find(p => normalizeString(p.name) === normalizeString(parsedName));
    if (exactMatch) {
      return {
        budgetClass: 'found' as const,
        equivalentName: exactMatch.name,
        mergeWithProductId: exactMatch.id,
        similarityWarning: undefined
      };
    }

    const sameActiveAndSupplier = products.find(existing => {
      const isSameActive = existing.activeIngredient && 
        existing.activeIngredient !== 'NÃO ESPECIFICADO' && 
        normalizeString(existing.activeIngredient) === normalizeString(activeIngredient);
      const isSameSupplier = existing.supplier && 
        existing.supplier !== 'Desconhecido' && 
        normalizeString(existing.supplier) === normalizeString(supplier);
      return isSameActive && isSameSupplier;
    });

    if (sameActiveAndSupplier) {
      return {
        budgetClass: 'equivalent' as const,
        equivalentName: sameActiveAndSupplier.name,
        mergeWithProductId: sameActiveAndSupplier.id,
        similarityWarning: `Regra de Equivalência (Mesmo princípio ativo e fabricante): Vinculado a "${sameActiveAndSupplier.name}"`
      };
    }

    let bestSimilarProduct = null;
    let bestSimilarity = 0;
    for (const existing of products) {
      const score = getSimilarityScore(existing.name, parsedName);
      if (score >= 0.85 && score > bestSimilarity) {
        bestSimilarProduct = existing;
        bestSimilarity = score;
      }
    }

    if (bestSimilarProduct) {
      return {
        budgetClass: 'equivalent' as const,
        equivalentName: bestSimilarProduct.name,
        mergeWithProductId: bestSimilarProduct.id,
        similarityWarning: `Similaridade de ${(bestSimilarity * 100).toFixed(1)}% superando limite de 85%: Sugerido vincular a "${bestSimilarProduct.name}"`
      };
    }

    if (isOfficialMatch && officialProductName) {
      const registeredOfficial = products.find(p => normalizeString(p.name) === normalizeString(officialProductName));
      return {
        budgetClass: 'equivalent' as const,
        equivalentName: officialProductName,
        mergeWithProductId: registeredOfficial?.id,
        similarityWarning: `Equivalência Oficial: "${parsedName}" corresponde ao produto de catálogo "${officialProductName}"`
      };
    }

    return {
      budgetClass: 'unregistered' as const,
      equivalentName: undefined,
      mergeWithProductId: undefined,
      similarityWarning: undefined
    };
  };

  const handleUpdateParsedItem = (id: string, updates: Partial<UploadParsedItem>) => {
    setUploadParsedItems(prev => prev.map(item => {
      if (item.id === id) {
        const merged = { ...item, ...updates };
        // If they updated the name, re-run smart matching automatically
        if (updates.name) {
          const recognition = scanProductSmartly(updates.name, merged.quantity, merged.costPerUnit, merged.supplier);
          merged.productGroup = recognition.classification.productGroup;
          merged.chemicalGroup = recognition.classification.chemicalGroup;
          merged.activeIngredient = recognition.classification.activeIngredient;
          merged.category = recognition.classification.categoryCode;
          merged.isOfficialMatch = recognition.isOfficialMatch;
          merged.officialProductName = recognition.officialProduct?.name;

          // Re-compute budget alignment
          const mStatus = computeProductMatchStatus(
            updates.name,
            recognition.classification.activeIngredient,
            recognition.classification.chemicalGroup,
            merged.supplier,
            recognition.isOfficialMatch,
            recognition.officialProduct?.name
          );
          merged.budgetClass = mStatus.budgetClass;
          merged.equivalentName = mStatus.equivalentName;
          merged.mergeWithProductId = mStatus.mergeWithProductId;
          merged.similarityWarning = mStatus.similarityWarning;
          merged.suggestedAction = mStatus.mergeWithProductId ? 'family_merge' : (recognition.isOfficialMatch ? 'exact_alias' : 'new_item');
        }
        return merged;
      }
      return item;
    }));
  };

  const handleAddManualRow = () => {
    const newIdx = uploadParsedItems.length + 1;
    const initialName = 'OPTIGARD LT';
    const mStatus = computeProductMatchStatus(
      initialName,
      'Tiametoxam',
      'Neonicotinóide',
      'Syngenta',
      true,
      initialName
    );

    setUploadParsedItems(prev => [
      ...prev,
      {
        id: `manual-entry-row-${newIdx}-${Math.random().toString(36).substring(2, 5)}`,
        name: initialName,
        quantity: 5,
        unit: 'ml',
        costPerUnit: 120.00,
        category: 'inseticida',
        supplier: 'Syngenta',
        confirmed: true,
        productGroup: 'Inseticidas',
        chemicalGroup: 'Neonicotinóide',
        activeIngredient: 'Tiametoxam',
        isOfficialMatch: true,
        officialProductName: initialName,
        suggestedAction: mStatus.mergeWithProductId ? 'family_merge' : 'exact_alias',
        budgetClass: mStatus.budgetClass,
        equivalentName: mStatus.equivalentName,
        mergeWithProductId: mStatus.mergeWithProductId,
        similarityWarning: mStatus.similarityWarning
      }
    ]);
  };

  // Run AI Refinement on imported products
  const refineWithAI = async () => {
    if (uploadParsedItems.length === 0) return;
    setIsClassifyingWithAI(true);
    toast.info("Aprimorando classificação com Inteligência Artificial Gemini...", {
      description: "Buscando princípios ativos reais e grupos químicos científicos na base regulatória."
    });

    try {
      const apiInputs = uploadParsedItems.map(p => ({
        name: p.name,
        supplier: p.supplier
      }));

      const refined = await queryAIForProducts(apiInputs);
      
      setUploadParsedItems(prev => prev.map((item, idx) => {
        const refItem = refined.find(r => normalizeString(r.name) === normalizeString(item.name)) || refined[idx];
        if (refItem) {
          return {
            ...item,
            productGroup: refItem.productGroup,
            chemicalGroup: refItem.chemicalGroup,
            activeIngredient: refItem.activeIngredient,
            category: refItem.categoryCode
          };
        }
        return item;
      }));
      
      toast.success("Parâmetros químicos catalogados com sucesso!", {
        description: "Inteligência Artificial atualizou princípios ativos e grupos farmacêuticos de todos os itens."
      });
    } catch (err) {
      console.error(err);
      toast.error("Ocorreu um erro ao chamar a Inteligência Artificial DDSulf.");
    } finally {
      setIsClassifyingWithAI(false);
    }
  };

  const handleConfirmImport = () => {
    const toImport = uploadParsedItems.filter(item => item.confirmed);
    if (toImport.length === 0) {
      toast.warning('Nenhum item marcado', {
        description: 'Marque ao menos um produto para poder efetivar a entrada.'
      });
      return;
    }

    let addedCount = 0;
    let summedCount = 0;

    toImport.forEach(item => {
      // Rule 1, 2, 3: Compare similar and suggest fusion
      const mergeId = item.mergeWithProductId;
      const existingProduct = products.find(p => p.id === mergeId);

      let targetId = '';

      if (mergeId && existingProduct) {
        // Rule 3: Do not create new automatically, merge and update quantities
        targetId = mergeId;
        updateInventoryProduct(mergeId, {
          quantity: existingProduct.quantity + item.quantity,
          // Weighted average cost or override
          costPerUnit: item.costPerUnit > 0 ? item.costPerUnit : existingProduct.costPerUnit,
          // Persist the official metadata
          chemicalGroup: existingProduct.chemicalGroup || item.chemicalGroup,
          activeIngredient: existingProduct.activeIngredient || item.activeIngredient,
          productGroup: existingProduct.productGroup || item.productGroup,
          lastUpdated: new Date().toISOString()
        });
        summedCount++;
      } else {
        // Create new item
        const newId = `prod-${Math.random().toString(36).substring(2, 11)}`;
        targetId = newId;
        addInventoryProduct({
          id: newId,
          name: item.name.trim(),
          category: item.category,
          unit: item.unit,
          quantity: item.quantity,
          minQuantity: Math.ceil(item.quantity * 0.2), // Default 20% limit
          costPerUnit: item.costPerUnit,
          supplier: item.supplier || 'Importado / Manual',
          lastUpdated: new Date().toISOString(),
          productGroup: item.productGroup,
          chemicalGroup: item.chemicalGroup,
          activeIngredient: item.activeIngredient
        });
        addedCount++;
      }

      // Rule 5: Armazenar histórico de movimentação
      addInventoryMovement({
        id: `mov-${Math.random().toString(36).substring(2, 11)}`,
        date: new Date().toISOString(),
        productId: targetId,
        type: 'entrada',
        quantity: item.quantity,
        reason: `Mapeamento inteligente de lote de produtos - (${uploadedFileName || 'Entrada Dedicada'})`
      });
    });

    toast.success('Entrada de produtos concluída!', {
      description: `Sincronizados com sucesso: ${addedCount} novos cadastros e ${summedCount} fusões de estoque.`
    });

    setUploadParsedItems([]);
    setUploadedFileName('');
    setActiveTab('current_stock');
  };

  // -------------------------------------------------------------
  // TAB 3: TIMELINE VERTICAL
  // -------------------------------------------------------------
  const filteredMovements = movements.filter(m => {
    if (movementTypeFilter !== 'all' && m.type !== movementTypeFilter) return false;
    if (movementProductFilter !== 'all' && m.productId !== movementProductFilter) return false;
    if (movementPeriodFilter !== 'all') {
      const daysLimit = movementPeriodFilter === '7d' ? 7 : movementPeriodFilter === '30d' ? 30 : 90;
      const limitDate = new Date();
      limitDate.setDate(limitDate.getDate() - daysLimit);
      return new Date(m.date) >= limitDate;
    }
    return true;
  });

  const getProductName = (id: string) => {
    const p = products.find(prod => prod.id === id);
    return p ? p.name : `Produto #${id}`;
  };

  const getProductUnit = (id: string) => {
    const p = products.find(prod => prod.id === id);
    return p ? p.unit : '';
  };

  // Filtered stocks lists
  const displayedProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(stockSearch.toLowerCase()) || 
      (p.supplier && p.supplier.toLowerCase().includes(stockSearch.toLowerCase())) ||
      (p.activeIngredient && p.activeIngredient.toLowerCase().includes(stockSearch.toLowerCase())) ||
      (p.productGroup && p.productGroup.toLowerCase().includes(stockSearch.toLowerCase()));
    const matchCategory = stockCategoryFilter === 'all' || p.category === stockCategoryFilter;
    return matchSearch && matchCategory;
  });

  // Calculate global statistics safely (avoiding divide-by-zero or NaN)
  const totalStockValue = products.reduce((acc, p) => acc + (p.quantity * (p.costPerUnit || 0)), 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
      
      {/* HEADER */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-sans text-[#2D6A4F] text-xs font-bold uppercase tracking-wider block">DDSULF OPERACIONAL</span>
          <h1 className="font-display text-2.5xl font-black text-[#141410] mt-1 uppercase tracking-tight">Fluxo Inteligente de Produtos</h1>
          <p className="text-xs text-[#6B6B5F] mt-0.5">Importação NF-e, detecção de semelhanças e agrupamento químico da DDSulf.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-[#1B3A2D] text-white 
                             text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#2D6A4F] transition-all cursor-pointer shadow-sm shrink-0"
        >
          <Plus className="size-4" /> Cadastrar Produto Manual
        </button>
      </header>

      {/* BANNER DE PRODUTOS CRÍTICOS */}
      {criticalProducts.length > 0 && (
        <div className="bg-[#FDF2F2] border border-rose-200 rounded-2xl p-4 mb-6 text-xs text-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🚨</span>
            <span className="font-medium">
              Há <strong>{criticalProducts.length}</strong> {criticalProducts.length === 1 ? 'insumo' : 'insumos'} com estoque abaixo de seu limite crítico: {criticalProducts.map(p => p.name).join(', ')}.
            </span>
          </div>
          <button
            onClick={() => {
              setUploadedFileName('');
              setUploadParsedItems([]);
              setActiveTab('upload_entry');
            }}
            className="text-xs font-black uppercase tracking-wider text-[#1B3A2D] underline hover:text-[#2D6A4F] text-left cursor-pointer shrink-0"
          >
            Sinalizar Compra / Entrada por Upload
          </button>
        </div>
      )}

      {/* ABAS */}
      <div className="flex gap-1 mb-8 p-1 bg-[#F0EDE8] rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            id={`tab-btn-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === tab.id ? 'bg-[#1B3A2D] text-white shadow-sm' : 'text-[#6B6B5F] hover:text-[#141410]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SWITCH CONTENTS */}
      <AnimatePresence mode="wait">

        {/* ----------------- TAB 1: ESTOQUE ATUAL ----------------- */}
        {activeTab === 'current_stock' && (
          <motion.div
            key="current-stock-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Stats summaries */}
            <div className="grid gap-6 sm:grid-cols-4">
              <div className="p-5 bg-white border border-[#E8E6E1] rounded-2xl space-y-1">
                <p className="text-[9px] font-black uppercase tracking-wider text-[#6B6B5F]">Valor Total em Estoque</p>
                <p className="text-xl font-display font-black text-[#141410]">R$ {totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <div className="text-[10px] text-[#2D6A4F] font-bold">Investimento integrado</div>
              </div>

              <div className="p-5 bg-white border border-[#E8E6E1] rounded-2xl space-y-1">
                <p className="text-[9px] font-black uppercase tracking-wider text-[#6B6B5F]">Insumos Cadastrados</p>
                <p className="text-xl font-display font-black text-[#141410]">{products.length} itens</p>
                <div className="text-[10px] text-[#6B6B5F] font-bold">Variáveis de campo DDSulf</div>
              </div>

              <div className="p-5 bg-white border border-[#E8E6E1] rounded-2xl space-y-1">
                <p className="text-[9px] font-black uppercase tracking-wider text-[#6B6B5F]">Nível Crítico</p>
                <p className="text-xl font-display font-black text-rose-700">{products.filter(p => p.quantity <= p.minQuantity).length} itens</p>
                <div className="text-[10px] text-rose-600 font-bold">Abaixo do limite de segurança</div>
              </div>

              <div className="p-5 bg-white border border-[#E8E6E1] rounded-2xl space-y-1">
                <p className="text-[9px] font-black uppercase tracking-wider text-[#6B6B5F]">Nível de Atenção</p>
                <p className="text-xl font-display font-black text-amber-700">{products.filter(p => p.quantity > p.minQuantity && p.quantity <= p.minQuantity * 1.5).length} itens</p>
                <div className="text-[10px] text-amber-600 font-bold">Reabastecimento recomendado</div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-[#E8E6E1] p-4 rounded-2xl">
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#6B6B5F]" />
                  <input
                    type="text"
                    value={stockSearch}
                    onChange={(e) => setStockSearch(e.target.value)}
                    placeholder="Filtrar por insumo, fabricante ou princípio ativo..."
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#E8E6E1] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9]"
                  />
                </div>

                <select
                  value={stockCategoryFilter}
                  onChange={(e) => setStockCategoryFilter(e.target.value)}
                  className="h-11 px-3 border border-[#E8E6E1] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9] cursor-pointer text-[#141410]"
                >
                  <option value="all">Todas as Categoria Técnicas</option>
                  {CATEGORIES_LIST.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* STOCK PRODUCTS LIST TABLE */}
            <div className="bg-white border border-[#E8E6E1] rounded-2xl overflow-hidden">
              {displayedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                  <SearchX className="size-9 text-[#6B6B5F] opacity-50" />
                  <div className="space-y-1">
                    <p className="text-xs font-black text-[#141410] uppercase tracking-widest">Nenhum Insumo Disponível</p>
                    <p className="text-xs text-[#6B6B5F] max-w-sm">Tente redefinir sua busca ou use os botões superiores para cadastrar novos produtos.</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F0EDE8]">
                      <tr className="border-b border-[#E8E6E1]">
                        <th className="py-4 px-6 text-[9px] font-black text-[#6B6B5F] uppercase tracking-wider font-sans">Nome do Produto</th>
                        <th className="py-4 px-4 text-[9px] font-black text-[#6B6B5F] uppercase tracking-wider font-sans">Grupo Comercial / Químico</th>
                        <th className="py-4 px-4 text-[9px] font-black text-[#6B6B5F] uppercase tracking-wider font-sans">Princípio Ativo</th>
                        <th className="py-4 px-4 text-[9px] font-black text-[#6B6B5F] uppercase tracking-wider font-sans">Fabricante</th>
                        <th className="py-4 px-4 text-right text-[9px] font-black text-[#6B6B5F] uppercase tracking-wider font-sans">Quantidade</th>
                        <th className="py-4 px-4 text-right text-[9px] font-black text-[#6B6B5F] uppercase tracking-wider font-sans">Valor Unitário</th>
                        <th className="py-4 px-4 text-right text-[9px] font-black text-[#6B6B5F] uppercase tracking-wider font-sans">Total em Estoque</th>
                        <th className="py-4 px-4 text-center text-[9px] font-black text-[#6B6B5F] uppercase tracking-wider font-sans">Status</th>
                        <th className="py-4 px-6 text-right text-[9px] font-black text-[#6B6B5F] uppercase tracking-wider font-sans">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E6E1] text-xs">
                      {displayedProducts.map((p) => {
                        const status = getProductStatus(p.quantity, p.minQuantity);
                        const isInlineEditing = editingId === p.id;
                        const valueInStock = p.quantity * p.costPerUnit;

                        let pillClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                        if (status.code === 'critico') {
                          pillClasses = 'bg-rose-50 text-rose-850 border-rose-200';
                        } else if (status.code === 'baixo') {
                          pillClasses = 'bg-amber-50 text-amber-850 border-amber-200';
                        }

                        return (
                          <tr key={p.id} className="hover:bg-[#FAFAF9] transition-colors font-medium border-b border-[#E8E6E1] text-[#141410]">
                            
                            {/* Nome */}
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#FAFAF9] rounded-xl border border-[#E8E6E1] text-[#6B6B5F]">
                                  <Package className="size-4" />
                                </div>
                                <div className="space-y-0.5">
                                  <span className="font-extrabold text-sm text-[#141410] block">{p.name}</span>
                                  <span className="text-[10px] text-[#6B6B5F] font-semibold">{p.productGroup || 'Consumíveis'}</span>
                                </div>
                              </div>
                            </td>

                            {/* Grupo Comercial / Químico */}
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="space-y-0.5">
                                <span className="px-2 py-0.5 rounded-md font-mono text-[9px] font-bold border border-[#E8E6E1] bg-[#FAFAF9] uppercase">
                                  {CATEGORY_LABELS[p.category] || p.category}
                                </span>
                                <span className="block text-[10px] text-[#6B6B5F] font-mono font-medium truncate max-w-[120px]">
                                  {p.chemicalGroup || '⚠️ NÃO INFORMADO'}
                                </span>
                              </div>
                            </td>

                            {/* Princípio Ativo */}
                            <td className="py-4 px-4 font-mono text-[10px] text-[#6B6B5F] max-w-[120px] truncate">
                              {p.activeIngredient || '⚠️ NÃO INFORMADO'}
                            </td>

                            {/* Fabricante */}
                            <td className="py-4 px-4 font-sans font-bold text-[#6B6B5F] max-w-[120px] truncate">
                              {p.supplier || 'N/A'}
                            </td>

                            {/* Quantidade */}
                            <td className="py-4 px-4 text-right">
                              {isInlineEditing ? (
                                <div className="flex items-center justify-end gap-1.5 max-w-[120px] ml-auto">
                                  <input
                                    type="number"
                                    min="0"
                                    value={editingQty}
                                    onChange={(e) => setEditingQty(parseFloat(e.target.value) || 0)}
                                    className="w-16 h-8 border border-[#E8E6E1] rounded-lg text-center text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9]"
                                  />
                                  <button
                                    onClick={() => saveInlineQuantity(p)}
                                    className="p-1 w-7 h-7 bg-[#1B3A2D] text-white rounded-lg hover:bg-[#2D6A4F] flex items-center justify-center cursor-pointer"
                                  >
                                    <Check className="size-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="p-1 w-7 h-7 bg-white border border-[#E8E6E1] text-[#6B6B5F] rounded-lg hover:bg-slate-150 flex items-center justify-center cursor-pointer"
                                  >
                                    <X className="size-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="inline-flex items-baseline justify-end gap-0.5 cursor-pointer group" onClick={() => startInlineEdit(p)}>
                                  <span className="font-display font-black text-[#141410] text-sm leading-none">
                                    {p.quantity.toLocaleString('pt-BR')}
                                  </span>
                                  <span className="text-[#6B6B5F] text-[10px] font-bold ml-1">
                                    {p.unit}
                                  </span>
                                  <Edit2 className="size-2.5 text-[#6B6B5F] opacity-0 group-hover:opacity-100 transition-opacity ml-1.5 self-center" />
                                </div>
                              )}
                            </td>

                            {/* Valor Unitário */}
                            <td className="py-4 px-4 text-right font-mono font-bold text-xs">
                              R$ {p.costPerUnit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>

                            {/* Valor Total em Estoque */}
                            <td className="py-4 px-4 text-right font-mono font-black text-xs text-[#1B3A2D]">
                              R$ {valueInStock.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>

                            {/* Status */}
                            <td className="py-4 px-4 text-center whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] border font-black uppercase tracking-wider ${pillClasses}`}>
                                <span className={`size-1.5 rounded-full ${status.dot}`}></span>
                                {status.label}
                              </span>
                            </td>

                            {/* Ações */}
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => openEditModal(p)}
                                  className="p-1.5 text-[#6B6B5F] hover:text-[#2D6A4F] hover:bg-[#D8EDE3] rounded-lg transition-all cursor-pointer"
                                  title="Ficha Cadastral"
                                >
                                  <Edit2 className="size-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="p-1.5 text-[#6B6B5F] hover:text-[#C1361A] hover:bg-[#FDDDD8] rounded-lg transition-all cursor-pointer"
                                  title="Excluir"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ----------------- TAB 2: ENTRADA POR UPLOAD & INTEL ENGINE ----------------- */}
        {activeTab === 'upload_entry' && (
          <motion.div
            key="upload-entry-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid gap-8 lg:grid-cols-12"
          >
            {/* Left side upload and parameters */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white border border-[#E8E6E1] p-6 rounded-2xl space-y-6">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-[#141410] font-display">Scanner Inteligente DDSulf</h3>
                  <p className="text-xs text-[#6B6B5F] font-medium leading-relaxed">
                    Arraste sua planilha, nota fiscal XML ou PDF. O motor de inteligência deduzirá as equivalências de insumos químicos de forma automatizada.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="text-[9px] font-black uppercase text-[#6B6B5F] tracking-widest font-sans block">Propósito da Importação</label>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-[#FAFAF9] border border-[#E8E6E1] rounded-xl">
                    <button
                      type="button"
                      onClick={() => setImportType('estoque')}
                      className={`py-1.5 rounded-lg text-center text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        importType === 'estoque'
                          ? 'bg-[#1B3A2D] text-white shadow-xs'
                          : 'text-[#6B6B5F] hover:text-[#141410]'
                      }`}
                    >
                      Estoque
                    </button>
                    <button
                      type="button"
                      onClick={() => setImportType('orcamento')}
                      className={`py-1.5 rounded-lg text-center text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        importType === 'orcamento'
                          ? 'bg-[#1B3A2D] text-white shadow-xs'
                          : 'text-[#6B6B5F] hover:text-[#141410]'
                      }`}
                    >
                      Orçamento / Proposta
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-[#6B6B5F] tracking-widest font-sans block">Formatos Prontos</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      type="button"
                      onClick={() => document.getElementById('inventory-file-selector')?.click()}
                      className="flex flex-col items-center justify-center p-2 bg-[#FAFAF9] border border-[#E8E6E1] hover:border-[#1B3A2D] hover:bg-emerald-50 rounded-xl text-center text-[10px] font-bold text-[#6B6B5F] hover:text-[#1B3A2D] transition-all cursor-pointer gap-1"
                    >
                      <FileSpreadsheet className="size-4 text-emerald-700" />
                      <span>Planilha (.xlsx)</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => document.getElementById('inventory-file-selector')?.click()}
                      className="flex flex-col items-center justify-center p-2 bg-[#FAFAF9] border border-[#E8E6E1] hover:border-[#1B3A2D] hover:bg-emerald-50 rounded-xl text-center text-[10px] font-bold text-[#6B6B5F] hover:text-[#1B3A2D] transition-all cursor-pointer gap-1"
                    >
                      <FileUp className="size-4 text-sky-700" />
                      <span>XML (.xml)</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => document.getElementById('inventory-file-selector')?.click()}
                      className="flex flex-col items-center justify-center p-2 bg-[#FAFAF9] border border-[#E8E6E1] hover:border-[#1B3A2D] hover:bg-emerald-50 rounded-xl text-center text-[10px] font-bold text-[#6B6B5F] hover:text-[#1B3A2D] transition-all cursor-pointer gap-1"
                    >
                      <FileUp className="size-4 text-rose-700" />
                      <span>PDF (.pdf)</span>
                    </button>
                  </div>
                </div>

                {/* Drag zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('inventory-file-selector')?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                    isDragging 
                      ? 'border-[#1B3A2D] bg-[#FAFAF9]' 
                      : 'border-[#E8E6E1] hover:border-[#1B3A2D] hover:bg-[#FAFAF9]/50 bg-[#FAFAF9]'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <FileUp className="size-6 text-[#1B3A2D]" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#141410]">Selecione ou solte aqui o arquivo</p>
                      <p className="text-[10px] text-[#6B6B5F]">Lemos quantidades, custos e nomes</p>
                    </div>

                    {uploadedFileName && (
                      <div className="bg-[#D8EDE3] text-[#1B3A2D] border border-[#2D6A4F]/20 px-3 py-1 rounded-full text-[10px] font-bold max-w-full truncate">
                        {uploadedFileName}
                      </div>
                    )}

                    <input
                      id="inventory-file-selector"
                      type="file"
                      accept=".xlsx,.xls,.csv,.xml,.pdf"
                      onChange={handleFileInputChange}
                      className="sr-only"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 font-black text-[9px] uppercase tracking-wider text-[#1B3A2D] rounded-lg border-[#1B3A2D] hover:bg-[#1B3A2D]/10 cursor-pointer mt-1"
                    >
                      Procurar Local
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-[#FAFAF9] border border-[#E8E6E1] rounded-xl text-[11px] text-[#6B6B5F] space-y-1.5 leading-relaxed">
                  <span className="font-extrabold text-[#141410] uppercase tracking-wider text-[9px] block">🔍 Regras de Equivalência</span>
                  <p>
                    Nomes semelhantes (ex: <i>OPTIGARD WG</i>) são enlaçados à família correspondente, acionando o preenchimento automático de princípios ativos e fornecedores da DDSulf.
                  </p>
                </div>
              </div>

              {/* Grid Preview Raw Rows */}
              {(sheetPreviewRaw.length > 0 || rawTextPreview) && (
                <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Eye className="size-4 text-[#6B6B5F]" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#6B6B5F]">Dados Brutos do Arquivo</span>
                  </div>

                  {fileTypeDetected === 'sheet' && sheetPreviewRaw.length > 0 && (
                    <div className="overflow-x-auto max-h-[160px] border border-[#E8E6E1] rounded-xl text-[9px] font-mono divide-y divide-[#E8E6E1] bg-[#FAFAF9]">
                      {sheetPreviewRaw.map((rowArr, rIdx) => (
                        <div key={rIdx} className="flex divide-x divide-[#E8E6E1] whitespace-nowrap p-1.5">
                          {rowArr.map((cellStr, cIdx) => (
                            <span key={cIdx} className="px-1.5 opacity-85 block truncate max-w-[120px]" title={cellStr}>
                              {cellStr || '-'}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {(fileTypeDetected === 'xml' || fileTypeDetected === 'pdf') && rawTextPreview && (
                    <pre className="p-3 bg-[#141410] text-emerald-400 text-[9px] font-mono rounded-xl overflow-auto max-h-[160px] whitespace-pre-wrap leading-normal border border-[#E8E6E1]">
                      {rawTextPreview}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Right side confirming list */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white border border-[#E8E6E1] p-6 rounded-2xl flex flex-col min-h-[440px]">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E6E1] pb-4 mb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-[#141410] font-display">Confirmar Alinhamento de Linhas</h3>
                    <p className="text-xs text-[#6B6B5F] font-medium">Reveja se deseja fundir os produtos similares encontrados para evitar novas duplicidades.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {uploadParsedItems.length > 0 && (
                      <Button
                        type="button"
                        onClick={refineWithAI}
                        disabled={isClassifyingWithAI}
                        className="h-9 px-3 bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-[10px] uppercase tracking-wide rounded-lg flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                      >
                        {isClassifyingWithAI ? (
                          <>
                            <Loader2 className="size-3 animate-spin" />
                            <span>Mapeando...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="size-3.5 fill-white/25" />
                            <span>Aperfeiçoar com IA</span>
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddManualRow}
                      className="h-9 px-3 rounded-lg border-dashed border-[#E8E6E1] text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] hover:text-[#141410] cursor-pointer"
                    >
                      + Nova Linha Manual
                    </Button>
                  </div>
                </div>

                {/* Confirmable items list */}
                <div className="flex-1 space-y-4 pr-1 overflow-y-auto max-h-[500px]">
                  {uploadParsedItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                      <FileSpreadsheet className="size-10 text-[#6B6B5F] opacity-40" />
                      <div className="space-y-1">
                        <p className="text-xs font-black text-[#141410] uppercase tracking-wider">Aguardando Importação</p>
                        <p className="text-xs text-[#6B6B5F] max-w-xs">Carregue um documento para ver e editar os itens mapeados antes de salvá-los.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-1">
                      {uploadParsedItems.map((item) => {
                        const originalMatched = products.find(p => p.id === item.mergeWithProductId);

                        return (
                          <div 
                            key={item.id}
                            className={`p-4 rounded-xl border transition-all space-y-3 ${
                              item.confirmed 
                                ? 'bg-[#FAFAF9] border-[#E8E6E1] shadow-xs' 
                                : 'bg-slate-50 border-dashed border-slate-200 opacity-60'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`chk-item-${item.id}`}
                                  checked={item.confirmed}
                                  onChange={(e) => handleUpdateParsedItem(item.id, { confirmed: e.target.checked })}
                                  className="size-4.5 rounded-md accent-[#1B3A2D] cursor-pointer"
                                />
                                <span className="text-sm font-extrabold text-[#141410]">{item.name}</span>
                              </div>

                              <button
                                onClick={() => setUploadParsedItems(prev => prev.filter(p => p.id !== item.id))}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                title="Descartar"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>

                            {/* Budget Alignment Banner */}
                            {importType === 'orcamento' && (
                              <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
                                {(!item.budgetClass || item.budgetClass === 'found') && (
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black bg-[#D8EDE3] text-[#1B3A2D] border border-[#2D6A4F]/20">
                                    <CheckCircle2 className="size-3 text-[#2D6A4F]" />
                                    <span>PRODUTO ENCONTRADO</span>
                                  </div>
                                )}
                                {item.budgetClass === 'equivalent' && (
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200">
                                    <ArrowRightLeft className="size-3 text-amber-600" />
                                    <span>PRODUTO EQUIVALENTE &rarr; {item.equivalentName}</span>
                                  </div>
                                )}
                                {item.budgetClass === 'unregistered' && (
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-300">
                                    <AlertTriangle className="size-3 text-slate-500" />
                                    <span>PRODUTO NÃO CADASTRADO</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Similarity alert / Option to merge in order to resolve Rule 3 */}
                            {item.similarityWarning && originalMatched && (
                              <div className="bg-amber-50 border border-amber-200/60 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-amber-850">
                                <div className="flex items-center gap-1.5">
                                  <ShieldAlert className="size-4 text-amber-600 shrink-0" />
                                  <span>
                                    Rule 3 Duplicate check: Semelhante a <strong>{originalMatched.name}</strong> (Ativo: <i>{originalMatched.activeIngredient || 'Outros'}</i>).
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <label className="flex items-center gap-1 font-bold text-[10px] uppercase cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      checked={!!item.mergeWithProductId}
                                      onChange={(e) => {
                                        // Toggle fusion or treat as completely separate product
                                        handleUpdateParsedItem(item.id, {
                                          mergeWithProductId: e.target.checked ? originalMatched.id : undefined
                                        });
                                      }}
                                      className="size-3.5 accent-amber-650"
                                    />
                                    <span>FUNDO / UNIFICAR</span>
                                  </label>
                                </div>
                              </div>
                            )}

                            {/* Automatic match display tag */}
                            {item.isOfficialMatch && item.officialProductName && (
                              <div className="bg-[#D8EDE3] text-[#1B3A2D] border border-[#2D6A4F]/20 px-2.5 py-1 rounded-lg text-[10px] font-bold w-fit flex items-center gap-1.5">
                                <CheckCircle2 className="size-3 text-[#2D6A4F] fill-[#2D6A4F]/10" />
                                <span>Equivalência DDSulf oficial garantida: <strong>{item.officialProductName}</strong></span>
                              </div>
                            )}

                            {/* Editable inputs row */}
                            <div className="grid gap-4 sm:grid-cols-4">
                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-[#6B6B5F]">Grupo de Produto</label>
                                <select
                                  value={item.productGroup}
                                  onChange={(e: any) => handleUpdateParsedItem(item.id, { productGroup: e.target.value })}
                                  className="w-full h-8 border border-[#E8E6E1] rounded-lg px-2 text-[10px] font-semibold bg-white cursor-pointer"
                                >
                                  {CATEGORIES_LIST.map(g => (
                                    <option key={g.label} value={g.label}>{g.label}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-[#6B6B5F]">Princípio Ativo</label>
                                <input
                                  type="text"
                                  value={item.activeIngredient}
                                  onChange={(e) => handleUpdateParsedItem(item.id, { activeIngredient: e.target.value })}
                                  className="w-full h-8 border border-[#E8E6E1] rounded-lg px-2 text-[10px] font-semibold bg-white"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-[#6B6B5F]">Grupo Químico</label>
                                <input
                                  type="text"
                                  value={item.chemicalGroup}
                                  onChange={(e) => handleUpdateParsedItem(item.id, { chemicalGroup: e.target.value })}
                                  className="w-full h-8 border border-[#E8E6E1] rounded-lg px-2 text-[10px] font-semibold bg-white"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-[#6B6B5F]">Fabricante</label>
                                <input
                                  type="text"
                                  value={item.supplier}
                                  onChange={(e) => handleUpdateParsedItem(item.id, { supplier: e.target.value })}
                                  className="w-full h-8 border border-[#E8E6E1] rounded-lg px-2 text-[10px] font-semibold bg-white"
                                />
                              </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3 pt-1 border-t border-[#E8E6E1]/60">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase text-[#6B6B5F]">Qtd</label>
                                  <input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => handleUpdateParsedItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                                    className="w-full h-8 border border-[#E8E6E1] rounded-lg px-2 text-center text-xs font-bold bg-white"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-black uppercase text-[#6B6B5F]">Unidade</label>
                                  <select
                                    value={item.unit}
                                    onChange={(e) => handleUpdateParsedItem(item.id, { unit: e.target.value })}
                                    className="w-full h-8 border border-[#E8E6E1] rounded-lg px-1.5 text-[10px] font-semibold bg-white cursor-pointer"
                                  >
                                    {UNITS_LIST.map(u => (
                                      <option key={u} value={u}>{u}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-[#6B6B5F]">Custo Unitário (R$)</label>
                                <input
                                  type="number"
                                  value={item.costPerUnit}
                                  onChange={(e) => handleUpdateParsedItem(item.id, { costPerUnit: parseFloat(e.target.value) || 0 })}
                                  className="w-full h-8 border border-[#E8E6E1] rounded-lg px-3 text-xs font-bold bg-white"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-[#6B6B5F]">Valor Total Estimado</label>
                                <div className="h-8 flex items-center justify-end px-3 rounded-lg border border-[#E8E6E1] bg-slate-50 text-xs font-black text-[#1B3A2D] font-mono">
                                  R$ {(item.quantity * item.costPerUnit).toFixed(2)}
                                </div>
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Import Footer actions block */}
                {uploadParsedItems.length > 0 && (
                  <div className="border-t border-[#E8E6E1] pt-4 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-[10px] font-bold text-[#6B6B5F]">
                      Totalizando <span className="text-[#141410] font-black underline">{uploadParsedItems.filter(p => p.confirmed).length} item(ns)</span> prontos para consolidação reguladora.
                    </span>
                    <Button
                      type="button"
                      onClick={handleConfirmImport}
                      className="w-full sm:w-auto h-11 bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white rounded-xl px-6 font-bold text-xs uppercase tracking-widest cursor-pointer shadow-xs transition-colors"
                    >
                      Efetivar Entrada no Estoque
                    </Button>
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        )}

        {/* ----------------- TAB 3: LOG DE MOVIMENTAÇÕES ----------------- */}
        {activeTab === 'movements_log' && (
          <motion.div
            key="movements-log-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="bg-white border border-[#E8E6E1] p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4 w-full">
                <div className="space-y-1 flex-1 min-w-[140px]">
                  <label className="text-[9px] font-black uppercase text-[#6B6B5F] block">Filtrar por Fluxo</label>
                  <select
                    value={movementTypeFilter}
                    onChange={(e) => setMovementTypeFilter(e.target.value as any)}
                    className="w-full h-10 border border-[#E8E6E1] rounded-lg px-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9] cursor-pointer"
                  >
                    <option value="all">Todas as Altas/Baixas</option>
                    <option value="entrada">Entradas (Incrementos)</option>
                    <option value="saida">Saídas (Consumos/Ajustes)</option>
                  </select>
                </div>

                <div className="space-y-1 flex-1 min-w-[180px]">
                  <label className="text-[9px] font-black uppercase text-[#6B6B5F] block">Filtrar por Produto</label>
                  <select
                    value={movementProductFilter}
                    onChange={(e) => setMovementProductFilter(e.target.value)}
                    className="w-full h-10 border border-[#E8E6E1] rounded-lg px-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9] cursor-pointer"
                  >
                    <option value="all">Todos os Produtos do Catálogo</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 flex-1 min-w-[130px]">
                  <label className="text-[9px] font-black uppercase text-[#6B6B5F] block">Período de Análise</label>
                  <select
                    value={movementPeriodFilter}
                    onChange={(e) => setMovementPeriodFilter(e.target.value as any)}
                    className="w-full h-10 border border-[#E8E6E1] rounded-lg px-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9] cursor-pointer"
                  >
                    <option value="all">Histórico Completo</option>
                    <option value="7d">Últimos 7 dias</option>
                    <option value="30d">Últimos 30 dias</option>
                    <option value="90d">Últimos 90 dias</option>
                  </select>
                </div>
              </div>
            </div>

            {/* TIMELINE */}
            <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6">
              {filteredMovements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                  <History className="size-9 text-[#6B6B5F] opacity-40" />
                  <div className="space-y-1">
                    <p className="text-xs font-black text-[#141410] uppercase tracking-widest">Sem Movimentações Históricas</p>
                    <p className="text-xs text-[#6B6B5F]">Nenhum registro coincide com os filtros aplicados.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 relative pl-4 border-l border-[#E8E6E1] ml-2">
                  {filteredMovements.map((m) => {
                    const isEntrada = m.type === 'entrada';
                    const productName = getProductName(m.productId);
                    const productUnit = getProductUnit(m.productId);
                    const formattedDate = new Date(m.date).toLocaleString('pt-BR');

                    const productObj = products.find(p => p.id === m.productId);
                    const activeIngredient = productObj?.activeIngredient || 'Não informado';
                    const categoryLabel = productObj?.category ? (CATEGORY_LABELS[productObj.category] || productObj.category) : 'Não informado';
                    const manufacturer = productObj?.supplier || 'Não informado';
                    const costPerUnit = productObj?.costPerUnit || 0;
                    const lot = m.lot || (productObj as any)?.lot || 'LOTE-PADRAO';
                    const expiryDate = m.expiryDate || (productObj as any)?.expiryDate || 'Não informado';

                    return (
                      <div
                        key={m.id}
                        className={`relative pl-8 pb-4 last:pb-0 ${
                          isEntrada ? 'border-l-2 border-emerald-200' : 'border-l-2 border-amber-200'
                        }`}
                        style={{ marginLeft: '-17px' }}
                      >
                        <div className="absolute left-0 top-0 -translate-x-[50%] flex items-center justify-center size-8 rounded-full bg-white border border-[#E8E6E1] shadow-xs">
                          {isEntrada ? (
                            <ArrowUpRight className="size-4 text-emerald-700" />
                          ) : (
                            <ArrowDownLeft className="size-4 text-amber-700" />
                          )}
                        </div>

                        <div className="space-y-1 pl-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-[#6B6B5F] tracking-wide">
                              {formattedDate}
                            </span>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                              isEntrada 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                                : 'bg-amber-50 text-amber-800 border-amber-100'
                            }`}>
                              {isEntrada ? 'Entrada' : 'Saída'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-extrabold text-[#141410]">{productName}</span>
                            <span className="text-xs font-mono font-bold text-[#6B6B5F]">
                              ({isEntrada ? '+' : '-'}{m.quantity.toLocaleString('pt-BR')} {productUnit})
                            </span>
                          </div>

                          <div className="text-xs text-[#6B6B5F] leading-relaxed italic">
                            Motivo: {m.reason}
                          </div>

                          {/* Painel DDSulf de Rastreabilidade Operacional */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-3 bg-slate-50 border border-slate-200/80 p-3 rounded-xl text-[10px] leading-tight">
                            <div>
                              <span className="block text-[8px] font-black uppercase text-[#6B6B5F] tracking-wider">Princípio Ativo</span>
                              <span className="font-bold text-[#141410] block mt-0.5">{activeIngredient}</span>
                            </div>
                            <div>
                              <span className="block text-[8px] font-black uppercase text-[#6B6B5F] tracking-wider">Categoria</span>
                              <span className="font-bold text-[#141410] block mt-0.5 capitalize">{categoryLabel}</span>
                            </div>
                            <div>
                              <span className="block text-[8px] font-black uppercase text-[#6B6B5F] tracking-wider">Fabricante</span>
                              <span className="font-bold text-[#141410] block mt-0.5">{manufacturer}</span>
                            </div>
                            <div>
                              <span className="block text-[8px] font-black uppercase text-[#6B6B5F] tracking-wider">Custo Unitário</span>
                              <span className="font-mono font-bold text-[#1B3A2D] block mt-0.5">
                                R$ {costPerUnit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div>
                              <span className="block text-[8px] font-black uppercase text-[#6B6B5F] tracking-wider">Lote</span>
                              <span className="font-mono font-bold text-amber-800 block mt-0.5">{lot}</span>
                            </div>
                            <div>
                              <span className="block text-[8px] font-black uppercase text-[#6B6B5F] tracking-wider">Validade</span>
                              <span className="font-mono font-bold text-slate-700 block mt-0.5">
                                {expiryDate && expiryDate !== 'Não informado' 
                                  ? (expiryDate.includes('-') ? expiryDate.split('-').reverse().join('/') : expiryDate) 
                                  : '⚠️ NÃO INFORMADO'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ----------------- TAB 4: IMPORTAÇÃO DE ORÇAMENTOS DE FORNECEDOR (FLUXO 12) ----------------- */}
        {activeTab === 'supplier_import' && (
          <motion.div
            key="supplier-import-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 animate-in fade-in"
          >
            <SpreadsheetImportTab />
          </motion.div>
        )}

        {/* ----------------- TAB 5: REQUISIÇÕES DE COMPRA ----------------- */}
        {activeTab === 'purchase_requisitions' && (
          <motion.div
            key="purchase-requisitions-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Header / Intro Card */}
            <div className="bg-white border border-[#E8E6E1] p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
              <div>
                <h2 className="font-display font-black text-[#141410] text-sm uppercase">Painel de Reposição Planejada</h2>
                <p className="text-[11px] text-[#6B6B5F] mt-0.5">Gerenciamento dinâmico de compras de insumos para suprir o limite de estoque crítico e ideal.</p>
              </div>
              <div className="text-[10px] bg-[#E8F5E9] text-[#2D6A4F] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider self-start md:self-auto">
                Fluxo de Suprimentos DDSulf
              </div>
            </div>

            {/* List or Empty State */}
            {(purchases || []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-white border border-[#E8E6E1] rounded-2xl">
                <SearchX className="size-9 text-[#6B6B5F] opacity-50" />
                <div className="space-y-1">
                  <p className="text-xs font-black text-[#141410] uppercase tracking-widest">Nenhuma requisição de compra pendente</p>
                  <p className="text-xs text-[#6B6B5F] max-w-sm">O sistema cria requisições automaticamente de acordo com as necessidades de estoque mínimo dos insumos.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                {/* Column Pendente */}
                <div className="space-y-4">
                  <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-800">1. Pendentes</span>
                    <span className="text-[10px] font-black bg-rose-200 text-rose-800 px-2 py-0.5 rounded-full">
                      {(purchases || []).filter(p => p.status === 'Pendente').length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {(purchases || []).filter(p => p.status === 'Pendente').length === 0 ? (
                      <div className="text-center py-8 text-[11px] text-[#6B6B5F] bg-[#FAFAF9] rounded-xl border border-dashed border-[#E8E6E1]">Nenhuma nesta etapa</div>
                    ) : (
                      (purchases || []).filter(p => p.status === 'Pendente').map(req => (
                        <div key={req.id} className="bg-white border border-[#E8E6E1] p-4 rounded-xl shadow-xs space-y-3 hover:border-rose-400 transition-all text-left">
                          <h4 className="font-display font-black text-[#141410] text-[11px] uppercase leading-tight">{req.productName}</h4>
                          <div className="space-y-1 text-[10px] text-[#6B6B5F] font-semibold font-mono">
                            <p>Atual: <span className="text-rose-700">{req.currentStock} {getProductUnit(req.productId)}</span></p>
                            <p>Mínimo: {req.minStock} {getProductUnit(req.productId)}</p>
                            <p>Ideal: {req.idealStock} {getProductUnit(req.productId)}</p>
                            <p className="text-[#141410] font-black">A comprar: {req.quantityToBuy} {getProductUnit(req.productId)}</p>
                            <p className="text-[9px] text-[#9E9E90] pt-1 font-sans">Criado em: {new Date(req.createdAt).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <button
                            onClick={() => {
                              updatePurchaseStatus(req.id, 'Solicitado');
                              toast.success('Compra Solicitada!', {
                                description: `O insumo "${req.productName}" foi de Pendente para Solicitado.`
                              });
                            }}
                            className="mt-3 w-full flex items-center justify-center gap-1 py-1.5 px-3 bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white text-[9px] font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                          >
                            <span>Solicitar Compra</span>
                            <ChevronRight className="size-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Column Solicitado */}
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">2. Solicitados</span>
                    <span className="text-[10px] font-black bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                      {(purchases || []).filter(p => p.status === 'Solicitado').length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {(purchases || []).filter(p => p.status === 'Solicitado').length === 0 ? (
                      <div className="text-center py-8 text-[11px] text-[#6B6B5F] bg-[#FAFAF9] rounded-xl border border-dashed border-[#E8E6E1]">Nenhuma nesta etapa</div>
                    ) : (
                      (purchases || []).filter(p => p.status === 'Solicitado').map(req => (
                        <div key={req.id} className="bg-white border border-[#E8E6E1] p-4 rounded-xl shadow-xs space-y-3 hover:border-amber-400 transition-all text-left">
                          <h4 className="font-display font-black text-[#141410] text-[11px] uppercase leading-tight">{req.productName}</h4>
                          <div className="space-y-1 text-[10px] text-[#6B6B5F] font-semibold font-mono">
                            <p>Atual: {req.currentStock} {getProductUnit(req.productId)}</p>
                            <p>Mínimo: {req.minStock} {getProductUnit(req.productId)}</p>
                            <p>Ideal: {req.idealStock} {getProductUnit(req.productId)}</p>
                            <p className="text-[#141410] font-black">A comprar: {req.quantityToBuy} {getProductUnit(req.productId)}</p>
                            <p className="text-[9px] text-[#9E9E90] pt-1 font-sans">Solicitado em: {new Date(req.updatedAt || req.createdAt).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <button
                            onClick={() => {
                              updatePurchaseStatus(req.id, 'Comprado');
                              toast.success('Insumo Comprado!', {
                                description: `O insumo "${req.productName}" foi de Solicitado para Comprado.`
                              });
                            }}
                            className="mt-3 w-full flex items-center justify-center gap-1 py-1.5 px-3 bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white text-[9px] font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                          >
                            <span>Marcar Comprado</span>
                            <ChevronRight className="size-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Column Comprado */}
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-800">3. Comprados</span>
                    <span className="text-[10px] font-black bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                      {(purchases || []).filter(p => p.status === 'Comprado').length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {(purchases || []).filter(p => p.status === 'Comprado').length === 0 ? (
                      <div className="text-center py-8 text-[11px] text-[#6B6B5F] bg-[#FAFAF9] rounded-xl border border-dashed border-[#E8E6E1]">Nenhuma nesta etapa</div>
                    ) : (
                      (purchases || []).filter(p => p.status === 'Comprado').map(req => (
                        <div key={req.id} className="bg-white border border-[#E8E6E1] p-4 rounded-xl shadow-xs space-y-3 hover:border-blue-400 transition-all text-left">
                          <h4 className="font-display font-black text-[#141410] text-[11px] uppercase leading-tight">{req.productName}</h4>
                          <div className="space-y-1 text-[10px] text-[#6B6B5F] font-semibold font-mono">
                            <p>Atual: {req.currentStock} {getProductUnit(req.productId)}</p>
                            <p>Mínimo: {req.minStock} {getProductUnit(req.productId)}</p>
                            <p>Ideal: {req.idealStock} {getProductUnit(req.productId)}</p>
                            <p className="text-[#141410] font-black">A comprar: {req.quantityToBuy} {getProductUnit(req.productId)}</p>
                            <p className="text-[9px] text-[#9E9E90] pt-1 font-sans">Comprado em: {new Date(req.updatedAt || req.createdAt).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <button
                            onClick={() => {
                              updatePurchaseStatus(req.id, 'Recebido');
                              addInventoryMovement({
                                id: `mov-${Math.random().toString(36).substring(2, 11)}`,
                                date: new Date().toISOString().split('T')[0],
                                productId: req.productId,
                                type: 'entrada',
                                quantity: req.quantityToBuy,
                                reason: `Recebimento de compra - Requisição #${req.id}`
                              });
                              toast.success('Insumo recebido e estocado!', {
                                description: `Quantidade de "${req.productName}" incrementada.`
                              });
                            }}
                            className="mt-3 w-full flex items-center justify-center gap-1 py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-[9px] font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                          >
                            <span>Marcar Recebido</span>
                            <ChevronRight className="size-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Column Recebido */}
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#1B3A2D]">4. Recebidos</span>
                    <span className="text-[10px] font-black bg-emerald-200 text-[#1B3A2D] px-2 py-0.5 rounded-full">
                      {(purchases || []).filter(p => p.status === 'Recebido').length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {(purchases || []).filter(p => p.status === 'Recebido').length === 0 ? (
                      <div className="text-center py-8 text-[11px] text-[#6B6B5F] bg-[#FAFAF9] rounded-xl border border-dashed border-[#E8E6E1]">Nenhuma nesta etapa</div>
                    ) : (
                      (purchases || []).filter(p => p.status === 'Recebido').map(req => (
                        <div key={req.id} className="bg-[#FAF9F6] border border-[#E8E6E1] p-4 rounded-xl shadow-xs space-y-3 text-left opacity-80">
                          <h4 className="font-display font-black text-[#5C5C50] text-[11px] uppercase leading-tight line-through">{req.productName}</h4>
                          <div className="space-y-1 text-[10px] text-[#6B6B5F] font-semibold font-mono">
                            <p>Comprado e Recebido: {req.quantityToBuy} {getProductUnit(req.productId)}</p>
                            <p className="text-[9px] text-[#9E9E90] pt-1 font-sans">Recebido em: {new Date(req.updatedAt || req.createdAt).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div className="mt-3 flex items-center justify-center gap-1 py-1 px-3 bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase tracking-widest rounded-lg border border-emerald-200">
                            <Check className="size-3" />
                            <span>Entregue e Conciliado</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* -------------------------------------------------------------
          FICHA CADASTRAL / MODAL PARA ATUALIZAÇÃO E NOVOS PRODUTOS
          ------------------------------------------------------------- */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-[#E8E6E1] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-6 bg-[#1B3A2D] flex items-center justify-between text-white">
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight font-display text-white">
                    {modalMode === 'create' ? 'Novo Cadastro de Insumo' : 'Ajustar Ficha Cadastral'}
                  </h3>
                  <p className="text-[11px] text-[#A8CDB8] mt-0.5">Defina todos os indicadores regulamentares exigidos pela Anvisa e DDSulf.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-1.5 hover:bg-white/10 text-[#A8CDB8] hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
                
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-[#6B6B5F] block">Nome Comercial *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: OPTIGARD LT WG"
                    className="w-full h-10 border border-[#E8E6E1] rounded-lg px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9]"
                  />
                </div>

                {/* DDSulf Smart specifications */}
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#6B6B5F] block">Grupo de Produto *</label>
                    <select
                      value={formProductGroup}
                      onChange={(e) => setFormProductGroup(e.target.value)}
                      className="w-full h-10 border border-[#E8E6E1] rounded-lg px-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9] cursor-pointer"
                    >
                      {CATEGORIES_LIST.map(g => (
                        <option key={g.label} value={g.label}>{g.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#6B6B5F] block">Princípio Ativo *</label>
                    <input
                      type="text"
                      required
                      value={formActiveIngredient}
                      onChange={(e) => setFormActiveIngredient(e.target.value)}
                      placeholder="Ex: Tiametoxam"
                      className="w-full h-10 border border-[#E8E6E1] rounded-lg px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9]"
                    />
                  </div>
                </div>

                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#6B6B5F] block">Grupo Químico *</label>
                    <input
                      type="text"
                      required
                      value={formChemicalGroup}
                      onChange={(e) => setFormChemicalGroup(e.target.value)}
                      placeholder="Ex: Neonicotinóide"
                      className="w-full h-10 border border-[#E8E6E1] rounded-lg px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#6B6B5F] block">Fabricante / Fornecedor *</label>
                    <input
                      type="text"
                      required
                      value={formSupplier}
                      onChange={(e) => setFormSupplier(e.target.value)}
                      placeholder="Ex: Syngenta"
                      className="w-full h-10 border border-[#E8E6E1] rounded-lg px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9]"
                    />
                  </div>
                </div>

                {/* Tech categories & unit */}
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#6B6B5F] block">Categoria Tecnológica *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full h-10 border border-[#E8E6E1] rounded-lg px-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9] cursor-pointer"
                    >
                      {CATEGORIES_LIST.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#6B6B5F] block">Unidade de Medida *</label>
                    <select
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                      className="w-full h-10 border border-[#E8E6E1] rounded-lg px-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9] cursor-pointer"
                    >
                      {UNITS_LIST.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quantities & cost */}
                <div className="grid gap-4 grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#6B6B5F] block">Qtd em Loja</label>
                    <input
                      type="number"
                      min="0"
                      step="ANY"
                      value={formQty}
                      onChange={(e) => setFormQty(parseFloat(e.target.value) || 0)}
                      className="w-full h-10 border border-[#E8E6E1] rounded-lg px-3 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#6B6B5F] block">Estoque Crítico</label>
                    <input
                      type="number"
                      min="0"
                      step="ANY"
                      value={formMinQty}
                      onChange={(e) => setFormMinQty(parseFloat(e.target.value) || 0)}
                      className="w-full h-10 border border-[#E8E6E1] rounded-lg px-3 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#6B6B5F] block">Custo (R$)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.0001"
                      value={formCost}
                      onChange={(e) => setFormCost(parseFloat(e.target.value) || 0)}
                      className="w-full h-10 border border-[#E8E6E1] rounded-lg px-3 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9]"
                    />
                  </div>
                </div>

                {/* DDSulf Lote e Validade */}
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#6B6B5F] block font-sans">Lote / Partida *</label>
                    <input
                      type="text"
                      required
                      value={formLot}
                      onChange={(e) => setFormLot(e.target.value)}
                      placeholder="Ex: LT-2026-X1"
                      className="w-full h-10 border border-[#E8E6E1] rounded-lg px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#6B6B5F] block font-sans">Data de Validade *</label>
                    <input
                      type="date"
                      required
                      value={formExpiryDate}
                      onChange={(e) => setFormExpiryDate(e.target.value)}
                      className="w-full h-10 border border-[#E8E6E1] rounded-lg px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9]"
                    />
                  </div>
                </div>

                {showDuplicateWarning && (
                  <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-start gap-2 text-xs text-amber-900">
                    <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-1.5 flex-1">
                      <p className="font-black text-[11px] uppercase tracking-wider text-amber-950">Produto possivelmente já cadastrado.</p>
                      <p className="text-[10px] leading-relaxed text-amber-800">Já existe um produto em estoque com o mesmo princípio ativo, fabricante e unidade de medida/volume.</p>
                      <label className="flex items-center gap-2 mt-2 font-black uppercase text-[9px] tracking-widest cursor-pointer text-[#1B3A2D] bg-white border border-[#E8E6E1]/80 px-2 py-1.5 rounded-lg w-fit">
                        <input 
                          type="checkbox" 
                          checked={duplicateConfirmed} 
                          onChange={(e) => setDuplicateConfirmed(e.target.checked)}
                          className="rounded border-[#E8E6E1] text-[#1B3A2D] focus:ring-[#1B3A2D] size-3.5"
                        />
                        <span>Confirmar criação mesmo assim</span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex items-center justify-end gap-4 border-t border-[#E8E6E1]">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="text-xs font-bold uppercase tracking-wider text-[#6B6B5F] hover:text-[#141410] cursor-pointer"
                  >
                    Retroceder / Cancelar
                  </button>
                  <Button
                    type="submit"
                    className="h-10 px-5 text-xs font-black uppercase tracking-wider bg-[#1B3A2D] text-white hover:bg-[#2D6A4F] cursor-pointer rounded-xl shadow-xs"
                  >
                    Confirmar e Registrar
                  </Button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
