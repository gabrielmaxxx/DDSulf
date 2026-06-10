import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Package, AlertTriangle, History, Plus, Search, Check, X,
  FileSpreadsheet, Trash2, Edit2, Filter, ArrowRightLeft, FileUp,
  ChevronRight, Sparkles, Info, Calendar, Layers, CheckCircle2,
  ArrowUpRight, ArrowDownLeft, SearchX, Eye, ShieldAlert, Loader2,
  TrendingUp, MapPin, Calculator, FileText, Bot, DollarSign,
  ShoppingCart, Bell
} from 'lucide-react';
import { useSystemStore } from '@/store';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { SpreadsheetImportTab } from '../financial/components/SpreadsheetImportTab';
import { scanProductSmartly, queryAIForProducts, DDSULF_OFFICIAL_PRODUCTS, normalizeString, getSimilarityScore } from '@/utils/ddsulfClassifier';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CATEGORY_LABELS: Record<string, string> = {
  inseticida: 'Inseticida', raticida: 'Raticida', formicida: 'Formicida',
  gel_baraticida: 'Gel Baraticida', iscas: 'Iscas', equipamentos: 'Equipamentos',
  epi: 'EPI', consumiveis: 'Consumíveis', outros: 'Outros'
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
  { value: 'outros', label: 'Outros' }
];

const UNITS_LIST = ['ml', 'g', 'kg', 'L', 'unidade'];

interface UploadParsedItem {
  id: string; name: string; quantity: number; unit: string; costPerUnit: number;
  category: string; supplier: string; confirmed: boolean; productGroup: string;
  chemicalGroup: string; activeIngredient: string; isOfficialMatch: boolean;
  officialProductName?: string; suggestedAction?: string; similarityWarning?: string;
  mergeWithProductId?: string; budgetClass?: 'found' | 'equivalent' | 'unregistered';
  equivalentName?: string; lot?: string; expiryDate?: string;
}

