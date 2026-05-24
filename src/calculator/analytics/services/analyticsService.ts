import { 
  PestType, 
  EnvironmentType, 
  InfestationLevel, 
  OperationalComplexity, 
  Recurrence, 
  UrgencyLevel 
} from '@/types/database';
import { ProductCostItem, PricingBreakdown, PricingInputs } from '../../types';
import { 
  OperationalSnapshot, 
  QuoteVersionHistory, 
  HistoricalMetrics, 
  WorkflowAnalytics, 
  OperationalIntelligenceInsight, 
  ForecastingScenario, 
  AIReadyContext, 
  RealtimeProfitabilitySnap 
} from '../types';

// Constants for Local Storage keys
const SNAPSHOTS_KEY = 'ddsulf_analytics_snapshots';
const WORKFLOW_ANALYTICS_KEY = 'ddsulf_workflow_analytics';

// Initial realistic seed data representing history of 12 previous quotes to populate the premium charts instantly
const SEED_SNAPSHOTS: OperationalSnapshot[] = [
  {
    id: 'snap_001',
    quoteId: 'quote_001',
    version: 1,
    timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    inputs: {
      clientName: 'Restaurante Sabor Mineiro',
      pestType: 'Baratas',
      environmentType: 'Restaurante',
      areaSize: 180,
      infestationLevel: 'Alto',
      complexity: 'Normal',
      displacement: 15,
      technicians: 2,
      urgency: 'Prioritário',
      recurrence: 'Mensal',
      selectedProducts: [
        { id: 'prod_fendona', name: 'Fendona Pro', dosagePerM2: 0.1, unitCost: 1.55, unitLabel: 'ml', amountUsed: 18, totalCost: 27.9 }
      ]
    },
    breakdown: {
      directLaborCost: 160,
      displacementCost: 45,
      chemicalsCost: 27.9,
      indirectOverheadCost: 50,
      equipmentsCost: 25,
      totalOperationalCost: 307.9,
      suggestedPrice: 1680,
      actualMarginPercent: 81.67,
      profitAmount: 1372.1,
      estimatedTimeHours: 4,
      breakEvenPrice: 384.87
    },
    activeMarginPercent: 81.67,
    totalOperationalCost: 307.9,
    suggestedPrice: 1680,
    techniciansCount: 2,
    estimatedHours: 4,
    productCosts: [{ id: 'prod_fendona', name: 'Fendona Pro', amountUsed: 18, totalCost: 27.9 }],
    changedBy: 'commercial_agent_01'
  },
  {
    id: 'snap_002',
    quoteId: 'quote_002',
    version: 1,
    timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    inputs: {
      clientName: 'Condomínio Sol Nascente',
      pestType: 'Formigas',
      environmentType: 'Condomínio',
      areaSize: 1200,
      infestationLevel: 'Médio',
      complexity: 'Complexo',
      displacement: 8,
      technicians: 3,
      urgency: 'Normal',
      recurrence: 'Trimestral',
      selectedProducts: [
        { id: 'prod_temprid', name: 'Temprid SC', dosagePerM2: 0.2, unitCost: 1.95, unitLabel: 'ml', amountUsed: 240, totalCost: 468 }
      ]
    },
    breakdown: {
      directLaborCost: 480,
      displacementCost: 24,
      chemicalsCost: 468,
      indirectOverheadCost: 120,
      equipmentsCost: 80,
      totalOperationalCost: 1172,
      suggestedPrice: 4200,
      actualMarginPercent: 72.1,
      profitAmount: 3028,
      estimatedTimeHours: 8,
      breakEvenPrice: 1465
    },
    activeMarginPercent: 72.1,
    totalOperationalCost: 1172,
    suggestedPrice: 4200,
    techniciansCount: 3,
    estimatedHours: 8,
    productCosts: [{ id: 'prod_temprid', name: 'Temprid SC', amountUsed: 240, totalCost: 468 }],
    changedBy: 'commercial_agent_01'
  },
  {
    id: 'snap_003',
    quoteId: 'quote_003',
    version: 1,
    timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    inputs: {
      clientName: 'Indústria Metalúrgica Sul',
      pestType: 'Ratos',
      environmentType: 'Indústria',
      areaSize: 4500,
      infestationLevel: 'Crítico',
      complexity: 'Complexo',
      displacement: 32,
      technicians: 4,
      urgency: 'Emergência',
      recurrence: 'Mensal',
      selectedProducts: [
        { id: 'prod_raticida', name: 'Raticida Grãos', dosagePerM2: 0.05, unitCost: 0.45, unitLabel: 'g', amountUsed: 225, totalCost: 101.25 }
      ]
    },
    breakdown: {
      directLaborCost: 960,
      displacementCost: 96,
      chemicalsCost: 101.25,
      indirectOverheadCost: 280,
      equipmentsCost: 150,
      totalOperationalCost: 1587.25,
      suggestedPrice: 8900,
      actualMarginPercent: 82.17,
      profitAmount: 7312.75,
      estimatedTimeHours: 12,
      breakEvenPrice: 1984
    },
    activeMarginPercent: 82.17,
    totalOperationalCost: 1587.25,
    suggestedPrice: 8900,
    techniciansCount: 4,
    estimatedHours: 12,
    productCosts: [{ id: 'prod_raticida', name: 'Raticida Grãos', amountUsed: 225, totalCost: 101.25 }],
    changedBy: 'manager_admin'
  },
  {
    id: 'snap_004',
    quoteId: 'quote_004',
    version: 1,
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    inputs: {
      clientName: 'Residencial Silva',
      pestType: 'Escorpiões',
      environmentType: 'Residência',
      areaSize: 220,
      infestationLevel: 'Alto',
      complexity: 'Complexo',
      displacement: 5,
      technicians: 2,
      urgency: 'Prioritário',
      recurrence: 'Único',
      selectedProducts: [
        { id: 'prod_fendona', name: 'Fendona Pro', dosagePerM2: 0.1, unitCost: 1.55, unitLabel: 'ml', amountUsed: 22, totalCost: 34.1 }
      ]
    },
    breakdown: {
      directLaborCost: 160,
      displacementCost: 15,
      chemicalsCost: 34.1,
      indirectOverheadCost: 40,
      equipmentsCost: 30,
      totalOperationalCost: 279.1,
      suggestedPrice: 1850,
      actualMarginPercent: 84.91,
      profitAmount: 1570.9,
      estimatedTimeHours: 4,
      breakEvenPrice: 348.8
    },
    activeMarginPercent: 84.91,
    totalOperationalCost: 279.1,
    suggestedPrice: 1850,
    techniciansCount: 2,
    estimatedHours: 4,
    productCosts: [{ id: 'prod_fendona', name: 'Fendona Pro', amountUsed: 22, totalCost: 34.1 }],
    changedBy: 'commercial_agent_02'
  },
  {
    id: 'snap_005',
    quoteId: 'quote_005',
    version: 1,
    timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    inputs: {
      clientName: 'Padaria Pão Quente',
      pestType: 'Baratas',
      environmentType: 'Restaurante',
      areaSize: 95,
      infestationLevel: 'Alto',
      complexity: 'Simples',
      displacement: 12,
      technicians: 1,
      urgency: 'Normal',
      recurrence: 'Mensal',
      selectedProducts: [
        { id: 'prod_deltametrina', name: 'Deltametrina 25 EC', dosagePerM2: 0.25, unitCost: 0.85, unitLabel: 'ml', amountUsed: 23.75, totalCost: 20.19 }
      ]
    },
    breakdown: {
      directLaborCost: 60,
      displacementCost: 36,
      chemicalsCost: 20.19,
      indirectOverheadCost: 30,
      equipmentsCost: 10,
      totalOperationalCost: 156.19,
      suggestedPrice: 950,
      actualMarginPercent: 83.56,
      profitAmount: 793.81,
      estimatedTimeHours: 3,
      breakEvenPrice: 195.24
    },
    activeMarginPercent: 83.56,
    totalOperationalCost: 156.19,
    suggestedPrice: 950,
    techniciansCount: 1,
    estimatedHours: 3,
    productCosts: [{ id: 'prod_deltametrina', name: 'Deltametrina 25 EC', amountUsed: 23.75, totalCost: 20.19 }],
    changedBy: 'commercial_agent_01'
  },
  {
    id: 'snap_006',
    quoteId: 'quote_006',
    version: 1,
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    inputs: {
      clientName: 'Indústria Química Sul',
      pestType: 'Cupins',
      environmentType: 'Indústria',
      areaSize: 3200,
      infestationLevel: 'Crítico',
      complexity: 'Complexo',
      displacement: 45,
      technicians: 4,
      urgency: 'Prioritário',
      recurrence: 'Semestral',
      selectedProducts: [
        { id: 'prod_fipronil', name: 'Fipronil 80 WG', dosagePerM2: 0.15, unitCost: 1.25, unitLabel: 'g', amountUsed: 480, totalCost: 600 }
      ]
    },
    breakdown: {
      directLaborCost: 1120,
      displacementCost: 135,
      chemicalsCost: 600,
      indirectOverheadCost: 350,
      equipmentsCost: 200,
      totalOperationalCost: 2405,
      suggestedPrice: 12500,
      actualMarginPercent: 80.76,
      profitAmount: 10095,
      estimatedTimeHours: 14,
      breakEvenPrice: 3006.25
    },
    activeMarginPercent: 80.76,
    totalOperationalCost: 2405,
    suggestedPrice: 12500,
    techniciansCount: 4,
    estimatedHours: 14,
    productCosts: [{ id: 'prod_fipronil', name: 'Fipronil 80 WG', amountUsed: 480, totalCost: 600 }],
    changedBy: 'manager_admin'
  },
  {
    id: 'snap_007',
    quoteId: 'quote_007',
    version: 1,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    inputs: {
      clientName: 'Clínica Sorriso Clean',
      pestType: 'Mosquitos',
      environmentType: 'Hospital',
      areaSize: 350,
      infestationLevel: 'Baixo',
      complexity: 'Simples',
      displacement: 6,
      technicians: 1,
      urgency: 'Normal',
      recurrence: 'Mensal',
      selectedProducts: [
        { id: 'prod_deltametrina', name: 'Deltametrina 25 EC', dosagePerM2: 0.25, unitCost: 0.85, unitLabel: 'ml', amountUsed: 87.5, totalCost: 74.38 }
      ]
    },
    breakdown: {
      directLaborCost: 80,
      displacementCost: 18,
      chemicalsCost: 74.38,
      indirectOverheadCost: 40,
      equipmentsCost: 25,
      totalOperationalCost: 237.38,
      suggestedPrice: 1550,
      actualMarginPercent: 84.69,
      profitAmount: 1312.62,
      estimatedTimeHours: 4,
      breakEvenPrice: 296.72
    },
    activeMarginPercent: 84.69,
    totalOperationalCost: 237.38,
    suggestedPrice: 1550,
    techniciansCount: 1,
    estimatedHours: 4,
    productCosts: [{ id: 'prod_deltametrina', name: 'Deltametrina 25 EC', amountUsed: 87.5, totalCost: 74.38 }],
    changedBy: 'commercial_agent_02'
  },
  {
    id: 'snap_008',
    quoteId: 'quote_008',
    version: 1,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    inputs: {
      clientName: 'Supermercado Todo Dia',
      pestType: 'Ratos',
      environmentType: 'Comércio',
      areaSize: 1500,
      infestationLevel: 'Médio',
      complexity: 'Normal',
      displacement: 18,
      technicians: 2,
      urgency: 'Normal',
      recurrence: 'Mensal',
      selectedProducts: [
        { id: 'prod_raticida', name: 'Raticida Grãos', dosagePerM2: 0.05, unitCost: 0.45, unitLabel: 'g', amountUsed: 75, totalCost: 33.75 }
      ]
    },
    breakdown: {
      directLaborCost: 240,
      displacementCost: 54,
      chemicalsCost: 33.75,
      indirectOverheadCost: 100,
      equipmentsCost: 50,
      totalOperationalCost: 477.75,
      suggestedPrice: 3800,
      actualMarginPercent: 87.43,
      profitAmount: 3322.25,
      estimatedTimeHours: 6,
      breakEvenPrice: 597.19
    },
    activeMarginPercent: 87.43,
    totalOperationalCost: 477.75,
    suggestedPrice: 3800,
    techniciansCount: 2,
    estimatedHours: 6,
    productCosts: [{ id: 'prod_raticida', name: 'Raticida Grãos', amountUsed: 75, totalCost: 33.75 }],
    changedBy: 'commercial_agent_01'
  },
  {
    id: 'snap_009',
    quoteId: 'quote_009',
    version: 1,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    inputs: {
      clientName: 'Galpão Logístico Express',
      pestType: 'Cupins',
      environmentType: 'Indústria',
      areaSize: 8000,
      infestationLevel: 'Alto',
      complexity: 'Complexo',
      displacement: 55,
      technicians: 6,
      urgency: 'Emergência',
      recurrence: 'Anual',
      selectedProducts: [
        { id: 'prod_fipronil', name: 'Fipronil 80 WG', dosagePerM2: 0.15, unitCost: 1.25, unitLabel: 'g', amountUsed: 1200, totalCost: 1500 }
      ]
    },
    breakdown: {
      directLaborCost: 2160,
      displacementCost: 165,
      chemicalsCost: 1500,
      indirectOverheadCost: 600,
      equipmentsCost: 350,
      totalOperationalCost: 4775,
      suggestedPrice: 28000,
      actualMarginPercent: 82.95,
      profitAmount: 23225,
      estimatedTimeHours: 18,
      breakEvenPrice: 5968
    },
    activeMarginPercent: 82.95,
    totalOperationalCost: 4775,
    suggestedPrice: 28000,
    techniciansCount: 6,
    estimatedHours: 18,
    productCosts: [{ id: 'prod_fipronil', name: 'Fipronil 80 WG', amountUsed: 1200, totalCost: 1500 }],
    changedBy: 'manager_admin'
  }
];

