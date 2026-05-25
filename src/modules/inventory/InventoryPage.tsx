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
  Settings2
} from 'lucide-react';
import { useSystemStore } from '@/store';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';

// Constant labels and classes mapping
const CATEGORY_LABELS: Record<string, string> = {
  inseticida: 'Inseticida',
  raticida: 'Raticida',
  fungicida: 'Fungicida',
  epi: 'EPI',
  outros: 'Outros'
};

const CATEGORIES_LIST = [
  { value: 'inseticida', label: 'Inseticida' },
  { value: 'raticida', label: 'Raticida' },
  { value: 'fungicida', label: 'Fungicida' },
  { value: 'epi', label: 'EPI' },
  { value: 'outros', label: 'Outros' }
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
}

export function InventoryPage() {
  const { 
    inventory, 
    addInventoryProduct, 
    updateInventoryProduct, 
    removeInventoryProduct, 
    addInventoryMovement 
  } = useSystemStore();

  const products = inventory?.products || [];
  const movements = inventory?.movements || [];

  const [activeTab, setActiveTab] = useState<'current_stock' | 'upload_entry' | 'movements_log'>('current_stock');
  const tabs = [
    { id: 'current_stock', label: 'Estoque Atual' },
    { id: 'upload_entry', label: 'Entrada por Upload' },
    { id: 'movements_log', label: 'Movimentações' }
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

  // Drag n Drop File Selection States (Tab 2)
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadParsedItems, setUploadParsedItems] = useState<UploadParsedItem[]>([]);
  const [sheetPreviewRaw, setSheetPreviewRaw] = useState<string[][]>([]);
  const [rawTextPreview, setRawTextPreview] = useState('');
  const [fileTypeDetected, setFileTypeDetected] = useState<'sheet' | 'xml' | 'pdf' | null>(null);

  // Filters for Movements Log (Tab 3)
  const [movementTypeFilter, setMovementTypeFilter] = useState<'all' | 'entrada' | 'saida'>('all');
  const [movementProductFilter, setMovementProductFilter] = useState<string>('all');
  const [movementPeriodFilter, setMovementPeriodFilter] = useState<'all' | '7d' | '30d' | '90d'>('all');

  // -------------------------------------------------------------
  // CRITICAL STATUS ALERTS LOGIC
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
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('O nome do produto é obrigatório.');
      return;
    }

    if (modalMode === 'create') {
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
        lastUpdated: new Date().toISOString()
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
          reason: `Estoque Inicial - Produto cadastrado manualmente`
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
          supplier: formSupplier.trim() || 'Fornecedor Direto'
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
            reason: `Ajuste manual de estoque via ficha cadastral`
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
  // TAB 2: UPLOAD & AUTOMATIC OCR/SCANNING IN THE BROWSER
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

            // Search headers index
            for (let i = 0; i < Math.min(rawRows.length, 5); i++) {
              const row = rawRows[i];
              if (!Array.isArray(row)) continue;
              
              const findCol = (regex: RegExp) => row.findIndex(c => regex.test(String(c).toLowerCase()));
              
              const nIdx = findCol(/produto|item|descri/i);
              const qIdx = findCol(/qtd|quant|qtde/i);
              const cIdx = findCol(/valor|pre[cç]o|custo|unit/i);
              const uIdx = findCol(/unid|embalagem/i);

              if (nIdx > -1 || qIdx > -1) {
                headerRowIndex = i;
                nameColIdx = nIdx;
                qtyColIdx = qIdx;
                costColIdx = cIdx;
                unitColIdx = uIdx;
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
                if (UNITS_LIST.includes(innerUnit)) pUnit = innerUnit;
              }

              // Guard check naming
              if (pName && pName !== 'undefined' && isNaN(Number(pName)) && pQty > 0) {
                // Determine tentative categories
                let categorySuggested = 'outros';
                const lowerName = pName.toLowerCase();
                if (lowerName.includes('inseticida') || lowerName.includes('fendona') || lowerName.includes('k-othrine') || lowerName.includes('termidor')) {
                  categorySuggested = 'inseticida';
                } else if (lowerName.includes('raticida') || lowerName.includes('rodilon') || lowerName.includes('bloco') || lowerName.includes('iscas')) {
                  categorySuggested = 'raticida';
                } else if (lowerName.includes('fungicida')) {
                  categorySuggested = 'fungicida';
                } else if (lowerName.includes('epi') || lowerName.includes('luva') || lowerName.includes('mascara') || lowerName.includes('oculos') || lowerName.includes('óculos')) {
                  categorySuggested = 'epi';
                }

                itemsParsed.push({
                  id: `upload-${i}-${Math.random().toString(36).substring(2, 5)}`,
                  name: pName,
                  quantity: pQty,
                  unit: pUnit,
                  costPerUnit: pCost || 0.10,
                  category: categorySuggested,
                  supplier: 'Planilha Importada',
                  confirmed: true
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
                description: 'Não conseguimos identificar produtos na estrutura lines. Use o editor manual abaixo.'
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
          setRawTextPreview(content.slice(0, 1500) + '\n\n... (conteúdo truncado para visualização)...');

          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(content, 'text/xml');
          
          // NFe standard tags info
          const prodElements = xmlDoc.getElementsByTagName('prod');
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
                // Determine tentative categories
                let categorySuggested = 'outros';
                const lowerName = pName.toLowerCase();
                if (lowerName.includes('inseticida') || lowerName.includes('fendona') || lowerName.includes('k-othrine') || lowerName.includes('termidor')) {
                  categorySuggested = 'inseticida';
                } else if (lowerName.includes('raticida') || lowerName.includes('rodilon') || lowerName.includes('bloco') || lowerName.includes('iscas')) {
                  categorySuggested = 'raticida';
                } else if (lowerName.includes('fungicida')) {
                  categorySuggested = 'fungicida';
                } else if (lowerName.includes('epi') || lowerName.includes('luva') || lowerName.includes('mascara')) {
                  categorySuggested = 'epi';
                }

                itemsParsed.push({
                  id: `xml-${i}-${Math.random().toString(36).substring(2, 5)}`,
                  name: pName,
                  quantity: pQty,
                  unit: pUnit,
                  costPerUnit: pCost,
                  category: categorySuggested,
                  supplier: 'Nota Fiscal Eletrônica (NFe)',
                  confirmed: true
                });
              }
            }
          }

          if (itemsParsed.length > 0) {
            setUploadParsedItems(itemsParsed);
            toast.success(`XML da Nota Fiscal Importada!`, {
              description: `Parseamos tags de comercialização (<det>/<prod>). Identificados ${itemsParsed.length} itens.`
            });
          } else {
            // Regex fallback if DOMParser has namespaces issues
            const xProdMatches = content.match(/<xProd>(.*?)<\/xProd>/g) || [];
            const qComMatches = content.match(/<qCom>(.*?)<\/qCom>/g) || [];
            const vUnComMatches = content.match(/<vUnCom>(.*?)<\/vUnCom>/g) || [];
            const uComMatches = content.match(/<uCom>(.*?)<\/uCom>/g) || [];

            const fallbackItems: UploadParsedItem[] = [];
            for (let i = 0; i < xProdMatches.length; i++) {
              const nameClean = xProdMatches[i].replace(/<\/?xProd>/g, '');
              const qtyClean = parseFloat(qComMatches[i]?.replace(/<\/?qCom>/g, '') || '0');
              const costClean = parseFloat(vUnComMatches[i]?.replace(/<\/?vUnCom>/g, '') || '0');
              let unitClean = uComMatches[i]?.replace(/<\/?uCom>/g, '').toLowerCase() || 'unidade';
              
              if (!UNITS_LIST.includes(unitClean)) unitClean = 'unidade';

              if (nameClean && qtyClean > 0) {
                fallbackItems.push({
                  id: `xml-regex-${i}`,
                  name: nameClean,
                  quantity: qtyClean,
                  unit: unitClean,
                  costPerUnit: costClean,
                  category: 'outros',
                  supplier: 'Nota Fiscal XML (Regex)',
                  confirmed: true
                });
              }
            }

            if (fallbackItems.length > 0) {
              setUploadParsedItems(fallbackItems);
              toast.success(`Nota Fiscal decodificada (Regex Fallback)!`, {
                description: `Extraímos ${fallbackItems.length} itens do descritivo da NFe.`
              });
            } else {
              toast.warning('Processado sem novos dados.', {
                description: 'Verifique se o XML pertence ao layout padrão nacional de NF-e.'
              });
            }
          }
        } catch (err) {
          console.error(err);
          toast.error('Erro de decodificação no XML da Nota Fiscal.');
        }
      };
      reader.readAsText(file);
    }

    // 3. PDF Files (Manual Form Fallback with ASCII parser)
    else if (lowercaseName.endsWith('.pdf')) {
      setFileTypeDetected('pdf');
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const rawBuffer = e.target?.result as ArrayBuffer;
          const byteView = new Uint8Array(rawBuffer);
          
          // Get basic ascii strings (PDF contains uncompressed stream text sometimes)
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
            if (count > 50000) break; // limit
          }

          // Clean up garbage spaces
          const cleanedText = asciiStr
            .replace(/\s+/g, ' ')
            .replace(/[^\w\s.,;:()\-/@%]/g, '')
            .slice(0, 1500);

          setRawTextPreview(
            `[LEITURA BRUTA DO PDF DE ENTRADA]\n` +
            `=================================\n` +
            cleanedText + '\n\n...[Fim da Extração Ascii]'
          );

          toast.success('Dicionário de Caracteres do PDF Carregado!', {
            description: 'Extraímos fragmentos textuais. Confirme as informações e insira na tabela editável.'
          });

          // Prefill flat template form so they can manipulate
          setUploadParsedItems([
            {
              id: 'pdf-prefilled-1',
              name: 'Insumo Identificado no PDF',
              quantity: 10,
              unit: 'unidade',
              costPerUnit: 12.50,
              category: 'outros',
              supplier: 'Ordem de Compra PDF',
              confirmed: true
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

  const handleUpdateParsedItem = (id: string, updates: Partial<UploadParsedItem>) => {
    setUploadParsedItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    }));
  };

  const handleAddManualRow = () => {
    const newIdx = uploadParsedItems.length + 1;
    setUploadParsedItems(prev => [
      ...prev,
      {
        id: `manual-entry-row-${newIdx}-${Math.random().toString(36).substring(2, 5)}`,
        name: 'Novo Item Comercial',
        quantity: 1,
        unit: 'unidade',
        costPerUnit: 1.00,
        category: 'outros',
        supplier: 'Entrada Manual',
        confirmed: true
      }
    ]);
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
      // Find similar name item
      const similar = products.find(p => 
        p.name.toLowerCase().trim() === item.name.toLowerCase().trim() ||
        p.name.toLowerCase().trim().includes(item.name.toLowerCase().trim()) ||
        item.name.toLowerCase().trim().includes(p.name.toLowerCase().trim())
      );

      let targetProductId = '';

      if (similar) {
        targetProductId = similar.id;
        updateInventoryProduct(similar.id, {
          quantity: similar.quantity + item.quantity,
          costPerUnit: item.costPerUnit > 0 ? item.costPerUnit : similar.costPerUnit,
          lastUpdated: new Date().toISOString()
        });
        summedCount++;
      } else {
        const newId = `prod-${Math.random().toString(36).substring(2, 11)}`;
        targetProductId = newId;
        addInventoryProduct({
          id: newId,
          name: item.name.trim(),
          category: item.category,
          unit: item.unit,
          quantity: item.quantity,
          minQuantity: Math.ceil(item.quantity * 0.2), // Default 20%
          costPerUnit: item.costPerUnit,
          supplier: item.supplier || 'Importado / Manual',
          lastUpdated: new Date().toISOString()
        });
        addedCount++;
      }

      // Record corresponding entry movement
      addInventoryMovement({
        id: `mov-${Math.random().toString(36).substring(2, 11)}`,
        date: new Date().toISOString(),
        productId: targetProductId,
        type: 'entrada',
        quantity: item.quantity,
        reason: `Entrada autorizada via upload de arquivo - (${uploadedFileName || 'Ordens de Compra'})`
      });
    });

    toast.success('Entrada concluída sucesso!', {
      description: `Mapeamos: ${addedCount} novos insumos, ${summedCount} frotas incrementadas com sucesso.`
    });

    setUploadParsedItems([]);
    setUploadedFileName('');
    setActiveTab('current_stock');
  };

  // -------------------------------------------------------------
  // TAB 3: FILTERS & LOG PROCESSORS
  // -------------------------------------------------------------
  const filteredMovements = movements.filter(m => {
    // 1. Filter by type
    if (movementTypeFilter !== 'all' && m.type !== movementTypeFilter) return false;
    
    // 2. Filter by Product
    if (movementProductFilter !== 'all' && m.productId !== movementProductFilter) return false;

    // 3. Filter by period
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

  // Stock list displayed
  const displayedProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(stockSearch.toLowerCase()) || 
      (p.supplier && p.supplier.toLowerCase().includes(stockSearch.toLowerCase()));
    const matchCategory = stockCategoryFilter === 'all' || p.category === stockCategoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
      
      {/* HEADER */}
      <header className="mb-8 flex items-start justify-between">
        <div>
          <span className="kpi-label text-[#2D6A4F] text-xs font-bold uppercase tracking-wider font-sans">Gestão de Estoque</span>
          <h1 className="font-display text-3xl font-semibold text-[#141410] mt-1">Insumos & Produtos</h1>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1B3A2D] text-white 
                             text-sm font-semibold rounded-xl hover:bg-[#2D6A4F] transition-colors cursor-pointer"
        >
          <Plus className="size-4" /> Novo Produto
        </button>
      </header>

      {/* BANNER DE PRODUTOS CRÍTICOS */}
      {criticalProducts.length > 0 && (
        <div className="bg-[#FFF3CD] border border-[#D4A017]/40 rounded-xl p-4 mb-6 text-sm text-[#92600A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>
              {criticalProducts.length} {criticalProducts.length === 1 ? 'produto precisa' : 'produtos precisam'} de reposição urgente: {criticalProducts.map(p => p.name).join(', ')}
            </span>
          </div>
          <button
            onClick={() => {
              setUploadedFileName('');
              setUploadParsedItems([]);
              setActiveTab('upload_entry');
            }}
            className="text-xs font-bold underline hover:text-[#1B3A2D] cursor-pointer text-left sm:text-right shrink-0"
          >
            Dar Entrada de Insumos
          </button>
        </div>
      )}

      {/* ABAS (Pills Escuros) */}
      <div className="flex gap-2 mb-8 p-1 bg-[#F0EDE8] rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            id={`tab-btn-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === tab.id ? 'bg-[#1B3A2D] text-white shadow-sm' : 'text-[#6B6B5F] hover:text-[#141410]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB SWITCH CONTENTS */}
      <AnimatePresence mode="wait">

        {/* ----------------- ABA 1: ESTOQUE ATUAL ----------------- */}
        {activeTab === 'current_stock' && (
          <motion.div
            key="current-stock-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Quick Overview KPI grid */}
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="p-6 bg-white border border-[#E8E6E1] rounded-2xl space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F]">Total de Categorias</p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-display font-semibold text-[#141410]">{Object.keys(CATEGORY_LABELS).length}</span>
                  <span className="text-xs text-[#6B6B5F]">Ativas na DDSulf</span>
                </div>
              </div>

              <div className="p-6 bg-white border border-[#E8E6E1] rounded-2xl space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F]">Itens Cadastrados</p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-display font-semibold text-[#141410]">{products.length}</span>
                  <span className="text-xs text-[#6B6B5F]">Lançados no sistema</span>
                </div>
              </div>

              <div className="p-6 bg-[#FFF3CD]/50 border border-[#D4A017]/30 text-[#92600A] rounded-2xl space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#92600A]">Insumos em Alerta</p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-display font-semibold text-[#92600A]">{products.filter(p => p.quantity <= p.minQuantity * 1.5).length}</span>
                  <span className="text-[10px] font-bold text-[#92600A] uppercase bg-[#FFF3CD] border border-[#D4A017]/20 px-2 py-0.5 rounded-md">Reabastecer</span>
                </div>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-[#E8E6E1] rounded-xl p-4">
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#6B6B5F]" />
                  <input
                    type="text"
                    value={stockSearch}
                    onChange={(e) => setStockSearch(e.target.value)}
                    placeholder="Filtrar por nome do insumo ou fornecedor..."
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#E8E6E1] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9]"
                  />
                </div>

                <select
                  value={stockCategoryFilter}
                  onChange={(e) => setStockCategoryFilter(e.target.value)}
                  className="h-11 px-4 border border-[#E8E6E1] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9] cursor-pointer text-[#141410]"
                >
                  <option value="all">Todas as Categorias</option>
                  {CATEGORIES_LIST.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* STOCK PRODUCTS GRID TABLE */}
            <div className="bg-white border border-[#E8E6E1] rounded-2xl overflow-hidden" id="card-stock-grid-table">
              {displayedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                  <SearchX className="size-9 text-[#6B6B5F] opacity-50" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#141410] uppercase tracking-widest">Nenhum Insumo Encontrado</p>
                    <p className="text-xs text-[#6B6B5F] max-w-sm">Tente reajustar os filtros ou adicione um novo produto usando o botão superior.</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F0EDE8]">
                      <tr className="border-b border-[#E8E6E1]">
                        <th className="py-4 px-6 text-[10px] font-bold text-[#6B6B5F] uppercase tracking-wider font-sans">Nome do Insumo</th>
                        <th className="py-4 px-4 text-[10px] font-bold text-[#6B6B5F] uppercase tracking-wider font-sans">Categoria</th>
                        <th className="py-4 px-4 text-right text-[10px] font-bold text-[#6B6B5F] uppercase tracking-wider font-sans">Quantidade</th>
                        <th className="py-4 px-4 text-right text-[10px] font-bold text-[#6B6B5F] uppercase tracking-wider font-sans">Estoque Mín</th>
                        <th className="py-4 px-4 text-right text-[10px] font-bold text-[#6B6B5F] uppercase tracking-wider font-sans">Custo / Un.</th>
                        <th className="py-4 px-4 text-[10px] font-bold text-[#6B6B5F] uppercase tracking-wider font-sans">Fornecedor</th>
                        <th className="py-4 px-4 text-center text-[10px] font-bold text-[#6B6B5F] uppercase tracking-wider font-sans">Status</th>
                        <th className="py-4 px-6 text-right text-[10px] font-bold text-[#6B6B5F] uppercase tracking-wider font-sans">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E6E1] text-xs">
                      {displayedProducts.map((p) => {
                        const status = getProductStatus(p.quantity, p.minQuantity);
                        const isInlineEditing = editingId === p.id;

                        // Map code to beautiful requested pills
                        let pillClasses = 'bg-[#D8EDE3] text-[#1B3A2D] border border-[#2D6A4F]/20';
                        if (status.code === 'critico') {
                          pillClasses = 'bg-[#FDDDD8] text-[#C1361A] border border-[#C1361A]/20';
                        } else if (status.code === 'baixo') {
                          pillClasses = 'bg-[#FFF3CD] text-[#92600A] border border-[#D4A017]/20';
                        }

                        return (
                          <tr key={p.id} className="hover:bg-[#FAFAF9] transition-colors font-medium text-[#141410] border-b border-[#E8E6E1]">
                            
                            {/* Nome com ícone */}
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#FAFAF9] rounded-xl border border-[#E8E6E1] text-[#6B6B5F]">
                                  <Package className="size-4" />
                                </div>
                                <div className="space-y-0.5">
                                  <span className="font-bold text-[#141410] block">{p.name}</span>
                                  <span className="text-[10px] font-mono text-[#6B6B5F] font-medium">ID: {p.id}</span>
                                </div>
                              </div>
                            </td>

                            {/* Categoria Badge */}
                            <td className="py-4 px-4 uppercase text-[10px]">
                              <span className="px-2 py-0.5 rounded-md font-mono border border-[#E8E6E1] bg-[#FAFAF9] text-[#6B6B5F] font-bold">
                                {CATEGORY_LABELS[p.category] || p.category}
                              </span>
                            </td>

                            {/* Qtd with large display typography */}
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
                                    className="p-1.5 bg-[#1B3A2D] text-white rounded-lg hover:bg-[#2D6A4F] transition-colors"
                                    title="Confirmar"
                                  >
                                    <Check className="size-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="p-1.5 bg-white border border-[#E8E6E1] text-[#6B6B5F] rounded-lg hover:bg-[#FAFAF9] transition-colors"
                                    title="Cancelar"
                                  >
                                    <X className="size-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="inline-flex items-baseline justify-end gap-1 cursor-pointer group" onClick={() => startInlineEdit(p)}>
                                  <span className="font-display text-[#141410] font-semibold text-lg">
                                    {p.quantity.toLocaleString('pt-BR')}
                                  </span>
                                  <span className="text-[#6B6B5F] text-xs ml-1">
                                    {p.unit}
                                  </span>
                                  <button className="p-1 text-[#6B6B5F] opacity-0 group-hover:opacity-100 hover:text-[#141410] transition-all rounded ml-1">
                                    <Edit2 className="size-3" />
                                  </button>
                                </div>
                              )}
                            </td>

                            {/* Estoque Mínimo */}
                            <td className="py-4 px-4 text-right font-mono text-[#6B6B5F] text-xs">
                              {p.minQuantity.toLocaleString('pt-BR')} {p.unit}
                            </td>

                            {/* Custo por Unidade */}
                            <td className="py-4 px-4 text-right font-mono text-[#141410]">
                              R$ {p.costPerUnit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                            </td>

                            {/* Fornecedor */}
                            <td className="py-4 px-4 text-[#6B6B5F] max-w-[140px] truncate">
                              {p.supplier || 'N/A'}
                            </td>

                            {/* Status Visual como pill colorida descrita nas diretrizes */}
                            <td className="py-4 px-4 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${pillClasses}`}>
                                {status.label}
                              </span>
                            </td>

                            {/* Ações (ícones apenas em cinza, hover colorido) */}
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openEditModal(p)}
                                  className="p-2 text-[#6B6B5F] hover:text-[#2D6A4F] hover:bg-[#D8EDE3] rounded-xl transition-all cursor-pointer"
                                  title="Editar Produto"
                                >
                                  <Edit2 className="size-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="p-2 text-[#6B6B5F] hover:text-[#C1361A] hover:bg-[#FDDDD8] rounded-xl transition-all cursor-pointer"
                                  title="Excluir Produto"
                                >
                                  <Trash2 className="size-4" />
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

        {/* ----------------- ABA 2: ENTRADA POR UPLOAD ----------------- */}
        {activeTab === 'upload_entry' && (
          <motion.div
            key="upload-entry-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="grid gap-8 lg:grid-cols-12 animate-in fade-in"
          >
            {/* Upload Area left column */}
            <div className="lg:col-span-12 xl:col-span-5 space-y-6">
              <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-[#141410] font-display">Scanner de Compras</h3>
                  <p className="text-xs text-[#6B6B5F] font-medium">Extraia e sincronize entradas de faturas de insumos químicos para controle unificado.</p>
                </div>

                {/* Cards de formato aceito como pills clicáveis */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-[#6B6B5F] tracking-wider font-sans block">Formatos Disponíveis</span>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      type="button"
                      onClick={() => document.getElementById('inventory-file-selector')?.click()}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#FAFAF9] border border-[#E8E6E1] hover:border-[#1B3A2D] hover:bg-[#1B3A2D]/5 rounded-xl text-xs font-medium text-[#6B6B5F] hover:text-[#1B3A2D] transition-all cursor-pointer"
                    >
                      <FileSpreadsheet className="size-3.5 text-[#2D6A4F]" />
                      <span>Planilha (.XLSX)</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => document.getElementById('inventory-file-selector')?.click()}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#FAFAF9] border border-[#E8E6E1] hover:border-[#1B3A2D] hover:bg-[#1B3A2D]/5 rounded-xl text-xs font-medium text-[#6B6B5F] hover:text-[#1B3A2D] transition-all cursor-pointer"
                    >
                      <FileUp className="size-3.5 text-[#D4A017]" />
                      <span>XML NF-e (.xml)</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => document.getElementById('inventory-file-selector')?.click()}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#FAFAF9] border border-[#E8E6E1] hover:border-[#1B3A2D] hover:bg-[#1B3A2D]/5 rounded-xl text-xs font-medium text-[#6B6B5F] hover:text-[#1B3A2D] transition-all cursor-pointer"
                    >
                      <FileSpreadsheet className="size-3.5 text-[#C1361A]" />
                      <span>Fatura CSV (.csv)</span>
                    </button>
                  </div>
                </div>

                {/* Dynamic drop zone */}
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
                  <div className="flex flex-col items-center gap-4 animate-fade-in">
                    <div className="p-3 bg-white rounded-xl border border-[#E8E6E1] text-[#1B3A2D] shadow-xs">
                      <FileUp className="size-7" />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#141410]">Arraste a Nota Fiscal ou tabela de compras</p>
                      <p className="text-[10px] text-[#6B6B5F] leading-normal">Lemos xml, notas brutas, planilhas organizadas ou ordens PDF.</p>
                    </div>

                    {uploadedFileName && (
                      <div className="inline-flex items-center gap-1.5 bg-[#D8EDE3] text-[#1B3A2D] border border-[#2D6A4F]/20 px-3 py-1 rounded-full text-[10px] font-bold">
                        <Check className="size-3 text-[#2D6A4F]" />
                        {uploadedFileName}
                      </div>
                    )}

                    <div>
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
                        className="h-9 font-bold text-[9px] uppercase tracking-wider text-[#1B3A2D] rounded-xl border-[#1B3A2D] hover:bg-[#1B3A2D]/10 shadow-xs cursor-pointer"
                      >
                        Localizar Arquivo
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Guided note mapping description */}
                <div className="p-4 bg-[#FAFAF9] border border-[#E8E6E1] rounded-xl space-y-1.5 text-xs text-[#6B6B5F]">
                  <span className="font-bold text-[#141410] uppercase block tracking-wider text-[10px]">Mapeamento Inteligente</span>
                  <p className="leading-relaxed text-[11px]">
                    Nossa ferramenta realiza o cruzamento sintático do catálogo de produtos comerciais e preenche a quantidade de entrada. Altere o mapeamento das colunas conforme sua conveniência.
                  </p>
                </div>
              </div>

              {/* Show original file debug snippet dynamically */}
              {(sheetPreviewRaw.length > 0 || rawTextPreview) && (
                <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Eye className="size-4 text-[#6B6B5F]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F]">Visualização de Registros Originais</span>
                  </div>

                  {/* Excel rows visual grid preview */}
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

                  {/* Text snippets for XML and PDF */}
                  {(fileTypeDetected === 'xml' || fileTypeDetected === 'pdf') && rawTextPreview && (
                    <pre className="p-3 bg-[#141410] text-[#FAFAF9] text-[9px] font-mono rounded-xl overflow-auto max-h-[160px] whitespace-pre-wrap leading-normal border border-[#E8E6E1]">
                      {rawTextPreview}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* Mapped results table right column */}
            <div className="lg:col-span-12 xl:col-span-7 space-y-6">
              <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6 space-y-6 flex flex-col min-h-[440px]">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E6E1] pb-4">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-semibold text-[#141410] font-display">Confirmar Parâmetros Mapeados</h3>
                    <p className="text-xs text-[#6B6B5F] font-medium">Configure e confirme os insumos encontrados antes de incorporar ao catálogo.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddManualRow}
                    className="h-9 px-3 rounded-lg border-dashed border-[#E8E6E1] text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] hover:text-[#141410]"
                  >
                    + Adicionar Linha Manual
                  </Button>
                </div>

                {/* Import confirm table */}
                <div className="flex-1 overflow-y-auto max-h-[420px] divide-y divide-[#E8E6E1] pr-1">
                  {uploadParsedItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                      <FileSpreadsheet className="size-10 text-[#6B6B5F] opacity-50" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-[#141410] uppercase tracking-widest">Nenhum Registro Prévio</p>
                        <p className="text-[10px] text-[#6B6B5F] max-w-xs">Carregue um arquivo à esquerda ou pressione "+ Adicionar Linha Manual" para digitar.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-1">
                      {uploadParsedItems.map((item) => (
                        <div 
                          key={item.id}
                          className={`flex flex-col sm:flex-row items-stretch justify-between p-4 rounded-xl border transition-all gap-4 ${
                            item.confirmed 
                              ? 'bg-[#FAFAF9] border-[#E8E6E1]' 
                              : 'bg-white border-dashed border-[#E8E6E1] opacity-40'
                          }`}
                        >
                          {/* Item parameters editable fields */}
                          <div className="grid gap-3 sm:grid-cols-12 flex-1">
                            {/* Checkbox selector */}
                            <div className="sm:col-span-1 flex items-center justify-center">
                              <input
                                type="checkbox"
                                checked={item.confirmed}
                                onChange={(e) => handleUpdateParsedItem(item.id, { confirmed: e.target.checked })}
                                className="size-4 rounded-md accent-[#1B3A2D] cursor-pointer"
                              />
                            </div>

                            {/* Name input */}
                            <div className="sm:col-span-5 space-y-1">
                              <label className="text-[9px] font-bold uppercase text-[#6B6B5F]">Nome do Insumo</label>
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleUpdateParsedItem(item.id, { name: e.target.value })}
                                className="w-full h-9 border border-[#E8E6E1] rounded-lg px-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-white"
                              />
                            </div>

                            {/* Qtd & Unit input */}
                            <div className="sm:col-span-3 grid grid-cols-2 gap-1.5">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-[#6B6B5F]">Qtd</label>
                                <input
                                  type="number"
                                  min="0.1"
                                  step="ANY"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateParsedItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                                  className="w-full h-9 border border-[#E8E6E1] rounded-lg px-1.5 text-center text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-white"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-[#6B6B5F]">Unidade</label>
                                <select
                                  value={item.unit}
                                  onChange={(e) => handleUpdateParsedItem(item.id, { unit: e.target.value })}
                                  className="w-full h-9 border border-[#E8E6E1] rounded-lg px-1 text-[10px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-white cursor-pointer"
                                >
                                  {UNITS_LIST.map(u => (
                                    <option key={u} value={u}>{u}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Cost per unit & Category */}
                            <div className="sm:col-span-3 grid grid-cols-2 gap-1.5">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-[#6B6B5F]">Custo (R$)</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.0001"
                                  value={item.costPerUnit}
                                  onChange={(e) => handleUpdateParsedItem(item.id, { costPerUnit: parseFloat(e.target.value) || 0 })}
                                  className="w-full h-9 border border-[#E8E6E1] rounded-lg px-1 text-center text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-white"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold uppercase text-[#6B6B5F]">Categoria</label>
                                <select
                                  value={item.category}
                                  onChange={(e) => handleUpdateParsedItem(item.id, { category: e.target.value })}
                                  className="w-full h-9 border border-[#E8E6E1] rounded-lg px-1 text-[10px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-white cursor-pointer"
                                >
                                  {CATEGORIES_LIST.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Action Trash row deletion */}
                          <div className="flex items-center justify-end border-t sm:border-t-0 border-[#E8E6E1] pt-2 sm:pt-0 shrink-0">
                            <button
                              onClick={() => setUploadParsedItems(prev => prev.filter(p => p.id !== item.id))}
                              className="p-2 text-[#6B6B5F] hover:text-[#C1361A] hover:bg-[#FDDDD8] rounded-lg transition-colors inline-block cursor-pointer"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Import Confirmation Footer */}
                {uploadParsedItems.length > 0 && (
                  <div className="border-t border-[#E8E6E1] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-[10px] font-bold text-[#6B6B5F]">
                      Entrada programada de <span className="text-[#141410] font-black underline">{uploadParsedItems.filter(p => p.confirmed).length} itens</span> selecionados.
                    </span>
                    <Button
                      type="button"
                      id="btn-confirm-mapped-entry"
                      onClick={handleConfirmImport}
                      className="w-full sm:w-auto h-11 bg-[#1B3A2D] text-white rounded-xl px-6 font-bold text-xs uppercase tracking-wider hover:bg-[#2D6A4F] shadow-sm cursor-pointer"
                    >
                      Confirmar Entrada de Produtos
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ----------------- ABA 3: MOVIMENTAÇÕES (TIMELINE VERTICAL) ----------------- */}
        {activeTab === 'movements_log' && (
          <motion.div
            key="movements-log-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Log Filters Bar */}
            <div className="bg-white border border-[#E8E6E1] rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4 w-full">
                {/* Type filters */}
                <div className="space-y-1 flex-1 min-w-[140px]">
                  <label className="text-[9px] font-bold uppercase text-[#6B6B5F] block pb-0.5">Tipo de Movimentação</label>
                  <select
                    value={movementTypeFilter}
                    onChange={(e) => setMovementTypeFilter(e.target.value as any)}
                    className="w-full h-10 border border-[#E8E6E1] rounded-lg px-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9]"
                  >
                    <option value="all">Todas as Altas/Baixas</option>
                    <option value="entrada">Entradas (Incrementos)</option>
                    <option value="saida">Saídas (Consumos/Ajustes)</option>
                  </select>
                </div>

                {/* Products lookup selection */}
                <div className="space-y-1 flex-1 min-w-[180px]">
                  <label className="text-[9px] font-bold uppercase text-[#6B6B5F] block pb-0.5">Filtrar por Produto</label>
                  <select
                    value={movementProductFilter}
                    onChange={(e) => setMovementProductFilter(e.target.value)}
                    className="w-full h-10 border border-[#E8E6E1] rounded-lg px-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9]"
                  >
                    <option value="all">Todos os Produtos</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Period selection */}
                <div className="space-y-1 flex-1 min-w-[130px]">
                  <label className="text-[9px] font-bold uppercase text-[#6B6B5F] block pb-0.5">Período Histórico</label>
                  <select
                    value={movementPeriodFilter}
                    onChange={(e) => setMovementPeriodFilter(e.target.value as any)}
                    className="w-full h-10 border border-[#E8E6E1] rounded-lg px-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9]"
                  >
                    <option value="all">Histórico Completo</option>
                    <option value="7d">Últimos 7 dias</option>
                    <option value="30d">Últimos 30 dias</option>
                    <option value="90d">Últimos 90 dias</option>
                  </select>
                </div>
              </div>
            </div>

            {/* TIMELINE VERTICAL DE MOVIMENTAÇÕES */}
            <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6 shadow-xs">
              {filteredMovements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                  <History className="size-9 text-[#6B6B5F] opacity-50" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#141410] uppercase tracking-widest">Sem Movimentações no Log</p>
                    <p className="text-xs text-[#6B6B5F] max-w-sm">Nenhuma movimentação corresponde aos critérios de pesquisa selecionados acima.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 relative pl-4 border-l border-[#E8E6E1] ml-2">
                  {filteredMovements.map((m) => {
                    const isEntrada = m.type === 'entrada';
                    const productName = getProductName(m.productId);
                    const productUnit = getProductUnit(m.productId);
                    const formattedDate = new Date(m.date).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div
                        key={m.id}
                        className={`relative pl-8 pb-3 last:pb-0 ${
                          isEntrada 
                            ? 'border-l-2 border-[#D8EDE3]' 
                            : 'border-l-2 border-[#FFF3CD]'
                        }`}
                        style={{ marginLeft: '-17px' }}
                      >
                        {/* Circle Bullet inside vertical line */}
                        <div className="absolute left-0 top-0 -translate-x-[50%] flex items-center justify-center size-8 rounded-full bg-white border border-[#E8E6E1] shadow-xs">
                          {isEntrada ? (
                            <ArrowUpRight className="size-4 text-[#2D6A4F]" />
                          ) : (
                            <ArrowDownLeft className="size-4 text-[#D4A017]" />
                          )}
                        </div>

                        {/* Text fields custom styled */}
                        <div className="space-y-1 pl-2">
                          <div className="flex items-center gap-2">
                            <span className="kpi-label text-[10px] font-bold text-[#6B6B5F] uppercase tracking-wider font-sans">
                              {formattedDate}
                            </span>
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                              isEntrada 
                                ? 'bg-[#D8EDE3] text-[#1B3A2D] border-[#2D6A4F]/10' 
                                : 'bg-[#FFF3CD] text-[#92600A] border-[#D4A017]/10'
                            }`}>
                              {isEntrada ? 'Entrada / Incremento' : 'Saída / Consumo'}
                            </span>
                          </div>

                          <div className="font-semibold text-[#141410] flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-semibold">{productName}</span>
                            <span className="text-xs font-mono text-[#6B6B5F]">
                              ({isEntrada ? '+' : '-'}{m.quantity.toLocaleString('pt-BR')} {productUnit})
                            </span>
                          </div>

                          <div className="text-sm text-[#6B6B5F] leading-relaxed">
                            {m.reason}
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

      </AnimatePresence>

      {/* -------------------------------------------------------------
          FICHA CADASTRAL / MODAL PARA ATUALIZAÇÃO E NOVOS PRODUTOS
          ------------------------------------------------------------- */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl border border-[#E8E6E1] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              {/* Modal header - bg-[#1B3A2D] com título em branco */}
              <div className="p-6 bg-[#1B3A2D] flex items-center justify-between text-white">
                <div>
                  <h3 className="text-base font-bold font-display text-white">
                    {modalMode === 'create' ? 'Cadastrar Novo Insumo' : 'Ajustar Parâmetros do Insumo'}
                  </h3>
                  <p className="text-[11px] text-[#A8CDB8]">Insira as referências técnicas de comercialização na DDSulf.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-1.5 hover:bg-white/10 text-[#A8CDB8] hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={handleSaveProduct} className="p-6 space-y-5">
                
                {/* Product Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-[#6B6B5F] block pb-0.5">Nome Comercial do Produto *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Fendona 60 SC (Inseticida)"
                    className="w-full h-10 border border-[#E8E6E1] rounded-lg px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9]"
                  />
                </div>

                {/* Category and Unit selectors */}
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-[#6B6B5F] block pb-0.5">Categoria Tecnológica *</label>
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
                    <label className="text-[10px] font-bold uppercase text-[#6B6B5F] block pb-0.5">Unidade de Medida *</label>
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

                {/* Quantities metrics */}
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-[#6B6B5F] block pb-0.5">Quantidade Inicial em Loja</label>
                    <input
                      type="number"
                      min="0"
                      step="ANY"
                      value={formQty}
                      onChange={(e) => setFormQty(parseFloat(e.target.value) || 0)}
                      className="w-full h-10 border border-[#E8E6E1] rounded-lg px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-[#6B6B5F] block pb-0.5">Estoque Mínimo Alerta</label>
                    <input
                      type="number"
                      min="0"
                      step="ANY"
                      value={formMinQty}
                      onChange={(e) => setFormMinQty(parseFloat(e.target.value) || 0)}
                      className="w-full h-10 border border-[#E8E6E1] rounded-lg px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9]"
                    />
                  </div>
                </div>

                {/* Cost and Supplier details */}
                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-[#6B6B5F] block pb-0.5">Custo Unitário Bruto (R$)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.0001"
                      value={formCost}
                      onChange={(e) => setFormCost(parseFloat(e.target.value) || 0)}
                      className="w-full h-10 border border-[#E8E6E1] rounded-lg px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-[#6B6B5F] block pb-0.5">Fornecedor Autorizado</label>
                    <input
                      type="text"
                      value={formSupplier}
                      onChange={(e) => setFormSupplier(e.target.value)}
                      placeholder="Ex: Bayer / BASF"
                      className="w-full h-10 border border-[#E8E6E1] rounded-lg px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9]"
                    />
                  </div>
                </div>

                {/* Footer buttons - botão primário bg-[#1B3A2D] + botão cancelar em texto apenas */}
                <div className="pt-2 flex items-center justify-end gap-5">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="text-xs font-bold uppercase tracking-wider text-[#6B6B5F] hover:text-[#141410] transition-colors cursor-pointer"
                  >
                    Retroceder / Cancelar
                  </button>
                  <Button
                    type="submit"
                    className="h-10 px-5 text-xs font-bold rounded-lg uppercase tracking-wider bg-[#1B3A2D] text-white hover:bg-[#2D6A4F] cursor-pointer"
                  >
                    Confirmar e Salvar
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