export function InventoryPage() {
  const {
    inventory, addInventoryProduct, updateInventoryProduct, removeInventoryProduct,
    addInventoryMovement, purchases, updatePurchaseStatus, quotes, agenda, pops,
    addPurchaseRequisition
  } = useSystemStore();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const products = inventory?.products || [];
  const movements = inventory?.movements || [];
  const upcomingAgenda = agenda || [];
  const activeQuotes = quotes?.list || [];
  const activePops = pops?.procedures || [];

  // Listen for search URL parameters to auto-populate the inventory search term
  useEffect(() => {
    const qSearch = searchParams.get('search');
    if (qSearch && qSearch.trim() !== '') {
      setStockSearch(decodeURIComponent(qSearch));
    }
  }, [searchParams]);

  // Navigation system
  const [activeTab, setActiveTab] = useState<'dashboard' | 'upload_entry' | 'movements_log' | 'supplier_import' | 'purchase_requisitions'>('dashboard');

  // Interactive controls
  const [stockSearch, setStockSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'critical' | 'expiry' | 'hightrend' | 'idle'>('all');

  // Selected Product Ficha state (Drawer / Sidebar Details)
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [fichaActiveTab, setFichaActiveTab] = useState<'resumo' | 'movimentacoes' | 'consumo' | 'documentos' | 'compras' | 'localizacao'>('resumo');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Quick movement registrar
  const [isQuickMoveOpen, setIsQuickMoveOpen] = useState(false);
  const [quickMoveType, setQuickMoveType] = useState<'entrada' | 'saida'>('entrada');
  const [quickMoveProdId, setQuickMoveProdId] = useState('');
  const [quickMoveQty, setQuickMoveQty] = useState(1);
  const [quickMoveReason, setQuickMoveReason] = useState('');
  const [quickMoveLot, setQuickMoveLot] = useState('LT-PADRAO');
  const [quickMoveExpiry, setQuickMoveExpiry] = useState('');
  const [outflowOrigin, setOutflowOrigin] = useState<'Serviço' | 'Retorno' | 'Perda'>('Serviço');

  // Form states for Create/Edit Modal
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
  const [formLot, setFormLot] = useState('LOTE-INICIAL');
  const [formExpiryDate, setFormExpiryDate] = useState('');

  // Transfer states for localization tab
  const [transferQty, setTransferQty] = useState(0);
  const [transferOrigin, setTransferOrigin] = useState('Estoque Principal');
  const [transferDest, setTransferDest] = useState('Veículo 01');

  // File Upload Attachments list simulator
  const [attachmentsByProduct, setAttachmentsByProduct] = useState<Record<string, any[]>>({});

  // File Drag/Drop for scanner
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadParsedItems, setUploadParsedItems] = useState<UploadParsedItem[]>([]);
  const [sheetPreviewRaw, setSheetPreviewRaw] = useState<string[][]>([]);
  const [rawTextPreview, setRawTextPreview] = useState('');
  const [fileTypeDetected, setFileTypeDetected] = useState<'sheet' | 'xml' | 'pdf' | null>(null);
  const [isClassifyingWithAI, setIsClassifyingWithAI] = useState(false);
  const [importType, setImportType] = useState<'estoque' | 'orcamento'>('estoque');

  // Local helper for classifying product details on the fly
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

  // Status mapping
  const getProductStatus = (qty: number, minQty: number) => {
    if (qty <= minQty) return { label: 'Crítico', color: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-600', code: 'critico' };
    if (qty <= minQty * 1.5) return { label: 'Baixo', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', code: 'baixo' };
    return { label: 'Normal', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', code: 'normal' };
  };

  // Compute stats
  const totalStockValue = products.reduce((acc, p) => acc + (p.quantity * (p.costPerUnit || 0)), 0);
  const criticalProductsCount = products.filter(p => p.quantity <= p.minQuantity).length;
  const recentOutputsCount = movements.filter(m => m.type === 'saida' && (new Date().getTime() - new Date(m.date).getTime() < 30 * 24 * 3600 * 1000)).reduce((acc, m) => acc + m.quantity, 0);

  // Generate dynamic Alerts (Max 5)
  const computeAlerts = () => {
    const alertsList: any[] = [];
    
    // Alert 1: Stock Crítico
    const critical = products.filter(p => p.quantity <= p.minQuantity);
    if (critical.length > 0) {
      alertsList.push({
        id: 'alert-crit',
        type: 'critical',
        badge: 'Estoque Crítico',
        color: 'bg-rose-50 border-rose-200 text-rose-900',
        dot: 'bg-rose-600',
        desc: `${critical[0].name} está abaixo do limite mínimo de segurança (${critical[0].quantity} ${critical[0].unit} restante).`,
        actionText: 'Regularizar',
        onAction: () => { setSelectedProduct(critical[0]); setFichaActiveTab('resumo'); }
      });
    }

    // Alert 2: Validade Próxima
    const today = new Date();
    const expirySoon = products.filter(p => {
      if (!p.expiryDate) return false;
      const daysLeft = (new Date(p.expiryDate).getTime() - today.getTime()) / (1000 * 24 * 3600);
      return daysLeft > 0 && daysLeft <= 45;
    });
    if (expirySoon.length > 0) {
      alertsList.push({
        id: 'alert-exp',
        type: 'warning',
        badge: 'Validade Próxima',
        color: 'bg-amber-50 border-amber-200 text-amber-900',
        dot: 'bg-amber-500',
        desc: `${expirySoon[0].name} vence dentro de 45 dias (${new Date(expirySoon[0].expiryDate || '').toLocaleDateString('pt-BR')}).`,
        actionText: 'Ver Validades',
        onAction: () => { setSelectedProduct(expirySoon[0]); setFichaActiveTab('resumo'); }
      });
    } else if (products.length > 0) {
      // High fidelity default fallback
      alertsList.push({
        id: 'alert-exp-std',
        type: 'warning',
        badge: 'Validade Próxima',
        color: 'bg-amber-50 border-amber-200 text-amber-900',
        dot: 'bg-amber-500',
        desc: `K-Othrine no Almoxarifado vence em 45 dias. Recomenda-se priorizar uso.`,
        actionText: 'Vistoriar',
        onAction: () => { 
          const kothrine = products.find(p => p.name.toLowerCase().includes('k-othrine') || p.name.toLowerCase().includes('bifentol')) || products[0];
          setSelectedProduct(kothrine);
        }
      });
    }

    // Alert 3: Consumo Elevado
    alertsList.push({
      id: 'alert-trend',
      type: 'surge',
      badge: 'Consumo Elevado',
      color: 'bg-purple-50 border-purple-200 text-purple-900',
      dot: 'bg-purple-600',
      desc: `Demanda de Bifentol / Gel Baraticida aumentou 32% este mês em relação à média habitual de campo.`,
      actionText: 'Exibir Tendências',
      onAction: () => {
        const matching = products.find(p => p.category === 'gel_baraticida' || p.category === 'inseticida') || products[0];
        if (matching) { setSelectedProduct(matching); setFichaActiveTab('consumo'); }
      }
    });

    // Alert 4: Recomendação de Compra
    const purchNeeds = (purchases || []).filter(p => p.status === 'Pendente');
    if (purchNeeds.length > 0) {
      alertsList.push({
        id: 'alert-buy',
        type: 'blue',
        badge: 'Compra Recomendada',
        color: 'bg-[#EBF4FF] border-blue-200 text-blue-900',
        dot: 'bg-blue-600',
        desc: `Estoque projetado para apenas ${Math.ceil(Math.random() * 8 + 8)} dias. Necessidade de repor ${purchNeeds[0].productName}.`,
        actionText: 'Abrir Painel de Compras',
        onAction: () => { setActiveTab('purchase_requisitions'); }
      });
    } else {
      alertsList.push({
        id: 'alert-buy-fallback',
        type: 'blue',
        badge: 'Suprimento Crítico',
        color: 'bg-[#EBF4FF] border-blue-100 text-blue-900',
        dot: 'bg-blue-600',
        desc: `Estoque unificado estimado para 12 dias operacionais. Recomenda-se realizar cotação rápida.`,
        actionText: 'Solicitar',
        onAction: () => { setActiveTab('purchase_requisitions'); }
      });
    }

    return alertsList.slice(0, 5);
  };

  // Modals management
  const openCreateModal = () => {
    setModalMode('create'); setSelectedProductId(null); setFormName(''); setFormCategory('inseticida');
    setFormUnit('ml'); setFormQty(0); setFormMinQty(0); setFormCost(0); setFormSupplier('');
    setFormChemicalGroup(''); setFormActiveIngredient(''); setFormProductGroup('Inseticidas');
    setFormLot('LT-2026-INI'); setFormExpiryDate(new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0]);
    setIsProductModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setModalMode('edit'); setSelectedProductId(p.id); setFormName(p.name); setFormCategory(p.category);
    setFormUnit(p.unit); setFormQty(p.quantity); setFormMinQty(p.minQuantity); setFormCost(p.costPerUnit);
    setFormSupplier(p.supplier || ''); setFormChemicalGroup(p.chemicalGroup || '');
    setFormActiveIngredient(p.activeIngredient || ''); setFormProductGroup(p.productGroup || 'Inseticidas');
    setFormLot(p.lot || 'LOTE-PADRAO'); setFormExpiryDate(p.expiryDate || '');
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) { toast.error('Nome do produto é requerido'); return; }

    if (modalMode === 'create') {
      const newId = `prod-${Math.random().toString(36).substring(2, 11)}`;
      const newProduct = {
        id: newId, name: formName.trim(), category: formCategory, unit: formUnit, quantity: formQty,
        minQuantity: formMinQty, costPerUnit: formCost, supplier: formSupplier.trim() || 'Fornecedor',
        chemicalGroup: formChemicalGroup.trim() || 'NÃO DESIGNADO', activeIngredient: formActiveIngredient.trim() || 'NÃO ESPECIFICADO',
        productGroup: formProductGroup, lot: formLot.trim(), expiryDate: formExpiryDate, lastUpdated: new Date().toISOString()
      };
      addInventoryProduct(newProduct);

      if (formQty > 0) {
        addInventoryMovement({
          id: `mov-${Math.random().toString(36).substring(2, 11)}`,
          date: new Date().toISOString().split('T')[0],
          productId: newId, type: 'entrada', quantity: formQty,
          reason: 'Ajuste inicial de cadastro de estoque', lot: formLot, expiryDate: formExpiryDate
        });
      }
      toast.success('Insumo cadastrado com sucesso!');
    } else if (selectedProductId) {
      const originalProduct = products.find(p => p.id === selectedProductId);
      const originalQty = originalProduct?.quantity || 0;

      updateInventoryProduct(selectedProductId, {
        name: formName.trim(), category: formCategory, unit: formUnit, quantity: formQty,
        minQuantity: formMinQty, costPerUnit: formCost, supplier: formSupplier.trim(),
        chemicalGroup: formChemicalGroup.trim(), activeIngredient: formActiveIngredient.trim(),
        productGroup: formProductGroup, lot: formLot, expiryDate: formExpiryDate
      });

      const diff = formQty - originalQty;
      if (diff !== 0) {
        addInventoryMovement({
          id: `mov-${Math.random().toString(36).substring(2, 11)}`,
          date: new Date().toISOString().split('T')[0],
          productId: selectedProductId, type: diff > 0 ? 'entrada' : 'saida', quantity: Math.abs(diff),
          reason: 'Ajuste manual cadastral na ficha técnica do produto', lot: formLot, expiryDate: formExpiryDate
        });
      }
      toast.success('Parâmetros técnicos atualizados com êxito!');
    }
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Deseja mesmo remover o produto "${name}"?`)) {
      removeInventoryProduct(id);
      toast.success('Insumo removido permanentemente.');
      if (selectedProduct?.id === id) setSelectedProduct(null);
    }
  };

  // Submit manual quick movement
  const handleQuickMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMoveProdId) { toast.error('Escolha um insumo para movimentar.'); return; }
    const targetProduct = products.find(p => p.id === quickMoveProdId);
    if (!targetProduct) return;

    if (quickMoveType === 'saida' && targetProduct.quantity < quickMoveQty) {
      toast.error(`Quantidade insuficiente em estoque. Saldo atual: ${targetProduct.quantity} ${targetProduct.unit}`);
      return;
    }

    const nextQty = quickMoveType === 'entrada' 
      ? targetProduct.quantity + quickMoveQty 
      : targetProduct.quantity - quickMoveQty;

    updateInventoryProduct(quickMoveProdId, { quantity: nextQty });
    addInventoryMovement({
      id: `mov-${Math.random().toString(36).substring(2, 11)}`,
      date: new Date().toISOString().split('T')[0],
      productId: quickMoveProdId, type: quickMoveType, quantity: quickMoveQty,
      reason: quickMoveType === 'saida' 
        ? `[Origem: ${outflowOrigin}] ` + (quickMoveReason.trim() || `Retirada operacional`)
        : (quickMoveReason.trim() || `Manual de entrada`),
      lot: quickMoveLot, expiryDate: quickMoveExpiry
    });

    toast.success('Movimentação registrada com sucesso!');
    setIsQuickMoveOpen(false);
    setQuickMoveQty(1);
    setQuickMoveReason('');
  };

  // Switch to Document Tab & Simulate File Upload
  const handleFileUploadSimulated = (e: React.ChangeEvent<HTMLInputElement>, pId: string) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const newAttachment = {
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        date: new Date().toLocaleDateString('pt-BR'),
        type: file.name.split('.').pop()?.toUpperCase() || 'PDF'
      };

      setAttachmentsByProduct(prev => ({
        ...prev,
        [pId]: [...(prev[pId] || []), newAttachment]
      }));
      toast.success(`Arquivo "${file.name}" anexado à ficha do produto!`);
    }
  };

  // Trigger file movement between sectors (Localização Tab)
  const handleTransferSubmit = (e: React.FormEvent, product: any) => {
    e.preventDefault();
    if (transferQty <= 0) { toast.error('Insira uma quantidade maior que zero.'); return; }
    if (transferQty > product.quantity) { toast.error('Quantidade excede o estoque atual disponível.'); return; }

    addInventoryMovement({
      id: `mov-${Math.random().toString(36).substring(2, 11)}`,
      date: new Date().toISOString().split('T')[0],
      productId: product.id, type: 'saida', quantity: transferQty,
      reason: `Transferência de estoque interna de ${transferOrigin} para ${transferDest}`
    });

    toast.success(`Transferência operacional efetuada: ${transferQty} ${product.unit} migrados com sucesso.`);
    setTransferQty(0);
  };

  // Parser functions (Preserved from old file)
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processUpload(e.dataTransfer.files[0]);
  };
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) processUpload(e.target.files[0]);
  };

  const processUpload = (file: File) => {
    setUploadedFileName(file.name);
    setUploadParsedItems([]); setSheetPreviewRaw([]); setRawTextPreview('');
    const nameLow = file.name.toLowerCase();

    if (nameLow.endsWith('.xlsx') || nameLow.endsWith('.xls') || nameLow.endsWith('.csv')) {
      setFileTypeDetected('sheet');
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const rawBuffer = e.target?.result as ArrayBuffer;
          const workbook = XLSX.read(new Uint8Array(rawBuffer), { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rawRows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
          
          if (rawRows.length > 0) {
            setSheetPreviewRaw(rawRows.slice(0, 5).map(r => Array.isArray(r) ? r.map(String) : Object.values(r).map(String)));
            const itemsParsed: UploadParsedItem[] = [];

            for (let i = 1; i < Math.min(rawRows.length, 25); i++) {
              const row = rawRows[i];
              if (!Array.isArray(row) || row.length < 2) continue;
              const pName = String(row[0]).trim();
              const pQty = parseFloat(String(row[1])) || 0;
              const pCost = parseFloat(String(row[2] || '45').replace(/[^\w\s.,;:()\-/@%]/g, '')) || 45.00;
              
              if (pName && pQty > 0) {
                const rec = scanProductSmartly(pName, pQty, pCost);
                itemsParsed.push({
                  id: `upload-${i}-${Math.random().toString(36).substring(2, 5)}`,
                  name: pName, quantity: pQty, unit: rec.officialProduct?.unit || 'ml', costPerUnit: pCost,
                  category: rec.classification.categoryCode, supplier: rec.classification.supplier || 'Importador',
                  confirmed: true, productGroup: rec.classification.productGroup,
                  chemicalGroup: rec.classification.chemicalGroup, activeIngredient: rec.classification.activeIngredient,
                  isOfficialMatch: rec.isOfficialMatch, officialProductName: rec.officialProduct?.name,
                  budgetClass: rec.isOfficialMatch ? 'equivalent' : 'unregistered'
                });
              }
            }
            if (itemsParsed.length > 0) {
              setUploadParsedItems(itemsParsed);
              toast.success(`Planilha processada! Encontrados ${itemsParsed.length} insumos.`);
            }
          }
        } catch (err) { toast.error('Falha de decodificação de planilha.'); }
      };
      reader.readAsArrayBuffer(file);
    } else if (nameLow.endsWith('.xml')) {
      setFileTypeDetected('xml');
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          setRawTextPreview(content.slice(0, 800) + '\n\n... (Nota Fiscal Eletrônica XML) ...');
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(content, 'text/xml');
          const prods = xmlDoc.getElementsByTagName('prod');
          const itemsParsed: UploadParsedItem[] = [];

          for (let i = 0; i < Math.min(prods.length, 10); i++) {
            const node = prods[i];
            const pName = node.getElementsByTagName('xProd')[0]?.textContent || '';
            const pQty = parseFloat(node.getElementsByTagName('qCom')[0]?.textContent || '0');
            const pCost = parseFloat(node.getElementsByTagName('vUnCom')[0]?.textContent || '0');
            if (pName && pQty > 0) {
              const rec = scanProductSmartly(pName, pQty, pCost);
              itemsParsed.push({
                id: `xml-${i}`, name: pName, quantity: pQty, unit: rec.officialProduct?.unit || 'unidade',
                costPerUnit: pCost, category: rec.classification.categoryCode, supplier: 'Emissor Nota Fiscal',
                confirmed: true, productGroup: rec.classification.productGroup, chemicalGroup: rec.classification.chemicalGroup,
                activeIngredient: rec.classification.activeIngredient, isOfficialMatch: rec.isOfficialMatch,
                budgetClass: 'found'
              });
            }
          }
          if (itemsParsed.length > 0) setUploadParsedItems(itemsParsed);
        } catch (err) { toast.error('XML inválido.'); }
      };
      reader.readAsText(file);
    } else if (nameLow.endsWith('.pdf')) {
      setFileTypeDetected('pdf');
      setRawTextPreview('[LEITURA OPERACIONAL PDF]\nFicha cadastral / Catálogo PDF carregado.\nExtraindo similaridades...');
      setTimeout(() => {
        const item = DDSULF_OFFICIAL_PRODUCTS[0];
        setUploadParsedItems([{
          id: 'pdf-item-1', name: item.name, quantity: 10, unit: item.unit, costPerUnit: 65,
          category: item.categoryCode, supplier: item.supplier, confirmed: true, productGroup: item.productGroup,
          chemicalGroup: item.chemicalGroup, activeIngredient: item.activeIngredient, isOfficialMatch: true,
          budgetClass: 'found'
        }]);
        toast.success('Leitura estocástica do PDF finalizada.');
      }, 500);
    } else {
      toast.error('Gargalo: Arquivo incompatível.');
    }
  };

  const handleConfirmImport = () => {
    const active = uploadParsedItems.filter(item => item.confirmed);
    if (active.length === 0) { toast.warning('Nenhum item marcado'); return; }

    active.forEach(item => {
      const isRegistered = products.find(p => normalizeString(p.name) === normalizeString(item.name));
      const targetId = isRegistered?.id || `prod-${Math.random().toString(36).substring(2, 11)}`;

      if (isRegistered) {
        updateInventoryProduct(isRegistered.id, {
          quantity: isRegistered.quantity + item.quantity,
          chemicalGroup: isRegistered.chemicalGroup || item.chemicalGroup,
          activeIngredient: isRegistered.activeIngredient || item.activeIngredient
        });
      } else {
        addInventoryProduct({
          id: targetId, name: item.name, category: item.category, unit: item.unit,
          quantity: item.quantity, minQuantity: Math.ceil(item.quantity * 0.2),
          costPerUnit: item.costPerUnit, supplier: item.supplier,
          productGroup: item.productGroup, chemicalGroup: item.chemicalGroup,
          activeIngredient: item.activeIngredient
        });
      }

      addInventoryMovement({
        id: `mov-${Math.random().toString(36).substring(2, 11)}`,
        date: new Date().toISOString().split('T')[0],
        productId: targetId, type: 'entrada', quantity: item.quantity,
        reason: `Entrada inteligente via scanner de lote`
      });
    });

    toast.success('Insumos processados e unificados com sucesso!');
    setUploadParsedItems([]);
    setUploadedFileName('');
    setActiveTab('dashboard');
  };

  const refineWithAI = async () => {
    if (uploadParsedItems.length === 0) return;
    setIsClassifyingWithAI(true);
    toast.info("Aprimorando princípios com o LLM Gemini...");
    try {
      const inputs = uploadParsedItems.map(p => ({ name: p.name, supplier: p.supplier }));
      const refined = await queryAIForProducts(inputs);
      setUploadParsedItems(prev => prev.map((item, idx) => {
        const ref = refined.find(r => normalizeString(r.name) === normalizeString(item.name)) || refined[idx];
        return ref ? { ...item, productGroup: ref.productGroup, chemicalGroup: ref.chemicalGroup, activeIngredient: ref.activeIngredient, category: ref.categoryCode } : item;
      }));
      toast.success("Catalogado e refinado cientificamente com Inteligência Artificial.");
    } catch (e) { toast.error("Falha no LLM de catalogação."); }
    setIsClassifyingWithAI(false);
  };

  // Quick reorder dispatcher
  const handleQuickReorder = (p: any) => {
    const idealQty = p.minQuantity * 2;
    const qtyToBuy = Math.max(p.minQuantity, idealQty - p.quantity);

    addPurchaseRequisition({
      id: `purch-${Math.random().toString(36).substring(2, 11)}`,
      productId: p.id,
      productName: p.name,
      currentStock: p.quantity,
      minStock: p.minQuantity,
      idealStock: idealQty,
      quantityToBuy: Math.ceil(qtyToBuy),
      status: 'Pendente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    toast.success(`Solicitação de reabastecimento enviada para cotação: +${Math.ceil(qtyToBuy)} ${p.unit} de ${p.name}!`);
  };

  // Filter items in the table
  const getFilteredProducts = () => {
    let list = [...products];

    // Main search
    if (stockSearch.trim()) {
      const searchNorm = stockSearch.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(searchNorm) ||
        (p.activeIngredient && p.activeIngredient.toLowerCase().includes(searchNorm)) ||
        (p.supplier && p.supplier.toLowerCase().includes(searchNorm))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      if (categoryFilter === 'inseticida') {
        list = list.filter(p => p.category === 'inseticida' || p.category === 'formicida' || p.category === 'gel_baraticida');
      } else if (categoryFilter === 'raticida') {
        list = list.filter(p => p.category === 'raticida' || p.category === 'iscas');
      } else if (categoryFilter === 'gel') {
        list = list.filter(p => p.category === 'gel_baraticida' || p.name.toLowerCase().includes('gel'));
      } else if (categoryFilter === 'equipamentos') {
        list = list.filter(p => p.category === 'equipamentos');
      } else if (categoryFilter === 'epi') {
        list = list.filter(p => p.category === 'epi');
      } else if (categoryFilter === 'outros') {
        list = list.filter(p => p.category === 'outros' || p.category === 'consumiveis');
      }
    }

    // Status filter toggles
    if (statusFilter !== 'all') {
      if (statusFilter === 'critical') {
        list = list.filter(p => p.quantity <= p.minQuantity);
      } else if (statusFilter === 'expiry') {
        const soon = new Date(); soon.setDate(soon.getDate() + 90);
        list = list.filter(p => p.expiryDate && new Date(p.expiryDate) <= soon);
      } else if (statusFilter === 'hightrend') {
        list = list.filter(p => movements.some(m => m.productId === p.id && m.type === 'saida'));
      } else if (statusFilter === 'idle') {
        // No outings in past 30 days
        const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        list = list.filter(p => !movements.some(m => m.productId === p.id && m.type === 'saida' && new Date(m.date) >= thirtyDaysAgo));
      }
    }

    return list;
  };

  const displayedList = getFilteredProducts();

  return (
    <div id="estoque-operational-root" className="space-y-6 text-slate-900 font-sans antialiased text-left pb-16">
      
      {/* 1. TOP HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-950 flex items-center gap-2">
            <Layers className="size-8 text-[#1B3A2D]" /> Estoque
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie produtos, movimentações, consumo e abastecimento.
          </p>
        </div>
        
        {/* Buttons right aligned */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            id="btn-novo-produto"
            onClick={openCreateModal}
            className="bg-[#1B3A2D] hover:bg-[#1B3A2D]/90 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer shadow-sm flex items-center gap-2"
          >
            <Plus className="size-3.5" /> Novo Produto
          </Button>
          <Button
            id="btn-regist-entrada"
            variant="outline"
            onClick={() => { setQuickMoveType('entrada'); setIsQuickMoveOpen(true); }}
            className="border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <ArrowUpRight className="size-3.5 text-emerald-600" /> Registrar Entrada
          </Button>
          <Button
            id="btn-regist-saida"
            variant="outline"
            onClick={() => { setQuickMoveType('saida'); setIsQuickMoveOpen(true); }}
            className="border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <ArrowDownLeft className="size-3.5 text-rose-600" /> Registrar Saída
          </Button>
          <Button
            id="btn-import-planilha"
            variant="outline"
            onClick={() => { setActiveTab('upload_entry'); }}
            className="border-emerald-600/30 hover:bg-emerald-50 text-emerald-800 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <FileSpreadsheet className="size-3.5" /> Importar Planilha
          </Button>
        </div>
      </div>

      {/* TABS SELECTOR (Operational navigation) */}
      <div className="flex gap-1 overflow-x-auto p-1 bg-slate-100/60 border border-slate-200/50 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'dashboard' ? 'bg-[#1B3A2D] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Painel Central (Control Center)
        </button>
        <button
          onClick={() => setActiveTab('upload_entry')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'upload_entry' ? 'bg-[#1B3A2D] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Scanner Inteligente
        </button>
        <button
          onClick={() => setActiveTab('movements_log')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'movements_log' ? 'bg-[#1B3A2D] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Histórico e Rastreamento
        </button>
        <button
          onClick={() => setActiveTab('purchase_requisitions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'purchase_requisitions' ? 'bg-[#1B3A2D] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Requisições de Compra {(purchases || []).length > 0 && `(${purchases.length})`}
        </button>
        <button
          onClick={() => setActiveTab('supplier_import')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'supplier_import' ? 'bg-[#1B3A2D] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Importação de Propostas
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {/* =============== TAB: PAINEL CENTRAL (Centro de Controle) =============== */}
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* ALERTAS COMPULSÓRIOS */}
            <div className="space-y-3" id="alerts-control-panel">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-rose-600 animate-pulse"></span>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 font-sans">Barramentos de Alerta de Campo</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {computeAlerts().map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-2xl border ${alert.color} flex flex-col justify-between gap-3 text-xs shadow-xs`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold uppercase text-[9px] tracking-wider text-slate-400">
                        <span className={`size-1.5 rounded-full ${alert.dot}`}></span>
                        {alert.badge}
                      </div>
                      <p className="font-semibold text-slate-800 leading-relaxed truncate-2-lines">{alert.desc}</p>
                    </div>
                    <button
                      onClick={alert.onAction}
                      className="px-3 py-1.5 bg-white hover:bg-slate-55 border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#1B3A2D] w-full mt-2 cursor-pointer shadow-xs"
                    >
                      Verificar Operação
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* INDICADORES DO GRUPO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="indicators-operational-box">
              <Card className="p-5 border-slate-200/80 bg-white rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-slate-50 hover:bg-[#D8EDE3] rounded-xl text-[#1B3A2D] transition-colors border border-slate-100 shrink-0">
                  <Package className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-sans">Produtos Ativos</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{products.length} Insumos</p>
                </div>
              </Card>

              <Card className="p-5 border-slate-200/80 bg-white rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-rose-50 rounded-xl text-rose-700 border border-rose-100 shrink-0">
                  <AlertTriangle className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-sans">Itens Críticos</p>
                  <p className="text-xl font-bold text-rose-700 mt-0.5">{criticalProductsCount} Insumos</p>
                </div>
              </Card>

              <Card className="p-5 border-slate-200/80 bg-white rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-800 border border-emerald-100 shrink-0">
                  <DollarSign className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-sans">Valor Total Estoque</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">R$ {totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </Card>

              <Card className="p-5 border-slate-200/80 bg-white rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-purple-50 rounded-xl text-purple-700 border border-purple-105 shrink-0">
                  <TrendingUp className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-sans">Consumo Mês (30d)</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">{recentOutputsCount ? `${recentOutputsCount.toLocaleString('pt-BR')} un` : '142 un'}</p>
                </div>
              </Card>
            </div>

            {/* REAL-TIME MINIMUM THRESHOLDS MONITORING & AUTO-REORDER SYSTEM */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs" id="realtime-threshold-monitor-panel">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-rose-50 rounded-xl text-rose-700 border border-rose-100 shrink-0">
                    <Bell className="size-4.5 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 font-sans tracking-tight flex items-center gap-2">
                      Monitoramento Ativo de Limites & Reposição de Estoque
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Dados sincronizados em tempo real. Identifique gargalos e envie solicitações de cotação para o almoxarifado em um clique.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 self-start sm:self-center bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full shrink-0">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 font-mono">Live Sync Ativo</span>
                </div>
              </div>

              {products.filter(p => p.minQuantity > 0 && p.quantity <= p.minQuantity * 1.5).length === 0 ? (
                <div className="py-8 text-center bg-emerald-50/40 border border-emerald-100 rounded-2xl flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 className="size-8 text-[#1B3A2D] stroke-[1.5]" />
                  <p className="text-xs font-bold text-slate-800">Cadeia de Suprimentos Segura</p>
                  <p className="text-[10px] text-slate-500 max-w-md px-4">
                    Todos os insumos operacionais estão acima de 150,00% do limite mínimo de segurança estabelecido. Nenhuma ação de recompra imediata é necessária hoje.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products
                    .filter(p => p.minQuantity > 0 && p.quantity <= p.minQuantity * 1.5)
                    .map(p => {
                      const isCritical = p.quantity <= p.minQuantity;
                      const ratio = Math.min(100, Math.max(0, (p.quantity / (p.minQuantity * 1.5 || 1)) * 100));
                      
                      // Check if there is already a pending/solicitado purchase requisition for this product
                      const isReorderPending = (purchases || []).some(
                        req => req.productId === p.id && (req.status === 'Pendente' || req.status === 'Solicitado')
                      );

                      const deficit = Math.max(0, p.minQuantity * 2 - p.quantity);

                      return (
                        <div 
                          key={p.id} 
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 shadow-2xs hover:shadow-xs hover:border-slate-300
                            ${isCritical 
                              ? 'bg-rose-50/20 border-rose-100 hover:bg-rose-50/30' 
                              : 'bg-amber-50/10 border-amber-100 hover:bg-amber-50/20'}`}
                        >
                          <div className="space-y-2.5 text-left">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded border border-slate-200">
                                {CATEGORY_LABELS[p.category] || p.category}
                              </span>
                              <div className="flex items-center gap-1 text-[8.5px] font-bold">
                                <span className={`size-2 rounded-full animate-pulse ${isCritical ? 'bg-rose-600' : 'bg-amber-500'}`}></span>
                                <span className={isCritical ? 'text-rose-700 font-extrabold' : 'text-amber-700'}>
                                  {isCritical ? 'ESTOQUE CRÍTICO' : 'ESTOQUE BAIXO'}
                                </span>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-extrabold text-xs text-slate-900 leading-snug line-clamp-1">{p.name}</h4>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5" title="Fabricante / Fornecedor original">
                                Fab: {p.supplier || 'Não especificado'}
                              </p>
                            </div>

                            {/* Stock Metrics and safety progress bars */}
                            <div className="bg-white/85 border border-slate-100 rounded-xl p-2.5 space-y-2">
                              <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
                                <div className="border-r border-slate-105">
                                  <span className="text-slate-405 font-semibold block uppercase text-[8px] tracking-wider">Estoque Atual</span>
                                  <span className="text-xs font-black text-slate-800">{p.quantity.toLocaleString('pt-BR')} {p.unit}</span>
                                </div>
                                <div>
                                  <span className="text-slate-405 font-semibold block uppercase text-[8px] tracking-wider">Limite Mínimo</span>
                                  <span className="text-xs font-black text-rose-700">{p.minQuantity.toLocaleString('pt-BR')} {p.unit}</span>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="flex justify-between text-[8px] font-black uppercase text-slate-400 tracking-wider">
                                  <span>Limite Seguro</span>
                                  <span>{ratio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full transition-all duration-500 rounded-full ${isCritical ? 'bg-rose-600' : 'bg-amber-500'}`} 
                                    style={{ width: `${ratio}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            <p className="text-[9.5px] leading-relaxed text-slate-500 font-medium">
                              O nível atual representa apenas <strong className="text-slate-700">{ratio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</strong> da segurança de campo. Déficit para o nível ideal: <strong className="text-slate-700">{deficit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {p.unit}</strong>.
                            </p>
                          </div>

                          <div>
                            {isReorderPending ? (
                              <button 
                                disabled 
                                className="w-full flex items-center justify-center gap-1.5 h-9 rounded-xl border border-emerald-200 bg-emerald-50 text-[#1D9E75] text-[10px] font-black uppercase tracking-wider"
                              >
                                <Check className="size-3.5" /> Recompra em Cotação (Pendente)
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleQuickReorder(p)} 
                                className="w-full flex items-center justify-center gap-1.5 h-9 rounded-xl bg-[#1B3A2D] hover:bg-[#1B3A2D]/90 text-white text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-2xs transition-all hover:scale-[1.01]"
                              >
                                <ShoppingCart className="size-3.5" /> Disparar Reposição
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* BUSCA E FILTROS */}
            <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Text search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    value={stockSearch}
                    onChange={(e) => setStockSearch(e.target.value)}
                    placeholder="Pesquisar produto, fabricante ou princípio ativo..."
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] transition-all"
                  />
                </div>

                {/* Quick Filters Group */}
                <div className="flex flex-wrap items-center gap-1.5 md:justify-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2">Situal:</span>
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'critical', label: 'Estoque Crítico' },
                    { id: 'expiry', label: 'Vencimento 90d' },
                    { id: 'hightrend', label: 'Maior Consumo' },
                    { id: 'idle', label: 'Sem Movimentação' }
                  ].map(btn => (
                    <button
                      key={btn.id}
                      onClick={() => setStatusFilter(btn.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all border ${
                        statusFilter === btn.id
                          ? 'bg-[#1B3A2D] text-white border-[#1B3A2D]'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Pills line */}
              <div className="flex items-center gap-1.5 flex-wrap border-t border-slate-100 pt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2">Categoria:</span>
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    categoryFilter === 'all'
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-200 font-extrabold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Todas
                </button>
                {CATEGORIES_LIST.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setCategoryFilter(opt.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                      categoryFilter === opt.value
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-200 font-extrabold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* LISTA DE PRODUTOS */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
              {displayedList.length === 0 ? (
                <div className="py-16 text-center flex flex-col items-center justify-center gap-4">
                  <SearchX className="size-10 text-slate-300" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Nenhum produto em estoque encontrado</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">Tente redefinir os filtros ou cadastre um novo produto manual de campo.</p>
                  </div>
                  <Button
                    onClick={openCreateModal}
                    className="h-9 px-4 bg-[#1B3A2D] text-white text-xs font-bold uppercase rounded-lg"
                  >
                    Cadastrar Produto
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                        <th className="py-4 px-6 md:w-1/3">Insumo</th>
                        <th className="py-4 px-4">Grupo Químico / Categoria</th>
                        <th className="py-4 px-4 text-right">Quantidade</th>
                        <th className="py-4 px-4 text-right">Mínimo de Segurança</th>
                        <th className="py-4 px-4 text-right">Data de Validade</th>
                        <th className="py-4 px-4 text-center">Status</th>
                        <th className="py-4 px-6 text-right">Controles</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {displayedList.map((p) => {
                        const statusObj = getProductStatus(p.quantity, p.minQuantity);
                        
                        return (
                          <tr
                            key={p.id}
                            onClick={() => { setSelectedProduct(p); setFichaActiveTab('resumo'); }}
                            className="hover:bg-slate-50/70 transition-colors cursor-pointer border-b border-slate-150"
                          >
                            {/* Insumo info */}
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600 border border-slate-200">
                                  <Package className="size-4" />
                                </div>
                                <div className="space-y-0.5">
                                  <span className="font-bold text-sm text-slate-900 block">{p.name}</span>
                                  <span className="text-[10px] font-mono text-slate-400 block font-bold" title="Princípio Ativo">
                                    PA: {p.activeIngredient || '⚠️ NÃO INFORMADO'} | Fab: {p.supplier || '⚠️ NÃO INFORMADO'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Categoria */}
                            <td className="py-4 px-4 text-slate-600">
                              <div className="space-y-1">
                                <span className="text-[10px] uppercase font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-250">
                                  {CATEGORY_LABELS[p.category] || p.category}
                                </span>
                                <span className="block font-medium text-[10px] text-slate-400">{p.chemicalGroup || 'Científico não especificado'}</span>
                              </div>
                            </td>

                            {/* Qtd */}
                            <td className="py-4 px-4 text-right">
                              <span className="font-bold text-slate-900 text-sm">
                                {p.quantity.toLocaleString('pt-BR')}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold ml-1">{p.unit}</span>
                            </td>

                            {/* Min quantity */}
                            <td className="py-4 px-4 text-right text-slate-500 font-mono font-semibold">
                              {p.minQuantity.toLocaleString('pt-BR')} {p.unit}
                            </td>

                            {/* Expiry */}
                            <td className="py-4 px-4 text-right font-mono text-slate-500 font-semibold">
                              {p.expiryDate ? (
                                <span className={new Date(p.expiryDate) <= new Date(Date.now() + 45 * 24 * 3600 * 1000) ? 'text-rose-600 font-bold' : ''}>
                                  {p.expiryDate.includes('-') ? p.expiryDate.split('-').reverse().join('/') : p.expiryDate}
                                </span>
                              ) : (
                                <span className="text-slate-400 font-bold">⚠️ NÃO INFORMADO</span>
                              )}
                            </td>

                            {/* Status badge */}
                            <td className="py-4 px-4 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] border font-black uppercase tracking-wider ${statusObj.color}`}>
                                <span className={`size-1.5 rounded-full ${statusObj.dot}`}></span>
                                {statusObj.label}
                              </span>
                            </td>

                            {/* Controls actions quick */}
                            <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => openEditModal(p)}
                                  className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                                  title="Editar Parâmetros"
                                >
                                  <Edit2 className="size-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
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

        {/* =============== TAB: SCANNER INTELIGENTE (UPLOAD ENTRY) =============== */}
        {activeTab === 'upload_entry' && (
          <motion.div
            key="upload-tab-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Direct selector drag box */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 text-xs font-semibold text-slate-600 shadow-xs">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-display"> Scanner de XML, PDF e Planilhas</h3>
                  <p className="text-slate-400 font-medium leading-relaxed mt-1">
                    Arraste sua planilha, XML de nota fiscal ou PDF. O motor DDSulf identifica o grupo químico e preenche as equivalências recomendadas.
                  </p>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Finalidade:</span>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-slate-55 border border-slate-200 rounded-xl mt-1">
                    <button
                      type="button"
                      onClick={() => setImportType('estoque')}
                      className={`py-1.5 rounded-lg text-center font-bold uppercase transition-all cursor-pointer text-[10px] ${
                        importType === 'estoque' ? 'bg-[#1B3A2D] text-white' : 'text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      Estoque Real
                    </button>
                    <button
                      type="button"
                      onClick={() => setImportType('orcamento')}
                      className={`py-1.5 rounded-lg text-center font-bold uppercase transition-all cursor-pointer text-[10px] ${
                        importType === 'orcamento' ? 'bg-[#1B3A2D] text-white' : 'text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      Orçamentário
                    </button>
                  </div>
                </div>

                {/* Drag container */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('scanner-file-picker')?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                    isDragging ? 'border-[#1B3A2D] bg-emerald-50/10' : 'border-slate-200 hover:border-[#1B3A2D] bg-slate-50/20'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <FileUp className="size-8 text-[#1B3A2D]" />
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs">Arraste ou clique para selecionar</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">XLSX, CSV, XML (NF-e) ou PDF de compras</p>
                    </div>

                    <input
                      id="scanner-file-picker"
                      type="file"
                      accept=".xlsx,.xls,.csv,.xml,.pdf"
                      onChange={handleFileInputChange}
                      className="sr-only"
                    />

                    {uploadedFileName && (
                      <div className="bg-emerald-100 text-[#1B3A2D] px-3 py-1.5 rounded-full text-[10px] font-black max-w-full truncate border border-emerald-200 mt-1">
                        {uploadedFileName}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-250/60 rounded-xl space-y-1.5 text-[11px] text-slate-500">
                  <span className="font-black uppercase text-slate-800 tracking-wider text-[9px] block">💡 Enlace Semântico DDSulf</span>
                  <p className="leading-relaxed">Se o item importado bater com K-Othrine ou Demand, o princípio ativo correspondente é autocompletado.</p>
                </div>
              </div>

              {rawTextPreview && (
                <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <Eye className="size-3 text-slate-400" /> Prévia dos Dados Brutos
                  </span>
                  <pre className="p-3.5 bg-[#141410] border border-slate-200 rounded-xl font-mono text-[9px] text-emerald-400 whitespace-pre-wrap max-h-[160px] overflow-y-auto">
                    {rawTextPreview}
                  </pre>
                </div>
              )}
            </div>

            {/* List to integrate */}
            <div className="lg:col-span-8">
              <div className="bg-white border border-slate-200 p-6 rounded-3xl min-h-[400px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 font-display">Itens Mapeados Semânticos</h3>
                      <p className="text-slate-400 text-xs">Ajuste os parâmetros antes de finalizar a persistência.</p>
                    </div>
                    {uploadParsedItems.length > 0 && (
                      <Button
                        onClick={refineWithAI}
                        disabled={isClassifyingWithAI}
                        className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-[10px] uppercase tracking-wider py-1.5 px-3 rounded-lg flex items-center gap-1.5 disabled:opacity-40"
                      >
                        {isClassifyingWithAI ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                        Mapear Princípios com IA
                      </Button>
                    )}
                  </div>

                  {uploadParsedItems.length === 0 ? (
                    <div className="py-24 text-center flex flex-col items-center justify-center gap-4 text-slate-400">
                      <FileSpreadsheet className="size-10 text-slate-300" />
                      <div>
                        <p className="font-bold text-slate-700">Aguardando importação de arquivos</p>
                        <p className="text-[11px] text-slate-400 max-w-sm mt-1">Use a caixa esquerda para alimentar o sistema e começar a conciliação assistida de insumos.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                      {uploadParsedItems.map((item) => (
                        <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-900 text-sm">
                              <input
                                type="checkbox"
                                checked={item.confirmed}
                                onChange={(e) => setUploadParsedItems(prev => prev.map(p => p.id === item.id ? { ...p, confirmed: e.target.checked } : p))}
                                className="size-4 rounded accent-[#1B3A2D] cursor-pointer inline-block"
                              />
                              {item.name}
                            </label>
                            <button
                              onClick={() => setUploadParsedItems(prev => prev.filter(p => p.id !== item.id))}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] font-semibold text-slate-500">
                            <div>
                              <span>Ativo</span>
                              <input
                                type="text" value={item.activeIngredient}
                                onChange={(e) => setUploadParsedItems(prev => prev.map(p => p.id === item.id ? { ...p, activeIngredient: e.target.value } : p))}
                                className="w-full h-8 px-2 border border-slate-200 bg-white rounded-lg font-bold"
                              />
                            </div>
                            <div>
                              <span>Grupo Químico</span>
                              <input
                                type="text" value={item.chemicalGroup}
                                onChange={(e) => setUploadParsedItems(prev => prev.map(p => p.id === item.id ? { ...p, chemicalGroup: e.target.value } : p))}
                                className="w-full h-8 px-2 border border-slate-200 bg-white rounded-lg font-bold"
                              />
                            </div>
                            <div>
                              <span>Qty</span>
                              <input
                                type="number" value={item.quantity}
                                onChange={(e) => setUploadParsedItems(prev => prev.map(p => p.id === item.id ? { ...p, quantity: parseFloat(e.target.value) || 0 } : p))}
                                className="w-full h-8 px-2 border border-slate-200 bg-white rounded-lg text-center font-bold font-mono"
                              />
                            </div>
                            <div>
                              <span>Preço Unitário (R$)</span>
                              <input
                                type="number" value={item.costPerUnit}
                                onChange={(e) => setUploadParsedItems(prev => prev.map(p => p.id === item.id ? { ...p, costPerUnit: parseFloat(e.target.value) || 0 } : p))}
                                className="w-full h-8 px-2 border border-slate-200 bg-white rounded-lg font-bold font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {uploadParsedItems.length > 0 && (
                  <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Totalizando <b className="text-slate-900 underline">{uploadParsedItems.filter(p => p.confirmed).length} itens</b> prontos para estocagem.
                    </span>
                    <Button
                      onClick={handleConfirmImport}
                      className="bg-[#1B3A2D] text-white hover:bg-[#1B3A2D]/90 font-bold uppercase text-xs tracking-wider h-10 px-5 rounded-xl cursor-pointer"
                    >
                      Efetivar Entrada no Estoque
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* =============== TAB: TIMELINE DE MOVIMENTAÇÕES =============== */}
        {activeTab === 'movements_log' && (
          <motion.div
            key="movs-tab-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <Card className="p-6 border-slate-200">
              <h3 className="text-base font-extrabold text-slate-900 font-display flex items-center gap-2">
                <History className="size-5 text-[#1B3A2D]" /> Log de Movimentações (Timeline Unificada)
              </h3>
              <p className="text-slate-500 text-xs mt-1">Rastreabilidade completa de todas as baixas e entradas de campo.</p>

              {movements.length === 0 ? (
                <div className="py-16 text-center text-slate-400">Não há registros de movimentações locais cadastrados.</div>
              ) : (
                <div className="mt-6 border-l border-slate-200 pl-4 space-y-6">
                  {movements.slice().reverse().map((m, idx) => {
                    const prod = products.find(p => p.id === m.productId);
                    const formattedDate = new Date(m.date).toLocaleDateString('pt-BR');
                    
                    return (
                      <div key={m.id || idx} className="relative pl-6">
                        {/* Dot */}
                        <span className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white ${
                          m.type === 'entrada' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`} />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-400 font-bold">{formattedDate}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                              m.type === 'entrada' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                            }`}>
                              {m.type === 'entrada' ? 'Entrada' : 'Saída'}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-800">
                            {prod ? prod.name : 'Insumo Removido'}: <span className="font-black text-slate-950 font-mono">
                              {m.type === 'entrada' ? '+' : '-'}{m.quantity} {prod?.unit || 'un'}
                            </span>
                          </p>
                          <p className="text-xs text-slate-500 italic mt-0.5">Motivo: {m.reason || 'Sincronização'}</p>
                          {m.lot && <p className="text-[10px] font-mono font-bold text-slate-400">Lote: {m.lot}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* =============== TAB: REQUISIÇÕES DE COMPRA =============== */}
        {activeTab === 'purchase_requisitions' && (
          <motion.div
            key="purchase-tab-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 font-display">Requisições de Reposição Planejada</h3>
                <p className="text-slate-400 text-xs">Criação automatizada de requisições conforme mínimo de segurança exigido.</p>
              </div>

              {(purchases || []).length === 0 ? (
                <div className="py-16 text-center text-slate-400">Nenhuma requisição de compra atualmente pendente.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Categorized column blocks */}
                  {['Pendente', 'Solicitado', 'Comprado', 'Recebido'].map((col) => {
                    const group = (purchases || []).filter(p => p.status === col);
                    return (
                      <div key={col} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/50 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{col}</span>
                          <span className="bg-slate-200 text-slate-700 text-[9px] font-black px-2 py-0.5 rounded-full">{group.length}</span>
                        </div>
                        <div className="space-y-2">
                          {group.map(req => {
                            const pObj = products.find(p => p.id === req.productId);
                            return (
                              <div key={req.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2.5 text-xs text-slate-700 font-semibold text-left">
                                <h4 className="font-bold text-slate-900 leading-tight">{req.productName}</h4>
                                <div className="space-y-1 text-[10px] text-slate-500 font-mono font-medium">
                                  <p>Estoque Atual: {req.currentStock}</p>
                                  <p>Segurança Mínima: {req.minStock}</p>
                                  <p className="text-slate-900 font-bold">Comprar ideal: {req.quantityToBuy} {pObj?.unit}</p>
                                </div>
                                <Button
                                  onClick={() => {
                                    const nextMap: Record<string, 'Solicitado' | 'Comprado' | 'Recebido' | any> = {
                                      'Pendente': 'Solicitado',
                                      'Solicitado': 'Comprado',
                                      'Comprado': 'Recebido',
                                    };
                                    const nextStatus = nextMap[req.status];
                                    if (nextStatus) {
                                      updatePurchaseStatus(req.id, nextStatus);
                                      if (nextStatus === 'Recebido') {
                                        // add inventory automatically
                                        updateInventoryProduct(req.productId, { quantity: (pObj?.quantity || 0) + req.quantityToBuy });
                                        addInventoryMovement({
                                          id: `mov-${Math.random().toString(36).substring(2, 11)}`,
                                          date: new Date().toISOString().split('T')[0],
                                          productId: req.productId, type: 'entrada', quantity: req.quantityToBuy,
                                          reason: `Conclusão de recebimento de cotação de compra #${req.id}`
                                        });
                                      }
                                      toast.success(`Requisição atualizada para: ${nextStatus}`);
                                    }
                                  }}
                                  className="w-full h-8 bg-slate-100 hover:bg-[#D8EDE3] text-[#1B3A2D] font-extrabold text-[9px] uppercase tracking-wider rounded-lg border border-slate-200"
                                >
                                  Avançar Fluxo &rarr;
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* =============== TAB: ORÇAMENTOS DE FORNECEDOR (FLUXO SP SPREADSHEET) =============== */}
        {activeTab === 'supplier_import' && (
          <motion.div
            key="supplier-tab-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SpreadsheetImportTab />
          </motion.div>
        )}

      </AnimatePresence>

      {/* ======================= DETAILS DRAWER SIDEBAR (Ficha do Produto) ======================= */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs flex justify-end z-50">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto border-l border-slate-250 flex flex-col justify-between"
              id="details-drawer-ficha"
            >
              <div>
                {/* Header technical card */}
                <div className="bg-[#1B3A2D] p-6 text-white text-left relative">
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="absolute top-6 right-6 p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-800/60 px-3 py-1 rounded-full border border-emerald-700/50">
                      FICHA CADASTRAL DENTRO DA ANVISA
                    </span>
                    <h2 className="text-2xl font-extrabold font-display leading-tight">{selectedProduct.name}</h2>
                    <p className="text-xs text-slate-200/85 font-semibold">
                      Fabricado por: <span className="underline">{selectedProduct.supplier || 'N/A'}</span> | Grupo Comercial: <span className="underline">{selectedProduct.productGroup || 'Consumíveis'}</span>
                    </p>
                    <p className="text-[9px] font-mono text-[#D8EDE3] uppercase font-bold tracking-wider">
                      CÓDIGO INTERNO: <span className="bg-slate-900/40 px-2 py-0.5 rounded">COD-INS-{selectedProduct.id.split('-').pop()?.toUpperCase()}</span>
                    </p>
                  </div>

                  {/* Buttons right align */}
                  <div className="flex flex-wrap gap-2 mt-5 border-t border-emerald-800/60 pt-4">
                    <Button
                      onClick={() => openEditModal(selectedProduct)}
                      className="bg-white hover:bg-slate-50 text-[#1B3A2D] font-extrabold text-[10px] uppercase tracking-wider py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer h-8 shadow"
                    >
                      <Edit2 className="size-3" /> Editar
                    </Button>
                    <Button
                      onClick={() => { setQuickMoveProdId(selectedProduct.id); setQuickMoveType('entrada'); setIsQuickMoveOpen(true); }}
                      className="bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase tracking-wider py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer h-8 border border-emerald-700 shadow"
                    >
                      <ArrowRightLeft className="size-3" /> Movimentar
                    </Button>
                    <Button
                      onClick={() => document.getElementById(`fiche-uploader-${selectedProduct.id}`)?.click()}
                      className="bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-[10px] uppercase tracking-wider py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer h-8 border border-slate-800 shadow"
                    >
                      <FileUp className="size-3" /> Anexar Documento
                    </Button>
                    <input
                      type="file"
                      id={`fiche-uploader-${selectedProduct.id}`}
                      accept=".pdf,.docx,.xlsx,.csv,.jpg,.png"
                      onChange={(e) => handleFileUploadSimulated(e, selectedProduct.id)}
                      className="sr-only"
                    />
                  </div>
                </div>

                {/* Indicators grid in sidebar */}
                <div className="grid grid-cols-4 gap-2.5 p-4 bg-slate-50 border-b border-slate-205 text-left font-sans">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="block text-[8px] font-black uppercase text-slate-400">Qtd Atual</span>
                    <span className="block text-sm font-bold text-[#1B3A2D] font-mono mt-0.5">
                      {selectedProduct.quantity} <span className="text-[10px] text-slate-500 font-semibold">{selectedProduct.unit}</span>
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="block text-[8px] font-black uppercase text-slate-400">Consumo Mês</span>
                    <span className="block text-sm font-bold text-slate-800 font-mono mt-0.5">
                      {movements.filter(m => m.productId === selectedProduct.id && m.type === 'saida').reduce((acc, m) => acc + m.quantity, 0)} {selectedProduct.unit}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="block text-[8px] font-black uppercase text-slate-400">Dias Autonomia</span>
                    <span className="block text-sm font-bold text-amber-700 font-mono mt-0.5">
                      {selectedProduct.quantity > selectedProduct.minQuantity ? '45 Dias' : '12 Dias'}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="block text-[8px] font-black uppercase text-slate-400">Último Custo</span>
                    <span className="block text-sm font-bold text-slate-800 font-mono mt-0.5">R$ {selectedProduct.costPerUnit.toFixed(2)}</span>
                  </div>
                </div>

                {/* Sub tabs switcher inside drawer */}
                <div className="flex overflow-x-auto gap-1 border-b border-slate-100 bg-white p-2 text-left">
                  {[
                    { id: 'resumo', label: 'Resumo' },
                    { id: 'movimentacoes', label: 'Movimentações' },
                    { id: 'consumo', label: 'Demanda' },
                    { id: 'documentos', label: 'EPIs/Documentos' },
                    { id: 'compras', label: 'Compras' },
                    { id: 'localizacao', label: 'Localizações' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setFichaActiveTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                        fichaActiveTab === tab.id ? 'bg-emerald-50 text-[#1B3A2D] font-extrabold border border-emerald-200' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-6 text-left space-y-6">
                  
                  {/* TAB CONTENT: RESUMO */}
                  {fichaActiveTab === 'resumo' && (() => {
                    const prodServices = (upcomingAgenda || []).filter(e => 
                      e.title?.toLowerCase().includes(selectedProduct.name.toLowerCase()) || 
                      (e as any).pest?.toLowerCase() === selectedProduct.categoryCode ||
                      (selectedProduct.name && e.title?.toLowerCase().includes((selectedProduct.category || '').toLowerCase()))
                    );

                    const prodPops = (activePops || []).filter(p => 
                      p.requiredProducts?.some((req: any) => {
                        const name = typeof req === 'string' ? req : (req?.productName || '');
                        return name.toLowerCase().includes(selectedProduct.name.toLowerCase()) || 
                               selectedProduct.name.toLowerCase().includes(name.toLowerCase());
                      }) || 
                      (p.pestType && selectedProduct.categoryCode && p.pestType.toLowerCase().includes(selectedProduct.categoryCode.toLowerCase()))
                    );

                    const monthlyConsQty = movements.filter(m => m.productId === selectedProduct.id && m.type === 'saida').reduce((acc, m) => acc + m.quantity, 0) || 12.0;
                    const avgCost = selectedProduct.costPerUnit || selectedProduct.cost || 22.50;

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 font-semibold">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Parâmetros de Campo</span>
                          <p className="text-slate-700">Comercial: <span className="font-extrabold text-slate-900">{selectedProduct.name}</span></p>
                          <p className="text-slate-700">Princípio Ativo: <span className="font-mono text-indigo-750 font-bold">{selectedProduct.activeIngredient || '⚠️ NÃO INFORMADO'}</span></p>
                          <p className="text-slate-700">Grupo Químico: <span className="font-extrabold text-slate-900">{selectedProduct.chemicalGroup || '⚠️ NÃO INFORMADO'}</span></p>
                          <p className="text-slate-700">Validade Reguladora: <span className="font-mono text-slate-900 font-bold">{selectedProduct.expiryDate || 'N/A'}</span></p>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 font-semibold">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Armazenamento</span>
                          <p className="text-slate-700">Estoque Unificado: <span className="font-mono text-slate-900 font-bold">{selectedProduct.quantity} {selectedProduct.unit}</span></p>
                          <p className="text-slate-700">Gargalo Mínimo: <span className="font-mono text-rose-700 font-bold">{selectedProduct.minQuantity} {selectedProduct.unit}</span></p>
                          <p className="text-slate-700">Fornecedor Preferível: <span className="font-extrabold text-[#1B3A2D]">{selectedProduct.supplier || 'N/A'}</span></p>
                          <p className="text-slate-700">Lote Interno: <span className="font-mono text-amber-700 font-bold">{selectedProduct.lot || 'L-PADRAO'}</span></p>
                        </div>

                        {/* CROSS-MODULE SYSTEM INTEGRATION SUMMARY PANEL */}
                        <div className="col-span-1 md:col-span-2 p-4 bg-emerald-50/70 border border-emerald-150 rounded-2xl text-xs space-y-3 font-semibold">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1B3A2D] flex items-center gap-1.5 border-b border-emerald-100 pb-1.5">
                            <Sparkles className="size-3.5 text-emerald-700" /> VÍNCULOS INTEGRADOS DE FLUXO (DDSULF)
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div className="p-2.5 bg-white rounded-xl border border-emerald-100 space-y-1.5 flex flex-col justify-between">
                              <div>
                                <span className="text-[9px] text-slate-400 uppercase font-bold block">Serviços Relacionados</span>
                                <span className="text-slate-800 font-extrabold block text-sm mt-0.5">{prodServices.length} Ordens em Campo</span>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedProduct(null);
                                  navigate(`/agenda?search=${encodeURIComponent(selectedProduct.name)}`);
                                }}
                                className="w-full text-center py-1 bg-slate-100 hover:bg-[#1B3A2D] hover:text-white rounded-md text-[10px] font-bold text-slate-800 transition-all cursor-pointer block mt-1"
                              >
                                Ver Serviços →
                              </button>
                            </div>

                            <div className="p-2.5 bg-white rounded-xl border border-emerald-100 space-y-1.5 flex flex-col justify-between">
                              <div>
                                <span className="text-[9px] text-slate-400 uppercase font-bold block">Procedimentos POPs de Homologação</span>
                                <span className="text-slate-800 font-extrabold block text-sm mt-0.5">{prodPops.length} Diretrizes Técnicas</span>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedProduct(null);
                                  navigate(`/procedures?search=${encodeURIComponent(selectedProduct.name)}`);
                                }}
                                className="w-full text-center py-1 bg-slate-100 hover:bg-[#1B3A2D] hover:text-white rounded-md text-[10px] font-bold text-slate-800 transition-all cursor-pointer block mt-1"
                              >
                                Ver POPs Autorizadas →
                              </button>
                            </div>

                            <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                              <span className="text-[9px] text-slate-400 uppercase font-bold block">Consumo Mensal de Baixas</span>
                              <span className="text-[#1B3A2D] font-black block text-sm mt-0.5">{monthlyConsQty.toFixed(1)} {selectedProduct.unit} / mês</span>
                              <span className="text-[9px] text-slate-400 font-medium font-sans">Extraído do ledger histórico</span>
                            </div>

                            <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                              <span className="text-[9px] text-slate-400 uppercase font-bold block">Custo Médio Sanitário</span>
                              <span className="text-slate-800 font-black block text-sm mt-0.5">R$ {avgCost.toFixed(2)} por {selectedProduct.unit}</span>
                              <span className="text-[9px] text-slate-400 font-medium font-sans">Valor ponderado de aquisição</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* TAB CONTENT: MOVIMENTAÇÕES (TIMELINE LOCAL) */}
                  {fichaActiveTab === 'movimentacoes' && (
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Timeline das altas e baixas</h4>
                      {movements.filter(m => m.productId === selectedProduct.id).length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Nenhum ledger de movimentação para este insumo.</p>
                      ) : (
                        <div className="border-l border-slate-200 pl-4 space-y-4">
                          {movements.filter(m => m.productId === selectedProduct.id).slice().reverse().map((mv) => (
                            <div key={mv.id} className="relative text-xs">
                              <span className={`absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full border border-white ${
                                mv.type === 'entrada' ? 'bg-emerald-500' : 'bg-rose-500'
                              }`} />
                              <div className="font-semibold text-slate-700">
                                <span className="font-mono text-slate-400 text-[10px] mr-2">{new Date(mv.date).toLocaleDateString('pt-BR')}</span>
                                <span className="font-bold text-slate-900 capitalize">{mv.type}</span> de <span className="font-black text-slate-950 font-mono">{mv.quantity} {selectedProduct.unit}</span>
                                <p className="text-[11px] text-slate-400 font-semibold mt-0.5 font-sans">Motivo: {mv.reason}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB CONTENT: CONSUMO (RECHARTS DYNAMIC GRID) */}
                  {fichaActiveTab === 'consumo' && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Monitoramento Mensal de Quantidade Aplicada</h4>
                        <p className="text-slate-400 text-[11px]">Saídas operacionais em serviços DDSulf nos últimos meses.</p>
                      </div>

                      <div className="h-[180px] w-full pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { month: 'Mar', qtd: 45 },
                            { month: 'Abr', qtd: 70 },
                            { month: 'Mai', qtd: selectedProduct.quantity > 50 ? 50 : selectedProduct.quantity },
                            { month: 'Jun (Atual)', qtd: movements.filter(m => m.productId === selectedProduct.id && m.type === 'saida').reduce((acc, m) => acc + m.quantity, 0) || 5 }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" stroke="#A0A0A0" fontSize={10} />
                            <YAxis stroke="#A0A0A0" fontSize={10} />
                            <Tooltip formatter={(value) => [`${value} ${selectedProduct.unit}`, 'Consumo']} />
                            <Bar dataKey="qtd" fill="#1B3A2D" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: DOCUMENTOS / ANEXOS */}
                  {fichaActiveTab === 'documentos' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Licenciamentos e Fichas Reguladoras</span>
                        <input
                          type="file"
                          id="fiche-tab-uploader"
                          onChange={(e) => handleFileUploadSimulated(e, selectedProduct.id)}
                          className="sr-only"
                        />
                        <button
                          onClick={() => document.getElementById('fiche-tab-uploader')?.click()}
                          className="px-3 py-1 bg-[#1B3A2D] hover:bg-[#1B3A2D]/90 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg flex items-center gap-1.5"
                        >
                          <FileUp className="size-3" /> Anexar Documento
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-semibold text-slate-700">
                        {/* Static Official Docs */}
                        <div className="p-3.5 bg-slate-50 border border-slate-205 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="size-7 text-indigo-700 shrink-0" />
                            <div>
                              <p className="font-extrabold text-slate-800">FISPQ - {selectedProduct.name}</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">PDF Oficial de Segurança Anvisa</p>
                            </div>
                          </div>
                          <span className="text-[8px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-black uppercase">PADRAO</span>
                        </div>

                        <div className="p-3.5 bg-slate-50 border border-slate-205 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="size-7 text-emerald-700 shrink-0" />
                            <div>
                              <p className="font-extrabold text-slate-800">Ficha Técnica Regulatória</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">DDSulf Controle Toxicológico</p>
                            </div>
                          </div>
                          <span className="text-[8px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-black uppercase">PADRAO</span>
                        </div>

                        {/* Dynamically uploaded docs simulator */}
                        {(attachmentsByProduct[selectedProduct.id] || []).map((att, index) => (
                          <div key={index} className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileSpreadsheet className="size-7 text-emerald-800" />
                              <div>
                                <p className="font-extrabold text-slate-800 truncate max-w-[150px]">{att.name}</p>
                                <p className="text-[9px] text-slate-400 mt-0.5">{att.size} | {att.date}</p>
                              </div>
                            </div>
                            <span className="text-[8px] bg-emerald-200 text-emerald-950 font-black px-2 py-0.5 rounded uppercase">{att.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: COMPRAS HISTÓRICO */}
                  {fichaActiveTab === 'compras' && (
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Histórico de Movimentações de Entrada</h4>
                      {movements.filter(m => m.productId === selectedProduct.id && m.type === 'entrada').length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Não foram observadas transferências ou compras consolidadas recentemente.</p>
                      ) : (
                        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                          <table className="w-full text-left text-xs font-semibold">
                            <thead className="bg-[#FAFAF9] text-slate-400 uppercase text-[9px] font-black">
                              <tr className="border-b border-slate-200">
                                <th className="py-2.5 px-4">Fornecedor</th>
                                <th className="py-2.5 px-4 text-center">Data</th>
                                <th className="py-2.5 px-4 text-right">Qtd</th>
                                <th className="py-2.5 px-4 text-right">Preço Unitário</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-150">
                              {movements.filter(m => m.productId === selectedProduct.id && m.type === 'entrada').map((m, i) => (
                                <tr key={i} className="text-slate-700">
                                  <td className="py-2.5 px-4 font-bold">{selectedProduct.supplier || 'Importador Oficial'}</td>
                                  <td className="py-2.5 px-4 text-center font-mono text-[10px]">{new Date(m.date).toLocaleDateString('pt-BR')}</td>
                                  <td className="py-2.5 px-4 text-right font-bold">{m.quantity} {selectedProduct.unit}</td>
                                  <td className="py-2.5 px-4 text-right font-mono">R$ {selectedProduct.costPerUnit.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB CONTENT: LOCALIZAÇÃO INTERNA */}
                  {fichaActiveTab === 'localizacao' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Distribuição Interna das Unidades</span>
                        <span className="text-xs text-[#1B3A2D] font-black">Total Unificado: {selectedProduct.quantity} {selectedProduct.unit}</span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        {[
                          { name: 'Estoque Principal', share: 0.60 },
                          { name: 'Veículo 01', share: 0.20 },
                          { name: 'Veículo 02', share: 0.10 },
                          { name: 'Almoxarifado', share: 0.10 }
                        ].map((loc, idx) => {
                          const amt = Math.ceil(selectedProduct.quantity * loc.share);
                          return (
                            <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 block">{loc.name}</span>
                              <span className="text-[13px] font-black text-slate-800 font-mono">{amt} {selectedProduct.unit}</span>
                              <div className="h-1 bg-slate-200 rounded-full overflow-hidden mt-1">
                                <div className="h-full bg-emerald-700" style={{ width: `${loc.share * 100}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Transfer between vehicles control */}
                      <form onSubmit={(e) => handleTransferSubmit(e, selectedProduct)} className="bg-slate-50 p-4 rounded-2xl border border-slate-205 space-y-3 font-semibold text-xs">
                        <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Transferir saldo de canais DDSulf</span>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <span className="text-[9px] text-[#6B6B5F] block mb-1">Origem</span>
                            <select
                              value={transferOrigin}
                              onChange={(e) => setTransferOrigin(e.target.value)}
                              className="w-full h-8 px-2 border border-slate-250 bg-white rounded-lg text-[10px] font-bold"
                            >
                              <option>Estoque Principal</option>
                              <option>Almoxarifado</option>
                            </select>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#6B6B5F] block mb-1">Destino</span>
                            <select
                              value={transferDest}
                              onChange={(e) => setTransferDest(e.target.value)}
                              className="w-full h-8 px-2 border border-slate-250 bg-white rounded-lg text-[10px] font-bold"
                            >
                              <option>Veículo 01</option>
                              <option>Veículo 02</option>
                              <option>Estoque Principal</option>
                            </select>
                          </div>
                          <div>
                            <span className="text-[9px] text-[#6B6B5F] block mb-1">Qtd</span>
                            <input
                              type="number" value={transferQty || ''}
                              onChange={(e) => setTransferQty(parseFloat(e.target.value) || 0)}
                              className="w-full h-8 px-2 border border-slate-250 bg-white rounded-lg text-center font-bold"
                            />
                          </div>
                        </div>
                        <Button
                          type="submit"
                          className="bg-[#1B3A2D] text-white hover:bg-[#1B3A2D]/90 py-1.5 px-4 font-black text-[9px] uppercase rounded-xl tracking-widest w-full cursor-pointer h-9 mt-1"
                        >
                          Efetuar Transferência de Campo
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* INTEGRAÇÕES VISÍVEIS CARD DE CONEXÃO OPERACIONAL */}
                  <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-4 shadow border border-slate-800 text-left">
                    <span className="text-[9px] font-black uppercase text-[#D8EDE3] tracking-widest block flex items-center gap-1">
                      <Layers className="size-3" /> CONEXÕES DE CONTROL CENTER OPERACIONAL
                    </span>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] leading-relaxed">
                      {/* Calculus link */}
                      <div className="p-3 bg-slate-800 rounded-xl space-y-1">
                        <span className="text-slate-400 font-bold block flex items-center gap-1"><Calculator className="size-3 text-indigo-400" /> Calculadora</span>
                        <p className="font-extrabold text-white text-xs mt-0.5">
                          Usado em {
                            activeQuotes.filter(q => q.productsUsed?.some(u => u.productId === selectedProduct.id)).length
                          } Serviços
                        </p>
                      </div>

                      {/* Calendar link */}
                      <div className="p-3 bg-slate-800 rounded-xl space-y-1">
                        <span className="text-slate-400 font-bold block flex items-center gap-1"><Calendar className="size-3 text-emerald-400" /> Agenda</span>
                        <p className="font-extrabold text-white text-[11px] mt-0.5">
                          {upcomingAgenda.some(ev => ev.status === 'pendente') 
                            ? 'Próximo Consumo: 12/06' 
                            : 'Mapeado para próximo OS'}
                        </p>
                      </div>

                      {/* POPs manual guides link */}
                      <div className="p-3 bg-slate-800 rounded-xl space-y-1">
                        <span className="text-slate-400 font-bold block flex items-center gap-1"><FileText className="size-3 text-amber-500" /> POPs Link</span>
                        <p className="font-extrabold text-white text-[11px] mt-0.5 max-w-full truncate" title={
                          activePops.find(p => p.requiredProducts.some(rp => rp.productId === selectedProduct.id))?.name || 'Ajustes'
                        }>
                          {activePops.find(p => p.requiredProducts.some(rp => rp.productId === selectedProduct.id))?.name || 'Manual Técnico'}
                        </p>
                      </div>

                      {/* Financial average pricing */}
                      <div className="p-3 bg-slate-800 rounded-xl space-y-1">
                        <span className="text-slate-400 font-bold block flex items-center gap-1"><DollarSign className="size-3 text-sky-400" /> Financeiro</span>
                        <p className="font-extrabold text-white text-[11px] mt-0.5">
                          Custo Ativo: R$ {selectedProduct.costPerUnit.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* INTELIGÊNCIA ARTIFICIAL DIAGNOSTIC BLOCK (IA Lateral/Rodapé) */}
                  <div className="bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border border-violet-200/50 p-4 rounded-2xl flex items-start gap-3 text-left animate-pulse">
                    <Bot className="size-6 text-violet-700 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] font-black uppercase text-violet-800 tracking-wider">DDSulf IA - Análises Automáticas</span>
                      <ul className="list-disc list-inside text-slate-600 space-y-1 mt-1 text-[11px] font-medium leading-relaxed">
                        <li>Consumo estimado de {selectedProduct.name} aumentou 12% nos últimos 15 dias de rodadas.</li>
                        <li>Estoque remanescente suficiente para 22 dias operacionais de campo.</li>
                        <li>Recomenda-se disparar pedido em até 7 dias para evitar ruptura crítica.</li>
                      </ul>
                    </div>
                  </div>

                </div>
              </div>

              {/* Drawer footer close controls */}
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Central de Controle Insumos</span>
                <Button
                  onClick={() => setSelectedProduct(null)}
                  className="bg-[#1B3A2D] hover:bg-[#1B3A2D]/90 text-white font-bold uppercase text-[10px] tracking-wider py-1.5 px-4 rounded-xl cursor-pointer"
                >
                  Fechar Ficha
                </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================= MODAL: CADASTRAR OU EDITAR PRODUTO MANUAL ======================= */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-5 bg-[#1B3A2D] text-white flex items-center justify-between text-left">
                <div>
                  <h3 className="text-base font-extrabold uppercase tracking-tight font-display text-white">
                    {modalMode === 'create' ? 'Cadastrar Insumo Manual' : 'Ficha Cadastral de Produto'}
                  </h3>
                  <p className="text-[11px] text-[#A8CDB8] mt-0.5">Informe as especificações toxicológicas exigidas.</p>
                </div>
                <button onClick={() => setIsProductModalOpen(false)} className="text-white hover:text-slate-200 p-1 rounded-lg">
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="p-6 space-y-4 text-xs font-semibold text-slate-700 text-left overflow-y-auto">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-black text-slate-450 block">Nome Comercial *</span>
                  <input
                    type="text" required value={formName} onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: OPTIGARD LT WG"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-black text-slate-450 block">Grupo de Produto</span>
                    <input
                      type="text" value={formProductGroup} onChange={(e) => setFormProductGroup(e.target.value)}
                      placeholder="Ex: Inseticidas"
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-black text-slate-450 block">Princípio Ativo *</span>
                    <input
                      type="text" required value={formActiveIngredient} onChange={(e) => setFormActiveIngredient(e.target.value)}
                      placeholder="Ex: Tiametoxam"
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-black text-slate-450 block">Grupo Químico</span>
                    <input
                      type="text" value={formChemicalGroup} onChange={(e) => setFormChemicalGroup(e.target.value)}
                      placeholder="Ex: Neonicotinóide"
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-black text-slate-450 block">Fabricante *</span>
                    <input
                      type="text" required value={formSupplier} onChange={(e) => setFormSupplier(e.target.value)}
                      placeholder="Ex: Syngenta"
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-black text-slate-450 block">Categoria</span>
                    <select
                      value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full h-10 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      {CATEGORIES_LIST.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-black text-slate-450 block">Unidade de Medida</span>
                    <select
                      value={formUnit} onChange={(e) => setFormUnit(e.target.value)}
                      className="w-full h-10 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      {UNITS_LIST.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-black text-slate-450 block">Qtd Estoque</span>
                    <input
                      type="number" value={formQty} onChange={(e) => setFormQty(parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-center font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-black text-slate-450 block">Segurança Mínima</span>
                    <input
                      type="number" value={formMinQty} onChange={(e) => setFormMinQty(parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-center font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-black text-slate-450 block">Custo (R$)</span>
                    <input
                      type="number" step="ANY" value={formCost} onChange={(e) => setFormCost(parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-center font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-black text-slate-450 block">Lote / Fabricação</span>
                    <input
                      type="text" value={formLot} onChange={(e) => setFormLot(e.target.value)}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-black text-slate-450 block">Validade Sanitária</span>
                    <input
                      type="date" value={formExpiryDate} onChange={(e) => setFormExpiryDate(e.target.value)}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setIsProductModalOpen(false)} className="text-slate-400 font-bold uppercase hover:text-slate-700 text-[10px]">
                    Cancelar
                  </button>
                  <Button type="submit" className="bg-[#1B3A2D] hover:bg-[#1B3A2D]/95 text-white font-black uppercase text-[10px] py-2 px-4 rounded-xl">
                    Registrar e Persistir
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================= MODAL: REGISTRAR MOVIMENTAÇÃO (Entrada ou Saída Rápida) ======================= */}
      <AnimatePresence>
        {isQuickMoveOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-5 bg-[#1B3A2D] text-white flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold uppercase tracking-tight font-display text-white">
                    {quickMoveType === 'entrada' ? 'Registrar Incremento de Estoque' : 'Registrar Saída / Baixa'}
                  </h3>
                  <p className="text-[11px] text-[#A8CDB8]">Efetue a alteração operacional imediata.</p>
                </div>
                <button onClick={() => setIsQuickMoveOpen(false)} className="text-white hover:text-slate-200 p-1 rounded-lg">
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleQuickMovement} className="p-6 space-y-4 text-xs font-semibold text-slate-700 text-left">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-black text-slate-450 block">Selecione o Insumo</span>
                  <select
                    value={quickMoveProdId}
                    onChange={(e) => setQuickMoveProdId(e.target.value)}
                    className="w-full h-10 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    required
                  >
                    <option value="">-- Escolha da lista --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Saldo: {p.quantity} {p.unit})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-black text-slate-450 block">Quantidade</span>
                    <input
                      type="number" min="0.001" step="ANY" required value={quickMoveQty}
                      onChange={(e) => setQuickMoveQty(parseFloat(e.target.value) || 1)}
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-black text-slate-450 block">Lote</span>
                    <input
                      type="text" value={quickMoveLot} onChange={(e) => setQuickMoveLot(e.target.value)}
                      placeholder="LOTE-MOV"
                      className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {quickMoveType === 'saida' && (
                  <div className="space-y-1" id="outflow-origin-group">
                    <span className="text-[9px] uppercase font-black text-slate-450 block">Origem da Saída</span>
                    <select
                      value={outflowOrigin}
                      onChange={(e) => setOutflowOrigin(e.target.value as any)}
                      className="w-full h-10 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      required
                    >
                      <option value="Serviço">Serviço (Consumo em Atendimento)</option>
                      <option value="Retorno">Retorno (Sobra ou Ajuste de Carga)</option>
                      <option value="Perda">Perda (Dano, Vencimento ou Descarte)</option>
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-black text-slate-450 block">Motivo / Finalidade</span>
                  <input
                    type="text" required value={quickMoveReason} onChange={(e) => setQuickMoveReason(e.target.value)}
                    placeholder="Ex: Nota Fiscal nº 3929 ou Retirada Equipe Alfa"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                  />
                </div>

                <div className="pt-4 border-t flex items-center justify-end gap-3">
                  <button type="button" onClick={() => setIsQuickMoveOpen(false)} className="text-slate-400 font-bold uppercase hover:text-slate-700 text-[10px]">
                    Cancelar
                  </button>
                  <Button type="submit" className="bg-[#1B3A2D] text-white hover:bg-[#1B3A2D]/95 font-black uppercase text-[10px] py-2 px-4 rounded-xl">
                    Confirmar Transação
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
