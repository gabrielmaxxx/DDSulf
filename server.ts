import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { PromptOrchestrator } from "./src/ai/prompts";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint for SyncEngine latency check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Lazy Gemini Initialization
  let aiInstance: GoogleGenAI | null = null;
  const getAi = () => {
    if (!aiInstance) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
      }
      aiInstance = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiInstance;
  };

  // AI Chat Endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, context, history } = req.body;
      const ai = getAi();

      // Retrieve dynamic system instructions based on roles & credentials context
      const systemCtx = context || { activeRole: "visualizador", userName: "Anênino/Convidado" };
      const systemInstruction = PromptOrchestrator.getSystemInstruction(systemCtx);

      // Structure conversational contents history in the format expected by the @google/genai SDK
      const contentsList: any[] = [];

      if (history && Array.isArray(history) && history.length > 0) {
        for (let i = 0; i < history.length; i++) {
          const h = history[i];
          const text = h.text || h.content || "";
          if (!text) continue;

          const role = h.role === "model" || h.role === "assistant" ? "model" : "user";
          
          // Replace user's last message with the context-wrapped orchestrated version for model accuracy
          const textToSubmit = (i === history.length - 1 && role === "user" && message) ? message : text;

          contentsList.push({
            role,
            parts: [{ text: textToSubmit }],
          });
        }
      } else {
        contentsList.push({
          role: "user",
          parts: [{ text: message || "Olá!" }],
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contentsList,
        config: {
          systemInstruction,
          temperature: 0.2, // Low temperature for tactical consistency and mathematical accuracy
          topP: 0.8,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI response" });
    }
  });

  // AI Notification Intelligence (Summarization, Priority Assessment, Actionable Suggestions)
  app.post("/api/ai/analyze-notification", async (req, res) => {
    try {
      const { title, message, category, severity } = req.body;
      const ai = getAi();
      
      const prompt = `Como um analista de operações seniores do DDSulf (plataforma de controle de pragas), analise esta notificação operacional e retorne um objeto JSON contendo exatamente as chaves:
"aiSummary": Uma string resumindo de forma ultra-precisa e acionável em apenas 1 frase curta no estilo Slack (ex: "Necessário reabastecimento imediato de fipronil para evitar paralisação.").
"aiPriorityIndex": Um inteiro de 0 a 100 indicando a real criticidade desta ocorrência baseada no contexto operacional, gravidade e segurança técnica.
"actionSuggestion": Uma frase curta indicando o próximo passo prático que o gestor ou técnico deve tomar primeiro.

DADOS DA NOTIFICAÇÃO:
- Categoria: ${category}
- Severidade: ${severity}
- Título: ${title}
- Mensagem: ${message}

Responda APENAS com o JSON puro sem qualquer formatação markdown, livre de \`\`\`json ou qualquer outra tag.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("AI Notification Intelligence Error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze notification" });
    }
  });

  // AI Document / POP Generative Assistant Endpoint
  app.post("/api/ai/generate-procedure", async (req, res) => {
    try {
      const { title, description, allowedChemicalIds, targetPests } = req.body;
      const ai = getAi();

      const prompt = `Como um engenheiro agrônomo sênior e supervisor regulatório da Anvisa para a DDSulf, formule um POP (Procedimento Operacional Padrão) completo e ultra-polido.
Retorne um objeto JSON contendo exatamente:
- "recommendedChemicalVolume": Uma recomendação de dosagem precisa em volume de calda por metro quadrado.
- "requiredEPIs": Objeto contendo booleanos: "hasMask", "hasGloves", "hasGoggles", "hasBoots", "hasApron" e uma string "extraArmorText".
- "steps": Um array de no mínimo 3 etapas contendo:
  - "sequence": Inteiro (1, 2, 3...)
  - "title": Nome curto da etapa (Ex: "Isolamento de Área")
  - "description": Frase detalhando rigorosamente como executar a etapa e riscos de intoxicação sanitária e compliance da Anvisa.
  - "isRequired": Booleano (sempre true exceto se opcional)
  - "requiresPhotoProof": Booleano (indique se o operador precisa subir foto no ddsulf para fins de inspeção)
  - "estimatedDurationSeconds": Tempo sugerido de execução em segundos

DADOS OPERACIONAIS:
- Título: ${title}
- Descrição: ${description}
- Pragas Alvo: ${JSON.stringify(targetPests || [])}
- Químicos Autorizados: ${JSON.stringify(allowedChemicalIds || [])}

Responda APENAS com o JSON de dados puro, sem blocos de código markdown ou texto explicativo extra.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      });

      const parsedObj = JSON.parse(response.text?.trim() || "{}");
      res.json(parsedObj);
    } catch (error: any) {
      console.error("AI Procedure Generation Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI procedural layout" });
    }
  });

  // Executive Decision Intelligence & Strategic Copilot Endpoint
  app.post("/api/executive-ai/query", async (req, res) => {
    try {
      const { prompt, history, tenantId, context } = req.body;
      const ai = getAi();

      const tenant = tenantId || "tenant_001_poa";
      const board = context?.board || { mrrTotal: 96000, activeContractsRatio: 92, operationalEfficiencyCoefficient: 0.84, monthlySafetyIndexPercent: 98.7 };

      const systemInstruction = `Você é o Principal Executive AI Architect e Strategic Operational Intelligence Engineer do DDSulf.
Você é encarregado de prover relatórios e direcionamentos estratégicos de nível de Conselho / Board (Board-Level Reporting) e decisões operacionais rigorosas.
Nunca aja como assistente genérico ou chatbot raso. Suas respostas devem ser precisas, com terminologia executiva qualificada em português.

DADOS DE CONTEXTO STRATÉGICO DO TENANT ATIVO (${tenant}):
- Receita Recorrente Mensal (MRR): R$ ${board.mrrTotal.toLocaleString("pt-BR")}
- Coeficiente de Eficiência de Campo: ${(board.operationalEfficiencyCoefficient * 100).toFixed(1)}%
- Índice de Conformidade e Segurança Física (Anvisa): ${board.monthlySafetyIndexPercent}%
- Recomendações Ativas no Funil: ${context?.recommendationCount || 0}

Instruções importantes:
1. Resuma as decisões usando tópicos focados em faturamento, saúde regulatória ou planejamento de equipe.
2. Seja realista: mencione o uso racional de EPIs, controle fitofarmacêutico e retenção de subscrições contra cancelamentos.
3. Use formatação Markdown polida.`;

      const contentsList: any[] = [];
      if (history && Array.isArray(history)) {
        for (const h of history) {
          const role = h.role === "assistant" || h.role === "model" ? "model" : "user";
          contentsList.push({
            role,
            parts: [{ text: h.content || "" }]
          });
        }
      } else {
        contentsList.push({
          role: "user",
          parts: [{ text: prompt || "Qual o status estratégico?" }]
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contentsList,
        config: {
          systemInstruction,
          temperature: 0.25,
          topP: 0.85
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Executive AI Server-Side Query Error:", error);
      res.status(500).json({ error: error.message || "Failed to process executive strategic query" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
