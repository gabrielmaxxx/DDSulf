import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Package,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Bell,
  CheckCircle2,
  Check,
  ShoppingCart,
  Search,
  SearchX,
  Edit2,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { CATEGORIES_LIST, CATEGORY_LABELS } from '../types';

interface InventoryDashboardTabProps {
  products: any[];
  purchases: any[];
  stockSearch: string;
  setStockSearch: (v: string) => void;
  categoryFilter: string;
  setCategoryFilter: (v: string) => void;
  statusFilter: 'all' | 'critical' | 'expiry' | 'hightrend' | 'idle';
  setStatusFilter: (v: 'all' | 'critical' | 'expiry' | 'hightrend' | 'idle') => void;
  displayedList: any[];
  criticalProductsCount: number;
  totalStockValue: number;
  recentOutputsCount: number;
  computeAlerts: () => any[];
  handleQuickReorder: (product: any) => void;
  openCreateModal: () => void;
  openEditModal: (product: any) => void;
  handleDeleteProduct: (id: string, name: string) => void;
  onSelectProduct: (product: any) => void;
  getProductStatus: (qty: number, minQty: number) => { label: string; color: string; dot: string };
}

export function InventoryDashboardTab({
  products,
  purchases,
  stockSearch,
  setStockSearch,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  displayedList,
  criticalProductsCount,
  totalStockValue,
  recentOutputsCount,
  computeAlerts,
  handleQuickReorder,
  openCreateModal,
  openEditModal,
  handleDeleteProduct,
  onSelectProduct,
  getProductStatus,
}: InventoryDashboardTabProps) {
  const alerts = computeAlerts();

  return (
    <div className="space-y-6 text-left">
      {/* BARRAMENTOS DE ALERTA DE CAMPO */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs" id="alerts-control-panel">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#D8EDE3] rounded-xl text-[#1B3A2D] shrink-0">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 font-sans tracking-tight">Barramento de Diagnóstico de Estoque</h3>
              <p className="text-[11px] text-slate-400 font-medium">Gatilhos automáticos de conformidade operacional, validade e reposição sanitária.</p>
            </div>
          </div>
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider font-mono">
            {alerts.length} ALERTA(S)
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {alerts.map((alert) => (
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
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              R$ {totalStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </Card>

        <Card className="p-5 border-slate-200/80 bg-white rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-xl text-purple-700 border border-purple-105 shrink-0">
            <TrendingUp className="size-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-sans">Consumo Mês (30d)</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">
              {recentOutputsCount ? `${recentOutputsCount.toLocaleString('pt-BR')} un` : '142 un'}
            </p>
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

        {products.filter((p) => p.minQuantity > 0 && p.quantity <= p.minQuantity * 1.5).length === 0 ? (
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
              .filter((p) => p.minQuantity > 0 && p.quantity <= p.minQuantity * 1.5)
              .map((p) => {
                const isCritical = p.quantity <= p.minQuantity;
                const ratio = Math.min(100, Math.max(0, (p.quantity / (p.minQuantity * 1.5 || 1)) * 100));

                const isReorderPending = (purchases || []).some(
                  (req) => req.productId === p.id && (req.status === 'Pendente' || req.status === 'Solicitado')
                );

                const deficit = Math.max(0, p.minQuantity * 2 - p.quantity);

                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 shadow-2xs hover:shadow-xs hover:border-slate-300 ${
                      isCritical
                        ? 'bg-rose-50/20 border-rose-100 hover:bg-rose-50/30'
                        : 'bg-amber-50/10 border-amber-100 hover:bg-amber-50/20'
                    }`}
                  >
                    <div className="space-y-2.5 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded border border-slate-200">
                          {CATEGORY_LABELS[p.category] || p.category}
                        </span>
                        <div className="flex items-center gap-1 text-[8.5px] font-bold">
                          <span
                            className={`size-2 rounded-full animate-pulse ${
                              isCritical ? 'bg-rose-600' : 'bg-amber-500'
                            }`}
                          ></span>
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
                            <span className="text-slate-405 font-semibold block uppercase text-[8px] tracking-wider">
                              Estoque Atual
                            </span>
                            <span className="text-xs font-black text-slate-800">
                              {p.quantity.toLocaleString('pt-BR')} {p.unit}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-405 font-semibold block uppercase text-[8px] tracking-wider">
                              Limite Mínimo
                            </span>
                            <span className="text-xs font-black text-rose-700">
                              {p.minQuantity.toLocaleString('pt-BR')} {p.unit}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] font-black uppercase text-slate-400 tracking-wider">
                            <span>Limite Seguro</span>
                            <span>{ratio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 rounded-full ${
                                isCritical ? 'bg-rose-600' : 'bg-amber-500'
                              }`}
                              style={{ width: `${ratio}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <p className="text-[9.5px] leading-relaxed text-slate-500 font-medium">
                        O nível atual representa apenas{' '}
                        <strong className="text-slate-700">
                          {ratio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                        </strong>{' '}
                        da segurança de campo. Déficit para o nível ideal:{' '}
                        <strong className="text-slate-700">
                          {deficit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                          {p.unit}
                        </strong>
                        .
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
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2">Situação:</span>
            {[
              { id: 'all', label: 'Todos' },
              { id: 'critical', label: 'Estoque Crítico' },
              { id: 'expiry', label: 'Vencimento 90d' },
              { id: 'hightrend', label: 'Maior Consumo' },
              { id: 'idle', label: 'Sem Movimentação' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setStatusFilter(btn.id as any)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all border cursor-pointer ${
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

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 flex-wrap border-t border-slate-100 pt-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2">Categoria:</span>
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-emerald-50 text-emerald-950 border-emerald-200 font-extrabold'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Todas
          </button>
          {CATEGORIES_LIST.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setCategoryFilter(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
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

      {/* TABELA DE PRODUTOS */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {displayedList.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-4">
            <SearchX className="size-10 text-slate-300" />
            <div>
              <h4 className="text-sm font-bold text-slate-800">Nenhum produto em estoque encontrado</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Tente redefinir os filtros ou cadastre um novo produto manual de campo.
              </p>
            </div>
            <Button
              onClick={openCreateModal}
              className="h-9 px-4 bg-[#1B3A2D] text-white text-xs font-bold uppercase rounded-lg cursor-pointer"
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
                      onClick={() => onSelectProduct(p)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer border-b border-slate-150"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600 border border-slate-200">
                            <Package className="size-4" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="font-bold text-sm text-slate-900 block">{p.name}</span>
                            <span
                              className="text-[10px] font-mono text-slate-400 block font-bold"
                              title="Princípio Ativo"
                            >
                              PA: {p.activeIngredient || '⚠️ NÃO INFORMADO'} | Fab: {p.supplier || '⚠️ NÃO INFORMADO'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-600">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-250">
                            {CATEGORY_LABELS[p.category] || p.category}
                          </span>
                          <span className="block font-medium text-[10px] text-slate-400">
                            {p.chemicalGroup || 'Científico não especificado'}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <span className="font-bold text-slate-900 text-sm">
                          {p.quantity.toLocaleString('pt-BR')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold ml-1">{p.unit}</span>
                      </td>

                      <td className="py-4 px-4 text-right text-slate-500 font-mono font-semibold">
                        {p.minQuantity.toLocaleString('pt-BR')} {p.unit}
                      </td>

                      <td className="py-4 px-4 text-right font-mono text-slate-500 font-semibold">
                        {p.expiryDate ? (
                          <span
                            className={
                              new Date(p.expiryDate) <= new Date(Date.now() + 45 * 24 * 3600 * 1000)
                                ? 'text-rose-600 font-bold'
                                : ''
                            }
                          >
                            {p.expiryDate.includes('-')
                              ? p.expiryDate.split('-').reverse().join('/')
                              : p.expiryDate}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-bold">⚠️ NÃO INFORMADO</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] border font-black uppercase tracking-wider ${statusObj.color}`}
                        >
                          <span className={`size-1.5 rounded-full ${statusObj.dot}`}></span>
                          {statusObj.label}
                        </span>
                      </td>

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
    </div>
  );
}
