/**
 * DDSulf Advanced Customer operational Relationship Engine
 * Resolves recurring service timelines, computes loyalty value (LTV), and evaluates active churn probabilities.
 */

import { 
  CustomerProfile, 
  ServiceHistoryItem, 
  RecurrenceOpportunity, 
  CustomerRelationshipInsight, 
  SatisfactionMetrics 
} from '../types';

export class CustomerRelationshipService {
  private static CUSTOMER_STORAGE_KEY = 'ddsulf_relationship_customer_profiles';
  private static HISTORY_STORAGE_KEY = 'ddsulf_relationship_service_history';

  private static listeners: Set<() => void> = new Set();

  public static subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => { this.listeners.delete(cb); };
  }

  private static notifyListeners() {
    this.listeners.forEach(cb => {
      try { cb(); } catch (e) { console.error('[RelationshipService] Listener fail:', e); }
    });
  }

  /**
   * Seed and retrieve high-fidelity mock customers
   */
  public static getProfiles(): CustomerProfile[] {
    if (typeof localStorage === 'undefined') return [];
    const stored = localStorage.getItem(this.CUSTOMER_STORAGE_KEY);
    if (stored) return JSON.parse(stored);

    const defaults: CustomerProfile[] = [
      {
        id: 'cust_plat_ind_01',
        name: 'Logística TransNorte Ltda',
        corporateName: 'TransNorte Logística de Grãos e Containers',
        cnpjOrCpf: '12.345.678/0001-99',
        segment: 'industrial',
        email: 'contato@transnorte.com.br',
        phone: '(54) 3321-9876',
        firstContractAt: Date.now() - 365 * 86400 * 1000,
        contractStatus: 'active',
        lastServiceAt: Date.now() - 40 * 86400 * 1000,
        recurrencePeriodDays: 90,
        totalServicesCompleted: 12,
        lifeTimeValue: 18450.00
      },
      {
        id: 'cust_res_02',
        name: 'Residencial Altos da Serra',
        corporateName: 'Condomínio Residencial Altos da Serra',
        cnpjOrCpf: '98.765.432/0001-11',
        segment: 'residential',
        email: 'adm@altosdaserra.condo',
        phone: '(54) 99912-3456',
        firstContractAt: Date.now() - 180 * 86400 * 1000,
        contractStatus: 'churn_risk',
        lastServiceAt: Date.now() - 120 * 86400 * 1000, // Long time no service for a 90 days cycle
        recurrencePeriodDays: 90,
        totalServicesCompleted: 3,
        lifeTimeValue: 4800.00
      },
      {
        id: 'cust_corp_03',
        name: 'Supermercado Central de Erechim',
        corporateName: 'Supermercados Central S/A',
        cnpjOrCpf: '45.123.789/0002-55',
        segment: 'corporate',
        email: 'qualidade@centralerechim.com',
        phone: '(54) 3522-1100',
        firstContractAt: Date.now() - 720 * 86400 * 1000,
        contractStatus: 'active',
        lastServiceAt: Date.now() - 15 * 86400 * 1000,
        recurrencePeriodDays: 30, // Highly critical monthly recurrence
        totalServicesCompleted: 24,
        lifeTimeValue: 42300.00
      },
      {
        id: 'cust_agri_04',
        name: 'Granja Sementes do Sul',
        corporateName: 'Sementes do Sul Agropecuária Ltda',
        cnpjOrCpf: '55.666.777/0001-00',
        segment: 'agricultural',
        email: 'rural@sementesdosul.com',
        phone: '(54) 99988-7766',
        firstContractAt: Date.now() - 90 * 86400 * 1000,
        contractStatus: 'pending_renewal',
        lastServiceAt: Date.now() - 85 * 86400 * 1000,
        recurrencePeriodDays: 90,
        totalServicesCompleted: 1,
        lifeTimeValue: 3200.00
      }
    ];

    localStorage.setItem(this.CUSTOMER_STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  }

  public static saveProfiles(list: CustomerProfile[]) {
    localStorage.setItem(this.CUSTOMER_STORAGE_KEY, JSON.stringify(list));
    this.notifyListeners();
  }

  /**
   * Seed and retrieve service histories
   */
  public static getHistory(): ServiceHistoryItem[] {
    if (typeof localStorage === 'undefined') return [];
    const stored = localStorage.getItem(this.HISTORY_STORAGE_KEY);
    if (stored) return JSON.parse(stored);

    const defaults: ServiceHistoryItem[] = [
      {
        id: 'hist_01',
        customerId: 'cust_plat_ind_01',
        serviceType: 'Barreira Química de Solo',
        executedAt: Date.now() - 40 * 86400 * 1000,
        status: 'completed',
        technicianName: 'Rodrigo Antunes',
        warrantyExpirationAt: Date.now() + 50 * 86400 * 1000,
        satisfactionScore: 5,
        pestIdentified: ['Cupim de Solo', 'Barata de Esgoto']
      },
      {
        id: 'hist_02',
        customerId: 'cust_res_02',
        serviceType: 'Pulverização Preventiva Orgânica',
        executedAt: Date.now() - 120 * 86400 * 1000,
        status: 'completed',
        technicianName: 'Rodrigo Antunes',
        warrantyExpirationAt: Date.now() - 30 * 86400 * 1000, // Expired
        satisfactionScore: 3,
        pestIdentified: ['Formiga Cortadeira']
      },
      {
        id: 'hist_03',
        customerId: 'cust_corp_03',
        serviceType: 'Expurgo Termonebulizado Noturno',
        executedAt: Date.now() - 15 * 86400 * 1000,
        status: 'completed',
        technicianName: 'Marcos Silveira',
        warrantyExpirationAt: Date.now() + 15 * 86400 * 1000,
        satisfactionScore: 5,
        pestIdentified: ['Ratos de Telhado', 'Barata de Esgoto']
      }
    ];

    localStorage.setItem(this.HISTORY_STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  }

  public static saveHistory(list: ServiceHistoryItem[]) {
    localStorage.setItem(this.HISTORY_STORAGE_KEY, JSON.stringify(list));
    this.notifyListeners();
  }

  /**
   * Generates premium predictive recurrence recommendations
   */
  public static calculateRecurrenceOpportunities(): RecurrenceOpportunity[] {
    const profiles = this.getProfiles();
    const list: RecurrenceOpportunity[] = [];

    profiles.forEach(p => {
      const msSinceLast = Date.now() - p.lastServiceAt;
      const daysSinceLast = Math.floor(msSinceLast / (86400 * 1000));
      const isOverdue = daysSinceLast > p.recurrencePeriodDays;

      if (isOverdue) {
        const daysOverdue = daysSinceLast - p.recurrencePeriodDays;
        const confidenceScoreStr = (1 - (daysOverdue * 0.02) > 0.4 ? 1 - (daysOverdue * 0.02) : 0.4).toFixed(2);

        list.push({
          id: 'rec_opp_' + p.id,
          customerId: p.id,
          customerName: p.name,
          segment: p.segment,
          lastServiceType: p.segment === 'industrial' ? 'Controle de Vetores Integrado' : 'Pulverização Preventiva',
          lastExecutedAt: p.lastServiceAt,
          daysOverdue,
          confidenceScore: parseFloat(confidenceScoreStr),
          estimatedRevenue: p.lifeTimeValue / p.totalServicesCompleted || 1200,
          recommendedPestAction: p.segment === 'industrial' ? 'Prevenção de Roedores com Iscagem' : 'Manejo de Pragas de Clima Úmido'
        });
      }
    });

    return list.sort((a, b) => b.confidenceScore - a.confidenceScore);
  }

  /**
   * Evaluates relationship triggers and risk patterns
   */
  public static calculateInsights(): CustomerRelationshipInsight[] {
    const profiles = this.getProfiles();
    const insights: CustomerRelationshipInsight[] = [];

    profiles.forEach(p => {
      if (p.contractStatus === 'churn_risk') {
        insights.push({
          id: 'ins_churn_' + p.id,
          customerId: p.id,
          customerName: p.name,
          impactLevel: 'high',
          message: `O cliente está há mais de ${Math.floor((Date.now() - p.lastServiceAt) / (86400 * 1000))} dias sem interações. Alerta de desistência (Churn).`,
          suggestedAction: 'Disparar e-mail executivo de re-engajamento com diagnóstico gratuito.'
        });
      }

      if (p.lifeTimeValue > 15000 && p.contractStatus === 'active') {
        insights.push({
          id: 'ins_loyalty_' + p.id,
          customerId: p.id,
          customerName: p.name,
          impactLevel: 'medium',
          message: `Cliente premium de alto ticket consolidado. LTV de R$ ${p.lifeTimeValue.toLocaleString()}.`,
          suggestedAction: 'Oferecer extensão de garantia corporativa sem custo no próximo ciclo.'
        });
      }
    });

    return insights;
  }

  /**
   * Computes localized satisfaction aggregate NPS ratings and stats
   */
  public static getSatisfactionMetrics(): SatisfactionMetrics {
    const history = this.getHistory();
    const validScores = history.filter(h => h.satisfactionScore !== undefined);
    const sum = validScores.reduce((acc, curr) => acc + (curr.satisfactionScore || 0), 0);
    const rating = validScores.length > 0 ? (sum / validScores.length) * 20 : 92; // Max out rating at 100 scale

    return {
      averageNpsScore: Math.round(rating),
      customerRetentionRate: 0.94,
      churnRatePrev30Days: 2.1,
      collectedFeedbacksCount: validScores.length
    };
  }

  /**
   * Interactive additions
   */
  public static addCustomer(profile: Omit<CustomerProfile, 'id' | 'firstContractAt' | 'lastServiceAt' | 'totalServicesCompleted' | 'lifeTimeValue'>) {
    const list = this.getProfiles();
    const newCust: CustomerProfile = {
      ...profile,
      id: 'cust_' + Math.random().toString(36).substr(2, 9),
      firstContractAt: Date.now(),
      lastServiceAt: Date.now() - 30 * 86400 * 1000,
      totalServicesCompleted: 1,
      lifeTimeValue: 1500.00
    };

    this.saveProfiles([newCust, ...list]);
  }

  public static reportNewSatisfactionScore(historyId: string, score: number) {
    const list = this.getHistory();
    const idx = list.findIndex(h => h.id === historyId);
    if (idx !== -1) {
      list[idx].satisfactionScore = score;
      this.saveHistory(list);
    }
  }
}

export default CustomerRelationshipService;
