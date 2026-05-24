/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExecutiveRecommendation, RecommendationCategory, RecommendationSeverity, RecommendationStatus } from '../types';

const RECS_STORAGE_KEY = 'ddsulf_executive_recommendations';

export class RecommendationService {
  private recommendations: ExecutiveRecommendation[] = [];

  constructor() {
    this.initializeDefaultRecommendations();
  }

  private initializeDefaultRecommendations() {
    try {
      const saved = localStorage.getItem(RECS_STORAGE_KEY);
      if (saved) {
        this.recommendations = JSON.parse(saved);
      } else {
        this.recommendations = [
          {
            id: 'rec_001_pesticide_efficiency',
            title: 'Otimização de Dosagem em Contratos de Pelotas',
            severity: RecommendationSeverity.HIGH,
            category: RecommendationCategory.FINANCIAL,
            description: 'Redução de margem identificada na filial Sul de Pelotas devido ao uso redundante de piretróides sintéticos fora da prescrita calibração estequiométrica.',
            estimatedImpactBrl: 14500.00,
            confidenceScorePercent: 94,
            evidenceWorkflow: 'Calculadora de Doses vs Histórico de POPs da filial Pelotas',
            remedyActionStep: 'Iniciar re-calibração mecânica de pulverizadores agrícolas e forçar teto estrito na calculadora para supervisores locais.',
            status: RecommendationStatus.PENDING_SUPERVISION
          },
          {
            id: 'rec_002_routes_clustering',
            title: 'Clusterização Geográfica de Visitas de Retransmissão',
            severity: RecommendationSeverity.MEDIUM,
            category: RecommendationCategory.OPERATIONS,
            description: 'Altos trajetos dispersos nas quartas e quintas-feiras gerando queima de combustíveis operacionais desnecessários e desgaste de vedações.',
            estimatedImpactBrl: 8900.00,
            confidenceScorePercent: 88,
            evidenceWorkflow: 'Mapeamento geofísico de rotas ativas do dashboard regional',
            remedyActionStep: 'Forçar o pooling quinzenal de vedações e controle de térmitas residenciais nos limites dos quadrantes metropolitanos.',
            status: RecommendationStatus.PENDING_SUPERVISION
          },
          {
            id: 'rec_003_pwa_onboarding_scale',
            title: 'Expansão de Técnicos na Unidade Caxias',
            severity: RecommendationSeverity.LOW,
            category: RecommendationCategory.EXPANSION,
            description: 'Frente de demanda no setor vitivinícola gaúcho excedendo a capacidade atual dos 5 técnicos locais de campo, limitando captação de novos contratos.',
            estimatedImpactBrl: 35000.00,
            confidenceScorePercent: 81,
            evidenceWorkflow: 'Registro de quotas no plano de subscrição mensal profissional',
            remedyActionStep: 'Provisionar 3 novas licenças Starter no painel SaaS e remanejar técnico tutor supervisor de Porto Alegre.',
            status: RecommendationStatus.APPROVED,
            approvedBy: 'Diretor Gabriel Max',
            approvedAt: Date.now() - 3600000
          },
          {
            id: 'rec_004_safety_audit',
            title: 'Auditoria de POPs do Regulatório Anvisa',
            severity: RecommendationSeverity.HIGH,
            category: RecommendationCategory.OPERATIONS,
            description: 'Falta de preenchimento do lote do praguicida biológico em 4 laudos técnicos POPs finais, correndo o risco de autuações e comprometimento do selo ISSO.',
            estimatedImpactBrl: 50000.00,
            confidenceScorePercent: 97,
            evidenceWorkflow: 'Validador de contratos e telemetria legal',
            remedyActionStep: 'Bloquear envio de POPs se campos de controle sanitário restrito forem deixados em branco.',
            status: RecommendationStatus.PENDING_SUPERVISION
          }
        ];
        this.persist();
      }
    } catch {
      // offline fallback
    }
  }

  private persist() {
    try {
      localStorage.setItem(RECS_STORAGE_KEY, JSON.stringify(this.recommendations));
    } catch (e) {
      console.warn('Persistence failed for recommendations:', e);
    }
  }

  public getRecommendations(): ExecutiveRecommendation[] {
    return this.recommendations;
  }

  public approveRecommendation(id: string, reviewerName: string): boolean {
    const item = this.recommendations.find(r => r.id === id);
    if (!item) return false;

    item.status = RecommendationStatus.APPROVED;
    item.approvedBy = reviewerName;
    item.approvedAt = Date.now();
    this.persist();
    return true;
  }

  public rejectRecommendation(id: string): boolean {
    const item = this.recommendations.find(r => r.id === id);
    if (!item) return false;

    item.status = RecommendationStatus.REJECTED;
    this.persist();
    return true;
  }

  public transitionToImplemented(id: string): boolean {
    const item = this.recommendations.find(r => r.id === id);
    if (!item) return false;

    item.status = RecommendationStatus.IMPLEMENTED;
    this.persist();
    return true;
  }
}

export const recommendationService = new RecommendationService();
export default recommendationService;
