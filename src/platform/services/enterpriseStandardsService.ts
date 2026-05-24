/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ComplianceGuideline {
  key: string;
  name: string;
  pattern: string;
  conformanceRatio: number;
  status: 'passed' | 'warning' | 'failed';
}

export class EnterpriseStandardsService {
  private guidelines: ComplianceGuideline[] = [];

  constructor() {
    this.guidelines = [
      { key: 'hook_naming', name: 'Hooks use* pattern', pattern: '^use[A-Z]', conformanceRatio: 100, status: 'passed' },
      { key: 'dir_structure', name: 'Separation of concerns folder tree', pattern: 'src/(platform|modules|components)', conformanceRatio: 98, status: 'passed' },
      { key: 'icon_imports', name: 'Lucide UI Icons unified sourcing', pattern: 'import { ... } from "lucide-react"', conformanceRatio: 94, status: 'passed' },
      { key: 'ts_strict_imports', name: 'TS named top level imports', pattern: 'import { X } from "Y"', conformanceRatio: 100, status: 'passed' },
    ];
  }

  public getGuidelines(): ComplianceGuideline[] {
    return this.guidelines;
  }

  /**
   * Triggers virtual check over general structure conformance.
   */
  public evaluateClassSafety(className: string): boolean {
    // Avoid double or triple style definition, check structural prefixes
    if (className.includes('class-name') || className.includes('custom-style')) {
      return false;
    }
    return true;
  }
}

export const enterpriseStandardsService = new EnterpriseStandardsService();
export default enterpriseStandardsService;
