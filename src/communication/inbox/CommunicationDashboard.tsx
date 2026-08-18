/**
 * PestFlow Operational Communication Center & Realtime Engagement Platform
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Inbox, 
  Flame, 
  TrendingDown, 
  Truck, 
  Sliders, 
  ShieldAlert, 
  Clock, 
  Activity, 
  Sparkles, 
  Mail, 
  FileText, 
  Check, 
  Trash2, 
  Archive, 
  Smartphone, 
  MessageSquare, 
  Plus, 
  CornerDownRight, 
  Eye, 
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';

import { 
  useOperationalNotifications, 
  useRealtimeAlerts, 
  useInboxSystem, 
  useEngagementContext, 
  useCommunicationPreferences, 
  useAlertPrioritization 
} from '../hooks';
import { formatTimeAgo, formatLatency } from '../utils';
import { AlertCategory, AlertSeverity, OperationalNotification } from '../types';

export function CommunicationDashboard() {
  const { 
    filteredNotifications,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    selectedSeverity,
    setSelectedSeverity,
    searchQuery,
    setSearchQuery,
    unreadCount,
    categoriesCount,
    markAsRead,
    archiveNotification,
    markAllAsRead
  } = useInboxSystem();

  const { prioritizedNotifications } = useAlertPrioritization();
  const { sendNotification, notifications } = useOperationalNotifications();
  const { metrics, refreshMetrics } = useEngagementContext();
  const { preferences, updatePreferences } = useCommunicationPreferences();
  const { incidents, acknowledgeIncident, resolveIncident, createIncident, activeIncidentsCount } = useRealtimeAlerts();

  const [activeTab, setActiveTab] = useState<'inbox' | 'observability' | 'incidents' | 'preferences'>('inbox');
  const [selectedNotif, setSelectedNotif] = useState<OperationalNotification | null>(null);
  const [simulationCategory, setSimulationCategory] = useState<AlertCategory>('operations');
  const [isOnlineState, setIsOnlineState] = useState(navigator.onLine);
  const [activeIncidentCountDown, setActiveIncidentCountDown] = useState<Record<string, number>>({});

  // Check network online status dynamically
  useEffect(() => {
    const handleOnline = () => setIsOnlineState(true);
    const handleOffline = () => setIsOnlineState(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update counts on active incidents continuously
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const updatedDiffs: Record<string, number> = {};
      
      incidents.forEach(inc => {
        if (inc.status === 'active' && inc.nextEscalationAt > 0) {
          const diff = Math.max(0, Math.round((inc.nextEscalationAt - now) / 1000));
          updatedDiffs[inc.id] = diff;
        }
      });
      setActiveIncidentCountDown(updatedDiffs);
    }, 1000);

    return () => clearInterval(timer);
  }, [incidents]);

  const triggerCustomSimulation = async (type: string) => {
    if (type === 'report') {
      await sendNotification({
        category: 'operations',
        templateKey: 'operations.report_submitted',
        variables: {
          technicianName: 'Carlos Silva',
          clientName: 'Supermercado Do Sul',
          pestType: 'Baratas & Roedores',
          'chemicalVolume usados': '18 L'
        },
        routeUrl: '/reports'
      });
    } else if (type === 'stock') {
      await sendNotification({
        category: 'operations',
        templateKey: 'operations.inventory_starved',
        variables: {
          itemName: 'Cipermetrina Premium',
          currentVolume: '5',
          minRequired: '25'
        },
        routeUrl: '/stock'
      });
    } else if (type === 'margin') {
      await sendNotification({
        category: 'financial',
        templateKey: 'financial.margin_breached',
        variables: {
          proposalId: `O-2026-${Math.floor(Math.random() * 800 + 100)}`,
          clientName: 'Padaria Trigo de Ouro',
          margin: (10 + Math.random() * 6).toFixed(1)
        },
        routeUrl: '/financial'
      });
    } else if (type === 'spill') {
      await createIncident({
        category: 'incident',
        carrierName: 'Pulverizador Turbo 1000',
        technicianId: 'Carlos Silva',
        failureLogString: 'Vazamento químico relatado na mangueira de recalque durante higienização',
        severity: 'critical',
        escalationPath: ['Supervisor de Campo', 'Diretor Operacional', 'Comitê Regulatório']
      });
    }
  };

  const getCategoryIcon = (cat: AlertCategory) => {
    switch (cat) {
      case 'financial': return <TrendingDown className="h-4 w-4 text-emerald-500" />;
      case 'operations': return <Truck className="h-4 w-4 text-sky-500" />;
      case 'workflow': return <Sliders className="h-4 w-4 text-purple-500" />;
      case 'incident': return <Flame className="h-4 w-4 text-red-500 animate-pulse" />;
      case 'sync': return <RefreshCw className="h-4 w-4 text-amber-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityBadgeColor = (sev: AlertSeverity) => {
    switch (sev) {
      case 'critical': return 'bg-red-50 text-red-800 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'medium': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'low': return 'bg-blue-50 text-blue-800 border-blue-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen text-gray-900 border border-neutral-100 rounded-3xl overflow-hidden shadow-sm">
      {/* Platform Header / Connectivity Bar */}
      <div className="bg-white border-b border-gray-100 px-8 py-4 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 shadow-xs">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-black text-white rounded-xl">
            <Bell className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-neutral-900 leading-none">
              Communication Hub
            </h1>
            <p className="text-xs font-semibold text-neutral-400 mt-1 uppercase tracking-wider">
              PestFlow Operational Communications & Realtime Engagement Panel
            </p>
          </div>
        </div>

        {/* Status Indicators & Connectivity */}
        <div className="flex items-center space-x-3 text-xs">
          <div className={`px-3 py-1.5 rounded-full border flex items-center space-x-2 font-mono font-bold uppercase transition-all ${
            isOnlineState 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-red-50 text-red-800 border-red-200 animate-pulse'
          }`}>
            {isOnlineState ? (
              <>
                <Wifi className="h-3.5 w-3.5" />
                <span>Sincronizado</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5" />
                <span>Modo Resiliente Offline</span>
              </>
            )}
          </div>
          {unreadCount > 0 && (
            <div className="px-3 py-1.5 rounded-full bg-red-600 text-white font-black font-mono">
              {unreadCount} PENDENTES
            </div>
          )}
        </div>
      </div>

      {/* Main Structural Tabs Grid */}
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar Controls & Simulation Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-1">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Módulos de Sistema</h3>
            
            <button 
              onClick={() => setActiveTab('inbox')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                activeTab === 'inbox' 
                  ? 'bg-black text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-black'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Inbox className="h-4 w-4" />
                <span>Inbox de Comunicação</span>
              </div>
              {unreadCount > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono leading-none ${
                  activeTab === 'inbox' ? 'bg-white text-black' : 'bg-red-200 text-red-900'
                }`}>
                  {unreadCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab('incidents')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                activeTab === 'incidents' 
                  ? 'bg-black text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-black'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Flame className="h-4 w-4" />
                <span>Tratamento de Incidentes</span>
              </div>
              {activeIncidentsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono leading-none bg-red-500 text-white animate-pulse">
                  {activeIncidentsCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab('observability')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                activeTab === 'observability' 
                  ? 'bg-black text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-black'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Activity className="h-4 w-4" />
                <span>Observabilidade de Entrega</span>
              </div>
            </button>

            <button 
              onClick={() => setActiveTab('preferences')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                activeTab === 'preferences' 
                  ? 'bg-black text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-black'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Sliders className="h-4 w-4" />
                <span>Definições e Canais</span>
              </div>
            </button>
          </div>

          {/* SIMULATION ACTIONS FOR DEMO AND RED-TEAM AUDITING */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">
                Simulador Operacional
              </h3>
              <span className="text-[10px] text-gray-400 block">Use para injetar sinistros e testar o tempo de retentativa e escalações</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 pt-1">
              <button 
                onClick={() => triggerCustomSimulation('report')}
                className="w-full py-2.5 px-3 rounded-xl border border-gray-100 hover:bg-gray-50 text-[11px] font-bold text-left flex items-center space-x-2 text-neutral-700 hover:text-black transition-all"
              >
                <Plus className="h-3.5 w-3.5 text-sky-500" />
                <span>Simular Envio de POP Téclico</span>
              </button>
              
              <button 
                onClick={() => triggerCustomSimulation('stock')}
                className="w-full py-2.5 px-3 rounded-xl border border-gray-100 hover:bg-gray-50 text-[11px] font-bold text-left flex items-center space-x-2 text-neutral-700 hover:text-black transition-all"
              >
                <Plus className="h-3.5 w-3.5 text-orange-500" />
                <span>Simular Escassez de Estoque</span>
              </button>

              <button 
                onClick={() => triggerCustomSimulation('margin')}
                className="w-full py-2.5 px-3 rounded-xl border border-gray-100 hover:bg-gray-50 text-[11px] font-bold text-left flex items-center space-x-2 text-neutral-700 hover:text-black transition-all"
              >
                <Plus className="h-3.5 w-3.5 text-emerald-500" />
                <span>Simular Ajuste Comercial Comercial</span>
              </button>

              <button 
                onClick={() => triggerCustomSimulation('spill')}
                className="w-full py-2.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 text-[11px] font-bold text-left flex items-center space-x-2 text-red-900 transition-all"
              >
                <Flame className="h-3.5 w-3.5 text-red-600 animate-pulse" />
                <span>Simular Vazamento Crítico</span>
              </button>
            </div>
          </div>
        </div>

        {/* Core Screen Workspaces */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* INBOX SECTION */}
            {activeTab === 'inbox' && (
              <motion.div 
                key="inbox-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Search & Granular Filter Bars */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="w-full md:w-1/3">
                    <input 
                      type="text"
                      placeholder="Filtrar conteúdo por palavra-chave..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs font-semibold px-4 py-2.5 bg-[#f8f9fa] border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    {/* Category Selector */}
                    <select 
                      value={selectedCategory} 
                      onChange={(e: any) => setSelectedCategory(e.target.value)}
                      className="text-xs font-bold px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                    >
                      <option value="all">Todas Categorias</option>
                      <option value="operations">Operações</option>
                      <option value="financial">Financeiro</option>
                      <option value="workflow">Aprovações (Workflows)</option>
                      <option value="sync">Sincronismo</option>
                      <option value="incident">Sinistros</option>
                    </select>

                    {/* Status Select */}
                    <select 
                      value={selectedStatus} 
                      onChange={(e: any) => setSelectedStatus(e.target.value)}
                      className="text-xs font-bold px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                    >
                      <option value="all">Todos Status</option>
                      <option value="unread">Não Lidos</option>
                      <option value="read">Lidos</option>
                      <option value="archived">Arquivados</option>
                    </select>

                    <button 
                      onClick={() => markAllAsRead()}
                      className="text-[11px] font-black uppercase text-gray-500 hover:text-black py-2 px-3 hover:bg-gray-50 rounded-xl border border-dotted border-gray-200 flex items-center space-x-1 transition-all"
                    >
                      <CheckCircle className="h-3.5 w-3.5 text-gray-400" />
                      <span>Limpar Inbox</span>
                    </button>
                  </div>
                </div>

                {/* Inbox List Output */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-7 space-y-3">
                    {filteredNotifications.length === 0 ? (
                      <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center shadow-sm">
                        <Inbox className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                        <h4 className="text-sm font-bold text-neutral-700">Inbox limpo e silencioso</h4>
                        <p className="text-xs text-neutral-400 mt-1">Nenhuma notificação atende aos filtros atuais.</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {filteredNotifications.map((notif) => (
                          <motion.div 
                            key={notif.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.005 }}
                            onClick={() => {
                              setSelectedNotif(notif);
                              if (notif.status === 'unread') {
                                markAsRead(notif.id);
                              }
                            }}
                            className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex items-start space-x-3.5 relative ${
                              selectedNotif?.id === notif.id 
                                ? 'bg-white border-black ring-1 ring-black shadow-md' 
                                : 'bg-white border-gray-100 opacity-95 hover:opacity-100 shadow-xs'
                            }`}
                          >
                            {/* Unread State Tick */}
                            {notif.status === 'unread' && (
                              <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                            )}

                            <div className="p-2.5 bg-gray-50 rounded-lg shrink-0 mt-0.5 border border-gray-100">
                              {getCategoryIcon(notif.category)}
                            </div>

                            <div className="space-y-1.5 min-w-0 flex-1">
                              <div className="flex items-center space-x-2">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 border rounded-md font-mono ${getSeverityBadgeColor(notif.severity)}`}>
                                  {notif.severity}
                                </span>
                                <span className="text-[10px] font-mono text-gray-400">
                                  {formatTimeAgo(notif.timestamp)}
                                </span>
                              </div>

                              <h4 className={`text-xs font-bold truncate ${
                                notif.status === 'unread' ? 'text-black font-black' : 'text-gray-600'
                              }`}>
                                {notif.title}
                              </h4>

                              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                {notif.message}
                              </p>

                              {notif.aiPriorityIndex !== undefined && (
                                <div className="flex items-center space-x-1 text-[10px] font-mono font-bold text-neutral-600">
                                  <Sparkles className="h-3 w-3 text-cyan-500" />
                                  <span>Grau de Urgência AI:</span>
                                  <span className={`px-1.5 py-0.2 rounded-md ${
                                    notif.aiPriorityIndex > 80 ? 'text-red-700 bg-red-50' : 'text-neutral-700 bg-neutral-100'
                                  }`}>
                                    {notif.aiPriorityIndex}/100
                                  </span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ACTIVE SELECTION DETAIL / GEMINI SUMMARY FOCUS DISPLAY */}
                  <div className="md:col-span-5">
                    {selectedNotif ? (
                      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm sticky top-6 space-y-5 text-left">
                        <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">{selectedNotif.category}</span>
                            <h3 className="text-sm font-black text-black leading-snug mt-1">{selectedNotif.title}</h3>
                          </div>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              archiveNotification(selectedNotif.id);
                              setSelectedNotif(null);
                            }}
                            className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-all"
                            title="Arquivar notificação"
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Summary Block */}
                        <div className="space-y-1 bg-[#f8f9fa] p-4 rounded-xl border border-gray-100 relative overflow-hidden">
                          <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                            <span>Compressão de IA (Gemini 3.5-Flash)</span>
                          </h4>
                          <p className="text-xs text-neutral-700 leading-relaxed font-semibold mt-2 italic">
                            "{selectedNotif.aiSummary || 'Processando compressão cognitiva inteligente...'}"
                          </p>
                          {selectedNotif.aiPriorityIndex !== undefined && (
                            <div className="mt-3 flex items-center space-x-2">
                              <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-1000 ${
                                    selectedNotif.aiPriorityIndex > 80 ? 'bg-red-500' : 'bg-neutral-800'
                                  }`}
                                  style={{ width: `${selectedNotif.aiPriorityIndex}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-mono font-black text-gray-800 shrink-0">
                                {selectedNotif.aiPriorityIndex}% prioridade
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Content text */}
                        <div className="text-xs text-gray-600 space-y-3 leading-relaxed">
                          <p className="font-semibold text-gray-800">Mensagem Oficial:</p>
                          <p className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">{selectedNotif.message}</p>
                        </div>

                        {/* Delivery Observability details inside card */}
                        <div className="space-y-2 border-t border-gray-100 pt-4">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Status Multicanal</p>
                          <div className="grid grid-cols-4 gap-2">
                            {Object.entries(selectedNotif.delivery.status).map(([ch, st]) => {
                              if (st === 'not_sent') return null;
                              return (
                                <div key={ch} className="p-2 border border-gray-100 rounded-lg text-center bg-gray-50">
                                  {ch === 'in_app' && <Inbox className="h-3.5 w-3.5 text-sky-500 mx-auto mb-1" />}
                                  {ch === 'push' && <Smartphone className="h-3.5 w-3.5 text-zinc-500 mx-auto mb-1" />}
                                  {ch === 'email' && <Mail className="h-3.5 w-3.5 text-yellow-500 mx-auto mb-1" />}
                                  {ch === 'whatsapp' && <MessageSquare className="h-3.5 w-3.5 text-emerald-500 mx-auto mb-1" />}
                                  <p className="text-[8px] font-mono uppercase font-black tracking-widest leading-none mt-1">{ch}</p>
                                  <span className={`text-[8px] font-mono inline-block mt-1 uppercase px-1 rounded-sm tracking-wide ${
                                    st === 'delivered' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50 animate-pulse'
                                  }`}>
                                    {st === 'delivered' ? 'OK' : 'Pendente'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Fast Actions Bottom bar */}
                        {selectedNotif.actions && selectedNotif.actions.length > 0 && (
                          <div className="border-t border-gray-100 pt-4 space-y-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Ações Contextuais de Escrita</p>
                            {selectedNotif.actions.map((act) => (
                              <button 
                                key={act.id}
                                onClick={() => {
                                  if (act.type === 'ack_incident') {
                                    const matchingInc = incidents.find(i => i.notificationId === selectedNotif.id);
                                    if (matchingInc) {
                                      acknowledgeIncident(matchingInc.id, 'Rodrigo Medeiros (Supervisor)');
                                    }
                                  } else {
                                    alert(`Navegando rota: ${act.routeUrl || '/dashboard'}`);
                                  }
                                }}
                                className="w-full text-xs font-bold py-2.5 px-3 rounded-lg bg-black text-white hover:bg-neutral-800 flex items-center justify-between transition-all"
                              >
                                <span className="truncate">{act.label}</span>
                                <CornerDownRight className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-400 sticky top-6">
                        <Eye className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                        <p className="text-xs font-bold">Selecione uma notificação para exibir análise inteligência e tática de resolução</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* INCIDENTS MANAGEMENT SECTION */}
            {activeTab === 'incidents' && (
              <motion.div 
                key="incidents-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Intro Card */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
                  <div className="text-left">
                    <h3 className="text-sm font-black text-neutral-900 uppercase tracking-tight">Vigilância e Atendimento e Incidentes Sinistros</h3>
                    <p className="text-xs text-neutral-400 mt-1">SLA e trilhas de escalação acelerada de resgate e contenção emergencial em rotas</p>
                  </div>
                  <div className="bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl text-center">
                    <span className="text-[9px] font-mono font-black text-red-600 uppercase block tracking-wider">Fila Crítica Ativa</span>
                    <span className="text-xl font-black text-red-700 font-mono leading-none">{activeIncidentsCount}</span>
                  </div>
                </div>

                {incidents.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center shadow-sm">
                    <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-neutral-700">Tudo calmo nas rotas agrícolas</h4>
                    <p className="text-xs text-neutral-400 mt-1">Nenhum sinistro ambiental ou operacional registrado no momento.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {incidents.map((inc) => (
                      <div 
                        key={inc.id}
                        className={`bg-white rounded-2xl p-5 border transition-all text-left space-y-4 shadow-sm relative overflow-hidden ${
                          inc.status === 'active' ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-100'
                        }`}
                      >
                        {/* Upper Header status banner */}
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-mono text-gray-400">{inc.id}</span>
                            <h4 className="text-xs font-black text-black uppercase mt-0.5">{inc.carrierName || 'Carga Química'}</h4>
                          </div>

                          <span className={`text-[9px] font-mono font-black border uppercase px-2 py-0.5 rounded-md ${
                            inc.status === 'active' 
                              ? 'bg-red-50 text-red-800 border-red-200 animate-pulse' 
                              : inc.status === 'acknowledged' 
                                ? 'bg-amber-50 text-amber-800 border-amber-200' 
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            {inc.status}
                          </span>
                        </div>

                        {/* Description */}
                        <div className="text-xs bg-neutral-50 p-3 rounded-lg border border-neutral-100 text-neutral-600">
                          <p className="font-bold text-gray-800 mb-1">Relatório Técnico:</p>
                          <p>{inc.failureLogString}</p>
                        </div>

                        {/* Interactive Countdown Progress bar if active */}
                        {inc.status === 'active' && (
                          <div className="space-y-1 bg-red-50 p-3 rounded-lg border border-red-100">
                            <div className="flex justify-between text-[10px] font-mono font-bold text-red-800">
                              <span>Próxima escala técnica:</span>
                              <span className="font-bold">Em {activeIncidentCountDown[inc.id] ?? 30}s</span>
                            </div>
                            <div className="w-full bg-red-200 h-1.5 rounded-full overflow-hidden mt-1">
                              <div 
                                className="h-full bg-red-600 transition-all duration-1000"
                                style={{ width: `${((activeIncidentCountDown[inc.id] ?? 30) / 30) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Escalation team lists */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Fila de Transferência de Alçada:</span>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {inc.escalationPath.length === 0 ? (
                              <span className="text-[10px] text-gray-500 font-mono italic">Estágio Máximo Atingido (Conselho Técnico)</span>
                            ) : (
                              inc.escalationPath.map((team, idx) => (
                                <span key={team} className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                                  idx === 0 && inc.status === 'active' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {team}
                                </span>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Log operators actions */}
                        {inc.acknowledgedBy && (
                          <div className="text-[10px] text-neutral-500 font-mono">
                            <span>Atendido por:</span> <strong className="text-neutral-700">{inc.acknowledgedBy}</strong>
                          </div>
                        )}

                        {/* Resolve steps */}
                        {inc.status === 'active' && (
                          <div className="flex gap-2.5 border-t border-gray-100 pt-3">
                            <button 
                              onClick={() => acknowledgeIncident(inc.id, 'Rodrigo (Supervisor)')}
                              className="w-1/2 py-2 text-center text-[11px] font-bold rounded-lg bg-black text-white hover:bg-neutral-800 transition-all"
                            >
                              Parar Alarme
                            </button>
                            <button 
                              onClick={() => resolveIncident(inc.id)}
                              className="w-1/2 py-2 text-center text-[11px] font-bold rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-all"
                            >
                              Resolver
                            </button>
                          </div>
                        )}

                        {inc.status === 'acknowledged' && (
                          <div className="border-t border-gray-100 pt-3">
                            <button 
                              onClick={() => resolveIncident(inc.id)}
                              className="w-full py-2 text-center text-[11px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all"
                            >
                              Finalizar Sinistro e Arquivar
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* OBSERVABILITY SECTION */}
            {activeTab === 'observability' && (
              <motion.div 
                key="observability-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Latency instrumentation meters */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-left">
                  <div className="flex justify-between items-center mb-5">
                    <div>
                      <h3 className="text-sm font-black text-neutral-900 uppercase">Observabilidade de Sincronismo e Latência</h3>
                      <p className="text-xs text-neutral-400 mt-1">Monitoramento real-time de entrega com telemetria de canais push externos</p>
                    </div>
                    <button 
                      onClick={() => refreshMetrics()}
                      className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-all"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-[#f8f9fa] p-4 rounded-xl border border-gray-100 text-left">
                      <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider block">Latência Média</span>
                      <strong className="text-xl font-mono text-black block mt-1">{formatLatency(metrics.averageLatencyMs)}</strong>
                      <span className="text-[9px] text-emerald-600 font-bold block mt-1">Conformidade SLA Anvisa</span>
                    </div>

                    <div className="bg-[#f8f9fa] p-4 rounded-xl border border-gray-100 text-left">
                      <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider block">Taxa de Leitura</span>
                      <strong className="text-xl font-mono text-black block mt-1">{metrics.openRate.toFixed(1)}%</strong>
                      <span className="text-[9px] text-sky-600 font-bold block mt-1">Engajamento de Campo</span>
                    </div>

                    <div className="bg-[#f8f9fa] p-4 rounded-xl border border-gray-100 text-left">
                      <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider block">Fadiga Prevenida</span>
                      <strong className="text-xl font-mono text-black block mt-1">{metrics.alertsPreventedCount} alarmes</strong>
                      <span className="text-[9px] text-indigo-600 font-bold block mt-1">Supressores proativos</span>
                    </div>

                    <div className="bg-[#f8f9fa] p-4 rounded-xl border border-gray-100 text-left">
                      <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider block">Sinistros Tratados</span>
                      <strong className="text-xl font-mono text-black block mt-1">{incidents.filter(i => i.status === 'resolved').length} totais</strong>
                      <span className="text-[9px] text-red-600 font-bold block mt-1">Tempo de Resolução: ~1s</span>
                    </div>
                  </div>
                </div>

                {/* Delivered quantity distribution table */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-left">
                  <h3 className="text-sm font-black text-neutral-900 uppercase mb-4">Volume de Mensagens Entregues por Canal</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold">In-App Feed (Fila Operacional)</span>
                      <strong className="font-mono">{metrics.deliveredByChannel.in_app} disparos</strong>
                    </div>
                    <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full" style={{ width: `${(metrics.deliveredByChannel.in_app / Math.max(1, metrics.totalDelivered)) * 100}%` }} />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold">Dispositivos Móveis (Push PWA)</span>
                      <strong className="font-mono">{metrics.deliveredByChannel.push} disparos</strong>
                    </div>
                    <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden">
                      <div className="h-full bg-black rounded-full" style={{ width: `${(metrics.deliveredByChannel.push / Math.max(1, metrics.totalDelivered)) * 100}%` }} />
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold">WhatsApp S.O.S</span>
                      <strong className="font-mono">{metrics.deliveredByChannel.whatsapp} disparos</strong>
                    </div>
                    <div className="w-full bg-neutral-100 h-2.5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(metrics.deliveredByChannel.whatsapp / Math.max(1, metrics.totalDelivered)) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PREFERENCES CONFIG SECTION */}
            {activeTab === 'preferences' && (
              <motion.div 
                key="preferences-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Granular routing checklist */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-left">
                  <h3 className="text-sm font-black text-neutral-900 uppercase">Preferências e Canais Ativados</h3>
                  <p className="text-xs text-neutral-400 mt-1 mb-5">Ative canais externos para recebimento em campo fora do horário de expediente</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <Inbox className="h-5 w-5 text-zinc-500" />
                        <div>
                          <p className="text-xs font-bold">In-App Feed</p>
                          <span className="text-[9px] text-gray-400">Ativo por regulamento</span>
                        </div>
                      </div>
                      <input type="checkbox" checked={preferences.channelsEnabled.in_app} disabled className="h-4 w-4 rounded" />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="h-5 w-5 text-zinc-500" />
                        <div>
                          <p className="text-xs font-bold">Push Notificações</p>
                          <span className="text-[9px] text-gray-400">Disparo nativo</span>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={preferences.channelsEnabled.push}
                        onChange={(e) => updatePreferences({ channelsEnabled: { ...preferences.channelsEnabled, push: e.target.checked } })}
                        className="h-4 w-4 rounded accent-black" 
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-zinc-500" />
                        <div>
                          <p className="text-xs font-bold">Comunicação por E-mail</p>
                          <span className="text-[9px] text-gray-400">Relatório de fechamento</span>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={preferences.channelsEnabled.email}
                        onChange={(e) => updatePreferences({ channelsEnabled: { ...preferences.channelsEnabled, email: e.target.checked } })}
                        className="h-4 w-4 rounded accent-black" 
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <MessageSquare className="h-5 w-5 text-zinc-500" />
                        <div>
                          <p className="text-xs font-bold">WhatsApp S.O.S</p>
                          <span className="text-[9px] text-gray-400">Sinistros críticos</span>
                        </div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={preferences.channelsEnabled.whatsapp}
                        onChange={(e) => updatePreferences({ channelsEnabled: { ...preferences.channelsEnabled, whatsapp: e.target.checked } })}
                        className="h-4 w-4 rounded accent-black" 
                      />
                    </div>
                  </div>
                </div>

                {/* Periodo silencioso configs */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-left">
                  <h3 className="text-sm font-black text-neutral-900 uppercase mb-4">Configuração de Período Silencioso (Quiet Hours)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">Bloqueio Noturno Ativado</label>
                      <select 
                        value={preferences.quietHours.enabled ? 'true' : 'false'}
                        onChange={(e) => updatePreferences({ quietHours: { ...preferences.quietHours, enabled: e.target.value === 'true' } })}
                        className="w-full text-xs font-bold px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                      >
                        <option value="true">Sim (Guardar notificações comuns)</option>
                        <option value="false">Não (Tratamento direto completo)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">Início do Período</label>
                      <input 
                        type="time" 
                        value={preferences.quietHours.start}
                        onChange={(e) => updatePreferences({ quietHours: { ...preferences.quietHours, start: e.target.value } })}
                        className="w-full text-xs font-bold px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500">Fim do Período</label>
                      <input 
                        type="time" 
                        value={preferences.quietHours.end}
                        onChange={(e) => updatePreferences({ quietHours: { ...preferences.quietHours, end: e.target.value } })}
                        className="w-full text-xs font-bold px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none"
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-3">⚠️ NOTA: Alertas classificados como Sinistros de Operação (Vazamento, Danos à Carga) bypassam o período silencioso de forma mandatório na Anvisa.</span>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default CommunicationDashboard;
