/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { TestType, TestStatus, TestCase, ChaosExperiment, SecurityAuditResult, AIConsistencyMetric } from '../types';

export const INITIAL_TEST_CASES: TestCase[] = [
  // --- UNIT TESTS ---
  {
    id: 'ut_01_calc_dosage',
    name: 'Cálculo de Dosagem Estequiométrica',
    description: 'Valida se o volume calculado de Piretróide em litros condiz com os hectares e curva residual.',
    type: TestType.UNIT,
    suite: 'CalculatorEngine.spec.ts',
    status: TestStatus.PASSED,
    durationMs: 4,
    assertionsCount: 5
  },
  {
    id: 'ut_02_calc_thresholds',
    name: 'Limite Máximo de Aspersão de Ingrediente',
    description: 'Rejeita dosagens que superem as margens toxicológicas estabelecidas pela Anvisa.',
    type: TestType.UNIT,
    suite: 'CalculatorEngine.spec.ts',
    status: TestStatus.PASSED,
    durationMs: 3,
    assertionsCount: 3
  },
  {
    id: 'ut_03_stock_deduction',
    name: 'Reserva Estocástica Fracionada',
    description: 'Verifica decréscimo atômico de estoque e rejeição se estoque virtual < estoque físico.',
    type: TestType.UNIT,
    suite: 'StockController.spec.ts',
    status: TestStatus.PASSED,
    durationMs: 8,
    assertionsCount: 4
  },
  {
    id: 'ut_04_financial_margins',
    name: 'Margem do Rateio Tributário POA',
    description: 'Verifica se a divisão tributária de custos com defensivos segue a retenção do estado.',
    type: TestType.UNIT,
    suite: 'FinancialTaxes.spec.ts',
    status: TestStatus.PASSED,
    durationMs: 5,
    assertionsCount: 3
  },

  // --- INTEGRATION TESTS ---
  {
    id: 'it_01_event_chain',
    name: 'Cascata de Eventos PESTICIDE_CALCULATED',
    description: 'Verifica se a calculadora publica o evento correto e o estoque se pré-reserva.',
    type: TestType.INTEGRATION,
    suite: 'EventPipeline.test.ts',
    status: TestStatus.PASSED,
    durationMs: 45,
    assertionsCount: 6
  },
  {
    id: 'it_02_pop_anvisa_sync',
    name: 'Roteamento de Laudo Técnico Assinado',
    description: 'Valida se a gravação do POP notifica o microsserviço de auditoria e grava hash criptográfico.',
    type: TestType.INTEGRATION,
    suite: 'POPSync.test.ts',
    status: TestStatus.PASSED,
    durationMs: 62,
    assertionsCount: 4
  },
  {
    id: 'it_03_multi_tenant_leak_check',
    name: 'Prevenção de Leaks Organizacionais (Multi-Tenant)',
    description: 'Garante que eventos publicados em um tenant não são repassados nem ouvidos por assinantes de outro.',
    type: TestType.INTEGRATION,
    suite: 'SecurityRouting.test.ts',
    status: TestStatus.PASSED,
    durationMs: 18,
    assertionsCount: 8
  },

  // --- E2E TESTS ---
  {
    id: 'e2e_01_offline_to_online_flow',
    name: 'Jornada PWA Completa Rural',
    description: 'Simula o usuário gerando laudo offline na plantação, alterando dados e restabelecendo sincronismo.',
    type: TestType.E2E,
    suite: 'RuralSyncJourney.e2e.ts',
    status: TestStatus.PASSED,
    durationMs: 340,
    assertionsCount: 12
  },
  {
    id: 'e2e_02_ai_assisted_audit',
    name: 'Assistente CoPilot de Pragas IA',
    description: 'Fluxo completo de auditoria baseado na inferência de imagem, validando contextualização geográfica.',
    type: TestType.E2E,
    suite: 'AICopilotAudit.e2e.ts',
    status: TestStatus.PASSED,
    durationMs: 480,
    assertionsCount: 7
  },

  // --- CONTRACT CHECKS ---
  {
    id: 'ct_01_schema_v120',
    name: 'Validação Contratual v1.2.0',
    description: 'Verifica conformidade estrita das mensagens e metadados contra o JSON Schema de governança corporativa.',
    type: TestType.CONTRACT,
    suite: 'EventComplianceSchema.ts',
    status: TestStatus.PASSED,
    durationMs: 12,
    assertionsCount: 9
  },
  {
    id: 'ct_02_jwt_biometrics',
    name: 'Assinatura Biométrica Digital POP',
    description: 'Assinaturas de biometria de autenticação contêm o payload de coordenadas GPS obrigatório.',
    type: TestType.CONTRACT,
    suite: 'BiometricsCompliance.ts',
    status: TestStatus.PASSED,
    durationMs: 15,
    assertionsCount: 4
  }
];

