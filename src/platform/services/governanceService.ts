/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ModuleOwnership, TechnicalDebtItem, SecurityPolicyRule, ModuleStatus, DebtSeverity } from '../types';

const OWNERSHIP_STORAGE_KEY = 'ddsulf_platform_ownership';
const DEBT_STORAGE_KEY = 'ddsulf_platform_tech_debt';
const RULES_STORAGE_KEY = 'ddsulf_platform_security_rules';

export class GovernanceService {
  private ownerships: ModuleOwnership[] = [];
  private debtItems: TechnicalDebtItem[] = [];
  private securityRules: SecurityPolicyRule[] = [];

  constructor() {
    this.initializeBaselineData();
  }

  private initializeBaselineData() {
    // 1. Initial Modular ownership mapping
    try {
      const savedOwnership = localStorage.getItem(OWNERSHIP_STORAGE_KEY);
      if (savedOwnership) {
        this.ownerships = JSON.parse(savedOwnership);
      } else {
        this.ownerships = [
          { id: 'mod_dashboard', name: 'Dashboard Principal', ownerTeam: 'Core UX', techLead: 'Gabriel Max', status: ModuleStatus.STABLE, linesOfCodeEstimated: 1240, testCoverage: 92, lastSecurityAudit: Date.now() - 15 * 86400000 },
          { id: 'mod_calculator', name: 'Calculadora Químicos', ownerTeam: 'Product Eng', techLead: 'Gabriel Max', status: ModuleStatus.STABLE, linesOfCodeEstimated: 950, testCoverage: 95, lastSecurityAudit: Date.now() - 5 * 86400000 },
          { id: 'mod_financial', name: 'Painel Financeiro', ownerTeam: 'Enterprise Fin', techLead: 'Camila Lima', status: ModuleStatus.STABLE, linesOfCodeEstimated: 2100, testCoverage: 88, lastSecurityAudit: Date.now() - 30 * 86400000 },
          { id: 'mod_pops', name: 'Procedimentos (POPs)', ownerTeam: 'Core Operations', techLead: 'Guilherme Silva', status: ModuleStatus.STABLE, linesOfCodeEstimated: 1450, testCoverage: 84, lastSecurityAudit: Date.now() - 12 * 86400000 },
          { id: 'mod_stocks', name: 'Controle de Estoque', ownerTeam: 'Supply Chain', techLead: 'Marina Reis', status: ModuleStatus.ACTIVE, linesOfCodeEstimated: 1800, testCoverage: 79, lastSecurityAudit: Date.now() - 19 * 86400000 },
          { id: 'mod_ai', name: 'IA Operacional', ownerTeam: 'AI Platform', techLead: 'Google AI Studio', status: ModuleStatus.EXPERIMENTAL, linesOfCodeEstimated: 680, testCoverage: 94, lastSecurityAudit: Date.now() - 2 * 86400000 },
        ];
        this.persist(OWNERSHIP_STORAGE_KEY, this.ownerships);
      }
    } catch {
      // Offline fallback
    }

    // 2. Technical debt baseline registers
    try {
      const savedDebt = localStorage.getItem(DEBT_STORAGE_KEY);
      if (savedDebt) {
        this.debtItems = JSON.parse(savedDebt);
      } else {
        this.debtItems = [
          { id: 'debt_calc_refactor', title: 'Refatorar aninhamentos da calculadora', component: 'Calculadora Doses', severity: DebtSeverity.MEDIUM, estimatedFixHours: 8, description: 'Reduzir loops repetitivos e normalizar herança de volumes calculados na conversão decimais.', status: 'pending' },
          { id: 'debt_pwa_assets_offline', title: 'Cache offline de ativos do fabricante quimico', component: 'Estoque', severity: DebtSeverity.HIGH, estimatedFixHours: 12, description: 'Injetar blobs e hashes de fotografias da Anvisa diretamente no cache modular prévio.', status: 'in_progress' },
          { id: 'debt_recharts_responsive', title: 'Adicionar observadores ruidosos de tamanho nos gráficos', component: 'Dashboard', severity: DebtSeverity.LOW, estimatedFixHours: 4, description: 'Debounce no resize observer para evitar rendering concorrente sob transição de visual.', status: 'resolved' },
          { id: 'debt_auth_token_refresh', title: 'Checagem antecipada de expiração de token firestore', component: 'Segurança', severity: DebtSeverity.HIGH, estimatedFixHours: 16, description: 'Prevenir desconexão de sessões ativas no campo em áreas sem nenhuma conexão celular.', status: 'pending' },
        ];
        this.persist(DEBT_STORAGE_KEY, this.debtItems);
      }
    } catch {
      // Offline fallback
    }

    // 3. Security policies baseline guidelines
    try {
      const savedRules = localStorage.getItem(RULES_STORAGE_KEY);
      if (savedRules) {
        this.securityRules = JSON.parse(savedRules);
      } else {
        this.securityRules = [
          { id: 'sec_auth_enforced', code: 'SEC-001', description: 'Todos os endpoints táticos exigem credenciais Firebase autenticadas.', category: 'authentication', isEnforced: true, complianceRatio: 100 },
          { id: 'sec_tenant_leak', code: 'SEC-002', description: 'Filtro explícito de TenantId aplicado em queries secundárias.', category: 'data_isolation', isEnforced: true, complianceRatio: 100 },
          { id: 'sec_api_throttling', code: 'SEC-003', description: 'Taxa limiar de tráfego de API bloqueia requests repetitivos (+120/min).', category: 'api_limits', isEnforced: true, complianceRatio: 94 },
          { id: 'sec_cache_encryption', code: 'SEC-004', description: 'Cifragem de dados sensíveis e relatórios de receitas salvos temporariamente.', category: 'pwa_cache', isEnforced: false, complianceRatio: 75 },
        ];
        this.persist(RULES_STORAGE_KEY, this.securityRules);
      }
    } catch {
      // Offline fallback
    }
  }

