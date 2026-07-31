import { BaseFirestoreService } from '../firestore/BaseFirestoreService';
import { Quote, QuoteStatus } from '@/types/database';
import { logOperationalEvent, logDilutionCalculation } from '@/firebase/analytics';

export class QuotesService extends BaseFirestoreService<Quote> {
  constructor() {
    super('quotes');
  }

  /**
   * Safe calculation logic for chemical dilution and pesticide costs
   * Establishes pricing recommendations according to operational criteria
   */
  calculateProposal(params: {
    areaSize: number;
    pestType: string;
    environmentType: string;
    infestationLevel: 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
    displacementKm: number;
    teamSize: number;
  }) {
    // Standard chemical cost estimate algorithms
    const BasePricePerSqm = 4.5; // BRL
    const baseChemicalCost = params.areaSize * 1.2;
    
    // Multipliers
    let complexityFactor = 1.0;
    if (params.infestationLevel === 'Médio') complexityFactor = 1.25;
    else if (params.infestationLevel === 'Alto') complexityFactor = 1.6;
    else if (params.infestationLevel === 'Crítico') complexityFactor = 2.1;

    let envMultiplier = 1.0;
    if (params.environmentType === 'Indústria') envMultiplier = 1.4;
    else if (params.environmentType === 'Restaurante') envMultiplier = 1.25;
    else if (params.environmentType === 'Hospital') envMultiplier = 1.5;

    // Financial formulas
    const laborHourRate = 35.0; // operational cost per technician hour
    const travelCostRate = 2.5; // per Km
    
    const estimatedDurationHours = Math.ceil(params.areaSize / 150) * (params.pestType === 'Baratas' ? 1.5 : 2.0);
    const laborCost = params.teamSize * estimatedDurationHours * laborHourRate;
    const travelCost = params.displacementKm * travelCostRate;
    
    const calculatedOperationalCost = baseChemicalCost + laborCost + travelCost;
    
    // Final Suggestion formulas ensuring target margin threshold is validated
    const rawSuggestedPrice = (params.areaSize * BasePricePerSqm * envMultiplier * complexityFactor) + travelCost;
    
    // Margin validation check
    const minimumPriceAcceptable = calculatedOperationalCost * 1.5; // Enforces minimum 50% markup
    const targetPrice = Math.max(rawSuggestedPrice, minimumPriceAcceptable);
    
    const calculatedMarginPercent = ((targetPrice - calculatedOperationalCost) / targetPrice) * 100;

    logDilutionCalculation(params.pestType, params.areaSize, targetPrice);

    return {
      suggestedPrice: Math.round(targetPrice),
      estimatedCost: Math.round(calculatedOperationalCost),
      estimatedMargin: Math.round(calculatedMarginPercent),
      recommendedTeam: params.teamSize,
      estimatedTime: estimatedDurationHours
    };
  }

  /**
   * Creating a validated Proposal with integrated business logic and safety checks
   */
  async createQuote(empresaId: string, quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { id?: string }): Promise<Quote> {
    logOperationalEvent('quote_creation_requested', { clientId: quoteData.clientId, pest: quoteData.pestType });
    
    const proposal = {
      ...quoteData,
      status: 'Rascunho' as QuoteStatus,
    };

    const newQuote = await this.create(empresaId, proposal as any);
    logOperationalEvent('quote_created', { quoteId: newQuote.id, suggestedPrice: newQuote.suggestedPrice });
    return newQuote as Quote;
  }

  /**
   * Secure state transitions for terminal quotes preventing modifications on approved files
   */
  async updateQuoteStatus(empresaId: string, id: string, newStatus: QuoteStatus): Promise<void> {
    logOperationalEvent('quote_status_update_requested', { id, newStatus });
    
    const quote = await this.getById(empresaId, id);
    if (!quote) {
      throw new Error(`Quote with identity ${id} could not be located.`);
    }

    // Protection rule mirrored from Firestore Rules Security Invariants
    const terminalStates: QuoteStatus[] = ['Aprovado', 'Executado', 'Cancelado'];
    if (terminalStates.includes(quote.status) && newStatus !== 'Cancelado') {
      throw new Error(`State Transition Blocked: Document ${id} represents terminal state ${quote.status} and cannot be modified.`);
    }

    await this.update(empresaId, id, { status: newStatus as any });
    logOperationalEvent('quote_status_updated', { id, finalStatus: newStatus });
  }

  /**
   * Dynamic retrieval query filter for sales pipeline and active lists
   */
  async listQuotesByStatus(empresaId: string, status: QuoteStatus): Promise<Quote[]> {
    return this.list(empresaId, {
      filters: [
        { field: 'status', operator: '==', value: status }
      ]
    });
  }

  /**
   * Filter queries specifically mapped for client relationship dashboards
   */
  async listQuotesByClient(empresaId: string, clientId: string): Promise<Quote[]> {
    return this.list(empresaId, {
      filters: [
        { field: 'clientId', operator: '==', value: clientId }
      ]
    });
  }
}

export const quotesService = new QuotesService();
export default quotesService;
