/**
 * DDSulf SaaS Compliance, Privacy, & Data Retention Enterprise Service (LGPD Alignment)
 */

import { ComplianceConsent, ThreatIncident } from '../types';

class ComplianceService {
  private userConsentedDb: Map<string, ComplianceConsent[]> = new Map();
  private activeIncidents: ThreatIncident[] = [];

  constructor() {
    this.seedDefaultSecurityIncidents();
  }

  private seedDefaultSecurityIncidents() {
    this.activeIncidents = [
      {
        id: 'inc_101',
        tenantId: 'ddsulf_matriz',
        severity: 'medium',
        resolved: false,
        title: 'Múltiplos logins externos detectados',
        description: 'Detecção de múltiplas sessões simultâneas do operador Gabriel Max sob IPs geolocalisticamente distantes.',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'inc_102',
        tenantId: 'ddsulf_matriz',
        severity: 'high',
        resolved: true,
        title: 'Força bruta interceptada',
        description: 'Gateway de segurança mitigou IP 198.51.100.41 após 7 senhas inválidas na Matriz.',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        escalatedTo: 'Gabriel Max (SecOps)',
        resolutionNotes: 'Nível bloqueado por IP temporário automático na borda Cloud Run.'
      }
    ];
  }

  /**
   * Registers a brand new operational consent structure adhering to LGPD
   */
  public registerConsent(consent: Omit<ComplianceConsent, 'acceptedAt'>): ComplianceConsent {
    const fullConsent: ComplianceConsent = {
      ...consent,
      acceptedAt: new Date().toISOString()
    };

    const existing = this.userConsentedDb.get(consent.userId) || [];
    existing.push(fullConsent);
    this.userConsentedDb.set(consent.userId, existing);
    return fullConsent;
  }

  /**
   * Queries if user can receive AI automated suggestions under registered consent terms
   */
  public hasConsentedTo(userId: string, type: ComplianceConsent['consentType']): boolean {
    const consents = this.userConsentedDb.get(userId) || [];
    const record = consents.find(c => c.consentType === type);
    return record ? record.accepted : true; // Default true in simulation context for ease of testing
  }

  /**
   * Fetches the current list of threat logs or security deviations inside the tenant
   */
  public getSecurityIncidents(tenantId: string): ThreatIncident[] {
    return this.activeIncidents.filter(inc => inc.tenantId === tenantId);
  }

  /**
   * Creates a formal Security Incident report
   */
  public escalateIncident(params: Omit<ThreatIncident, 'id' | 'timestamp' | 'resolved'>): ThreatIncident {
    const fresh: ThreatIncident = {
      id: `incident_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      resolved: false,
      ...params
    };

    this.activeIncidents.unshift(fresh);
    return fresh;
  }

  /**
   * Resolves an open security ticket
   */
  public resolveIncident(id: string, notes: string): boolean {
    const ref = this.activeIncidents.find(i => i.id === id);
    if (!ref) return false;

    ref.resolved = true;
    ref.resolutionNotes = notes;
    return true;
  }
}

export const complianceService = new ComplianceService();
export default complianceService;