  private persist(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed memory persist under offline storage:', e);
    }
  }

  // --- External APIs for Governance ---

  public getModulesOwnership(): ModuleOwnership[] {
    return this.ownerships;
  }

  public getTechnicalDebt(): TechnicalDebtItem[] {
    return this.debtItems;
  }

  public getSecurityRules(): SecurityPolicyRule[] {
    return this.securityRules;
  }

  public registerTechnicalDebt(item: Omit<TechnicalDebtItem, 'id'>): TechnicalDebtItem {
    const newItem: TechnicalDebtItem = {
      ...item,
      id: `debt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    };
    this.debtItems.unshift(newItem);
    this.persist(DEBT_STORAGE_KEY, this.debtItems);
    return newItem;
  }

  public updateTechnicalDebtStatus(id: string, status: 'pending' | 'in_progress' | 'resolved'): boolean {
    const debt = this.debtItems.find(d => d.id === id);
    if (!debt) return false;
    debt.status = status;
    this.persist(DEBT_STORAGE_KEY, this.debtItems);
    return true;
  }

  public toggleRuleEnforcements(id: string): boolean {
    const rule = this.securityRules.find(r => r.id === id);
    if (!rule) return false;
    rule.isEnforced = !rule.isEnforced;
    rule.complianceRatio = rule.isEnforced ? 100 : 75;
    this.persist(RULES_STORAGE_KEY, this.securityRules);
    return true;
  }

  /**
   * Compiles total platform compliance based on technical debts, auditing and coverage ratios
   */
  public compilePlatformComplianceScore(): number {
    const totalRules = this.securityRules.length;
    const enforcedRules = this.securityRules.filter(r => r.isEnforced).length;
    const ruleWeight = totalRules > 0 ? (enforcedRules / totalRules) * 50 : 50;

    const coverageAverage = this.ownerships.length > 0
      ? this.ownerships.reduce((acc, current) => acc + current.testCoverage, 0) / this.ownerships.length
      : 80;
    const coverageWeight = (coverageAverage / 100) * 30;

    const criticalDebts = this.debtItems.filter(d => d.status !== 'resolved' && d.severity === DebtSeverity.HIGH).length;
    const debtPenalty = Math.max(0, criticalDebts * 5);
    const debtWeight = Math.max(0, 20 - debtPenalty);

    return Math.round(ruleWeight + coverageWeight + debtWeight);
  }
}

export const governanceService = new GovernanceService();
export default governanceService;
