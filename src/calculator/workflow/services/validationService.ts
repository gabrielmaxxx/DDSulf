import { QuoteWorkflowState, WorkflowValidationResult } from '../types';

export const validationService = {
  /**
   * Performs real-time validation of a given step's state.
   */
  validateStep(step: number, state: QuoteWorkflowState): WorkflowValidationResult {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};

    switch (step) {
      case 1: // Informações iniciais
        if (!state.clientName || state.clientName.trim().length < 3) {
          errors.clientName = 'Nome do cliente é obrigatório e deve ter ao menos 3 caracteres.';
        }
        if (state.clientPhone && !/^\d{8,15}$/.test(state.clientPhone.replace(/\D/g, ''))) {
          warnings.clientPhone = 'Formato de telefone suspeito. Recomendado ddd + número.';
        }
        break;

      case 2: // Tipo de atendimento
        if (!state.environmentType) {
          errors.environmentType = 'O ambiente é obrigatório para composição de custos indiretos.';
        }
        break;

      case 3: // Tipo de praga
        if (!state.pestType) {
          errors.pestType = 'Praga-alvo deve ser explicitamente selecionada.';
        }
        break;

      case 4: // Complexidade
        if (!state.complexity) {
          errors.complexity = 'A complexidade regula o multiplicador de risco. Indique um nível.';
        }
        break;

      case 5: // Área e ambiente
        if (state.areaSize <= 0) {
          errors.areaSize = 'A área do ambiente deve ser superior a 0m².';
        } else if (state.areaSize > 10000) {
          warnings.areaSize = 'Área estritamente gigante. Considere atendimento industrial sob demanda.';
        }
        break;

      case 6: // Produtos
        if (state.selectedProducts.length === 0) {
          warnings.selectedProducts = 'DDSulf necessita de formulação de ingrediente químico ativo. Nenhum selecionado.';
        }
        break;

      case 7: // Equipe
        if (state.technicians <= 0) {
          errors.technicians = 'Mínimo de 1 técnico é necessário para qualquer intervenção física.';
        } else if (state.technicians > 8) {
          warnings.technicians = 'Grande mobilização de operadores. Certifique que a logística consiga comportá-los.';
        }
        break;

      case 8: // Custos e deslocamento
        if (state.displacement < 0) {
          errors.displacement = 'A distância percorrida não pode ser negativa.';
        } else if (state.displacement > 250) {
          warnings.displacement = 'Viagem de longa distância (>250km). Custos logísticos elevados serão adicionados.';
        }
        break;

      case 9: // Recorrência
        if (!state.recurrence) {
          errors.recurrence = 'Tipo de recorrência ou fidelidade é mandatório.';
        }
        break;

      case 10: // Simulação
        if (state.customMargin < 10) {
          errors.customMargin = 'Meta de margem líquida inferior a 10% é impeditiva para as contas gerais.';
        } else if (state.customMargin < 35) {
          warnings.customMargin = 'Abaixo do piso ideal de faturamento aceito pela administração.';
        }
        break;

      case 11: // Resumo operacional
      case 12: // Revisão final
      case 13: // Orçamento
      default:
        break;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings
    };
  }
};
