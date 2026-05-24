/**
 * DDSulf Safe Conditional Rules Evaluation Engine
 * Evaluates operational expressions safely against active event payloads.
 */

export class RuleEvaluator {
  /**
   * Evaluates expressions of form "field operator value" dynamically
   * E.g. "payload.margin < 0.20", "payload.stalledHours >= 48"
   */
  public static evaluateCondition(expression: string, payload: Record<string, any>): boolean {
    if (!expression || expression.trim() === '') return true;

    try {
      // Basic lexical parser to avoid unsafe eval() calls
      // Expected formula format: "category.property operator targetValue"
      const parts = expression.split(/\s+/);
      if (parts.length < 3) return false;

      const path = parts[0];       // e.g. "payload.margin" or "margin"
      const operator = parts[1];   // e.g. "<", ">=", "=="
      const targetStr = parts.slice(2).join(' '); // e.g. "0.20"

      // 1. Resolve path parameter value inside payload
      const actualValue = this.resolvePath(payload, path);
      if (actualValue === undefined) return false;

      // 2. Parse target comparison value
      let targetValue: any = targetStr;
      if (targetStr === 'true') targetValue = true;
      else if (targetStr === 'false') targetValue = false;
      else if (!isNaN(Number(targetStr))) targetValue = Number(targetStr);

      // 3. Compare values securely
      switch (operator) {
        case '==':
        case '===':
          return actualValue === targetValue;
        case '!=':
        case '!==':
          return actualValue !== targetValue;
        case '>':
          return Number(actualValue) > Number(targetValue);
        case '>=':
          return Number(actualValue) >= Number(targetValue);
        case '<':
          return Number(actualValue) < Number(targetValue);
        case '<=':
          return Number(actualValue) <= Number(targetValue);
        default:
          console.warn(`[Rule Evaluator] Desconhecido operador logico: ${operator}`);
          return false;
      }
    } catch (err) {
      console.error(`[Rule Evaluator] Erro ao analisar condicao "${expression}":`, err);
      return false;
    }
  }

  /**
   * Resolves nested property strings securely (e.g. "payload.metrics.margin" -> 0.18)
   */
  private static resolvePath(obj: any, path: string): any {
    // Strip redundant leading "payload." if specified
    const cleanPath = path.startsWith('payload.') ? path.substring(8) : path;
    
    return cleanPath.split('.').reduce((acc, part) => {
      if (acc && typeof acc === 'object') {
        return acc[part];
      }
      return undefined;
    }, obj);
  }
}

export default RuleEvaluator;
