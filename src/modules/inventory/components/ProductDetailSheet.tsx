import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Package,
  Layers,
  Activity,
  FileText,
  Truck,
  MapPin,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Clock,
  CheckCircle2,
  DollarSign,
  UploadCloud,
  FileCheck,
  Bot,
  Calculator,
  ShieldCheck,
  ExternalLink,
  Edit2,
  ArrowRightLeft,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { toast } from 'sonner';
import { CATEGORY_LABELS, FichaSubTabType } from '../types';

interface ProductDetailSheetProps {
  product: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movements: any[];
  onEditProduct: (prod: any) => void;
  onQuickMove: (prodId: string) => void;
  onTransferSubmit: (data: {
    productId: string;
    fromChannel: string;
    toChannel: string;
    quantity: number;
    reason: string;
  }) => void;
  onSimulateFileUpload: (productId: string, file: File) => void;
  uploadedDocs: Record<string, Array<{ name: string; date: string; size: string }>>;
  consumptionData: Array<{ month: string; amount: number }>;
}

export function ProductDetailSheet({
  product,
  open,
  onOpenChange,
  movements,
  onEditProduct,
  onQuickMove,
  onTransferSubmit,
  onSimulateFileUpload,
  uploadedDocs,
  consumptionData,
}: ProductDetailSheetProps) {
  const [activeTab, setActiveTab] = useState<FichaSubTabType>('resumo');
  const [transferOrigin, setTransferOrigin] = useState('Estoque Central');
  const [transferDestination, setTransferDestination] = useState('Veículo 01 (Operacional)');
  const [transferQty, setTransferQty] = useState(1);
  const [transferReason, setTransferReason] = useState('Abastecimento de Rotina');

  if (!product) return null;

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferOrigin === transferDestination) {
      toast.error('Canal de origem e destino não podem ser os mesmos.');
      return;
    }
    if (transferQty > product.quantity) {
      toast.error('Quantidade excede o saldo físico disponível.');
      return;
    }
    onTransferSubmit({
      productId: product.id,
      fromChannel: transferOrigin,
      toChannel: transferDestination,
      quantity: transferQty,
      reason: transferReason,
    });
  };

  const productMovements = movements.filter((m) => m.productId === product.id);
  const purchaseMovements = productMovements.filter((m) => m.type === 'entrada');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="sm:max-w-2xl md:max-w-2xl w-full p-0 flex flex-col justify-between overflow-hidden bg-white"
        id="details-drawer-ficha"
      >
        {/* TOP BANNER & IDENTITY HEADER */}
        <div className="p-6 bg-slate-900 text-white relative shrink-0">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>

          <SheetHeader className="text-left space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-[#1B3A2D] text-emerald-300 font-bold uppercase tracking-wider text-[9px] px-2.5 py-0.5 border border-emerald-500/30">
                {CATEGORY_LABELS[product.category] || product.category}
              </Badge>
              <span className="text-[10px] text-slate-400 font-mono">
                COD-INS-{product.id.slice(-4).toUpperCase()}
              </span>
            </div>

            <SheetTitle className="text-xl font-black font-display tracking-tight text-white mt-1">
              {product.name}
            </SheetTitle>

            <SheetDescription className="text-xs text-slate-300">
              Fabricante / Fornecedor: <span className="text-white font-bold">{product.supplier}</span> |{' '}
              Grupo: <span className="text-emerald-400 font-bold">{product.productGroup || 'Químicos'}</span>
            </SheetDescription>
          </SheetHeader>

          {/* Action trigger row */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
            <Button
              onClick={() => onEditProduct(product)}
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] uppercase tracking-wider py-1.5 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Edit2 className="size-3 text-emerald-400" /> Editar Cadastro
            </Button>
            <Button
              onClick={() => onQuickMove(product.id)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider py-1.5 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowRightLeft className="size-3 text-white" /> Movimentar
            </Button>
            <label className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] uppercase tracking-wider py-1.5 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer">
              <UploadCloud className="size-3 text-sky-400" /> Anexar Documento
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    onSimulateFileUpload(product.id, e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>

          {/* FAST INDICATORS METRIC GRID */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <div className="p-2.5 bg-slate-800/80 rounded-xl text-left border border-slate-700/50">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Qtd Atual</span>
              <span className="text-base font-black text-emerald-400">
                {product.quantity} <span className="text-xs font-normal text-slate-300">{product.unit}</span>
              </span>
            </div>
            <div className="p-2.5 bg-slate-800/80 rounded-xl text-left border border-slate-700/50">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Consumo Mês</span>
              <span className="text-base font-black text-white">
                {Math.round(product.quantity * 0.45)}{' '}
                <span className="text-xs font-normal text-slate-300">{product.unit}</span>
              </span>
            </div>
            <div className="p-2.5 bg-slate-800/80 rounded-xl text-left border border-slate-700/50">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Dias Autonomia</span>
              <span className="text-base font-black text-amber-400">
                {Math.round(product.quantity / (product.minQuantity || 1) * 15)} d
              </span>
            </div>
            <div className="p-2.5 bg-slate-800/80 rounded-xl text-left border border-slate-700/50">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Último Custo</span>
              <span className="text-base font-black text-sky-400">
                R$ {product.costPerUnit.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* TABS CONTAINER */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as FichaSubTabType)}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* SUB-TABS NAVIGATION BAR */}
            <div className="px-6 pt-3 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <TabsList className="h-9 p-1 bg-slate-200/70 rounded-xl w-full justify-start gap-1 overflow-x-auto">
                <TabsTrigger
                  value="resumo"
                  className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#1B3A2D] data-[state=active]:shadow-xs"
                >
                  <Layers className="size-3 mr-1" /> Resumo
                </TabsTrigger>
                <TabsTrigger
                  value="movimentacoes"
                  className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#1B3A2D] data-[state=active]:shadow-xs"
                >
                  <Activity className="size-3 mr-1" /> Movimentações
                </TabsTrigger>
                <TabsTrigger
                  value="consumo"
                  className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#1B3A2D] data-[state=active]:shadow-xs"
                >
                  <TrendingDown className="size-3 mr-1" /> Consumo
                </TabsTrigger>
                <TabsTrigger
                  value="documentos"
                  className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#1B3A2D] data-[state=active]:shadow-xs"
                >
                  <FileText className="size-3 mr-1" /> EPIs/Docs
                </TabsTrigger>
                <TabsTrigger
                  value="compras"
                  className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#1B3A2D] data-[state=active]:shadow-xs"
                >
                  <Truck className="size-3 mr-1" /> Compras
                </TabsTrigger>
                <TabsTrigger
                  value="localizacao"
                  className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#1B3A2D] data-[state=active]:shadow-xs"
                >
                  <MapPin className="size-3 mr-1" /> Canais
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB CONTENT SCROLLABLE AREA */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
              {/* SUB-ABA 1: RESUMO */}
              <TabsContent value="resumo" className="space-y-6 mt-0">
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Package className="size-4 text-[#1B3A2D]" /> Parâmetros de Campo
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Princípio Ativo</span>
                      <p className="font-extrabold text-slate-800">{product.activeIngredient}</p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Grupo Químico</span>
                      <p className="font-extrabold text-slate-800">{product.chemicalGroup}</p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Estoque Mínimo de Segurança</span>
                      <p className="font-extrabold text-amber-700">{product.minQuantity} {product.unit}</p>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Validade Sanitária</span>
                      <p className="font-extrabold text-slate-800 flex items-center gap-1">
                        <Calendar className="size-3 text-slate-500" /> {product.expiryDate || 'Não informada'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <MapPin className="size-4 text-emerald-600" /> Armazenamento
                  </h4>
                  <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">Almoxarifado Central - Prateleira 03B</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Ambiente ventilado com controle de temperatura e chave restrita.</p>
                    </div>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 font-black rounded-lg text-[9px] uppercase">
                      Armazém OK
                    </span>
                  </div>
                </div>

                {/* PestFlow Integrated Links */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Layers className="size-4 text-sky-600" /> Vínculos Integrados de Fluxo PestFlow
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 bg-sky-50/50 border border-sky-100 rounded-2xl space-y-1">
                      <span className="text-[9px] font-black uppercase text-sky-800 tracking-wider">Serviços Relacionados</span>
                      <p className="text-[11px] text-slate-600 font-medium">
                        Utilizado em 42 Ordens de Serviço nos últimos 30 dias (Desinsetização e Controle de Baratas).
                      </p>
                      <a href="/agenda" className="text-[10px] text-sky-700 font-black flex items-center gap-1 mt-2 hover:underline">
                        Ver na Agenda <ExternalLink className="size-2.5" />
                      </a>
                    </div>
                    <div className="p-3.5 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-1">
                      <span className="text-[9px] font-black uppercase text-purple-800 tracking-wider">Procedimentos POPs</span>
                      <p className="text-[11px] text-slate-600 font-medium">
                        Referenciado no POP-01 (Desinsetização de Cozinhas Industriais) e POP-04 (Manejo Integrado).
                      </p>
                      <a href="/procedures" className="text-[10px] text-purple-700 font-black flex items-center gap-1 mt-2 hover:underline">
                        Ver Normas Técnicas <ExternalLink className="size-2.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* SUB-ABA 2: MOVIMENTAÇÕES */}
              <TabsContent value="movimentacoes" className="space-y-4 mt-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Histórico Local deste Produto
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400">
                    {productMovements.length} transações registradas
                  </span>
                </div>

                {productMovements.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                    <Clock className="size-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-600">Nenhuma movimentação registrada.</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Novas entradas ou saídas aparecerão aqui.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {productMovements.map((mov) => (
                      <div
                        key={mov.id}
                        className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`p-2 rounded-lg font-black text-[9px] uppercase ${
                              mov.type === 'entrada'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {mov.type}
                          </span>
                          <div>
                            <p className="font-extrabold text-slate-800">{mov.reason}</p>
                            <span className="text-[10px] text-slate-400">Lote: {mov.lot || 'Geral'}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`font-black text-sm block ${
                              mov.type === 'entrada' ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {mov.type === 'entrada' ? '+' : '-'}
                            {mov.quantity} {product.unit}
                          </span>
                          <span className="text-[10px] text-slate-400">{mov.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* SUB-ABA 3: CONSUMO */}
              <TabsContent value="consumo" className="space-y-4 mt-0">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Demanda Mensal Acumulada
                    </span>
                    <span className="text-xs font-bold text-emerald-700">Média: 14.2 {product.unit}/mês</span>
                  </div>
                  <div className="h-44 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={consumptionData}>
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="amount" fill="#1B3A2D" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold">
                    <AlertTriangle className="size-4 text-amber-600" />
                    <span>Tendência Operacional</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    O consumo desse produto teve um incremento de 18% em função da sazonalidade de primavera/verão.
                    O estoque atual cobre apenas 22 dias operacionais.
                  </p>
                </div>
              </TabsContent>

              {/* SUB-ABA 4: DOCUMENTOS */}
              <TabsContent value="documentos" className="space-y-4 mt-0">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Documentação Sanitária & Fichas Técnicas
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 flex flex-col justify-between">
                    <div>
                      <FileCheck className="size-6 text-emerald-600 mb-1" />
                      <p className="text-xs font-bold text-slate-800">FISPQ / Ficha de Emergência</p>
                      <p className="text-[10px] text-slate-400">Exigido pela Vigilância Sanitária e ANVISA</p>
                    </div>
                    <Button
                      onClick={() => toast.success('FISPQ oficial carregada e pronta para impressão.')}
                      className="w-full bg-[#1B3A2D] hover:bg-[#1B3A2D]/90 text-white font-bold text-[9px] uppercase tracking-wider py-1.5 rounded-lg cursor-pointer"
                    >
                      Visualizar FISPQ
                    </Button>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 flex flex-col justify-between">
                    <div>
                      <FileText className="size-6 text-sky-600 mb-1" />
                      <p className="text-xs font-bold text-slate-800">Bula e Ficha Técnica</p>
                      <p className="text-[10px] text-slate-400">Instruções de diluição e EPIs obrigatórios</p>
                    </div>
                    <Button
                      onClick={() => toast.success('Ficha Técnica do Fabricante baixada com sucesso.')}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-[9px] uppercase tracking-wider py-1.5 rounded-lg cursor-pointer"
                    >
                      Ficha do Fabricante
                    </Button>
                  </div>
                </div>

                {/* Uploaded Documents List */}
                <div className="pt-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2">
                    Anexos Enviados para este Insumo
                  </span>
                  {(uploadedDocs[product.id] || []).length === 0 ? (
                    <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                      Nenhum laudo ou documento customizado anexado.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {uploadedDocs[product.id].map((doc, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="size-4 text-emerald-700" />
                            <div>
                              <p className="font-bold text-slate-700">{doc.name}</p>
                              <span className="text-[9px] text-slate-400">
                                {doc.date} • {doc.size}
                              </span>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            Disponível
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* SUB-ABA 5: COMPRAS */}
              <TabsContent value="compras" className="space-y-4 mt-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Histórico de Movimentações de Entrada
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400">
                    {purchaseMovements.length} compras/entradas
                  </span>
                </div>

                {purchaseMovements.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
                    <Truck className="size-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-600">Nenhum lote de compra registrado.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {purchaseMovements.map((mov) => (
                      <div
                        key={mov.id}
                        className="p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between text-xs shadow-2xs"
                      >
                        <div>
                          <p className="font-extrabold text-slate-800">{mov.reason}</p>
                          <p className="text-[10px] text-slate-400">
                            Data: {mov.date} • Lote: {mov.lot}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-emerald-700 text-sm block">
                            +{mov.quantity} {product.unit}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            Custo Médio: R$ {product.costPerUnit.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* SUB-ABA 6: LOCALIZAÇÃO & TRANSFERÊNCIA */}
              <TabsContent value="localizacao" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Distribuição Interna
                  </h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-[#1B3A2D]" />
                        <span className="font-bold text-slate-700">Estoque Central (Almoxarifado)</span>
                      </div>
                      <span className="font-black text-slate-800">
                        {(product.quantity * 0.7).toFixed(1)} {product.unit} (70%)
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Truck className="size-4 text-sky-600" />
                        <span className="font-bold text-slate-700">Veículo 01 (Equipe Alfa)</span>
                      </div>
                      <span className="font-black text-slate-800">
                        {(product.quantity * 0.2).toFixed(1)} {product.unit} (20%)
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Truck className="size-4 text-purple-600" />
                        <span className="font-bold text-slate-700">Veículo 02 (Equipe Beta)</span>
                      </div>
                      <span className="font-black text-slate-800">
                        {(product.quantity * 0.1).toFixed(1)} {product.unit} (10%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Internal transfer form */}
                <form
                  onSubmit={handleTransfer}
                  className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 text-xs"
                >
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                    Transferir Saldo entre Canais
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] uppercase text-slate-400 font-bold block mb-1">
                        Origem
                      </label>
                      <select
                        value={transferOrigin}
                        onChange={(e) => setTransferOrigin(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      >
                        <option value="Estoque Central">Estoque Central</option>
                        <option value="Veículo 01 (Operacional)">Veículo 01 (Operacional)</option>
                        <option value="Veículo 02 (Operacional)">Veículo 02 (Operacional)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] uppercase text-slate-400 font-bold block mb-1">
                        Destino
                      </label>
                      <select
                        value={transferDestination}
                        onChange={(e) => setTransferDestination(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      >
                        <option value="Veículo 01 (Operacional)">Veículo 01 (Operacional)</option>
                        <option value="Veículo 02 (Operacional)">Veículo 02 (Operacional)</option>
                        <option value="Estoque Central">Estoque Central</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] uppercase text-slate-400 font-bold block mb-1">
                        Quantidade ({product.unit})
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        step="ANY"
                        value={transferQty}
                        onChange={(e) => setTransferQty(parseFloat(e.target.value) || 1)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase text-slate-400 font-bold block mb-1">
                        Motivo
                      </label>
                      <input
                        type="text"
                        value={transferReason}
                        onChange={(e) => setTransferReason(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#1B3A2D] hover:bg-[#1B3A2D]/90 text-white font-bold uppercase text-[9px] tracking-wider py-2 rounded-xl mt-2 cursor-pointer"
                  >
                    Confirmar Transferência Interna
                  </Button>
                </form>
              </TabsContent>

              {/* CROSS-SYSTEM QUICK CONNECTIONS CARD */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-400" /> Control Center Operacional
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">INTEGRAÇÕES ATIVAS</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-slate-800 rounded-xl space-y-1">
                    <span className="text-slate-400 font-bold block flex items-center gap-1">
                      <Calculator className="size-3 text-emerald-400" /> Calculadora
                    </span>
                    <p className="font-extrabold text-white text-[11px] mt-0.5">
                      Rendimento: ~{Math.round(product.quantity * 12)} m²
                    </p>
                  </div>

                  <div className="p-3 bg-slate-800 rounded-xl space-y-1">
                    <span className="text-slate-400 font-bold block flex items-center gap-1">
                      <Calendar className="size-3 text-amber-400" /> Agenda
                    </span>
                    <p className="font-extrabold text-white text-[11px] mt-0.5">
                      3 OS Agendadas
                    </p>
                  </div>

                  <div className="p-3 bg-slate-800 rounded-xl space-y-1">
                    <span className="text-slate-400 font-bold block flex items-center gap-1">
                      <ShieldCheck className="size-3 text-purple-400" /> POPs Link
                    </span>
                    <p className="font-extrabold text-white text-[11px] mt-0.5">
                      Norma POP-01
                    </p>
                  </div>

                  <div className="p-3 bg-slate-800 rounded-xl space-y-1">
                    <span className="text-slate-400 font-bold block flex items-center gap-1">
                      <DollarSign className="size-3 text-sky-400" /> Financeiro
                    </span>
                    <p className="font-extrabold text-white text-[11px] mt-0.5">
                      Custo Ativo: R$ {product.costPerUnit.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* INTELIGÊNCIA ARTIFICIAL DIAGNOSTIC BLOCK */}
              <div className="bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border border-violet-200/50 p-4 rounded-2xl flex items-start gap-3 text-left">
                <Bot className="size-6 text-violet-700 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-black uppercase text-violet-800 tracking-wider">
                    PestFlow IA - Análises Automáticas
                  </span>
                  <ul className="list-disc list-inside text-slate-600 space-y-1 mt-1 text-[11px] font-medium leading-relaxed">
                    <li>Consumo estimado de {product.name} aumentou 12% nos últimos 15 dias de rodadas.</li>
                    <li>Estoque remanescente suficiente para 22 dias operacionais de campo.</li>
                    <li>Recomenda-se disparar pedido em até 7 dias para evitar ruptura crítica.</li>
                  </ul>
                </div>
              </div>
            </div>
          </Tabs>
        </div>

        {/* DRAWER FOOTER CLOSE CONTROLS */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Central de Controle Insumos
          </span>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-[#1B3A2D] hover:bg-[#1B3A2D]/90 text-white font-bold uppercase text-[10px] tracking-wider py-1.5 px-4 rounded-xl cursor-pointer"
          >
            Fechar Ficha
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
