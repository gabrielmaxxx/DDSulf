/**
 * AI Communication Intelligence module exports
 */

export const AI_COMM_PROMPTS = {
  notificationAnalyzer: `Como um analista de operações do DDSulf (plataforma de controle de pragas), analise esta notificação operacional e retorne um objeto JSON contendo:
"aiSummary": Uma de frase resumindo de forma ultra-precisa e acionável em apenas 1 frase curta no estilo Slack.
"aiPriorityIndex": Um inteiro de 0 a 100 indicando a real criticidade desta ocorrência baseada no contexto operacional e de segurança técnica.
"actionSuggestion": Uma frase curta indicando o próximo passo prático que o gestor ou técnico deve tomar primeiro.`,
  
  templateExpander: `Expanda o template a seguir utilizando regras de compliance da Anvisa e boas práticas de manejo ambiental.`
};

export function getAiDefaultConfig() {
  return {
    model: 'gemini-3.5-flash',
    temperature: 0.1,
    topP: 0.8
  };
}