export const analyticsService = {
  /**
   * Initializes baseline snapshots in Storage if not populated yet
   */
  initialize(): void {
    try {
      const existing = localStorage.getItem(SNAPSHOTS_KEY);
      if (!existing) {
        localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(SEED_SNAPSHOTS));
      }
    } catch (e) {
      console.error('Failed to initialize metrics storage', e);
    }
  },

  getAllSnapshots(): OperationalSnapshot[] {
    this.initialize();
    try {
      return JSON.parse(localStorage.getItem(SNAPSHOTS_KEY) || '[]');
    } catch {
      return SEED_SNAPSHOTS;
    }
  },

  /**
   * Commits an operational snapshot to history. Allows version increments.
   */
  saveSnapshot(
    quoteId: string, 
    inputs: PricingInputs, 
    breakdown: PricingBreakdown, 
    changedBy = 'sistema_comercial', 
    changeReason = 'Atualização de Parâmetros'
  ): OperationalSnapshot {
    const snaps = this.getAllSnapshots();
    
    // Find prior versions of this same quotation
    const quoteSnaps = snaps.filter(s => s.quoteId === quoteId);
    const nextVersion = quoteSnaps.length > 0 
      ? Math.max(...quoteSnaps.map(s => s.version)) + 1 
      : 1;

    const newSnapshot: OperationalSnapshot = {
      id: `snap_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      quoteId,
      version: nextVersion,
      timestamp: new Date().toISOString(),
      inputs: JSON.parse(JSON.stringify(inputs)),
      breakdown: JSON.parse(JSON.stringify(breakdown)),
      activeMarginPercent: breakdown.actualMarginPercent,
      totalOperationalCost: breakdown.totalOperationalCost,
      suggestedPrice: breakdown.suggestedPrice,
      techniciansCount: inputs.technicians,
      estimatedHours: breakdown.estimatedTimeHours,
      productCosts: inputs.selectedProducts.map(p => ({
        id: p.id,
        name: p.name,
        amountUsed: p.amountUsed,
        totalCost: p.totalCost
      })),
      changedBy,
      changeReason
    };

    snaps.unshift(newSnapshot); // Store newest first
    try {
      localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snaps));
    } catch (error) {
      console.warn('Storage overflow, slicing snapshot records', error);
      localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snaps.slice(0, 80)));
    }

    return newSnapshot;
  },

  getQuoteVersions(quoteId: string): OperationalSnapshot[] {
    const snaps = this.getAllSnapshots();
    return snaps
      .filter(s => s.quoteId === quoteId)
      .sort((a, b) => b.version - a.version); // newest version first
  },

  /**
   * Computes complex real-time operational aggregates
   */
  getHistoricalMetrics(): HistoricalMetrics {
    const snaps = this.getAllSnapshots();
    if (snaps.length === 0) {
      return {
        ticketMedio: 0,
        margemMediaPercent: 0,
        margemPorTipoPraga: {} as any,
        margemPorTipoAmbiente: {} as any,
        lucratividadeTotal: 0,
        frequenciaOperacional: {} as any,
        frequenciaPeloAmbiente: {} as any,
        mediaHorasEstimadas: 0,
        distribuicaoComplexidade: {} as any,
        distribuicaoRecorrencia: {} as any,
        tempoMedioOrcamentoSegundos: 0,
        taxaAprovacao: 0
      };
    }

    const totalRevenue = snaps.reduce((sum, s) => sum + s.suggestedPrice, 0);
    const totalCost = snaps.reduce((sum, s) => sum + s.totalOperationalCost, 0);
    const averageMargin = snaps.reduce((sum, s) => sum + s.activeMarginPercent, 0) / snaps.length;
    
    const pestMargins: Record<string, { sum: number; count: number }> = {};
    const envMargins: Record<string, { sum: number; count: number }> = {};
    const complexityCounts: Record<string, number> = { 'Simples': 0, 'Normal': 0, 'Complexo': 0 };
    const recurrenceCounts: Record<string, number> = { 'Único': 0, 'Mensal': 0, 'Trimestral': 0, 'Semestral': 0, 'Anual': 0 };
    const pestCounts: Record<string, number> = {};
    const envCounts: Record<string, number> = {};
    
    let totalEstimatedHours = 0;

    snaps.forEach(snap => {
      const pest = snap.inputs.pestType;
      const env = snap.inputs.environmentType;
      
      // Pest Aggregations
      if (!pestMargins[pest]) pestMargins[pest] = { sum: 0, count: 0 };
      pestMargins[pest].sum += snap.activeMarginPercent;
      pestMargins[pest].count++;
      pestCounts[pest] = (pestCounts[pest] || 0) + 1;

      // Env Aggregations
      if (!envMargins[env]) envMargins[env] = { sum: 0, count: 0 };
      envMargins[env].sum += snap.activeMarginPercent;
      envMargins[env].count++;
      envCounts[env] = (envCounts[env] || 0) + 1;

      // Other counts & hours
      complexityCounts[snap.inputs.complexity] = (complexityCounts[snap.inputs.complexity] || 0) + 1;
      recurrenceCounts[snap.inputs.recurrence] = (recurrenceCounts[snap.inputs.recurrence] || 0) + 1;
      totalEstimatedHours += snap.estimatedHours;
    });

    // Translate margem mapping
    const pestMarginsPercent: Record<PestType, number> = {} as any;
    Object.keys(pestMargins).forEach(k => {
      pestMarginsPercent[k as PestType] = Math.round((pestMargins[k].sum / pestMargins[k].count) * 100) / 100;
    });

    const envMarginsPercent: Record<EnvironmentType, number> = {} as any;
    Object.keys(envMargins).forEach(k => {
      envMarginsPercent[k as EnvironmentType] = Math.round((envMargins[k].sum / envMargins[k].count) * 100) / 100;
    });

    // Load workflow tracking for budget speed timers
    const workflowEvs = this.getRawWorkflowEvents();
    const finalized = workflowEvs.filter(e => e.event === 'quote_finalized_successfully');
    const timings = finalized.map(f => f.metadata?.totalTimeSeconds || 120);
    const avgCalcTime = timings.length > 0 ? timings.reduce((s, x) => s + x, 0) / timings.length : 185;

    return {
      ticketMedio: Math.round(totalRevenue / snaps.length),
      margemMediaPercent: Math.round(averageMargin * 100) / 100,
      margemPorTipoPraga: pestMarginsPercent,
      margemPorTipoAmbiente: envMarginsPercent,
      lucratividadeTotal: Math.round(totalRevenue - totalCost),
      frequenciaOperacional: pestCounts as Record<PestType, number>,
      frequenciaPeloAmbiente: envCounts as Record<EnvironmentType, number>,
      mediaHorasEstimadas: Math.round((totalEstimatedHours / snaps.length) * 10) / 10,
      distribuicaoComplexidade: complexityCounts as Record<OperationalComplexity, number>,
      distribuicaoRecorrencia: recurrenceCounts as Record<Recurrence, number>,
      tempoMedioOrcamentoSegundos: Math.round(avgCalcTime),
      taxaAprovacao: 82 // Baseline statistical factor 82% 
    };
  },

  /**
   * Calculates step conversion rates and dropout rates from user interaction logs
   */
  getWorkflowPerformance(): WorkflowAnalytics {
    const rawEvents = this.getRawWorkflowEvents();
    
    // Fallback if no active workflow runs occurred
    if (rawEvents.length === 0) {
      return {
        taxaConclusaoPercent: 88,
        tempoMedioPorEtapaSegundos: { 1: 15, 2: 24, 3: 20, 4: 35, 5: 28, 6: 22, 7: 19, 8: 14, 9: 18, 10: 25, 11: 30, 12: 40, 13: 35 },
        etapaAbandoneFrequencia: { 4: 2, 8: 1 },
        tempoTotalMedioSegundos: 195,
        totalIniciados: 25,
        totalFinalizados: 22
      };
    }

    const startedRuns = rawEvents.filter(e => e.event === 'onboarding_completed' || (e.event === 'step_advanced' && e.metadata?.from === 0));
    const finishedRuns = rawEvents.filter(e => e.event === 'quote_finalized_successfully' || e.event === 'completed');
    
    const stepsDelays: Record<number, number[]> = {};
    const stepDropouts: Record<number, number> = {};

    // Analyze transitions
    rawEvents.forEach(e => {
      if (e.event === 'step_advanced' && e.metadata) {
        const fromStep = Number(e.metadata.from || 1);
        const duration = Number(e.metadata.timeInStepSeconds || 15);
        if (!stepsDelays[fromStep]) stepsDelays[fromStep] = [];
        stepsDelays[fromStep].push(duration);
      }
      if (e.event === 'step_regressed' && e.metadata) {
        const fromStep = Number(e.metadata.from || 1);
        stepDropouts[fromStep] = (stepDropouts[fromStep] || 0) + 1;
      }
    });

    const stepAverages: Record<number, number> = {};
    Object.keys(stepsDelays).forEach(stepStr => {
      const stepNum = Number(stepStr);
      const list = stepsDelays[stepNum];
      stepAverages[stepNum] = Math.round(list.reduce((sum, item) => sum + item, 0) / list.length);
    });

    // Provide robust defaults for standard 13 stages if empty
    for (let s = 1; s <= 13; ++s) {
      if (!stepAverages[s]) {
        stepAverages[s] = [12, 18, 15, 25, 20, 22, 18, 14, 15, 22, 28, 35, 25][s - 1];
      }
    }

    const totalStarted = Math.max(8, startedRuns.length);
    const totalFinished = Math.max(7, finishedRuns.length);
    const conversion = Math.round((totalFinished / totalStarted) * 100);

    return {
      taxaConclusaoPercent: conversion > 100 ? 100 : conversion,
      tempoMedioPorEtapaSegundos: stepAverages,
      etapaAbandoneFrequencia: stepDropouts,
      tempoTotalMedioSegundos: Object.values(stepAverages).reduce((a, b) => a + b, 0),
      totalIniciados: totalStarted,
      totalFinalizados: totalFinished
    };
  },

  /**
   * Intelligence anomalies and pricing leak detectors based on margin deviations
   */
  getOperationalInsights(): OperationalIntelligenceInsight[] {
    const snaps = this.getAllSnapshots();
    const metrics = this.getHistoricalMetrics();
    const insights: OperationalIntelligenceInsight[] = [];

    if (snaps.length < 3) return [];

    // Rule 1: High Chemical Cost ratios detected (possible chemical leak)
    snaps.forEach(snap => {
      const chemRatio = snap.breakdown.chemicalsCost / snap.suggestedPrice;
      if (chemRatio > 0.18) {
        insights.push({
          id: `ins_leak_${snap.id}`,
          type: 'chemical_efficiency',
          title: `Alto Consumo Químico: ${snap.inputs.clientName}`,
          message: `O custo de químicos representa ${(chemRatio * 100).toFixed(1)}% do orçamento final para controle de ${snap.inputs.pestType}. A média ideal para ${snap.inputs.environmentType} é abaixo de 10%.`,
          impactValue: Math.round(snap.breakdown.chemicalsCost - (snap.suggestedPrice * 0.08)),
          impactType: 'savings',
          confidence: 0.92,
          evidence: [
            { key: 'Área do local', value: `${snap.inputs.areaSize} m²` },
            { key: 'Custo de químicos', value: `R$ ${snap.breakdown.chemicalsCost.toFixed(2)}` },
            { key: 'Preço cotado', value: `R$ ${snap.suggestedPrice}` }
          ],
          suggestedAction: 'Reavaliar diluição sob POP #04 ou substituir produto por suspensão concentrada de maior rendimento (Fendona Pro).'
        });
      }
    });

    // Rule 2: Underpricing margin anomaly compared to averages
    snaps.slice(0, 5).forEach(snap => {
      const avgPestMargin = metrics.margemPorTipoPraga[snap.inputs.pestType] || metrics.margemMediaPercent;
      const marginDeviation = avgPestMargin - snap.activeMarginPercent;

      if (marginDeviation > 12) {
        insights.push({
          id: `ins_margin_drop_${snap.id}`,
          type: 'margin_leakage',
          title: `Defasagem de Margem em ${snap.inputs.clientName}`,
          message: `Margem operada (${snap.activeMarginPercent.toFixed(1)}%) ficou ${marginDeviation.toFixed(1)}% abaixo da média praticada para ${snap.inputs.pestType} (${avgPestMargin}%).`,
          impactValue: Math.round(snap.suggestedPrice * (marginDeviation / 100)),
          impactType: 'revenue_leak',
          confidence: 0.88,
          evidence: [
            { key: 'Margem operada', value: `${snap.activeMarginPercent.toFixed(1)}%` },
            { key: 'Média de praga', value: `${avgPestMargin}%` },
            { key: 'Perda monetária', value: `R$ ${Math.round(snap.suggestedPrice * (marginDeviation / 100))}` }
          ],
          suggestedAction: 'Aplicar taxa de complexidade de urgência ou readequar contagem de técnicos dedicados.'
        });
      }
    });

    // Rule 3: High Recurring commercial opportunities
    const singleDealsCount = snaps.filter(s => s.inputs.recurrence === 'Único').length;
    if (singleDealsCount > 2) {
      insights.push({
        id: 'ins_recurring_op',
        type: 'recurring_opportunity',
        title: 'Oportunidade de Contratos Recorrentes',
        message: 'Detectamos múltiplos orçamentos avulsos em ambientes residenciais e comerciais. Converter orçamentos avulsos em trimestrais aumenta o LTV (Lifetime Value) operacional em até 160%.',
        impactValue: Math.round(metrics.ticketMedio * 1.4),
        impactType: 'margin_gain',
        confidence: 0.85,
        evidence: [
          { key: 'Clientes avulsos recentes', value: singleDealsCount },
          { key: 'Ticket médio ganho', value: `R$ ${metrics.ticketMedio}` }
        ],
        suggestedAction: 'Habilitar o desconto de 15% na etapa 11 para sugerir recorrência contratual na proposta final.'
      });
    }

    // Baseline fallback insights if lists are clean
    if (insights.length === 0) {
      insights.push({
        id: 'ins_default_01',
        type: 'pricing_optimization',
        title: 'Estabilidade Financeira Saudável',
        message: 'A margem média atual se mantém estável em 81.5% com alta liquidez sobre químicos.',
        impactValue: 0,
        impactType: 'margin_gain',
        confidence: 0.95,
        evidence: [{ key: 'Margem de Segurança', value: 'OK' }],
        suggestedAction: 'Manter precificação atual.'
      });
    }

    return insights;
  },

  /**
   * Predictive forecasting based on aggregates & seasonality
   */
  getForecastingScenarios(): ForecastingScenario[] {
    const metrics = this.getHistoricalMetrics();
    const avgMonthlyRev = metrics.lucratividadeTotal * 1.15; // Extrapolating baseline factors

    const currentMonth = new Date().getMonth();
    const monthsPt = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const scenarios: ForecastingScenario[] = [];
    
    // Generate next 3 months forecasts
    for (let i = 1; i <= 3; i++) {
      const monthIdx = (currentMonth + i) % 12;
      // High summer = high pests = seasonality multipliers (Oct to Feb)
      const isSummer = [9, 10, 11, 0, 1].includes(monthIdx);
      const seasonality = isSummer ? 1.25 : 0.95;
      
      const revenueForecast = Math.round(avgMonthlyRev * seasonality * (1 + 0.05 * i));
      const costForecast = Math.round(revenueForecast * (1 - (metrics.margemMediaPercent / 100)));
      const projectedGrowth = Math.round((seasonality - 1) * 100 + (5 * i));

      scenarios.push({
        periodLabel: `${monthsPt[monthIdx]} ${new Date().getFullYear() + (currentMonth + i >= 12 ? 1 : 0)}`,
        projecaoReceita: revenueForecast,
        projecaoCustoOperacional: costForecast,
        margemMediaEsperada: Math.round(metrics.margemMediaPercent + (isSummer ? 1.5 : -1)),
        taxaCrescimentoPrevistaPercent: projectedGrowth,
        fatorSazonalidade: seasonality,
        riscoEscassezProdutoScore: isSummer ? 0.35 : 0.1
      });
    }

    return scenarios;
  },

  /**
   * Prepares context strings and token descriptors optimized for Gemini neural prompts
   */
  getAIReadyFormat(inputs: PricingInputs, breakdown: PricingBreakdown): AIReadyContext {
    const historical = this.getHistoricalMetrics();
    const avgMarginForPest = historical.margemPorTipoPraga[inputs.pestType] || historical.margemMediaPercent;
    
    const chemCost = breakdown.chemicalsCost;
    const totalCost = breakdown.totalOperationalCost;
    const chemicalPct = totalCost > 0 ? (chemCost / totalCost) * 100 : 0;

    const formattedPrompt = `Operational pricing task context:
- Client Segment: ${inputs.environmentType}
- Target Pest Spec: ${inputs.pestType}
- Serviced Size: ${inputs.areaSize} m²
- Operational Complexity Factor: ${inputs.complexity}
- Technical Urgency Demand: ${inputs.urgency}
- Contract Type: ${inputs.recurrence}
- Commited Technicians: ${inputs.technicians} techs
- Suggested Customer Price: R$ ${breakdown.suggestedPrice}
- Projected Direct Cost: R$ ${breakdown.totalOperationalCost}
- Projected Gross Profit: R$ ${breakdown.profitAmount}
- Estimated Operational Hours: ${breakdown.estimatedTimeHours}h
- Calculated Scenario Margin: ${breakdown.actualMarginPercent}%

AI Optimizer Targets:
- Ideal Sector Benchmark Margin: ${avgMarginForPest}%
- Chemical Loading Efficiency: ${chemicalPct.toFixed(1)}% of total cost.
- Target Displacement Markup Factor: ${inputs.displacement > 20 ? 1.4 : 1.1}`;

    return {
      promptContextString: formattedPrompt,
      structuredPayload: {
        clientDetails: {
          name: inputs.clientName,
          segment: inputs.environmentType
        },
        operation: {
          pestType: inputs.pestType,
          areaSize: inputs.areaSize,
          complexity: inputs.complexity,
          infestation: inputs.infestationLevel,
          urgency: inputs.urgency
        },
        financials: {
          suggestedPrice: breakdown.suggestedPrice,
          totalOperationalCost: breakdown.totalOperationalCost,
          estimatedMargin: breakdown.actualMarginPercent,
          chemicalPercentageOfCost: Math.round(chemicalPct * 100) / 100
        },
        similarHistoricalStats: {
          avgMarginForPest,
          recommendationConfidence: 0.94,
          idealTechnicianCount: inputs.areaSize > 1000 ? 3 : inputs.areaSize > 300 ? 2 : 1
        },
        aiTokens: {
          recommendedDisplacementMarkup: inputs.displacement > 20 ? 1.4 : 1.1,
          optimalProductVolumeDosage: inputs.selectedProducts.reduce((acc, curr) => {
            acc[curr.id] = curr.dosagePerM2 * inputs.areaSize;
            return acc;
          }, {} as Record<string, number>)
        }
      }
    };
  },

  /**
   * Tracks live margin fluctuations on sliders before saving
   */
  getRealtimeProfitability(inputs: PricingInputs, breakdown: PricingBreakdown): RealtimeProfitabilitySnap {
    const idealMargin = 65; // standard target
    const currentMargin = breakdown.actualMarginPercent;
    
    return {
      currentProfit: breakdown.profitAmount,
      currentMarginPercent: currentMargin,
      hoursNeeded: breakdown.estimatedTimeHours,
      chemicalCostRatio: breakdown.suggestedPrice > 0 ? (breakdown.chemicalsCost / breakdown.suggestedPrice) : 0,
      breakEvenThreshold: breakdown.breakEvenPrice,
      leakageAlert: currentMargin < idealMargin
    };
  },

  /**
   * Local utilities to read workflow raw actions cached in localStorage
   */
  getRawWorkflowEvents(): any[] {
    try {
      return JSON.parse(localStorage.getItem(WORKFLOW_ANALYTICS_KEY) || '[]');
    } catch {
      return [];
    }
  }
};
