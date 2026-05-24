/**
 * DDSulf High-Performance Safe Rules Expression Evaluator
 * Interprets contextual expressions against operational payloads without generic unsafe eval execution.
 */

export class RuleEvaluator {
  /**
   * Safely parses expression keys and values against an arbitrary payload map.
   * Supports expressions like:
   * "payload.margin < 0.15"
   * "payload.backlogCount >= 5"
   * "payload.volume <= payload.minVolume"
   * "payload.severity === 'high'"
   */
  public static evaluateCondition(expression: string, payload: Record<string, any>): boolean {
    if (!expression || expression.trim() === '') return true;

    try {
      // Normalize comparison symbols
      const tokens = expression.trim().split(/\s+/);
      if (tokens.length < 3) {
        return false;
      }

      const leftToken = tokens[0];
      const operator = tokens[1];
      const rightToken = tokens.slice(2).join(' '); // Re-assemble RHS string literal/number

      const leftVal = this.resolveValue(leftToken, payload);
      const rightVal = this.resolveValue(rightToken, payload);

      switch (operator) {
        case '===':
        case '==':
          return leftVal === rightVal;
        case '!==':
        case '!=':
          return leftVal !== rightVal;
        case '>':
          return Number(leftVal) > Number(rightVal);
        case '<':
          return Number(leftVal) < Number(rightVal);
        case '>=':
          return Number(leftVal) >= Number(rightVal);
        case '<=':
          return Number(leftVal) <= Number(rightVal);
        case 'includes':
          return typeof leftVal === 'string' && leftVal.includes(String(rightVal));
        default:
          console.warn(`Rules Evaluator: Supported operator not matched: "${operator}"`);
          return false;
      }
    } catch (e) {
      console.error('Failed to parse condition expression:', expression, e);
      return false; // Safely default to falsy execution
    }
  }

  /**
   * Resolves references to payload or parses literal types
   */
  private static resolveValue(token: string, payload: Record<string, any>): any {
    // If it's a field property reference like "payload.margin" or "payload.nested.item"
    if (token.startsWith('payload.')) {
      const path = token.slice(8).split('.');
      let current: any = payload;
      for (const segment of path) {
        if (current === null || current === undefined) return undefined;
        current = current[segment];
      }
      return current;
    }

    // Number conversions
    if (!isNaN(Number(token))) {
      return Number(token);
    }

    // Booleans
    if (token.toLowerCase() === 'true') return true;
    if (token.toLowerCase() === 'false') return false;
    if (token.toLowerCase() === 'null') return null;

    // String literals (removing quotes if wrapped)
    if (
      (token.startsWith("'") && token.endsWith("'")) ||
      (token.startsWith('"') && token.endsWith('"'))
    ) {
      return token.slice(1, -1);
    }

    return token;
  }
}
export default RuleEvaluator;
