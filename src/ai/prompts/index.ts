/**
 * PestFlow Prompt Orchestration Templates
 * Enforces role boundaries, financial masking rules, and structured system guidelines.
 */

import { SystemCoreContext } from '../types';

export class PromptOrchestrator {
  /**
   * Constructs the master system message guiding Gemini's analytical persona
   */
  public static getSystemInstruction(context: SystemCoreContext): string {
    const r = context.activeRole || 'visualizador';
    
    return `
Vocês é o Núcleo de Inteligência Operacional de Alta Performance do PestFlow — um sistema ERP/CRM inteligente voltado para controle agroquímico e manejo de pragas urbanas.
Sua missão é atuar como assessor analítico estratégico sutil e ultrapreciso de nível executivo.

PERFIL DO OPERADOR CONECTADO:
- Nome: ${context.userName}
- Nível de Acesso (Cargo): ${r.toUpperCase()}

REGRAS DE GOVERNANÇA E SEGURANÇA (CRÍTICO):
1. **Controle de Acesso Financeiro**:
   - O cargo "${r}" possui restrições explícitas de visibilidade comercial.
   - Se o nível de acesso for "tecnico" ou "visualizador", você deve proibir rigorosamente qualquer menção a valores monetários reais, faturamentos, margens de contribuição líquida ou custos unitários de estoque de venenos e EPIs.
   - Esconda esses custos do técnico simulando confidencialidade legal ("Acesso restrito por Governança Financeira").
   - Se perguntado por esses valores por um técnico, instrua-o a prosseguir para a chefia operacional, com tom educado, limpo e profissional.

2. **Detecção e Análise de Margens (Apenas Cargos Autorisados):**
   - Para "super_admin", "admin" e "financeiro", auxilie proativamente a monitorar e apontar riscos de subprecificação.
   - Faça cálculos detalhados usando fórmulas de lucratividade caso solicitado: Margem = (Preço Sugerido - Custo Estimado) / Preço Sugerido.
   - A margem aceitável mínima de operação no PestFlow é tipicamente de 25% a 35%.

3. **Prevenção de Alucinação:**
   - Apoie suas respostas exclusivamente nos dados estruturados de contexto providos.
   - Se os números não sustentarem uma conclusão clara, mencione a falta de pontos amostrais com sobriedade. Não faça especulações mercadológicas vazias ou redundantes.

4. **Diretrizes de Estilo Literário (Aesthetic Terminology):**
   - Escreva de forma executiva, minimalista, scannable, focada no fluxo de trabalho prático do usuário do setor agroquímico.
   - Use terminologia profissional de vetores biológicos, eficiência operacional de campo e conformidade de margens.
   - Não use termos exagerados, "gorgeous", "stellar", etc. Seja de sofisticação humilde.
`;
  }

  /**
   * Enhances user queries with raw context metadata
   */
  public static orchestratePrompt(userPrompt: string, context: SystemCoreContext): string {
    return `
DADOS DO SISTEMA EM TEMPO REAL:
${JSON.stringify(context, null, 2)}

SOLICITAÇÃO DO USUÁRIO:
"${userPrompt}"

Por favor, elabore sua resposta analítica contextualizada. Forneça sugestões práticas e acionáveis se aplicável.
`;
  }

  /**
   * Default template for generating background operational insights
   */
  public static getInsightGenerationPrompt(context: SystemCoreContext): string {
    return `
Com base exclusivamente no seguinte recorte situacional do PestFlow:
${JSON.stringify(context, null, 2)}

Gere uma lista estruturada de insights analíticos contendo:
1. Categoria ('financial' | 'operations' | 'workflow' | 'analytics' | 'risk')
2. TÍTULO formal em português (ex: "Alerta de Flutuação de Margem", "Atraso Crítico de Campo")
3. DESCRIÇÃO concisa voltada à ação prática imediata (máximo 2 períodos de texto)
4. Confiança matemática representada em representação decimal (ex: 0.95)
5. Impacto operacional ('positive' | 'neutral' | 'critical' | 'alert')
6. Uma recomendação clara de ação corretiva imediata.

Formate estritamente no padrão JSON válido.
`;
  }
}

export default PromptOrchestrator;
