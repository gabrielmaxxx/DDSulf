/**
 * DDSulf Validation Service
 * Validates operational formulas, chemical recommendations, and schema compliance.
 */

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  validate: (data: any) => { valid: boolean; error?: string };
}

class ValidationService {
  private rules: ValidationRule[] = [];

  constructor() {
    this.registerCoreRules();
  }

  private registerCoreRules() {
    this.rules = [
      {
        id: 'val_chemical_dosage',
        name: 'Chemical Formulation Safe Limits',
        description: 'Verify recommended dosage does not exceed WHO eco-regulations of 120ml per m2.',
        validate: (data: { volumeM2: number; dilutionType: string; customRatio?: number }) => {
          if (!data.volumeM2 || data.volumeM2 <= 0) {
            return { valid: false, error: 'Valor de área (m2) deve ser strictly positivo.' };
          }
          const ratio = data.customRatio || 50; // standard 50ml/m2
          if (ratio > 120) {
            return { valid: false, error: 'Sanitary Danger: Concentração informada excede limite ecológico de 120ml/m2.' };
          }
          return { valid: true };
        }
      },
      {
        id: 'val_profit_margin',
        name: 'Enterprise Minimum Profit Lock',
        description: 'Ensure prices generated in estimates maintain a gross profit margin >= 35%.',
        validate: (data: { cost: number; price: number }) => {
          if (data.price <= 0) return { valid: false, error: 'Preço de venda deve ser maior que zero.' };
          const margin = ((data.price - data.cost) / data.price) * 100;
          if (margin < 35) {
            return { valid: false, error: `Rentabilidade insuficiente. Margem de ${margin.toFixed(1)}% está abaixo do limite corporativo de 35%.` };
          }
          return { valid: true };
        }
      },
      {
        id: 'val_tenant_boundary',
        name: 'Tenant Segregation Isolation Rule',
        description: 'Enforce that payload ownership belongs exclusively to the user session tenant.',
        validate: (data: { userTenantId: string; payloadTenantId: string }) => {
          if (data.userTenantId !== data.payloadTenantId) {
            return { valid: false, error: 'Data Breach Trigger: Tentativa de leitura de outro tenant isolado.' };
          }
          return { valid: true };
        }
      }
    ];
  }

  public getRules() {
    return this.rules;
  }

  public runValidation(ruleId: string, data: any): { valid: boolean; error?: string } {
    const rule = this.rules.find(r => r.id === ruleId);
    if (!rule) {
      return { valid: false, error: `Regra de validação '${ruleId}' desconhecida.` };
    }
    try {
      return rule.validate(data);
    } catch (err: any) {
      return { valid: false, error: `Internal Engine Error: ${err?.message || 'Falha de execução'}` };
    }
  }
}

export const validationService = new ValidationService();
export default validationService;
