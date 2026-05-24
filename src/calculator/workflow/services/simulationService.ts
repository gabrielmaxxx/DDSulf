import { QuoteWorkflowState } from '../types';
import { processOperationalPricing, DEFAULT_ENGINE_SETTINGS } from '../../calculations/pricingEngine';
import { PricingBreakdown, ProductCostItem } from '../../types';

export interface WorkflowSimulationResult {
  id: string;
  name: string;
  price: number;
  margin: number;
  profit: number;
  costs: number;
  desc: string;
}

export const simulationService = {
  /**
   * Generates structural simulation scenarios for comparing the active draft
   */
  simulateScenarios(state: QuoteWorkflowState, baseline: PricingBreakdown): WorkflowSimulationResult[] {
    const outputs: WorkflowSimulationResult[] = [];

    // Scenario 0: Current Proposal
    outputs.push({
      id: 'current',
      name: 'Proposta Atual',
      price: baseline.suggestedPrice,
      margin: baseline.actualMarginPercent,
      profit: baseline.profitAmount,
      costs: baseline.totalOperationalCost,
      desc: 'Composição de preço atual com a margem desejada indicada.'
    });

    // Scenario 1: Optimization of Field Labor (15% productivity increase)
    const optimizedLaborInputs = {
      ...state,
      technicians: Math.max(1, state.technicians - 1) // e.g., fewer technicians, or faster speed
    };
    const laborOut = processOperationalPricing({
      clientName: state.clientName,
      pestType: state.pestType,
      environmentType: state.environmentType,
      areaSize: state.areaSize,
      infestationLevel: state.infestationLevel,
      complexity: state.complexity,
      displacement: state.displacement,
      technicians: Math.max(1, state.technicians - 1),
      urgency: state.urgency,
      recurrence: state.recurrence,
      selectedProducts: state.selectedProducts,
      customMargin: state.customMargin
    }, DEFAULT_ENGINE_SETTINGS);

    outputs.push({
      id: 'optimized_labor',
      name: 'Eficiência de Equipe (-1 Operador)',
      price: laborOut.suggestedPrice,
      margin: laborOut.actualMarginPercent,
      profit: laborOut.profitAmount,
      costs: laborOut.totalOperationalCost,
      desc: 'Reduz custo de hora técnica em campo, aumentando o lucro residual final.'
    });

    // Scenario 2: Route Consolidation (20% mileage saving)
    const reducedRouteDisplacement = Math.round(state.displacement * 0.8);
    const routeOut = processOperationalPricing({
      clientName: state.clientName,
      pestType: state.pestType,
      environmentType: state.environmentType,
      areaSize: state.areaSize,
      infestationLevel: state.infestationLevel,
      complexity: state.complexity,
      displacement: reducedRouteDisplacement,
      technicians: state.technicians,
      urgency: state.urgency,
      recurrence: state.recurrence,
      selectedProducts: state.selectedProducts,
      customMargin: state.customMargin
    }, DEFAULT_ENGINE_SETTINGS);

    outputs.push({
      id: 'logistics_consolidated',
      name: 'Rota Otimizada (20% Menos Deslocação)',
      price: routeOut.suggestedPrice,
      margin: routeOut.actualMarginPercent,
      profit: routeOut.profitAmount,
      costs: routeOut.totalOperationalCost,
      desc: 'Reduz os custos logísticos de R$/Km de deslocação física.'
    });

    // Scenario 3: Bulk Chemicals Discount (10% lower chemical cost)
    const discountedProducts = state.selectedProducts.map(p => ({
      ...p,
      unitCost: p.unitCost * 0.90
    }));
    const chemicalOut = processOperationalPricing({
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
      selectedProducts: discountedProducts,
      customMargin: state.customMargin
    }, DEFAULT_ENGINE_SETTINGS);

    outputs.push({
      id: 'chemical_bulk',
      name: 'Calda Química Otimizada (-10% Custo Insumo)',
      price: chemicalOut.suggestedPrice,
      margin: chemicalOut.actualMarginPercent,
      profit: chemicalOut.profitAmount,
      costs: chemicalOut.totalOperationalCost,
      desc: 'Composição simulando compra inteligente de diluições químicas em lote.'
    });

    return outputs;
  }
};
