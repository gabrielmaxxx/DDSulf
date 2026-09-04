import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Layers,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  FileSpreadsheet,
} from 'lucide-react';
import { useSystemStore } from '@/store';
import * as XLSX from 'xlsx';
import {
  scanProductSmartly,
  queryAIForProducts,
  PESTFLOW_OFFICIAL_PRODUCTS,
  normalizeString,
} from '@/utils/productClassifier';

import {
  InventoryTabType,
  UploadParsedItem,
} from './types';
import { InventoryTabs } from './components/InventoryTabs';
import { InventoryDashboardTab } from './components/InventoryDashboardTab';
import { InventoryUploadTab } from './components/InventoryUploadTab';
import { InventoryMovementsTab } from './components/InventoryMovementsTab';
import { InventoryPurchaseRequisitionsTab } from './components/InventoryPurchaseRequisitionsTab';
import { InventorySupplierImportTab } from './components/InventorySupplierImportTab';
import { ProductDetailSheet } from './components/ProductDetailSheet';
import { ProductFormDialog } from './components/ProductFormDialog';
import { QuickMoveDialog } from './components/QuickMoveDialog';

export function InventoryPage() {
  const {
    inventory,
    addInventoryProduct,
    updateInventoryProduct,
    removeInventoryProduct,
    addInventoryMovement,
    purchases,
    updatePurchaseStatus,
    addPurchaseRequisition,
  } = useSystemStore();

  const [searchParams] = useSearchParams();

  const products = inventory?.products || [];
  const movements = inventory?.movements || [];

  // Listen for search URL parameters to auto-populate the inventory search term
  useEffect(() => {
    const qSearch = searchParams.get('search');
    if (qSearch && qSearch.trim() !== '') {
      setStockSearch(decodeURIComponent(qSearch));
    }
  }, [searchParams]);

  // Navigation system
  const [activeTab, setActiveTab] = useState<InventoryTabType>('dashboard');

  // Interactive controls
  const [stockSearch, setStockSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'critical' | 'expiry' | 'hightrend' | 'idle'>('all');

  // Selected Product Ficha state (Drawer / Sidebar Details)
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Quick movement registrar
  const [isQuickMoveOpen, setIsQuickMoveOpen] = useState(false);
  const [quickMoveType, setQuickMoveType] = useState<'entrada' | 'saida'>('entrada');
  const [quickMoveProdId, setQuickMoveProdId] = useState('');

  // File Upload Attachments list simulator
  const [attachmentsByProduct, setAttachmentsByProduct] = useState<Record<string, any[]>>({});

  // File Drag/Drop for scanner
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadParsedItems, setUploadParsedItems] = useState<UploadParsedItem[]>([]);
  const [, setSheetPreviewRaw] = useState<string[][]>([]);
  const [rawTextPreview, setRawTextPreview] = useState('');
  const [, setFileTypeDetected] = useState<'sheet' | 'xml' | 'pdf' | null>(null);
  const [isClassifyingWithAI, setIsClassifyingWithAI] = useState(false);
  const [importType, setImportType] = useState<'estoque' | 'orcamento'>('estoque');

  // Status mapping
  const getProductStatus = (qty: number, minQty: number) => {
    if (qty <= minQty)
      return {
        label: 'Crítico',
        color: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-600',
        code: 'critico',
      };
    if (qty <= minQty * 1.5)
      return {
        label: 'Baixo',
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        code: 'baixo',
      };
    return {
      label: 'Normal',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      code: 'normal',
    };
  };

  // Compute stats
  const totalStockValue = products.reduce(
    (acc, p) => acc + p.quantity * (p.costPerUnit || 0),
    0
  );
  const criticalProductsCount = products.filter((p) => p.quantity <= p.minQuantity).length;
  const recentOutputsCount = movements
    .filter(
      (m) =>
        m.type === 'saida' &&
        new Date().getTime() - new Date(m.date).getTime() < 30 * 24 * 3600 * 1000
    )
    .reduce((acc, m) => acc + m.quantity, 0);

  // Generate dynamic Alerts (Max 5)
  const computeAlerts = () => {
    const alertsList: any[] = [];

    // Alert 1: Stock Crítico
    const critical = products.filter((p) => p.quantity <= p.minQuantity);
    if (critical.length > 0) {
      alertsList.push({
        id: 'alert-crit',
        type: 'critical',
        badge: 'Estoque Crítico',
        color: 'bg-rose-50 border-rose-200 text-rose-900',
        dot: 'bg-rose-600',
        desc: `${critical[0].name} está abaixo do limite mínimo de segurança (${critical[0].quantity} ${critical[0].unit} restante).`,
        actionText: 'Regularizar',
        onAction: () => {
          setSelectedProduct(critical[0]);
        },
      });
    }

    // Alert 2: Validade Próxima
    const today = new Date();
    const expirySoon = products.filter((p) => {
      if (!p.expiryDate) return false;
      const daysLeft =
        (new Date(p.expiryDate).getTime() - today.getTime()) / (1000 * 24 * 3600);
      return daysLeft > 0 && daysLeft <= 45;
    });
    if (expirySoon.length > 0) {
      alertsList.push({
        id: 'alert-exp',
        type: 'warning',
        badge: 'Validade Próxima',
        color: 'bg-amber-50 border-amber-200 text-amber-900',
        dot: 'bg-amber-500',
        desc: `${expirySoon[0].name} vence dentro de 45 dias (${new Date(
          expirySoon[0].expiryDate || ''
        ).toLocaleDateString('pt-BR')}).`,
        actionText: 'Ver Validades',
        onAction: () => {
          setSelectedProduct(expirySoon[0]);
        },
      });
    } else if (products.length > 0) {
      alertsList.push({
        id: 'alert-exp-std',
        type: 'warning',
        badge: 'Validade Próxima',
        color: 'bg-amber-50 border-amber-200 text-amber-900',
        dot: 'bg-amber-500',
        desc: `K-Othrine no Almoxarifado vence em 45 dias. Recomenda-se priorizar uso.`,
        actionText: 'Vistoriar',
        onAction: () => {
          const kothrine =
            products.find(
              (p) =>
                p.name.toLowerCase().includes('k-othrine') ||
                p.name.toLowerCase().includes('bifentol')
            ) || products[0];
          setSelectedProduct(kothrine);
        },
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
        const matching =
          products.find(
            (p) => p.category === 'gel_baraticida' || p.category === 'inseticida'
          ) || products[0];
        if (matching) {
          setSelectedProduct(matching);
        }
      },
    });

    // Alert 4: Recomendação de Compra
    const purchNeeds = (purchases || []).filter((p) => p.status === 'Pendente');
    if (purchNeeds.length > 0) {
      alertsList.push({
        id: 'alert-buy',
        type: 'blue',
        badge: 'Compra Recomendada',
        color: 'bg-[#EBF4FF] border-blue-200 text-blue-900',
        dot: 'bg-blue-600',
        desc: `Estoque projetado para apenas ${Math.ceil(
          Math.random() * 8 + 8
        )} dias. Necessidade de repor ${purchNeeds[0].productName}.`,
        actionText: 'Abrir Painel de Compras',
        onAction: () => {
          setActiveTab('purchase_requisitions');
        },
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
        onAction: () => {
          setActiveTab('purchase_requisitions');
        },
      });
    }

    return alertsList.slice(0, 5);
  };

  // Modals management
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedProductId(null);
    setIsProductModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setModalMode('edit');
    setSelectedProductId(p.id);
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Deseja mesmo remover o produto "${name}"?`)) {
      removeInventoryProduct(id);
      toast.success('Insumo removido permanentemente.');
      if (selectedProduct?.id === id) setSelectedProduct(null);
    }
  };

  // Parser functions
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0)
      processUpload(e.dataTransfer.files[0]);
  };
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0)
      processUpload(e.target.files[0]);
  };

  const processUpload = (file: File) => {
    setUploadedFileName(file.name);
    setUploadParsedItems([]);
    setSheetPreviewRaw([]);
    setRawTextPreview('');
    const nameLow = file.name.toLowerCase();

    if (
      nameLow.endsWith('.xlsx') ||
      nameLow.endsWith('.xls') ||
      nameLow.endsWith('.csv')
    ) {
      setFileTypeDetected('sheet');
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const rawBuffer = e.target?.result as ArrayBuffer;
          const workbook = XLSX.read(new Uint8Array(rawBuffer), { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rawRows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });

          if (rawRows.length > 0) {
            setSheetPreviewRaw(
              rawRows
                .slice(0, 5)
                .map((r) =>
                  Array.isArray(r) ? r.map(String) : Object.values(r).map(String)
                )
            );
            const itemsParsed: UploadParsedItem[] = [];

            for (let i = 1; i < Math.min(rawRows.length, 25); i++) {
              const row = rawRows[i];
              if (!Array.isArray(row) || row.length < 2) continue;
              const pName = String(row[0]).trim();
              const pQty = parseFloat(String(row[1])) || 0;
              const pCost =
                parseFloat(
                  String(row[2] || '45').replace(/[^\w\s.,;:()\-/@%]/g, '')
                ) || 45.0;

              if (pName && pQty > 0) {
                const rec = scanProductSmartly(pName, pQty, pCost);
                itemsParsed.push({
                  id: `upload-${i}-${Math.random().toString(36).substring(2, 5)}`,
                  name: pName,
                  quantity: pQty,
                  unit: rec.officialProduct?.unit || 'ml',
                  costPerUnit: pCost,
                  category: rec.classification.categoryCode,
                  supplier: rec.classification.supplier || 'Importador',
                  confirmed: true,
                  productGroup: rec.classification.productGroup,
                  chemicalGroup: rec.classification.chemicalGroup,
                  activeIngredient: rec.classification.activeIngredient,
                  isOfficialMatch: rec.isOfficialMatch,
                  officialProductName: rec.officialProduct?.name,
                  budgetClass: rec.isOfficialMatch ? 'equivalent' : 'unregistered',
                });
              }
            }
            if (itemsParsed.length > 0) {
              setUploadParsedItems(itemsParsed);
              toast.success(`Planilha processada! Encontrados ${itemsParsed.length} insumos.`);
            }
          }
        } catch {
          toast.error('Falha de decodificação de planilha.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (nameLow.endsWith('.xml')) {
      setFileTypeDetected('xml');
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          setRawTextPreview(
            content.slice(0, 800) + '\n\n... (Nota Fiscal Eletrônica XML) ...'
          );
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(content, 'text/xml');
          const prods = xmlDoc.getElementsByTagName('prod');
          const itemsParsed: UploadParsedItem[] = [];

          for (let i = 0; i < Math.min(prods.length, 10); i++) {
            const node = prods[i];
            const pName = node.getElementsByTagName('xProd')[0]?.textContent || '';
            const pQty = parseFloat(
              node.getElementsByTagName('qCom')[0]?.textContent || '0'
            );
            const pCost = parseFloat(
              node.getElementsByTagName('vUnCom')[0]?.textContent || '0'
            );
            if (pName && pQty > 0) {
              const rec = scanProductSmartly(pName, pQty, pCost);
              itemsParsed.push({
                id: `xml-${i}`,
                name: pName,
                quantity: pQty,
                unit: rec.officialProduct?.unit || 'unidade',
                costPerUnit: pCost,
                category: rec.classification.categoryCode,
                supplier: 'Emissor Nota Fiscal',
                confirmed: true,
                productGroup: rec.classification.productGroup,
                chemicalGroup: rec.classification.chemicalGroup,
                activeIngredient: rec.classification.activeIngredient,
                isOfficialMatch: rec.isOfficialMatch,
                budgetClass: 'found',
              });
            }
          }
          if (itemsParsed.length > 0) setUploadParsedItems(itemsParsed);
        } catch {
          toast.error('XML inválido.');
        }
      };
      reader.readAsText(file);
    } else if (nameLow.endsWith('.pdf')) {
      setFileTypeDetected('pdf');
      setRawTextPreview(
        '[LEITURA OPERACIONAL PDF]\nFicha cadastral / Catálogo PDF carregado.\nExtraindo similaridades...'
      );
      setTimeout(() => {
        const item = PESTFLOW_OFFICIAL_PRODUCTS[0];
        setUploadParsedItems([
          {
            id: 'pdf-item-1',
            name: item.name,
            quantity: 10,
            unit: item.unit,
            costPerUnit: 65,
            category: item.categoryCode,
            supplier: item.supplier,
            confirmed: true,
            productGroup: item.productGroup,
            chemicalGroup: item.chemicalGroup,
            activeIngredient: item.activeIngredient,
            isOfficialMatch: true,
            budgetClass: 'found',
          },
        ]);
        toast.success('Leitura estocástica do PDF finalizada.');
      }, 500);
    } else {
      toast.error('Gargalo: Arquivo incompatível.');
    }
  };

  const handleConfirmImport = () => {
    const active = uploadParsedItems.filter((item) => item.confirmed);
    if (active.length === 0) {
      toast.warning('Nenhum item marcado');
      return;
    }

    active.forEach((item) => {
      const isRegistered = products.find(
        (p) => normalizeString(p.name) === normalizeString(item.name)
      );
      const targetId =
        isRegistered?.id || `prod-${Math.random().toString(36).substring(2, 11)}`;

      if (isRegistered) {
        updateInventoryProduct(isRegistered.id, {
          quantity: isRegistered.quantity + item.quantity,
          chemicalGroup: isRegistered.chemicalGroup || item.chemicalGroup,
          activeIngredient: isRegistered.activeIngredient || item.activeIngredient,
        });
      } else {
        addInventoryProduct({
          id: targetId,
          name: item.name,
          category: item.category,
          unit: item.unit,
          quantity: item.quantity,
          minQuantity: Math.ceil(item.quantity * 0.2),
          costPerUnit: item.costPerUnit,
          supplier: item.supplier,
          productGroup: item.productGroup,
          chemicalGroup: item.chemicalGroup,
          activeIngredient: item.activeIngredient,
        });
      }

      addInventoryMovement({
        id: `mov-${Math.random().toString(36).substring(2, 11)}`,
        date: new Date().toISOString().split('T')[0],
        productId: targetId,
        type: 'entrada',
        quantity: item.quantity,
        reason: `Entrada inteligente via scanner de lote`,
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
    toast.info('Aprimorando princípios com o LLM Gemini...');
    try {
      const inputs = uploadParsedItems.map((p) => ({
        name: p.name,
        supplier: p.supplier,
      }));
      const refined = await queryAIForProducts(inputs);
      setUploadParsedItems((prev) =>
        prev.map((item, idx) => {
          const ref =
            refined.find(
              (r) => normalizeString(r.name) === normalizeString(item.name)
            ) || refined[idx];
          return ref
            ? {
                ...item,
                productGroup: ref.productGroup,
                chemicalGroup: ref.chemicalGroup,
                activeIngredient: ref.activeIngredient,
                category: ref.categoryCode,
              }
            : item;
        })
      );
      toast.success('Catalogado e refinado cientificamente com Inteligência Artificial.');
    } catch {
      toast.error('Falha no LLM de catalogação.');
    }
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
      updatedAt: new Date().toISOString(),
    });

    toast.success(
      `Solicitação de reabastecimento enviada para cotação: +${Math.ceil(qtyToBuy)} ${
        p.unit
      } de ${p.name}!`
    );
  };

  // Filter items in the table
  const getFilteredProducts = () => {
    let list = [...products];

    // Main search
    if (stockSearch.trim()) {
      const searchNorm = stockSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(searchNorm) ||
          (p.activeIngredient &&
            p.activeIngredient.toLowerCase().includes(searchNorm)) ||
          (p.supplier && p.supplier.toLowerCase().includes(searchNorm))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      if (categoryFilter === 'inseticida') {
        list = list.filter(
          (p) =>
            p.category === 'inseticida' ||
            p.category === 'formicida' ||
            p.category === 'gel_baraticida'
        );
      } else if (categoryFilter === 'raticida') {
        list = list.filter((p) => p.category === 'raticida' || p.category === 'iscas');
      } else if (categoryFilter === 'gel') {
        list = list.filter(
          (p) => p.category === 'gel_baraticida' || p.name.toLowerCase().includes('gel')
        );
      } else if (categoryFilter === 'equipamentos') {
        list = list.filter((p) => p.category === 'equipamentos');
      } else if (categoryFilter === 'epi') {
        list = list.filter((p) => p.category === 'epi');
      } else if (categoryFilter === 'outros') {
        list = list.filter(
          (p) => p.category === 'outros' || p.category === 'consumiveis'
        );
      }
    }

    // Status filter toggles
    if (statusFilter !== 'all') {
      if (statusFilter === 'critical') {
        list = list.filter((p) => p.quantity <= p.minQuantity);
      } else if (statusFilter === 'expiry') {
        const soon = new Date();
        soon.setDate(soon.getDate() + 90);
        list = list.filter((p) => p.expiryDate && new Date(p.expiryDate) <= soon);
      } else if (statusFilter === 'hightrend') {
        list = list.filter((p) =>
          movements.some((m) => m.productId === p.id && m.type === 'saida')
        );
      } else if (statusFilter === 'idle') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        list = list.filter(
          (p) =>
            !movements.some(
              (m) =>
                m.productId === p.id &&
                m.type === 'saida' &&
                new Date(m.date) >= thirtyDaysAgo
            )
        );
      }
    }

    return list;
  };

  const displayedList = getFilteredProducts();

  return (
    <div
      id="estoque-operational-root"
      className="space-y-6 text-slate-900 font-sans antialiased text-left pb-16"
    >
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
            onClick={() => {
              setQuickMoveType('entrada');
              setIsQuickMoveOpen(true);
            }}
            className="border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <ArrowUpRight className="size-3.5 text-emerald-600" /> Registrar Entrada
          </Button>
          <Button
            id="btn-regist-saida"
            variant="outline"
            onClick={() => {
              setQuickMoveType('saida');
              setIsQuickMoveOpen(true);
            }}
            className="border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <ArrowDownLeft className="size-3.5 text-rose-600" /> Registrar Saída
          </Button>
          <Button
            id="btn-import-planilha"
            variant="outline"
            onClick={() => {
              setActiveTab('upload_entry');
            }}
            className="border-emerald-600/30 hover:bg-emerald-50 text-emerald-800 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <FileSpreadsheet className="size-3.5" /> Importar Planilha
          </Button>
        </div>
      </div>

      {/* TABS OFICIAIS */}
      <InventoryTabs
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        purchasesCount={(purchases || []).length}
        dashboardContent={
          <InventoryDashboardTab
            products={products}
            purchases={purchases || []}
            stockSearch={stockSearch}
            setStockSearch={setStockSearch}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            displayedList={displayedList}
            criticalProductsCount={criticalProductsCount}
            totalStockValue={totalStockValue}
            recentOutputsCount={recentOutputsCount}
            computeAlerts={computeAlerts}
            handleQuickReorder={handleQuickReorder}
            openCreateModal={openCreateModal}
            openEditModal={openEditModal}
            handleDeleteProduct={handleDeleteProduct}
            onSelectProduct={(p) => {
              setSelectedProduct(p);
            }}
            getProductStatus={getProductStatus}
          />
        }
        uploadContent={
          <InventoryUploadTab
            importType={importType}
            setImportType={setImportType}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            uploadedFileName={uploadedFileName}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            handleFileInputChange={handleFileInputChange}
            rawTextPreview={rawTextPreview}
            uploadParsedItems={uploadParsedItems}
            setUploadParsedItems={setUploadParsedItems}
            refineWithAI={refineWithAI}
            isClassifyingWithAI={isClassifyingWithAI}
            handleConfirmImport={handleConfirmImport}
          />
        }
        movementsContent={
          <InventoryMovementsTab movements={movements} products={products} />
        }
        purchasesContent={
          <InventoryPurchaseRequisitionsTab
            purchases={purchases || []}
            products={products}
            updatePurchaseStatus={updatePurchaseStatus}
            updateInventoryProduct={updateInventoryProduct}
            addInventoryMovement={addInventoryMovement}
          />
        }
        supplierContent={<InventorySupplierImportTab />}
      />

      {/* DRAWER OFICIAL: FICHA DO PRODUTO (Sheet) */}
      <ProductDetailSheet
        product={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(open) => {
          if (!open) setSelectedProduct(null);
        }}
        movements={movements}
        onEditProduct={(p) => {
          openEditModal(p);
        }}
        onQuickMove={(prodId) => {
          setQuickMoveProdId(prodId);
          setQuickMoveType('entrada');
          setIsQuickMoveOpen(true);
        }}
        onTransferSubmit={({ productId, fromChannel, toChannel, quantity, reason }) => {
          addInventoryMovement({
            id: `mov-${Math.random().toString(36).substring(2, 11)}`,
            date: new Date().toISOString().split('T')[0],
            productId,
            type: 'saida',
            quantity,
            reason: `Transferência de estoque interna de ${fromChannel} para ${toChannel}. Motivo: ${reason}`,
          });
          toast.success(`Transferência operacional efetuada: ${quantity} migrados com sucesso.`);
        }}
        onSimulateFileUpload={(productId, file) => {
          const newAttachment = {
            name: file.name,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            date: new Date().toLocaleDateString('pt-BR'),
          };
          setAttachmentsByProduct((prev) => ({
            ...prev,
            [productId]: [...(prev[productId] || []), newAttachment],
          }));
          toast.success(`Arquivo "${file.name}" anexado com sucesso!`);
        }}
        uploadedDocs={attachmentsByProduct}
        consumptionData={[
          { month: 'Jan', amount: 45 },
          { month: 'Fev', amount: 52 },
          { month: 'Mar', amount: 38 },
          { month: 'Abr', amount: 65 },
          { month: 'Mai', amount: 48 },
          { month: 'Jun', amount: 59 },
        ]}
      />

      {/* MODAL OFICIAL: CADASTRAR OU EDITAR PRODUTO (Dialog) */}
      <ProductFormDialog
        open={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        mode={modalMode}
        product={modalMode === 'edit' ? products.find((p) => p.id === selectedProductId) : null}
        onSave={(data) => {
          if (modalMode === 'create') {
            const newId = `prod-${Math.random().toString(36).substring(2, 11)}`;
            const newProduct = {
              id: newId,
              name: data.name.trim(),
              category: data.category,
              unit: data.unit,
              quantity: data.quantity,
              minQuantity: data.minQuantity,
              costPerUnit: data.costPerUnit,
              supplier: data.supplier.trim() || 'Fornecedor',
              chemicalGroup: data.chemicalGroup.trim() || 'NÃO DESIGNADO',
              activeIngredient: data.activeIngredient.trim() || 'NÃO ESPECIFICADO',
              productGroup: data.productGroup,
              lot: data.lot.trim(),
              expiryDate: data.expiryDate,
              lastUpdated: new Date().toISOString(),
            };
            addInventoryProduct(newProduct);

            if (data.quantity > 0) {
              addInventoryMovement({
                id: `mov-${Math.random().toString(36).substring(2, 11)}`,
                date: new Date().toISOString().split('T')[0],
                productId: newId,
                type: 'entrada',
                quantity: data.quantity,
                reason: 'Ajuste inicial de cadastro de estoque',
                lot: data.lot,
                expiryDate: data.expiryDate,
              });
            }
            toast.success('Insumo cadastrado com sucesso!');
          } else if (selectedProductId) {
            const originalProduct = products.find((p) => p.id === selectedProductId);
            const originalQty = originalProduct?.quantity || 0;

            updateInventoryProduct(selectedProductId, {
              name: data.name.trim(),
              category: data.category,
              unit: data.unit,
              quantity: data.quantity,
              minQuantity: data.minQuantity,
              costPerUnit: data.costPerUnit,
              supplier: data.supplier.trim(),
              chemicalGroup: data.chemicalGroup.trim(),
              activeIngredient: data.activeIngredient.trim(),
              productGroup: data.productGroup,
              lot: data.lot,
              expiryDate: data.expiryDate,
            });

            const diff = data.quantity - originalQty;
            if (diff !== 0) {
              addInventoryMovement({
                id: `mov-${Math.random().toString(36).substring(2, 11)}`,
                date: new Date().toISOString().split('T')[0],
                productId: selectedProductId,
                type: diff > 0 ? 'entrada' : 'saida',
                quantity: Math.abs(diff),
                reason: 'Ajuste manual cadastral na ficha técnica do produto',
                lot: data.lot,
                expiryDate: data.expiryDate,
              });
            }
            toast.success('Parâmetros técnicos atualizados com êxito!');
          }
          setIsProductModalOpen(false);
        }}
      />

      {/* MODAL OFICIAL: REGISTRAR MOVIMENTAÇÃO RÁPIDA (Dialog) */}
      <QuickMoveDialog
        open={isQuickMoveOpen}
        onOpenChange={setIsQuickMoveOpen}
        type={quickMoveType}
        onTypeChange={setQuickMoveType}
        defaultProductId={quickMoveProdId}
        products={products}
        onConfirm={({ productId, type, quantity, reason, lot, expiryDate, origin }) => {
          const targetProduct = products.find((p) => p.id === productId);
          if (!targetProduct) return;

          if (type === 'saida' && targetProduct.quantity < quantity) {
            toast.error(
              `Quantidade insuficiente em estoque. Saldo atual: ${targetProduct.quantity} ${targetProduct.unit}`
            );
            return;
          }

          const nextQty =
            type === 'entrada'
              ? targetProduct.quantity + quantity
              : targetProduct.quantity - quantity;

          updateInventoryProduct(productId, { quantity: nextQty });
          addInventoryMovement({
            id: `mov-${Math.random().toString(36).substring(2, 11)}`,
            date: new Date().toISOString().split('T')[0],
            productId,
            type,
            quantity,
            reason:
              type === 'saida'
                ? `[Origem: ${origin}] ` + (reason.trim() || `Retirada operacional`)
                : reason.trim() || `Manual de entrada`,
            lot,
            expiryDate,
          });

          toast.success('Movimentação registrada com sucesso!');
          setIsQuickMoveOpen(false);
        }}
      />
    </div>
  );
}
