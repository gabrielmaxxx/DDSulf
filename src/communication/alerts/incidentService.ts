/**
 * PestFlow Critical Operational Incident Escalation & Response Log Engine
 */

import { IncidentLog, AlertCategory, AlertSeverity } from '../types';
import PestFlowNotificationService from '../services/notificationService';
import { db } from '../../firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { tenantStorage } from '@/utils/storage';

const MILISECONDS_ESC_INTERVAL = 30000; // Fast 30s escalation intervals for live simulation

export class PestFlowIncidentService {
  private static instance: PestFlowIncidentService;
  private incidents: IncidentLog[] = [];
  private listeners: Set<(incidents: IncidentLog[]) => void> = new Set();
  private checkerInterval: any = null;

  private constructor() {
    this.loadLocal();
    this.startEscalationChecker();
  }

  public static getInstance(): PestFlowIncidentService {
    if (!PestFlowIncidentService.instance) {
      PestFlowIncidentService.instance = new PestFlowIncidentService();
    }
    return PestFlowIncidentService.instance;
  }

  private loadLocal() {
    const saved = tenantStorage.getItem('incident_logs');
    if (saved) {
      try {
        this.incidents = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse incidents log local storage', e);
      }
    }
  }

  private saveLocal() {
    tenantStorage.setItem('incident_logs', JSON.stringify(this.incidents));
    this.broadcast();
  }

  public subscribe(onUpdate: (incidents: IncidentLog[]) => void): () => void {
    this.listeners.add(onUpdate);
    onUpdate(this.incidents);
    return () => {
      this.listeners.delete(onUpdate);
    };
  }

  private broadcast() {
    this.listeners.forEach(cb => cb([...this.incidents]));
  }

  /**
   * Spawns a new critical incident tracking process, firing an immediate priority in-app notify and routing across vital channels
   */
  public async createIncident(params: {
    category: AlertCategory;
    carrierName?: string;
    technicianId?: string;
    failureLogString: string;
    severity: 'critical' | 'high';
    escalationPath: string[];
  }): Promise<IncidentLog> {
    const notifService = PestFlowNotificationService.getInstance();
    
    // Create corresponding notification first
    const notif = await notifService.createNotification({
      category: 'incident',
      severity: params.severity as AlertSeverity,
      customTitle: `S.O.S OPERACIONAL: ${params.carrierName || 'Equipamento/Insumo'}`,
      customMessage: `${params.failureLogString}. Iniciado protocolo de contingenciamento imediato. Técnico resp: ${params.technicianId || 'Sistema'}.`,
      actorId: params.technicianId || 'system',
      routeUrl: '/dashboard',
      actions: [
        {
          id: `act_ack_${Date.now()}`,
          label: 'Aconhecer Ocorrência Resiliente',
          type: 'ack_incident'
        }
      ]
    });

    const incidentId = `incident_${Math.random().toString(36).substring(2, 12)}`;
    const newIncident: IncidentLog = {
      id: incidentId,
      tenantId: 'tenant_pestflow_enterprise',
      notificationId: notif.id,
      severity: params.severity,
      status: 'active',
      carrierName: params.carrierName,
      initiatedAt: Date.now(),
      failureLogString: params.failureLogString,
      escalationPath: params.escalationPath,
      nextEscalationAt: Date.now() + MILISECONDS_ESC_INTERVAL,
      assignedTechnicianId: params.technicianId
    };

    this.incidents.unshift(newIncident);
    this.saveLocal();

    // Sync backup
    try {
      await setDoc(doc(db, 'tenants', 'tenant_pestflow_enterprise', 'incidents', incidentId), newIncident);
    } catch (e) {
      console.warn('[PestFlow Incident Service] Bypassed Firestore incident creation syncing.', e);
    }

    return newIncident;
  }

