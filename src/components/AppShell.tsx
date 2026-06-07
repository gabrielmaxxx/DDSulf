import React, { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/Sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { MobileNav } from '@/components/MobileNav';
import { NotificationsMenu } from '@/components/NotificationsMenu';
import { UserMenu } from '@/components/UserMenu';
import { useAuth } from '@/contexts/AuthContext';
import { useSystemStore } from '@/store/systemStore';
import { Search, HelpCircle, ChevronRight, Users, Package, FileText, Calendar } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentCompany, companies, clients = [], inventory, agenda = [], pops } = useSystemStore();

  const [globalSearchStr, setGlobalSearchStr] = useState('');

  const currentCompanyName = currentCompany && companies?.[currentCompany]
    ? companies[currentCompany].displayName
    : (user?.name || 'DDSulf');

  // Dynamic search results computation grouped by domain entity
  const searchResults = useMemo(() => {
    if (!globalSearchStr.trim()) return null;
    const q = globalSearchStr.toLowerCase();

    // 1. Clientes
    const foundClients = clients.filter(c => 
      c.name.toLowerCase().includes(q) || 
      (c.phone && c.phone.includes(q)) || 
      (c.cnpjCpf && c.cnpjCpf.includes(q))
    ).slice(0, 3);

    // 2. Produtos (Estoque / Insumos)
    const foundProducts = (inventory?.products || []).filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.category && p.category.toLowerCase().includes(q)) || 
      (p.activeIngredient && p.activeIngredient.toLowerCase().includes(q))
    ).slice(0, 3);

    // 3. Serviços (Agenda / Histórico)
    const foundEvents = agenda.filter(e => 
      e.title.toLowerCase().includes(q) || 
      e.clientName.toLowerCase().includes(q) || 
      ((e as any).technician && (e as any).technician.toLowerCase().includes(q))
    ).slice(0, 3);

    // 4. POPs e Procedimentos
    const foundPops = (pops?.procedures || []).filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.pestType && p.pestType.toLowerCase().includes(q)) || 
      (p.serviceType && p.serviceType.toLowerCase().includes(q))
    ).slice(0, 3);

    const hasResults = foundClients.length > 0 || foundProducts.length > 0 || foundEvents.length > 0 || foundPops.length > 0;

    return {
      clients: foundClients,
      products: foundProducts,
      events: foundEvents,
      pops: foundPops,
      hasResults
    };
  }, [globalSearchStr, clients, inventory, agenda, pops]);

  const handleResultClick = (path: string) => {
    setGlobalSearchStr('');
    navigate(path);
  };

  const matchPathToName = (pathname: string) => {
    const segment = pathname.split('/').filter(Boolean)[0];
    if (!segment) return 'Dashboard';
    
    const map: Record<string, string> = {
      'calculator': 'Calculadora',
      'financial': 'Financeiro',
      'pops': 'POPs e Procedimentos',
      'inventory': 'Estoque',
      'confirmacoes': 'Confirmação de Serviços',
      'agenda': 'Agenda e Serviços',
      'clientes': 'Clientes',
      'ai': 'IA Operacional',
      'settings': 'Configurações'
    };
    
    return map[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  const pathname = location.pathname;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#F8FAFC] font-sans selection:bg-black selection:text-white">
        {/* Sidebar fixa à esquerda */}
        <AppSidebar />
        
        <SidebarInset className="flex flex-col bg-[#F8FAFC] pb-20 md:pb-0 min-w-0">
          {/* HEADER GLOBAL - Altura: 72px */}
          <header className="sticky top-0 z-40 flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200/40 bg-white/85 backdrop-blur-md px-10">
            {/* Esquerda: Breadcrumb */}
            <div className="flex items-center gap-3">
              {/* SidebarTrigger para mobile */}
              <SidebarTrigger className="text-slate-500 hover:text-black hover:bg-slate-100 transition-all rounded-lg size-10 flex md:hidden items-center justify-center shrink-0" />
              
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <Link to="/" className="text-slate-400 hover:text-slate-900 transition-colors font-semibold">
                  Dashboard
                </Link>
                {pathname !== '/' && (
                  <>
                    <ChevronRight className="size-4 text-slate-300 shrink-0" />
                    <span className="text-slate-900 font-semibold font-sans truncate">
                      {matchPathToName(pathname)}
                    </span>
                  </>
                )}
              </nav>
            </div>

            {/* Centro: Espaço vazio */}
            <div className="flex-1" />

            {/* Direita: Busca Global, Notificações, Ajuda, Perfil */}
            <div className="flex items-center gap-4 shrink-0">
              {/* Busca Global: Largura 320px, Altura 44px */}
              <div className="relative w-[320px] h-[44px] hidden sm:block">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar clientes, serviços, produtos ou POPs..."
                  className="w-full h-full pl-10 pr-4 bg-slate-50 border border-slate-200 focus:border-[#1B3A2D] focus:bg-white rounded-xl text-xs placeholder:text-slate-400 outline-none transition-all font-semibold"
                  id="global-search-input"
                  value={globalSearchStr}
                  onChange={(e) => setGlobalSearchStr(e.target.value)}
                />

                {/* Submódulo de Resultados de Busca Unificada sob Demanda */}
                {searchResults && (
                  <div className="absolute top-[52px] right-0 w-[420px] bg-white border border-slate-200/80 rounded-2xl shadow-xl z-50 p-4 max-h-[420px] overflow-y-auto divide-y divide-slate-100 flex flex-col gap-3 text-left">
                    {!searchResults.hasResults ? (
                      <div className="py-8 text-center text-slate-400 text-xs font-medium">
                        <Search className="size-8 mx-auto text-slate-200 mb-1.5" />
                        Nenhum resultado para "{globalSearchStr}"
                      </div>
                    ) : (
                      <>
                        {/* 1. Clientes */}
                        {searchResults.clients.length > 0 && (
                          <div className="pt-2 first:pt-0">
                            <span className="text-[10px] font-black uppercase text-[#1B3A2D] tracking-widest block mb-2 flex items-center gap-1.5"><Users className="size-3 text-[#1B3A2D]" /> Clientes ({searchResults.clients.length})</span>
                            <div className="space-y-1">
                              {searchResults.clients.map(c => (
                                <button
                                  key={c.id}
                                  onClick={() => handleResultClick(`/clientes?clientId=${c.id}`)}
                                  className="w-full p-2 hover:bg-slate-50 rounded-xl transition-all flex items-start gap-2.5 text-left text-xs cursor-pointer"
                                >
                                  <div className="size-6 rounded-full bg-[#1B3A2D]/10 text-[#1B3A2D] font-bold text-[10px] flex items-center justify-center shrink-0">
                                    {c.name.charAt(0)}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-bold text-slate-800 truncate">{c.name}</p>
                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{c.phone || c.email || 'Parceiro Regular'}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 2. Serviços / Agenda */}
                        {searchResults.events.length > 0 && (
                          <div className="pt-3">
                            <span className="text-[10px] font-black uppercase text-amber-700 tracking-widest block mb-2 flex items-center gap-1.5"><Calendar className="size-3 text-amber-500" /> Serviços e Agenda ({searchResults.events.length})</span>
                            <div className="space-y-1">
                              {searchResults.events.map(e => (
                                <button
                                  key={e.id}
                                  onClick={() => handleResultClick(`/agenda?eventId=${e.id}`)}
                                  className="w-full p-2 hover:bg-slate-50 rounded-xl transition-all flex items-start gap-2.5 text-left text-xs cursor-pointer"
                                >
                                  <div className="size-6 rounded bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                                    <Calendar className="size-3" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-bold text-slate-800 truncate">{e.title}</p>
                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{e.clientName} | {e.date}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 3. Estoque */}
                        {searchResults.products.length > 0 && (
                          <div className="pt-3">
                            <span className="text-[10px] font-black uppercase text-indigo-700 tracking-widest block mb-2 flex items-center gap-1.5"><Package className="size-3 text-indigo-500" /> Produtos & Estoque ({searchResults.products.length})</span>
                            <div className="space-y-1">
                              {searchResults.products.map(p => (
                                <button
                                  key={p.id}
                                  onClick={() => handleResultClick(`/inventory?productId=${p.id}`)}
                                  className="w-full p-2 hover:bg-slate-50 rounded-xl transition-all flex items-start gap-2.5 text-left text-xs cursor-pointer"
                                >
                                  <div className="size-6 rounded bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                                    <Package className="size-3" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-bold text-slate-800 truncate">{p.name}</p>
                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">Saldo: {p.quantity} {p.unit}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 4. POPs */}
                        {searchResults.pops.length > 0 && (
                          <div className="pt-3">
                            <span className="text-[10px] font-black uppercase text-emerald-700 tracking-widest block mb-2 flex items-center gap-1.5"><FileText className="size-3 text-emerald-500" /> Procedimentos POPs ({searchResults.pops.length})</span>
                            <div className="space-y-1">
                              {searchResults.pops.map(p => (
                                <button
                                  key={p.id}
                                  onClick={() => handleResultClick(`/pops?popId=${p.id}`)}
                                  className="w-full p-2 hover:bg-slate-50 rounded-xl transition-all flex items-start gap-2.5 text-left text-xs cursor-pointer"
                                >
                                  <div className="size-6 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                                    <FileText className="size-3" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-bold text-slate-800 truncate">{p.name}</p>
                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">Praga: {p.pestType}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Notificações: Botão circular */}
              <div className="relative flex items-center justify-center">
                <NotificationsMenu />
              </div>

              {/* Ajuda: Botão circular */}
              <button 
                title="Ajuda"
                className="size-10 rounded-full border border-slate-200/60 bg-white text-slate-500 hover:text-black hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
              >
                <HelpCircle className="size-5" />
              </button>

              {/* Perfil: Avatar, Nome, Cargo */}
              <div className="flex items-center gap-3 border-l border-slate-200/60 pl-4">
                <div className="flex flex-col text-right hidden lg:flex">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {user?.name || currentCompanyName}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {user?.role || 'Gestor'}
                  </span>
                </div>
                
                <UserMenu />
              </div>
            </div>
          </header>

          {/* Área Principal - Padding: 40px, max-w: 1600px */}
          <main className="flex-1 flex flex-col w-full relative bg-[#F8FAFC]">
            <div className="w-full max-w-[1600px] mx-auto p-10">
              {children}
            </div>
          </main>
        </SidebarInset>

        {/* Dynamic Mobile Bottom Bar Navigation */}
        <MobileNav />
      </div>
    </SidebarProvider>
  );
}
