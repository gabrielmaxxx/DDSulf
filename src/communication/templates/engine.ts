/**
 * PestFlow Dynamics Template Engine & Communication Renderer
 */

import { AlertCategory, AlertSeverity, CommunicationTemplate, DeliveryChannel } from '../types';

export class CommunicationTemplateEngine {
  private static templates: Record<string, CommunicationTemplate> = {
    'operations.report_submitted': {
      id: 'template_report_sub',
      category: 'operations',
      name: 'Submissão de Relatório Técnico (POP)',
      subjectTemplate: 'POP Concluído: {{technicianName}} em {{clientName}}',
      bodyTemplate: 'O técnico {{technicianName}} finalizou com sucesso a aplicação de controle de pragas ({{pestType}}) em {{clientName}}. Insumo utilizado: {{chemicalVolume usados}}. Certificado sanitário legal foi lavrado e disponibilizado para o cliente.',
      defaultSeverity: 'informational',
      supportedChannels: ['in_app', 'email', 'whatsapp'],
      aiExpansionRules: 'Adoce e torne extra profissional enfatizando conformidade com normas Anvisa.'
    },
    'operations.inventory_starved': {
      id: 'template_inv_starved',
      category: 'operations',
      name: 'Escassez Crítica de Saneantes',
      subjectTemplate: 'ALERTA DE ESTOQUE: {{itemName}} abaixo do Limite Mínimo',
      bodyTemplate: 'O nível de armazenamento de {{itemName}} desceu para {{currentVolume}} unidades (Limite de segurança: {{minRequired}}). Risco imediato de paralisação de ordens de serviço ativas. É necessário re-abastecimento imediato.',
      defaultSeverity: 'high',
      supportedChannels: ['in_app', 'push', 'email'],
      aiExpansionRules: 'Gere pânico moderado quanto ao SLA técnico mas de forma elegante e urgente.'
    },
    'operations.route_deviation': {
      id: 'template_route_dev',
      category: 'operations',
      name: 'Alerta de Anomalia na Rota Externa',
      subjectTemplate: 'DESVIO DE COBERTURA: {{driverName}} - Veículo {{vehicleId}}',
      bodyTemplate: 'O veículo de transporte de caldas e defensivos {{vehicleId}} sob comando de {{driverName}} registrou um desvio operacional crítico ou problema técnico. Detalhes repassados: "{{details}}". Fila de rastreio ativada.',
      defaultSeverity: 'critical',
      supportedChannels: ['in_app', 'push', 'whatsapp'],
      aiExpansionRules: 'Destaque coordenadas geográficas presumidas e ordene contingenciamento imediato.'
    },
    'financial.margin_breached': {
      id: 'template_margin_breached',
      category: 'financial',
      name: 'Descumprimento de Budget Comercial (Margem Baixa)',
      subjectTemplate: 'RISCO FINANCEIRO: Margem Abaixo do Planejado ({{margin}}%)',
      bodyTemplate: 'A proposta comercial nº {{proposalId}} para o cliente {{clientName}} foi travada automaticamente. A margem final apurada de {{margin}}% violou as diretrizes estatutárias mínimas de 18% para o segmento.',
      defaultSeverity: 'high',
      supportedChannels: ['in_app', 'push', 'email'],
      aiExpansionRules: 'Aumente o tom corporativo de fiscalização de finanças internas e compliance.'
    },
    'workflow.approval_needed': {
      id: 'template_app_needed',
      category: 'workflow',
      name: 'Solicitação de Liberação de Alçada Técnico-Comercial',
      subjectTemplate: 'PENDÊNCIA: Liberação Requisitada por {{technicianName}}',
      bodyTemplate: 'O supervisor {{technicianName}} solicita autorização emergencial nível {{requiredLevel}} para a ação: "{{reason}}". O processo está suspenso aguardando decisão técnica imediata.',
      defaultSeverity: 'medium',
      supportedChannels: ['in_app', 'email'],
      aiExpansionRules: 'Facilite a tomada de decisão adicionando análise preliminar de risco de conformidade.'
    },
    'incident.critical_spill': {
      id: 'template_incident_spill',
      category: 'incident',
      name: 'Vazamento ou Incidente Químico de Caldas',
      subjectTemplate: 'INCIDENTE CRÍTICO: Vazamento ou Contato Biológico',
      bodyTemplate: 'URGENTE: Registrado sinistro operacional com compostos de fipronil/cipermetrina na rota {{routeId}}. Técnico envolvido: {{technicianName}}. Providências imediatas de isolamento exigidas para conformidade ambiental.',
      defaultSeverity: 'critical',
      supportedChannels: ['in_app', 'push', 'email', 'whatsapp'],
      aiExpansionRules: 'Imponha protocolo padrão de emergência toxicológica e resgate ambiental imediato.'
    }
  };

  /**
   * Evaluates standard template placeholders replacing matching keys dynamically
   */
  public static render(
    templateKey: string, 
    variables: Record<string, any>
  ): { title: string; body: string; severity: AlertSeverity; channels: DeliveryChannel[] } {
    const tmpl = this.templates[templateKey];
    if (!tmpl) {
      return {
        title: 'Operação PestFlow Evento',
        body: `Mensagem de controle gerada automaticamente com os dados: ${JSON.stringify(variables)}`,
        severity: 'informational',
        channels: ['in_app']
      };
    }

    let title = tmpl.subjectTemplate || tmpl.name;
    let body = tmpl.bodyTemplate;

    Object.entries(variables).forEach(([key, val]) => {
      const placeholder = `{{${key}}}`;
      title = title.replace(placeholder, String(val));
      body = body.replace(placeholder, String(val));
    });

    return {
      title,
      body,
      severity: tmpl.defaultSeverity,
      channels: tmpl.supportedChannels
    };
  }

  public static getTemplatesList(): CommunicationTemplate[] {
    return Object.values(this.templates);
  }
}
export default CommunicationTemplateEngine;
