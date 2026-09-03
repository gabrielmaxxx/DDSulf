export interface ExtendedPOP {
  id: string;
  name: string;
  pestType: string;
  serviceType: string;
  requiredProducts: any[];
  estimatedTimeHoursPer100m2: number;
  fileUrl?: string;
  fileName?: string;
  instructions: string;
  createdAt: string;
  // Extended fields
  category: string;
  subcategory?: string;
  author: string;
  version: string;
  status: 'Ativo' | 'Em revisão' | 'Obsoleto';
  lastRevision: string;
  versions?: { version: string; date: string; change: string; textUrl?: string }[];
}

export interface TrainingCourse {
  id: string;
  title: string;
  description: string;
  duration: string;
  slides: string[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface SuggestedEdit {
  id: string;
  popId: string;
  popName: string;
  proposer: string;
  date: string;
  content: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
}

export const CATEGORIES_TREE = [
  {
    name: 'Operacional',
    icon: 'wrench',
    subs: ['Controle de Baratas', 'Controle de Formigas', 'Controle de Cupins', 'Controle de Roedores', 'Controle de Escorpiões']
  },
  { name: 'Administrativo', icon: 'folder', subs: [] },
  { name: 'Financeiro', icon: 'dollar-sign', subs: [] },
  { name: 'Comercial', icon: 'trending-up', subs: [] },
  { name: 'Sistemas', icon: 'cpu', subs: [] },
  { name: 'Treinamentos', icon: 'graduation-cap', subs: [] }
];

export const DEFAULT_SEEDED_POPS: ExtendedPOP[] = [
  {
    id: 'pop-baratas-res',
    name: 'POP Controle de Baratas Residencial',
    pestType: 'baratas',
    serviceType: 'dedetizacao',
    category: 'Operacional',
    subcategory: 'Controle de Baratas',
    estimatedTimeHoursPer100m2: 1.5,
    author: 'Responsável Técnico',
    version: '2.0',
    status: 'Ativo',
    lastRevision: '15/03/2026',
    createdAt: '2025-01-01',
    requiredProducts: [
      { productId: 'prod-03', productName: 'Gel Baraticida', quantityPer100m2: 2, unit: 'unidade' },
      { productId: 'prod-01', productName: 'Inseticida Piretroide', quantityPer100m2: 50, unit: 'ml' }
    ],
    instructions: `# POP REGULADO - CONTROLE DE BARATAS EM ÁREAS RESIDENCIAIS\n\nEste procedimento padroniza as ações de inspeção e controle de Blattella germanica e Periplaneta americana.\n\n## 1. EQUIPAMENTOS DE SEGURANÇA (EPIs)\n* Luvas químicas de nitrila de cano longo.\n* Máscara semifacial com cartucho para vapores orgânicos/névoas.\n* Óculos panorâmicos de proteção.\n\n## 2. PROCEDIMENTO OPERACIONAL PASSO A PASSO\n1. **Inspeção de Foco**: Iniciar vistoria com lanterna em motores de geladeira, frestas de balcão e caixas de gordura.\n2. **Aspiração Mecânica**: Opcional, para remoção inicial de massas críticas.\n3. **Isquicidade Perimetral**: Aplicar pequenas gotas de gel nos gonzos de armários e gaveteiros operacionais.\n4. **Pulverização Residual**: Tratar rodapés, ralos abertos e tubulações periféricas no perímetro úmido externo para formação de barreira residual durável. Evitar contato com alimentos ou louças domésticas.`,
    versions: [
      { version: '1.0', date: '01/01/2025', change: 'Primeira versão de controle básico aprovada.' },
      { version: '2.0', date: '01/01/2026', change: 'Atualização geral de ingredientes e dosagens por m².' }
    ]
  },
  {
    id: 'pop-formigas',
    name: 'POP Controle Avançado de Formigas Urbanas',
    pestType: 'formigas',
    serviceType: 'dedetizacao',
    category: 'Operacional',
    subcategory: 'Controle de Formigas',
    estimatedTimeHoursPer100m2: 1.2,
    author: 'Responsável Técnico',
    version: '1.2',
    status: 'Ativo',
    lastRevision: '10/01/2026',
    createdAt: '2025-03-10',
    requiredProducts: [
      { productId: 'prod-03', productName: 'Gel Formicida', quantityPer100m2: 1, unit: 'unidade' }
    ],
    instructions: `# CONTROLE INTEGRADO DE FORMIGAS URBANAS (Monomorium pharaonis)\n\n## 1. PREMISSAS IMPORTANTES\nFormigas doceiras são desalojadas e dispersadas agressivamente caso pulverizações químicas irritantes sejam executadas nas proximidades das colônias.\n\n## 2. PROCEDIMENTO EXCLUSIVO DE ISCAGEM\n1. Mapear as trilhas ativas sem espantar as colônias.\n2. Injetar filetes finos de gel paralelo às rotas de passagem secundárias.\n3. Bloquear o acesso de umidade na área imediata para potencializar a atração do gel atrativo.`,
    versions: [
      { version: '1.0', date: '10/03/2025', change: 'Esboço primordial do POP.' },
      { version: '1.2', date: '10/01/2026', change: 'Remoção de indicação de calda líquida nas pias de sanitários.' }
    ]
  },
  {
    id: 'pop-admin-onboarding',
    name: 'POP Integração de Novos Colaboradores Administrativos',
    pestType: 'outro',
    serviceType: 'administrativo',
    category: 'Administrativo',
    estimatedTimeHoursPer100m2: 4,
    author: 'Recursos Humanos',
    version: '1.0',
    status: 'Ativo',
    lastRevision: '12/02/2026',
    createdAt: '2026-02-12',
    requiredProducts: [],
    instructions: `# PROCESSO ADMINISTRATIVO: ONBOARDING INTEGRAL\n\nEste manual guia o fluxo de recepção de recepcionistas e auxiliares de escritório.\n\n## Diretrizes de Entrada:\n1. Coleta de documentação pessoal, carteira técnica e assinatura de contratos.\n2. Concessão de credenciais internas no sistema.\n3. Fornecimento das apostilas operacionais de controle integrado.\n4. Agendamento do Treinamento Inicial Técnico Básico.`,
    versions: [{ version: '1.0', date: '12/02/2026', change: 'Primeiro lançamento oficial após revisão de conformidade.' }]
  },
  {
    id: 'pop-fin-fechamento',
    name: 'POP Processamento de Conciliação e Fechamento Diário de Caixa',
    pestType: 'outro',
    serviceType: 'financeiro',
    category: 'Financeiro',
    estimatedTimeHoursPer100m2: 1,
    author: 'Departamento Financeiro',
    version: '1.1',
    status: 'Ativo',
    lastRevision: '05/04/2026',
    createdAt: '2025-10-15',
    requiredProducts: [],
    instructions: `# GESTÃO FINANCEIRA: FECHAMENTO DE CAIXA\n\nPadronização da conferência orçamentária de serviços finalizados.\n\n## Passos Mandatórios:\n1. No painel operacional, filtrar Ordens de Serviço dadas como 'Executadas' ou 'Concluídas'.\n2. Cruzar com comprovantes de PIX, boletos de depósitos compensados e liquidações de cartões de débito/crédito.\n3. Sinalizar divergências e lançar taxas corporativas na aba correspondente.\n4. Fechar sumário diário e emitir relatório de fechamento gerencial.`,
    versions: [
      { version: '1.0', date: '15/10/2025', change: 'Procedimento inicial.' },
      { version: '1.1', date: '05/04/2026', change: 'Conversão para conciliação bancária estruturada pelo painel.' }
    ]
  },
  {
    id: 'pop-com-pipeline',
    name: 'POP Qualificação de Leads B2B e Cadastro Comercial',
    pestType: 'outro',
    serviceType: 'comercial',
    category: 'Comercial',
    estimatedTimeHoursPer100m2: 2,
    author: 'Equipe Comercial',
    version: '1.0',
    status: 'Ativo',
    lastRevision: '20/05/2026',
    createdAt: '2026-05-20',
    requiredProducts: [],
    instructions: `# FUNIL COMERCIAL: DIRETRIZ DE ATENDIMENTO\n\nEste procedimento define como converter contatos receptivos em propostas estruturadas no sistema.\n\n## Regras Chave:\n1. Investigar metragem total (m²) do imóvel do cliente.\n2. Perguntar praga predominante e se já houveram tratamentos anteriores.\n3. Alimentar a Calculadora Operacional para obter parâmetros de custo e margem mínima.\n4. Enviar proposta comercial detalhada com agilidade.`,
    versions: [{ version: '1.0', date: '20/05/2026', change: 'Lançamento inicial.' }]
  },
  {
    id: 'pop-sys-erp',
    name: 'POP Práticas de Segurança e Acessos ao Sistema',
    pestType: 'outro',
    serviceType: 'sistemas',
    category: 'Sistemas',
    estimatedTimeHoursPer100m2: 0.5,
    author: 'Segurança da Informação',
    version: '1.3',
    status: 'Ativo',
    lastRevision: '22/04/2026',
    createdAt: '2025-05-01',
    requiredProducts: [],
    instructions: `# SEGURANÇA E ACESSO A DADOS\n\nRegras de acesso e manutenção de dados sensíveis de carteira de clientes e operações.\n\n## Diretrizes Fundamentais:\n1. Proibido compartilhar credenciais de acesso individuais com terceiros.\n2. Manter autenticação segura ao acessar em novas redes externas.\n3. Bloqueio automático da sessão após inatividade prolongada.\n4. Registro de logs de atividades e modificações auditáveis de ponta a ponta.`,
    versions: [
      { version: '1.0', date: '01/05/2025', change: 'Abertura padrão.' },
      { version: '1.3', date: '22/04/2026', change: 'Revisão de práticas de segurança da informação.' }
    ]
  }
];

export const SEEDED_TRAININGS: TrainingCourse[] = [
  {
    id: 'train-01',
    title: 'Integração e Código Técnico de Vetores e Pragas',
    description: 'Capacitação inicial para técnicos aplicadores de campo. Conceitos de biossegurança de campo, diluição de caldas químicas e manuseio seguro de defensivos sob regulamentação sanitária.',
    duration: '8 horas',
    slides: [
      'Bem-vindo à Academia de Capacitação PestFlow! Como técnico profissional, sua missão é entregar resultados de controle sanitário preservando a saúde e segurança do cliente e colaboradores.',
      'Aula 1: Biologia de Pragas Urbanas. Entender os hábitos e comportamentos de baratas, roedores e cupins é fundamental para aplicar a dosagem correta nos pontos estratégicos.',
      'Aula 2: Preparo Químico. Sempre vista os EPIs de nitrila e óculos antes de manusear concentrados. Realize tríplice lavagem e meça as frações indicadas com provetas precisas.',
      'Aula 3: Descarte Ecológico. Embalagens vazias devem ser furadas para inutilização, armazenadas adequadamente e destinadas à logística reversa regulamentada.'
    ],
    quiz: [
      {
        question: 'Qual o principal EPI indicado para o manuseio direto de diluição de concentrados químicos?',
        options: ['Luvas de algodão simples', 'Luvas de nitrila de cano longo e respirador químico', 'Apenas óculos comuns', 'Capacete e botas simples'],
        correctIndex: 1,
        explanation: 'Luvas de nitrila resistentes e respirador com filtro protegem contra absorção cutânea e inalação de vapores.'
      },
      {
        question: 'O que deve ser realizado imediatamente após esvaziar totalmente a embalagem de um defensivo concentrado?',
        options: ['Reutilizar a embalagem para água no veículo', 'Tríplice lavagem e inutilização física (furação) do vasilhame', 'Descarte no lixo comum', 'Queimar a embalagem na área externa'],
        correctIndex: 1,
        explanation: 'A tríplice lavagem remove resíduos críticos antes de destinar a embalagem para logística reversa obrigatória.'
      },
      {
        question: 'Por que o uso de inseticidas altamente irritantes em ninhos de formigas doceiras pode ser prejudicial?',
        options: ['Formigas não reagem a defensivos', 'As formigas morrem instantaneamente sem relatar nada', 'Eles fragmentam a colônia e abrem novos ninhos satélites', 'Aumentam o açúcar da cozinha'],
        correctIndex: 2,
        explanation: 'Inseticidas de contato irritantes podem assustar a colônia, induzindo a fragmentação da colônia em novos ninhos.'
      }
    ]
  },
  {
    id: 'train-02',
    title: 'Procedimentos de Diluição Química Segura e Dosagem Prática',
    description: 'Curso focado em cálculos químicos, dosagens por m² e regulagem dos bicos de pulverizadores costais de pressão.',
    duration: '4 horas',
    slides: [
      'Compreensão do fator de calda ativa: uma aplicação correta reduz retornos de garantia e evita desperdício de insumos no estoque da empresa.',
      'Cálculo Prático: Se o POP estipula 50ml de calda por 100m² e o imóvel possui 200m² de área tratada, o operador aplicará no total 100ml de calda concentrada diluída.',
      'Regulagem do Equipamento: Mantenha a pressão constante nos pulverizadores manuais para evitar gotas excessivamente grandes ou deriva por névoa fina.'
    ],
    quiz: [
      {
        question: 'Se um POP indica 50ml de calda para cada 100m², quantos ml serão necessários para um galpão de 400m²?',
        options: ['100ml', '200ml', '150ml', '50ml'],
        correctIndex: 1,
        explanation: 'Multiplicamos a dose unitária pela proporção da área: 50ml x 4 = 200ml.'
      },
      {
        question: 'Qual o tipo de bico de pulverização mais indicado para cobertura residual homogênea sobre rodapés e superfícies?',
        options: ['Bico tipo Leque plano regulado', 'Bico tipo Cone cheio', 'Bico de fluxo livre sem ponteira', 'Mangueira direta'],
        correctIndex: 0,
        explanation: 'Os bicos tipo leque plano distribuem uma faixa uniforme de gotas médias ideal para barreiras residuais.'
      }
    ]
  }
];