export const INITIAL_CHAOS_EXPERIMENTS: ChaosExperiment[] = [
  {
    id: 'chaos_01_network_cut',
    name: 'Simulador de Queda de Rede Gaúcha',
    description: 'Força o sistema a entrar em modo offline-first estrito, enfileirando ordens na tabela local.',
    targetModule: 'Integration/EventBus',
    status: 'idle',
    injectedFailureType: 'network_offline',
    severity: 'critical'
  },
  {
    id: 'chaos_02_latency_spike',
    name: 'Injeção de Latência em Firestore Streams',
    description: 'Insere atraso artificial de 3500ms nas atualizações em tempo real para avaliar tratamento de timeout.',
    targetModule: 'Realtime/Sync',
    status: 'idle',
    injectedFailureType: 'latency',
    severity: 'high'
  },
  {
    id: 'chaos_03_state_corrupt',
    name: 'Corrupção de Cache de Linha',
    description: 'Insere payloads deformados e corrompidos de defensivo no cache PWA para certificar rejeição automatizada.',
    targetModule: 'Store/Cache',
    status: 'idle',
    injectedFailureType: 'state_corruption',
    severity: 'high'
  },
  {
    id: 'chaos_04_tenant_leak_threat',
    name: 'Intercepção Cruzada Inter-Tenant',
    description: 'Provoca uma tentativa de injeção direta de ID do Tenant Pelotas em canais do Tenant Porto Alegre.',
    targetModule: 'Security/Access',
    status: 'idle',
    injectedFailureType: 'tenant_breach',
    severity: 'critical'
  }
];

export const INITIAL_SECURITY_AUDITS: SecurityAuditResult[] = [
  {
    id: 'sec_01',
    policyName: 'Isolamento de Tenant Ativo',
    status: 'secure',
    testedScopes: ['EventBus', 'FirestoreQueries', 'LocalStorageState'],
    details: 'Zero cruzamento detectado após 10,000 queries simuladas sob concorrência estocástica.',
    tenantId: 'tenant_porto_alegre_01'
  },
  {
    id: 'sec_02',
    policyName: 'Prevenção de Acesso por ID Não Autorizado',
    status: 'secure',
    testedScopes: ['FinancialRoutes', 'POPApiRoutes'],
    details: 'Tentativa de requisição cruzada bloqueada com código HTTP 403 / Falha de Permissão Firestore.',
    tenantId: 'tenant_pelotas_02'
  },
  {
    id: 'sec_03',
    policyName: 'Criptografia de Assinatura Biométrica',
    status: 'secure',
    testedScopes: ['AnvisaVerificationRules'],
    details: 'Hash SHA-256 e coordenadas GPS concatenadas e validadas criptograficamente na persistência.',
    tenantId: 'tenant_caxias_03'
  }
];

export const INITIAL_AI_METRICS: AIConsistencyMetric[] = [
  {
    id: 'ai_met_01',
    promptSignature: 'PesticideDosageV3_Template',
    hallucinationRate: 0.12, // 0.12%
    explainabilityScore: 98.4,
    contextAdherence: 99.6,
    recommendationStability: 99.1
  },
  {
    id: 'ai_met_02',
    promptSignature: 'AnvisaComplianceHelper_V1',
    hallucinationRate: 0.25, // 0.25%
    explainabilityScore: 96.8,
    contextAdherence: 98.9,
    recommendationStability: 97.4
  }
];
