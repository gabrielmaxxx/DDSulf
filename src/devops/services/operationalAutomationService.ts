/**
 * DDSulf Operational Automation Services
 * Manages event-driven triggers, automated fallback routines, and auditable security forensic timelines.
 */

import { SecurityAuditRecord } from '../types';

export interface AutomatedTrigger {
  id: string;
  name: string;
  description: string;
  active: boolean;
  type: 'action' | 'alert' | 'validation';
  frequency: 'realtime' | 'daily' | 'on_deploy';
}

class OperationalAutomationService {
  private triggers: AutomatedTrigger[] = [];
  private securityLogs: SecurityAuditRecord[] = [];

  constructor() {
    this.seedTriggers();
    this.seedSecurityLogs();
  }

  private seedTriggers() {
    this.triggers = [
      {
        id: 'trig_001',
        name: 'Auto-Rollback on Error Spike (Sentry Integrator)',
        description: 'Desvia tráfego de borda automaticamente se a taxa de erros 5xx exceder 2% nos últimos 3 minutos.',
        active: true,
        type: 'action',
        frequency: 'realtime'
      },
      {
        id: 'trig_002',
        name: 'Auto-Invalidate PWA Cache on Critical Hotfixes',
        description: 'Força o registro do novo ServiceWorker de forma transparente no navegador do usuário.',
        active: true,
        type: 'action',
        frequency: 'on_deploy'
      },
      {
        id: 'trig_003',
        name: 'Forense Security Key Scan and Auditing',
        description: 'Bloqueia requisições do Workspace sem tokens autorizadores legítimos de SecOps.',
        active: true,
        type: 'validation',
        frequency: 'realtime'
      },
      {
        id: 'trig_004',
        name: 'Weekly Sandbox and Database Seed Purge',
        description: 'Limpa metadados e logs obsoletos dos ambientes de Staging/Staging-South e Development.',
        active: false,
        type: 'action',
        frequency: 'daily'
      }
    ];
  }

  private seedSecurityLogs() {
    this.securityLogs = [
      {
        id: 'sec_log_901',
        timestamp: new Date(Date.now() - 60000 * 45).toISOString(),
        module: 'Workspace Autenticador',
        action: 'Tenant Isolation Validation Check',
        actor: 'SecOps-Validator-Agent',
        ipAddress: '177.124.90.11',
        status: 'allowed',
        details: 'Nenhuma vazão detectada. Schema multi-tenant ddsulf_matriz isolado com sucesso no Firestore.'
      },
      {
        id: 'sec_log_902',
        timestamp: new Date(Date.now() - 60000 * 24).toISOString(),
        module: 'Financeiro API Guard',
        action: 'External Endpoint Authentication',
        actor: 'Gateway-Pagamento-Webhook',
        ipAddress: '34.95.120.45',
        status: 'allowed',
        details: 'Assinatura SHA-256 validada com sucesso para endpoint de faturamento operacional.'
      },
      {
        id: 'sec_log_903',
        timestamp: new Date(Date.now() - 60000 * 12).toISOString(),
        module: 'PWA Servidor-Proxy',
        action: 'Unregistered Device Ingress Attempt',
        actor: 'Unknown Scraper Bot',
        ipAddress: '45.18.232.19',
        status: 'blocked',
        details: 'Tentativa de requisição de ativos estáticos suspensa por regras de firewall de borda DDSulf.'
      }
    ];
  }

  public getTriggers(): AutomatedTrigger[] {
    return this.triggers;
  }

  public getSecurityLogs(): SecurityAuditRecord[] {
    return this.securityLogs;
  }

  public toggleTrigger(id: string): boolean {
    const matched = this.triggers.find(t => t.id === id);
    if (matched) {
      matched.active = !matched.active;
      return matched.active;
    }
    return false;
  }

  public triggerManualWorkflowAction(id: string): { success: boolean; message: string } {
    const matched = this.triggers.find(t => t.id === id);
    if (!matched) {
      return { success: false, message: 'Workflow não encontrado.' };
    }
    
    // Add audit trail entries
    this.recordSecurityEvent(
      'Automação Operacional',
      `Forçado disparo manual: ${matched.name}`,
      `gabriel.max@ddsulf.com.br`,
      '189.102.4.15',
      'allowed',
      `Executado módulo de contenção offline e atualização da malha de sincronização.`
    );
    
    return {
      success: true,
      message: `Workflow "${matched.name}" executado manualmente com sucesso em produção!`
    };
  }

  public recordSecurityEvent(
    module: string,
    action: string,
    actor: string,
    ipAddress: string,
    status: SecurityAuditRecord['status'],
    details: string
  ): SecurityAuditRecord {
    const record: SecurityAuditRecord = {
      id: `sec_log_${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      module,
      action,
      actor,
      ipAddress,
      status,
      details
    };
    this.securityLogs.unshift(record);
    return record;
  }
}

export const operationalAutomationService = new OperationalAutomationService();
export default operationalAutomationService;
