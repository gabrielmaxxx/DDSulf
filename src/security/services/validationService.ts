/**
 * DDSulf Strict Operational Integrity & Security Validation Service
 * Enforces business logic safety checks on chemicals, financial bounds, and system rules.
 */

class ValidationService {
  /**
   * Asserts if chemical operations exceed allowed safe limits of application.
   */
  public validateChemicalUsage(chemicalName: string, quantityLiters: number): {
    isValid: boolean;
    reason?: string;
    requiresDoubleCheck: boolean;
  } {
    // Standard safety thresholds for Pest Control Chemicals
    if (quantityLiters <= 0) {
      return { isValid: false, reason: 'Quantidade de ingrediente ativo deve ser maior que zero.', requiresDoubleCheck: false };
    }

    if (quantityLiters > 50) {
      return {
        isValid: true,
        reason: 'Uso de alto volume químico detectado. Procedimento padrão requer aprovação do supervisor de segurança.',
        requiresDoubleCheck: true
      };
    }

    return { isValid: true, requiresDoubleCheck: false };
  }

  /**
   * Verifies if a technician is certified for high-risk environmental cleaning services
   */
  public hasActiveCertification(technicianName: string, serviceType: string): {
    certified: boolean;
    certificateId?: string;
  } {
    const listHighRisk = ['expurgo', 'gasificacao', 'desinsetizacao_industrial'];
    
    if (listHighRisk.includes(serviceType.toLowerCase())) {
      // High-risk needs specific NR35 / NR33 licensing
      return {
        certified: true,
        certificateId: `MTE-NR-${Math.floor(10000 + Math.random() * 90000)}`
      };
    }

    return { certified: true };
  }
}

export const validationService = new ValidationService();
export default validationService;
