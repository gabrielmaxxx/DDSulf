/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ComponentMetric {
  id: string;
  name: string;
  module: string;
  complexity: 'simple' | 'medium' | 'dense';
  usesTailwindClasses: boolean;
  hasResponsivePrefixes: boolean;
  typeSecurityRating: number; // 0-100
}

export class ArchitectureService {
  private componentMetrics: ComponentMetric[] = [];

  constructor() {
    this.initializeBaselineMetrics();
  }

  private initializeBaselineMetrics() {
    this.componentMetrics = [
      { id: 'c_sidebar', name: 'AppSidebar.tsx', module: 'Navegação', complexity: 'medium', usesTailwindClasses: true, hasResponsivePrefixes: true, typeSecurityRating: 100 },
      { id: 'c_calculatordesign', name: 'CalculadoraDoses.tsx', module: 'Calculadora', complexity: 'dense', usesTailwindClasses: true, hasResponsivePrefixes: true, typeSecurityRating: 98 },
      { id: 'c_cockpit', name: 'ProductIntelligenceCockpit.tsx', module: 'Telemetria', complexity: 'dense', usesTailwindClasses: true, hasResponsivePrefixes: true, typeSecurityRating: 100 },
      { id: 'c_flowbox', name: 'FlowChecklist.tsx', module: 'POPs', complexity: 'simple', usesTailwindClasses: true, hasResponsivePrefixes: false, typeSecurityRating: 94 },
      { id: 'c_inventoryGrid', name: 'InventoryGrid.tsx', module: 'Estoque', complexity: 'medium', usesTailwindClasses: true, hasResponsivePrefixes: true, typeSecurityRating: 92 },
    ];
  }

  public getComponentMetrics(): ComponentMetric[] {
    return this.componentMetrics;
  }

  /**
   * Compiles the general clean-code index of files
   */
  public compileCleanCodeIndex(): number {
    const responsiveCount = this.componentMetrics.filter(c => c.hasResponsivePrefixes).length;
    const ratioResponsive = this.componentMetrics.length > 0 ? (responsiveCount / this.componentMetrics.length) * 40 : 40;

    const securityAverage = this.componentMetrics.length > 0
      ? this.componentMetrics.reduce((sum, c) => sum + c.typeSecurityRating, 0) / this.componentMetrics.length
      : 95;
    const ratioSecurity = (securityAverage / 100) * 60;

    return Math.round(ratioResponsive + ratioSecurity);
  }

  /**
   * Evaluates if component conforms to enterprise modular strict margins.
   */
  public auditsDraftComplexity(linesOfCode: number, depthLevel: number): 'low' | 'medium' | 'warning' {
    if (linesOfCode > 800 || depthLevel > 5) {
      return 'warning';
    }
    if (linesOfCode > 300 || depthLevel > 3) {
      return 'medium';
    }
    return 'low';
  }
}

export const architectureService = new ArchitectureService();
export default architectureService;
