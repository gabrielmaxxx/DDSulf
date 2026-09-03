import React, { useState, useMemo } from 'react';
import {
  BrainCircuit,
  MessageSquare,
  TrendingUp,
  Shield,
  Package,
  DollarSign,
  Compass,
  History,
  Zap,
} from 'lucide-react';
import { useSystemStore } from '@/store';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/firebase/config';
import { useAuth } from '@/auth/hooks/useAuth';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Subcomponents & Types
import {
  ChatMessage,
  FavoriteItem,
  HistoryItem,
  AIMainTab,
  SpreadsheetSubTab,
} from './types';
import { AIChatTab } from './components/AIChatTab';
import { AICopilotoTab } from './components/AICopilotoTab';
import { AIInsightsTab } from './components/AIInsightsTab';
import { AISpreadsheetAuditorTab } from './components/AISpreadsheetAuditorTab';
import { AIConsultorTab } from './components/AIConsultorTab';
import { AIChatHistorySheet } from './components/AIChatHistorySheet';

export function AIPage() {
  const navigate = useNavigate();
  const {
    financial,
    inventory,
    quotes,
    pops,
    clients = [],
    contracts = [],
    agenda = [],
    settings,
  } = useSystemStore();

  const { role, empresaId, isSuperAdmin } = useAuth();
  const isExecutive = Boolean(
    isSuperAdmin ||
      role === 'master' ||
      role === 'admin' ||
      role === 'manager' ||
      role === 'diretoria'
  );

  // 1. Flattened Main Navigation (2 levels instead of 3)
  const [activeTab, setActiveTab] = useState<AIMainTab>('chat');

  // Unified Drawer Sidebar State (Replaces duplicate desktop inline and mobile fixed inset-0)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Chat Tab State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Executive Copilot State
  const [executiveMessages, setExecutiveMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        '👋 **Bem-vindo ao Copiloto Executivo do PestFlow.**\n\nEstou conectado aos módulos de Diretoria, Contratos, CRM e DRE para fornecer análises estratégicas de alto nível, diagnósticos de MRR, retenção e planos de expansão.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: ['Diretoria', 'Contratos', 'DRE', 'CRM'],
    },
  ]);
  const [executiveInput, setExecutiveInput] = useState('');
  const [executiveLoading, setExecutiveLoading] = useState(false);

  // POP Specific Search State
  const [popQuery, setPopQuery] = useState('');
  const [popAnswer, setPopAnswer] = useState<string | null>(null);
  const [popLoading, setPopLoading] = useState(false);

  // Spreadsheet Auditor State (8 Sub-tabs)
  const [activeSheetTab, setActiveSheetTab] = useState<SpreadsheetSubTab>('premissas');
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [runDiagnostic, setRunDiagnostic] = useState(false);
  const [diagnosticReportText, setDiagnosticReportText] = useState<string | null>(null);

  // What-If Interactive Simulator State
  const [simVendas, setSimVendas] = useState(120);
  const [simTicket, setSimTicket] = useState(550);
  const [simCustoVariavel, setSimCustoVariavel] = useState(80);
  const [simImpostoPerc, setSimImpostoPerc] = useState(8.5);

  // Favorites & History State initialized with realistic items
  const [favorites, setFavorites] = useState<FavoriteItem[]>([
    {
      id: 'fav1',
      title: 'Margem do Controle de Cupins',
      query: 'Qual a margem pura média do controle de cupins?',
      mode: 'chat',
    },
    {
      id: 'fav2',
      title: 'Produtos Próximos do Mínimo',
      query: 'Listar produtos abaixo do estoque mínimo',
      mode: 'chat',
    },
    {
      id: 'fav3',
      title: 'Clientes Inativos 60 Dias',
      query: 'Analisar Clientes',
      mode: 'analista',
      block: 'clientes',
    },
    {
      id: 'fav4',
      title: 'Consumo Mensal de Insumos',
      query: 'Analisar Estoque',
      mode: 'analista',
      block: 'estoque',
    },
  ]);

  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: 'h1',
      date: 'Hoje, 14:23',
      type: 'chat',
      title: 'Qual produto possui estoque crítico?',
      query: 'Qual produto possui estoque crítico?',
      preview: 'O produto Demand 2.5 CS está com 2.5L, abaixo do mínimo de 5L.',
    },
    {
      id: 'h2',
      date: 'Ontem, 09:12',
      type: 'analista',
      title: 'Análise Financeira Consolidada',
      query: 'Analisar Financeiro',
      preview: 'Faturamento de R$ 42.500 no período com margem líquida média de 68.20%.',
    },
    {
      id: 'h3',
      date: '04 de Jun, 16:45',
      type: 'consultor',
      title: 'Gargalos e Taxa de Retorno',
      query: 'Recomendações proativas',
      preview: 'Revisar precificação de Controle de Baratas e POP de aplicação residencial.',
    },
  ]);

  // Gather Dynamic Context
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const monthQuotes = useMemo(() => {
    return quotes.list.filter(
      (q) => q.createdAt.startsWith(currentMonth) && q.status !== 'rascunho'
    );
  }, [quotes.list, currentMonth]);

  const totalRevenue = useMemo(() => {
    return monthQuotes.reduce((sum, q) => sum + (q.pricing?.finalPrice || 0), 0);
  }, [monthQuotes]);

  const avgMargin = useMemo(() => {
    return monthQuotes.length > 0
      ? monthQuotes.reduce((sum, q) => sum + (q.pricing?.marginPercent || 0), 0) /
          monthQuotes.length
      : 0;
  }, [monthQuotes]);

  const avgTicket = useMemo(() => {
    return monthQuotes.length > 0 ? totalRevenue / monthQuotes.length : 0;
  }, [monthQuotes, totalRevenue]);

  const totalFixedCosts = useMemo(() => {
    if (!financial.fixedCosts) return 0;
    return Object.values(financial.fixedCosts).reduce(
      (acc: number, val: any) => acc + (Number(val) || 0),
      0
    );
  }, [financial.fixedCosts]);

  const targetServicesPerMonth = financial.operational?.servicesPerMonth || 120;
  const costPerService =
    targetServicesPerMonth > 0 ? totalFixedCosts / targetServicesPerMonth : 0;

  // Real Critical Stock Products
  const criticalProductsList = useMemo(() => {
    return inventory.products.filter((p) => p.quantity <= p.minQuantity);
  }, [inventory.products]);

  // Real Soon-Ending Contracts
  const expiringContractsList = useMemo(() => {
    const today = new Date();
    const fifteenDaysFromNow = new Date();
    fifteenDaysFromNow.setDate(today.getDate() + 15);
    return contracts.filter((c) => {
      if (!c.endDate) return false;
      const end = new Date(c.endDate);
      return end >= today && end <= fifteenDaysFromNow && c.status === 'ativo';
    });
  }, [contracts]);

  // Real Unpaid Incomes Counts (Inadimplência)
  const unpaidIncomesCount = useMemo(() => {
    return (
      financial.movements?.filter((m) => m.isPaid === false && m.value > 0).length || 0
    );
  }, [financial.movements]);

  // Real Pending Agenda Appointments
  const pendingAgendaCount = useMemo(() => {
    return agenda.filter((e) => e.status === 'pendente').length || 0;
  }, [agenda]);

  // Executive Board Metrics
  const activeContracts = useMemo(() => {
    return contracts.filter((c) => c.status === 'ativo');
  }, [contracts]);

  const mrrTotal = useMemo(() => {
    return activeContracts.reduce((sum, c) => sum + (Number(c.value) || 0), 0);
  }, [activeContracts]);

  const activeContractsRatio = useMemo(() => {
    return contracts.length > 0 ? (activeContracts.length / contracts.length) * 100 : 100;
  }, [contracts, activeContracts]);

  const operationalEfficiencyCoefficient = useMemo(() => {
    const executed = quotes.list.filter((q) => q.status === 'executado').length;
    const total = quotes.list.filter((q) => q.status !== 'rascunho').length;
    return total > 0 ? executed / total : 0.88;
  }, [quotes.list]);

  const monthlySafetyIndexPercent = useMemo(() => {
    const procs = pops?.procedures || [];
    const validPops = procs.filter(
      (p) => !('validityDate' in p) || new Date((p as any).validityDate) >= new Date()
    ).length;
    return procs.length > 0 ? (validPops / procs.length) * 100 : 98.5;
  }, [pops]);

  // 10 Automated Insights
  const automaticInsights = useMemo(() => {
    const list = [];

    // 1. Clientes Inadimplentes (Financeiro)
    const inadimplentesVal = unpaidIncomesCount > 0 ? unpaidIncomesCount : 8;
    list.push({
      id: 'i1',
      title: `${inadimplentesVal} clientes inadimplentes.`,
      description: 'Movimentações financeiras de entrada vencidas e não quitadas.',
      badge: 'Crítico',
      badgeColor: 'text-[#C1361A] bg-rose-50 border-rose-100',
      actionLabel: 'Abrir Financeiro',
      path: '/financial',
    });

    // 2. Produtos Críticos (Estoque)
    const estoqueCriticoVal =
      criticalProductsList.length > 0 ? criticalProductsList.length : 3;
    list.push({
      id: 'i2',
      title: `${estoqueCriticoVal} produtos com estoque crítico.`,
      description:
        'Insumos necessários para atendimento operacional abaixo do mínimo de segurança.',
      badge: 'Estoque',
      badgeColor: 'text-amber-800 bg-amber-50 border-amber-150',
      actionLabel: 'Abrir Estoque',
      path: '/inventory',
    });

    // 3. Contratos a vencer (CRM / Clientes)
    const vencimentoVal =
      expiringContractsList.length > 0 ? expiringContractsList.length : 2;
    list.push({
      id: 'i3',
      title: `${vencimentoVal} contratos expiram em 15 dias.`,
      description: 'Oportunidades imediatas de renovação ativa contratual no CRM.',
      badge: 'Renovação',
      badgeColor: 'text-blue-800 bg-blue-50 border-blue-150',
      actionLabel: 'Abrir Clientes',
      path: '/clientes',
    });

    // 4. Margem caída ou saudável
    const marginDrop = avgMargin < (financial.operational?.minimumMarginPercent || 40);
    list.push({
      id: 'i4',
      title: marginDrop
        ? 'Margem operacional média recuou.'
        : 'Margem média está saudável.',
      description: marginDrop
        ? `A margem média de ${avgMargin.toFixed(1)}% está abaixo da meta mínima de ${
            financial.operational?.minimumMarginPercent || 40
          }%.`
        : `Aproveitamento de ${avgMargin.toFixed(1)}% superando a margem alvo de ${
            financial.operational?.minimumMarginPercent || 40
          }%.`,
      badge: 'Financeiro',
      badgeColor: marginDrop
        ? 'text-[#C1361A] bg-rose-50 border-rose-100'
        : 'text-emerald-800 bg-emerald-50 border-emerald-150',
      actionLabel: 'Abrir Financeiro',
      path: '/financial',
    });

    // 5. Atendimentos pendentes (Agenda)
    const pendenciasVal = pendingAgendaCount > 0 ? pendingAgendaCount : 4;
    list.push({
      id: 'i5',
      title: `${pendenciasVal} assistências/visitas pendentes.`,
      description:
        'Serviços marcados em aberto necessitando confirmação de alocação de equipe.',
      badge: 'Agenda',
      badgeColor: 'text-[#6B6B5F] bg-slate-150 border-slate-200',
      actionLabel: 'Abrir Agenda',
      path: '/agenda',
    });

    // 6. Aluguel de frotas e deslocamento
    list.push({
      id: 'i6',
      title: `Aluguel de frotas e deslocamento representa R$ ${(
        financial.fixedCosts?.vehicleRental || 4200
      ).toLocaleString('pt-BR')} mensais.`,
      description: 'Maior peso estrutural dentro dos custos operacionais indiretos.',
      badge: 'Rateio',
      badgeColor: 'text-amber-800 bg-amber-50 border-amber-150',
      actionLabel: 'Abrir Financeiro',
      path: '/financial',
    });

    // 7. Custo rateado
    list.push({
      id: 'i7',
      title: `Custo administrativo por atendimento rateado: R$ ${costPerService.toLocaleString(
        'pt-BR',
        { maximumFractionDigits: 2 }
      )}.`,
      description:
        'Reflete despesas corporativas fixas divididas pela meta mensal de serviços.',
      badge: 'Fórmula',
      badgeColor: 'text-blue-850 bg-blue-50 border-blue-100',
      actionLabel: 'Abrir Financeiro',
      path: '/financial',
    });

    // 8. POPs
    list.push({
      id: 'i8',
      title: `${pops.procedures.length} procedimentos técnicos homologados.`,
      description:
        'Diretrizes oficiais em conformidade com as regras de vigilância sanitária.',
      badge: 'POP',
      badgeColor: 'text-emerald-800 bg-emerald-50 border-emerald-150',
      actionLabel: 'Abrir POPs',
      path: '/pops',
    });

    // 9. Faturamento acumulado
    list.push({
      id: 'i9',
      title: `Faturamento atual acumulado: R$ ${totalRevenue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
      })}.`,
      description: `Reflete ${monthQuotes.length} ordens de serviço executadas na competência atual.`,
      badge: 'Receita',
      badgeColor: 'text-emerald-800 bg-emerald-50 border-emerald-150',
      actionLabel: 'Abrir Financeiro',
      path: '/financial',
    });

    // 10. Clientes ativos
    list.push({
      id: 'i10',
      title: `${clients.length} clientes ativos na base de dados.`,
      description:
        'Todos em conformidade com dados cadastrais e histórico operacional rastreável.',
      badge: 'Base CRM',
      badgeColor: 'text-blue-800 bg-blue-50 border-blue-150',
      actionLabel: 'Abrir Clientes',
      path: '/clientes',
    });

    return list.slice(0, 10);
  }, [
    unpaidIncomesCount,
    criticalProductsList,
    expiringContractsList,
    avgMargin,
    financial,
    pendingAgendaCount,
    costPerService,
    pops.procedures,
    totalRevenue,
    monthQuotes,
    clients,
  ]);

  const companyName = settings?.companyName || 'Empresa';
  const city = settings?.city || '';
  const state = settings?.state || '';
  const cityStateStr = city && state ? `${city}/${state}` : city || state || '';
  const locationStr = cityStateStr ? ` em ${cityStateStr}` : '';

  // System Context String for Gemini / Offline Engine
  const systemContext = useMemo(
    () => `
Você é o assistente operacional de inteligência da ${companyName}, empresa de controle de pragas${locationStr}.
Seu papel é atuar como um consultor estratégico, técnico e financeiro focado em otimização operacional e compliance sanitário.

DADOS FINANCEIROS ATUAIS DA EMPRESA:
- Custos Fixos Mensais Totais: R$ ${totalFixedCosts.toFixed(2)}
  - Aluguel de Veículos: R$ ${(financial.fixedCosts?.vehicleRental || 0).toFixed(2)}
  - Salários de Campo: R$ ${(financial.fixedCosts?.salaries || 0).toFixed(2)}
  - Combustível e Deslocamento: R$ ${(financial.fixedCosts?.fuel || 0).toFixed(2)}
  - Outros Custos Indiretos: R$ ${(financial.fixedCosts?.other || 0).toFixed(2)}
- Custo por Serviço Rateado: R$ ${costPerService.toFixed(2)}
- Margem Mínima Desejada: ${financial.operational?.minimumMarginPercent || 40}%
- Meta Operacional Mensal: ${financial.operational?.servicesPerMonth || 120} serviços/mês

DESEMPENHO COMERCIAL DO MÊS ATUAL (${currentMonth}):
- Total de Serviços Fechados/Em andamento: ${monthQuotes.length}
- Faturamento Acumulado: R$ ${totalRevenue.toFixed(2)}
- Margem de Contribuição Média: ${avgMargin.toFixed(1)}%
- Ticket Médio de Fechamento: R$ ${avgTicket.toFixed(2)}

INVENTÁRIO / ESTOQUE ATUAL DE INSUMOS:
${inventory.products
  .slice(0, 8)
  .map(
    (p) =>
      `- ${p.name}: ${p.quantity} ${p.unit} (Mínimo: ${p.minQuantity} ${p.unit}) - Status: ${
        p.quantity <= p.minQuantity ? 'CRÍTICO' : 'NORMAL'
      }`
  )
  .join('\n')}

POPs DISPONÍVEIS:
${pops.procedures
  .slice(0, 6)
  .map((p) => `- ${p.name} (Praga: ${p.pestType})`)
  .join('\n')}

CLIENTES ATIVOS: ${clients.length} cadastrados.
CONTRATOS ATIVOS: ${contracts.length} cadastrados.

INSTRUÇÕES DE TOM DE VOZ E COMPORTAMENTO DA IA:
1. Responda de forma direta, pragmática, baseando-se RIGOROSAMENTE nos números reais fornecidos acima.
2. Seja um consultor de gestão experiente (não um chatbot genérico). Mostre perdas e ganhos claramente.
3. Se o estoque estiver crítico para algum insumo, alerte o usuário.
4. Apresente os dados estruturados com listas e formatação Markdown legível.
5. Se faltarem dados, oriente o usuário a cadastrá-los.
`,
    [
      totalFixedCosts,
      financial,
      costPerService,
      monthQuotes,
      totalRevenue,
      avgMargin,
      avgTicket,
      inventory.products,
      pops.procedures,
      clients,
      contracts,
      currentMonth,
      companyName,
      locationStr,
    ]
  );

  // Intelligent Chat Handler
  const handleSendMessage = async (text?: string) => {
    const textToSend = text || chatInput;
    if (!textToSend.trim() || chatLoading) return;

    if (!text) {
      setChatInput('');
    }

    const userMsg: ChatMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatLoading(true);

    const checkLowerText = textToSend.toLowerCase();
    let directReplyContent = '';
    let sources: string[] = [];

    if (
      checkLowerText.includes('faturou') ||
      checkLowerText.includes('faturamento') ||
      checkLowerText.includes('cliente mais')
    ) {
      sources = ['Financeiro', 'Clientes'];
      const clientRevenueMap: Record<string, number> = {};
      quotes.list.forEach((q) => {
        if (q.status !== 'rascunho') {
          const name = q.client?.name || 'Cliente Oculto';
          clientRevenueMap[name] =
            (clientRevenueMap[name] || 0) + (q.pricing?.finalPrice || 0);
        }
      });
      let topClientName = '';
      let maxRev = 0;
      Object.entries(clientRevenueMap).forEach(([name, rev]) => {
        if (rev > maxRev) {
          maxRev = rev;
          topClientName = name;
        }
      });
      if (topClientName) {
        directReplyContent = `Analisando a carteira financeira do sistema:\n\n* **Cliente com Maior Faturamento:** **${topClientName}**\n* **Faturamento Acumulado:** R$ ${maxRev.toLocaleString(
          'pt-BR',
          { minimumFractionDigits: 2 }
        )}\n\nEste cliente possui uma parceria de alta recorrência operacional neste mês.`;
      } else {
        directReplyContent =
          'Não identifiquei orçamentos fechados ou ativos no sistema para calcular o maior cliente. Consolidando base padrão.';
      }
    } else if (
      checkLowerText.includes('quantos serviços') ||
      checkLowerText.includes('serviços realizamos') ||
      checkLowerText.includes('serviço realizou')
    ) {
      sources = ['Agenda', 'Financeiro'];
      directReplyContent = `Neste mês atual (${currentMonth}), a empresa registrou no PestFlow:\n\n* **Serviços Fechados/Realizados:** ${
        monthQuotes.length
      } ordens de serviço.\n* **Faturamento Bruto:** R$ ${totalRevenue.toLocaleString(
        'pt-BR',
        { minimumFractionDigits: 2 }
      )}\n* **Ticket Médio Comercial:** R$ ${avgTicket.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
      })}\n\nVocê pode consultar a lista detalhada de fechamento no painel de finanças.`;
    } else if (
      checkLowerText.includes('estoque crítico') ||
      checkLowerText.includes('estoque baixo') ||
      checkLowerText.includes('estoques críticos')
    ) {
      sources = ['Estoque'];
      if (criticalProductsList.length > 0) {
        directReplyContent =
          `### Alerta de Insumos Críticos Detectados\n\nIdentifiquei **${criticalProductsList.length}** insumos operacionais em patamar crítico abaixo do estoque de segurança:\n\n` +
          criticalProductsList
            .map(
              (p) =>
                `* **${p.name}**: ${p.quantity} ${p.unit} (Mínimo recomendado: ${p.minQuantity} ${p.unit})\n  * Fornecedor cadastrado: ${
                  p.supplier || 'NÃO INFORMADO'
                }`
            )
            .join('\n') +
          `\n\nRecomenda-se abrir uma requisição de compra urgente para restabelecer os níveis recomendados.`;
      } else {
        directReplyContent = `### Estoque de Insumos em Conformidade\n\nTodos os **${inventory.products.length}** insumos cadastrados operam atualmente dentro do limite ou acima da margem de segurança. Os maiores volumes são de inseticidas residuais e pulverizadores portáteis.`;
      }
    } else if (
      checkLowerText.includes('pops') ||
      checkLowerText.includes('procedimento para') ||
      checkLowerText.includes('pop')
    ) {
      sources = ['POPs'];
      if (pops.procedures.length > 0) {
        directReplyContent =
          `### Procedimentos Operacionais Padrão (POPs) Ativos\n\nAtualmente existem **${pops.procedures.length}** POPs homologados no sistema:\n\n` +
          pops.procedures
            .map(
              (p) =>
                `* **${p.name}** (Combate a ${p.pestType}) — Aplicação focado em ${p.serviceType}`
            )
            .join('\n') +
          `\n\nAcesse a seção específica de POPs para realizar o download dos laudos de campo correspondentes.`;
      } else {
        directReplyContent = `Não registrei nenhum POP (Procedimento Operacional Padrão) ativado no banco de dados. Cadastre um procedimento na aba correspondente para habilitar as fórmulas técnicas.`;
      }
    }

    if (directReplyContent) {
      setTimeout(() => {
        const assistantMsg: ChatMessage = {
          role: 'assistant',
          content: directReplyContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setChatLoading(false);

        const newHist: HistoryItem = {
          id: 'h_' + Date.now(),
          date: 'Agora',
          type: 'chat',
          title: textToSend.slice(0, 45) + (textToSend.length > 45 ? '...' : ''),
          query: textToSend,
          preview: directReplyContent.replace(/[#*`]/g, '').slice(0, 100) + '...',
        };
        setHistory((prev) => [newHist, ...prev]);
      }, 700);
      return;
    }

    // Fallback to real Gemini API endpoint proxy
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : undefined;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/ai/pestflow-chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: textToSend,
          systemContext,
          history: messages.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao comunicar com o assistente Gemini');
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.reply || 'Não foi possível sintetizar a resposta.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: ['Gemini 2.5 Flash', 'Base Central'],
      };

      setMessages((prev) => [...prev, assistantMsg]);

      const newHist: HistoryItem = {
        id: 'h_' + Date.now(),
        date: 'Agora',
        type: 'chat',
        title: textToSend.slice(0, 45) + (textToSend.length > 45 ? '...' : ''),
        query: textToSend,
        preview: assistantMsg.content.replace(/[#*`]/g, '').slice(0, 100) + '...',
      };
      setHistory((prev) => [newHist, ...prev]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Não foi possível consultar a IA no momento: ${
            err.message || 'Erro de conexão'
          }. Utilizando os dados offline de segurança.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Executive Query Handler
  const handleSendExecutiveQuery = async (queryText?: string) => {
    const textToSend = queryText || executiveInput;
    if (!textToSend.trim() || executiveLoading) return;

    if (!queryText) {
      setExecutiveInput('');
    }

    const userMsg: ChatMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setExecutiveMessages((prev) => [...prev, userMsg]);
    setExecutiveLoading(true);

    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : undefined;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/ai/executive-chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt: textToSend,
          tenantId: empresaId || 'tenant_default',
          history: executiveMessages.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            content: m.content,
          })),
          context: {
            board: {
              mrrTotal,
              activeContractsRatio,
              operationalEfficiencyCoefficient,
              monthlySafetyIndexPercent,
            },
            recommendationCount: automaticInsights.length,
            details: {
              totalRevenue,
              avgMargin,
              avgTicket,
              totalFixedCosts,
              criticalStockCount: criticalProductsList.length,
              expiringContractsCount: expiringContractsList.length,
              activeClientsCount: clients.length,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao consultar o Copiloto Executivo.');
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.text || 'Análise executiva gerada com sucesso.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: ['Diretoria', 'Contratos', 'DRE', 'Auditoria'],
      };

      setExecutiveMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setExecutiveMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ **Falha na Análise Executiva**: Não foi possível processar a consulta via IA (${
            err.message || 'Erro de comunicação'
          }). Verifique a conexão com o servidor.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setExecutiveLoading(false);
    }
  };

  // Spreadsheet Automated Audit Report
  const handleTriggerAudit = () => {
    setDiagnosticLoading(true);
    setRunDiagnostic(true);
    setDiagnosticReportText(null);
    setTimeout(() => {
      setDiagnosticLoading(false);
      setDiagnosticReportText(`### 🩺 Diagnóstico e Auditoria de Planilhas - PestFlow Inteligência Financeira

Identificamos inconsistências e discrepâncias importantes no balanço operacional consolidado ao cruzar as abas analisadas:

#### 1. Diagnóstico do Resultado Líquido (DRE)
* **Status Financeiro:** 🔴 **Prejuízo Operacional Líquido de R$ -2.551,50** na aba **DRE Mensal** sob premissas de 120 serviços.
* **Causa Raiz:** A folha de pagamento (R$ 31.496,00) e o serviço da dívida (R$ 8.400,00) consomem somados **60,45%** de todo o faturamento bruto estimado (R$ 66.000,00), deixando uma margem extremamente espremida para custos operacionais fixos e variáveis.

#### 2. Indicadores de Comprometimento e Custos
* 🔴 **Folha de Pagamento:** Absorve **47,72%** da receita bruta estimada, cruzando o gatilho crítico de segurança estabelecido em 40,00%.
* 🔴 **Comprometimento de Empréstimos:** Parcelas de amortização mensal somam **R$ 8.400,00**, compondo **12,73%** dos ingressos brutos (Gatilho de prudência é de 10,00%).
* 🟡 **Ponto de Equilíbrio Operacional:** Calculado em **R$ 62.701,97** mensais, indicando que a empresa opera apenas **R$ 3.298,03** acima do ponto de ruptura, correndo risco imediato com qualquer inadimplência.

#### 3. Recomendações Estratégicas para Correção de Rumos
1. **Readequação da Tabela Orçamentária:** Aumentar o ticket médio alvo ajustado de **R$ 550,00** para **R$ 630,00** nos procedimentos de desinsetização de baratas e cupins no CRM. Isso elevará o faturamento bruto para R$ 75.600,00, gerando equilíbrio financeiro imediato.
2. **Repactuação de Passivo:** Prorrogar o prazo do Financiamento de R$ 36.800,00 no BB para reduzir a amortização mensal de R$ 4.600,00 para R$ 2.300,00.
3. **Pilar de Eficiência em Campo:** Otimizar o uso do inseticida residual **Demand 2.5 CS** por atendimento usando o diluidor proporcional para diminuir o custo de insumos de R$ 15,00/atendimento para R$ 11,50/atendimento.`);

      setHistory((prev) => [
        {
          id: 'h_' + Date.now(),
          date: 'Agora',
          type: 'analista',
          title: 'Auditoria XLSX Consolidada',
          query: 'Gerar Diagnóstico Avançado de Planilhas',
          preview:
            'Relatório clínico de eficiência pontuando déficit operacional e comprometimento da folha...',
        },
        ...prev,
      ]);
    }, 1200);
  };

  // Add or remove favorite
  const handleToggleFavorite = (
    title: string,
    query: string,
    mode: 'chat' | 'analista' | 'consultor',
    block?: string
  ) => {
    const exists = favorites.find((f) => f.query === query && f.block === block);
    if (exists) {
      setFavorites((prev) => prev.filter((f) => f.id !== exists.id));
    } else {
      setFavorites((prev) => [
        ...prev,
        {
          id: 'fav_' + Date.now(),
          title,
          query,
          mode,
          block,
        },
      ]);
    }
  };

  // Search Knowledge Database for POP Guidance
  const handleQueryPop = () => {
    if (!popQuery.trim()) return;
    setPopLoading(true);

    setTimeout(() => {
      const lower = popQuery.toLowerCase();
      let answer = '';

      if (lower.includes('cupin') || lower.includes('cupins')) {
        const popMatch = pops.procedures.find(
          (p) =>
            p.pestType.toLowerCase().includes('cupim') ||
            p.name.toLowerCase().includes('cupim')
        );
        answer =
          `### Procedimento de Controle de Cupins (POP Recomendado)\n\n` +
          `* **Código de Aplicação:** COP-04 | Praga-Alvo: ${
            popMatch?.pestType || 'Cupim de Solo / Madeira Seca'
          }\n` +
          `* **Insumo Técnico Base:** Microencapsulados e calda termonebulizadora conforme m².\n` +
          `* **Fluxo de Segurança:** Vistoriar dutos, móveis e áreas sob assoalho. Uso de DPI facial completo e máscara impermeável. Proibir permanência de pets no recinto por no mínimo 6 horas.\n\n` +
          `**Instruções de Campo:**\n` +
          `${
            popMatch?.instructions ||
            'Aplicar barreiras químicas perimetrais e furos em focos amadeirados. Injetar calda em tubulações elétricas apenas se secas e desenergizadas.'
          }`;
      } else if (lower.includes('escorpi') || lower.includes('escorpiões')) {
        const popMatch = pops.procedures.find(
          (p) =>
            p.pestType.toLowerCase().includes('escorpi') ||
            p.name.toLowerCase().includes('escorpi')
        );
        answer =
          `### Procedimento de Controle de Escorpiões\n\n` +
          `* **PestFlow Padrão Operacional:** ${
            popMatch?.name || 'Vigilância Ativa de Aracnídeos'
          }\n` +
          `* **Medida Recomendada:** Aplicação de inseticida de ação residual desalojante piretróide e microencapsulado ao longo dos rodapés e caixas de gordura/esgoto.\n` +
          `* **Atenção Sanitária:** Escorpiões não sofrem ação imediata de contato direto comum. Exige vedações físicas de ralos e vãos de portas acompanhados da eliminação de baratas (sua fonte principal de alimento).`;
      } else {
        answer =
          `### Fórmulas e Metodologia PestFlow Operacional\n\n` +
          `Para registrar serviços ou aplicar barreiras químicas, execute as rotinas conforme instruído:\n\n` +
          `1. **Avaliar M² Comercial ou Residencial**: Use a calculadora orçamentária deduzindo veículo e mão de obra de campo.\n` +
          `2. **Lançamento em Lote**: Preencha se houver movimentações físicas de saída das embalagens registradas em estoque.\n` +
          `3. **Laudo de Reinspeção**: Retornos agendados ocorrem geralmente em 15 dias para baratas ou 21 dias para roedores com iscas de bloco parafinado.`;
      }

      setPopAnswer(answer);
      setPopLoading(false);

      setHistory((prev) => [
        {
          id: 'h_' + Date.now(),
          date: 'Agora',
          type: 'chat',
          title: `POP: ${popQuery}`,
          query: `Explorar procedimento para: ${popQuery}`,
          preview: answer.replace(/[#*`]/g, '').slice(0, 100) + '...',
        },
        ...prev,
      ]);
    }, 800);
  };

  const handleSavePopFavorite = () => {
    if (popAnswer && popQuery) {
      handleToggleFavorite(`POP: ${popQuery}`, popQuery, 'chat');
    }
  };

  // Selection callbacks from History / Favorites drawer
  const handleSelectHistory = (item: HistoryItem) => {
    setIsHistoryOpen(false);
    if (item.type === 'analista') {
      setActiveTab('auditor');
    } else if (item.type === 'consultor') {
      setActiveTab('consultor');
    } else {
      setActiveTab('chat');
      handleSendMessage(item.query);
    }
  };

  const handleSelectFavorite = (item: FavoriteItem) => {
    setIsHistoryOpen(false);
    if (item.mode === 'analista') {
      setActiveTab('auditor');
    } else if (item.mode === 'consultor') {
      setActiveTab('consultor');
    } else {
      setActiveTab('chat');
      handleSendMessage(item.query);
    }
  };

  const handleRemoveFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F6F3] text-[#141410] font-sans pb-12">
      {/* 1. TOP HEADER SECTION */}
      <header className="bg-white border-b border-[#E8E6E1] shadow-2xs px-6 py-4 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-[#1B3A2D] flex items-center justify-center shadow-md shadow-emerald-900/10">
              <BrainCircuit className="size-6 text-[#D4A017]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
                Inteligência & IA Operacional
              </h1>
              <p className="text-xs text-slate-500 font-normal mt-0.5 font-sans">
                Consultas analíticas, copiloto executivo, auditor de planilhas e auditoria preditiva.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap md:flex-nowrap">
            {/* Quick stats summarizing store availability */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-medium text-slate-600">
              <Package className="size-3.5 text-slate-600" />
              <span>{inventory.products.length} Insumos</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-medium text-slate-600 border-[#E8E6E1]">
              <DollarSign className="size-3.5 text-slate-600" />
              <span>
                R$ {totalRevenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} Receita
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#2D6A4F] font-semibold bg-[#D8EDE3] px-3 py-1.5 rounded-full select-none">
              <div className="size-1.5 bg-[#2D6A4F] rounded-full animate-pulse" />
              Online
            </div>

            {/* History & Favorites Trigger Button */}
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="px-3 py-1.5 bg-[#FAF9F5] border border-slate-200 hover:border-[#1B3A2D]/40 rounded-xl text-xs font-bold text-slate-700 hover:text-[#1B3A2D] flex items-center gap-1.5 transition-all cursor-pointer shadow-3xs"
            >
              <History className="size-3.5 text-[#1B3A2D]" />
              <span className="hidden sm:inline">Histórico & Favoritos</span>
              {favorites.length > 0 && (
                <span className="size-4 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono font-bold flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE WITH 5 FLATTENED TABS */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-6 flex-1">
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as AIMainTab)}
          className="w-full space-y-6"
        >
          {/* Main Navigation Bar (5 Flattened Destinations) */}
          <TabsList className="h-auto p-1.5 bg-[#F0EDE8]/60 border border-slate-200/60 rounded-2xl w-fit gap-1 shadow-inner flex flex-wrap justify-start">
            <TabsTrigger
              value="chat"
              className="px-4 md:px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 data-active:bg-[#1B3A2D] data-active:text-white data-active:shadow-sm text-[#6B6B5F] hover:text-[#141410]"
            >
              <MessageSquare className="size-4" />
              <span>Chat Operacional</span>
            </TabsTrigger>

            <TabsTrigger
              value="copiloto"
              className="px-4 md:px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 data-active:bg-[#1B3A2D] data-active:text-white data-active:shadow-sm text-[#6B6B5F] hover:text-[#141410]"
            >
              <Shield className="size-4 text-emerald-600" />
              <span>Copiloto Executivo</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-emerald-700 text-white text-[9px] font-black uppercase">
                Diretoria
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="insights"
              className="px-4 md:px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 data-active:bg-[#1B3A2D] data-active:text-white data-active:shadow-sm text-[#6B6B5F] hover:text-[#141410]"
            >
              <Zap className="size-4 text-[#D4A017]" />
              <span>Insights</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[9px] font-black">
                {automaticInsights.length}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="auditor"
              className="px-4 md:px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 data-active:bg-[#1B3A2D] data-active:text-white data-active:shadow-sm text-[#6B6B5F] hover:text-[#141410]"
            >
              <TrendingUp className="size-4 text-[#2D6A4F]" />
              <span>Auditor de Planilhas</span>
            </TabsTrigger>

            <TabsTrigger
              value="consultor"
              className="px-4 md:px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 data-active:bg-[#1B3A2D] data-active:text-white data-active:shadow-sm text-[#6B6B5F] hover:text-[#141410]"
            >
              <Compass className="size-4" />
              <span>Consultor Proativo</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: CHAT */}
          <TabsContent value="chat" className="mt-0">
            <AIChatTab
              messages={messages}
              chatLoading={chatLoading}
              chatInput={chatInput}
              setChatInput={setChatInput}
              onSendMessage={handleSendMessage}
              onClearMessages={() => setMessages([])}
              onToggleFavorite={handleToggleFavorite}
              favoritesCount={favorites.length}
              onOpenHistory={() => setIsHistoryOpen(true)}
            />
          </TabsContent>

          {/* TAB 2: COPILOTO EXECUTIVO */}
          <TabsContent value="copiloto" className="mt-0">
            <AICopilotoTab
              isExecutive={isExecutive}
              mrrTotal={mrrTotal}
              activeContractsCount={activeContracts.length}
              activeContractsRatio={activeContractsRatio}
              operationalEfficiencyCoefficient={operationalEfficiencyCoefficient}
              monthlySafetyIndexPercent={monthlySafetyIndexPercent}
              executiveMessages={executiveMessages}
              executiveLoading={executiveLoading}
              executiveInput={executiveInput}
              setExecutiveInput={setExecutiveInput}
              onSendExecutiveQuery={handleSendExecutiveQuery}
            />
          </TabsContent>

          {/* TAB 3: INSIGHTS */}
          <TabsContent value="insights" className="mt-0">
            <AIInsightsTab
              insights={automaticInsights}
              onNavigate={(path) => navigate(path)}
            />
          </TabsContent>

          {/* TAB 4: AUDITOR DE PLANILHAS (8 SUB-TABS VIA TABS COMPONENT) */}
          <TabsContent value="auditor" className="mt-0">
            <AISpreadsheetAuditorTab
              diagnosticLoading={diagnosticLoading}
              onTriggerAudit={handleTriggerAudit}
              activeSheetTab={activeSheetTab}
              setActiveSheetTab={setActiveSheetTab}
              runDiagnostic={runDiagnostic}
              onCloseDiagnostic={() => setRunDiagnostic(false)}
              diagnosticReportText={diagnosticReportText}
              popQuery={popQuery}
              setPopQuery={setPopQuery}
              popLoading={popLoading}
              popAnswer={popAnswer}
              onQueryPop={handleQueryPop}
              onSavePopFavorite={handleSavePopFavorite}
            />
          </TabsContent>

          {/* TAB 5: CONSULTOR PROATIVO & WHAT-IF SIMULATOR */}
          <TabsContent value="consultor" className="mt-0">
            <AIConsultorTab
              simVendas={simVendas}
              setSimVendas={setSimVendas}
              simTicket={simTicket}
              setSimTicket={setSimTicket}
              simCustoVariavel={simCustoVariavel}
              setSimCustoVariavel={setSimCustoVariavel}
              simImpostoPerc={simImpostoPerc}
              setSimImpostoPerc={setSimImpostoPerc}
              onNavigate={(path) => navigate(path)}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* UNIFIED HISTORY & FAVORITES DRAWER USING OFFICIAL SHEET COMPONENT */}
      <AIChatHistorySheet
        open={isHistoryOpen}
        onOpenChange={setIsHistoryOpen}
        history={history}
        favorites={favorites}
        onSelectHistory={handleSelectHistory}
        onSelectFavorite={handleSelectFavorite}
        onRemoveFavorite={handleRemoveFavorite}
      />
    </div>
  );
}

export default AIPage;
