import { useMemo } from 'react';
import { QuoteWorkflowState } from '../types';
import { processOperationalPricing, DEFAULT_ENGINE_SETTINGS } from '../../calculations/pricingEngine';
import { calculateDetailedOperationalMargins, DEFAULT_MARGIN_CONFIG } from '@/financial/profitability/margin/marginEngine';
import { evaluateOperationalViability, processRiskAnalysis } from '@/financial/profitability/viability/viabilityEngine';
import { formulateDecisionSupport } from '@/financial/profitability/decision/decisionEngine';
import { auditMarginAlerts } from '@/financial/profitability/alerts/alertSystem';
import { PricingBreakdown } from '../../types';

export function useRealtimeWorkflow(state: QuoteWorkflowState) {
  // 1. Core pricing math breakdown
  const pricingInputs = useMemo(() => ({
    clientName: state.clientName,
    pestType: state.pestType,
    environmentType: state.environmentType,
    areaSize: state.areaSize,
    infestationLevel: state.infestationLevel,
    complexity: state.complexity,
    displacement: state.displacement,
    technicians: state.technicians,
    urgency: state.urgency,
    recurrence: state.recurrence,
    selectedProducts: state.selectedProducts,
    customMargin: state.customMargin
  }), [state]);

  const breakdown: PricingBreakdown = useMemo(() => {
    return processOperationalPricing(pricingInputs, DEFAULT_ENGINE_SETTINGS);
  }, [pricingInputs]);

  // 2. High-fidelity margin metrics
  const yields = useMemo(() => {
    return calculateDetailedOperationalMargins({
      sellingPrice: breakdown.suggestedPrice,
      directCosts: breakdown.directLaborCost + breakdown.chemicalsCost + breakdown.equipmentsCost,
      indirectCosts: breakdown.indirectOverheadCost,
      displacementKm: state.displacement,
      complexity: state.complexity,
      environment: state.environmentType,
      recurrence: state.recurrence,
      config: DEFAULT_MARGIN_CONFIG
    });
  }, [breakdown, state]);

  // 3. Operational viability audit score
  const viability = useMemo(() => {
    return evaluateOperationalViability({
      netMarginPercent: yields.netMarginPercent,
      totalProductCost: breakdown.chemicalsCost,
      logisticsCost: breakdown.displacementCost,
      laborCost: breakdown.directLaborCost,
      indirectOverhead: breakdown.indirectOverheadCost,
      targetPrice: breakdown.suggestedPrice
    });
  }, [yields, breakdown]);

  // 4. Logistics and physical risk analyzer metrics
  const risk = useMemo(() => {
    return processRiskAnalysis({
      netMarginPercent: yields.netMarginPercent,
      displacementKm: state.displacement,
      chemicalWasteSafetyCost: state.additionalCosts,
      urgencyLevel: state.urgency === 'Emergência' ? 'Emergencial' : state.urgency === 'Prioritário' ? 'Urgente' : 'Normal'
    });
  }, [yields, state]);

  // 5. Intelligent advice formulation guidelines
  const decision = useMemo(() => {
    return formulateDecisionSupport({
      netMarginPercent: yields.netMarginPercent,
      environment: state.environmentType,
      complexity: state.complexity,
      pest: state.pestType,
      recurrence: state.recurrence,
      breakEvenThresholdPrice: yields.breakEvenThresholdPrice,
      currentProposedPrice: breakdown.suggestedPrice
    });
  }, [yields, state, breakdown]);

  // 6. Security threshold warnings
  const alerts = useMemo(() => {
    return auditMarginAlerts(yields, breakdown.suggestedPrice, state.displacement);
  }, [yields, breakdown, state.displacement]);

  return {
    breakdown,
    yields,
    viability,
    risk,
    decision,
    alerts
  };
}