  /**
   * Operator acknowledges the incident to halt the escalation pathway
   */
  public async acknowledgeIncident(incidentId: string, operatorName: string): Promise<void> {
    this.incidents = this.incidents.map(inc => {
      if (inc.id === incidentId) {
        const updated: IncidentLog = {
          ...inc,
          status: 'acknowledged',
          acknowledgedAt: Date.now(),
          acknowledgedBy: operatorName,
          nextEscalationAt: 0 // Stop the clock!
        };

        // Suppress alarms on matching notifications
        PestFlowNotificationService.getInstance().updateNotificationProperties(inc.notificationId, {
          title: `[Em Atendimento] ${inc.carrierName || 'Ocorrência'}`,
          status: 'read'
        });

        // Sync backup
        updateDoc(doc(db, 'tenants', 'tenant_pestflow_enterprise', 'incidents', incidentId), {
          status: 'acknowledged',
          acknowledgedAt: updated.acknowledgedAt,
          acknowledgedBy: updated.acknowledgedBy,
          nextEscalationAt: 0
        }).catch(e => console.warn('Incident sync suppressed.', e));

        return updated;
      }
      return inc;
    });
    this.saveLocal();
  }

  /**
   * Clinch resolution logging completion details
   */
  public async resolveIncident(incidentId: string): Promise<void> {
    this.incidents = this.incidents.map(inc => {
      if (inc.id === incidentId) {
        const updated: IncidentLog = {
          ...inc,
          status: 'resolved',
          resolvedAt: Date.now()
        };

        PestFlowNotificationService.getInstance().updateNotificationProperties(inc.notificationId, {
          title: `[RESOLVIDO] ${inc.carrierName || 'Ocorrência'}`,
          status: 'read'
        });

        updateDoc(doc(db, 'tenants', 'tenant_pestflow_enterprise', 'incidents', incidentId), {
          status: 'resolved',
          resolvedAt: updated.resolvedAt
        }).catch(e => console.warn('Incident resolve sync bypassed.', e));

        return updated;
      }
      return inc;
    });
    this.saveLocal();
  }

  /**
   * Live scanning checker that triggers escalation of ignored severe incidents
   */
  private startEscalationChecker() {
    this.checkerInterval = setInterval(() => {
      const activePendingScale = this.incidents.filter(
        inc => inc.status === 'active' && inc.nextEscalationAt > 0 && Date.now() > inc.nextEscalationAt
      );

      activePendingScale.forEach(inc => {
        this.escalate(inc);
      });
    }, 5000);
  }

  private escalate(inc: IncidentLog) {
    if (inc.escalationPath.length === 0) {
      // Reached ultimate escalation
      this.incidents = this.incidents.map(i => 
        i.id === inc.id ? { ...i, nextEscalationAt: 0, status: 'escalated' } : i
      );
      this.saveLocal();
      return;
    }

    const currentPath = [...inc.escalationPath];
    const nextResponsibleGroup = currentPath.shift(); // Remove first item as current target

    const notifService = PestFlowNotificationService.getInstance();
    
    // Broadcast urgent high-impact notice to the next tier of managers
    notifService.createNotification({
      category: 'incident',
      severity: 'critical',
      customTitle: `⚠️ ALERTA ESCALADO: Alçada para [${nextResponsibleGroup}]`,
      customMessage: `O incidente envolvendo "${inc.carrierName || 'Saneamento Técnico'}" NÃO foi atendido em tempo hábil. Responsabilidade técnica transferida com urgência para o grupo de supervisão [${nextResponsibleGroup}].`,
      routeUrl: '/dashboard'
    });

    this.incidents = this.incidents.map(i => {
      if (i.id === inc.id) {
        return {
          ...i,
          escalationPath: currentPath,
          nextEscalationAt: currentPath.length > 0 ? Date.now() + MILISECONDS_ESC_INTERVAL : 0,
          status: currentPath.length > 0 ? 'active' : 'escalated'
        };
      }
      return i;
    });

    this.saveLocal();
  }

  public getActiveIncidentsCount(): number {
    return this.incidents.filter(inc => inc.status === 'active').length;
  }

  public getIncidentsList(): IncidentLog[] {
    return [...this.incidents];
  }

  public destroy() {
    if (this.checkerInterval) {
      clearInterval(this.checkerInterval);
    }
  }
}

export default PestFlowIncidentService;
