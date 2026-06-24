import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { PromptOrchestrator } from "./src/ai/prompts";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { rateLimit } from "express-rate-limit";

dotenv.config();

let isFirebaseAdminInitialized = false;

function ensureFirebaseAdmin() {
  if (isFirebaseAdminInitialized) return;
  
  try {
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountVar) {
      const serviceAccount = JSON.parse(serviceAccountVar);
      initializeApp({
        credential: cert(serviceAccount)
      });
      console.log("Firebase Admin SDK inicializado com sucesso via Service Account.");
    } else {
      // Fallback: tenta inicializar com padrão (por exemplo, se já configurado no ambiente do Cloud Run)
      initializeApp();
      console.log("Firebase Admin SDK inicializado com as credenciais padrão.");
    }
    isFirebaseAdminInitialized = true;
  } catch (error: any) {
    console.error("Erro ao inicializar Firebase Admin SDK:", error);
    throw new Error("Firebase Admin SDK não pôde ser inicializado. Configure a variável de ambiente FIREBASE_SERVICE_ACCOUNT.");
  }
}

async function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Cabeçalho de autorização inválido ou ausente. Use Bearer <token>." });
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    ensureFirebaseAdmin();
    const decodedToken = await getAuth().verifyIdToken(idToken);
    (req as any).user = decodedToken;
    next();
  } catch (error: any) {
    console.error("Erro na validação do Token Firebase:", error);
    return res.status(401).json({ error: `Falha na autenticação do Firebase: ${error.message}` });
  }
}

const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // limite de 20 requisições por usuário (UID) a cada 15 minutos
  standardHeaders: true, // Retorna informações nos cabeçalhos RateLimit-*
  legacyHeaders: false, // Desativa cabeçalhos X-RateLimit-* antigos
  keyGenerator: (req: any) => {
    return req.user?.uid || req.ip || "anonymous";
  },
  handler: (req, res) => {
    res.status(429).json({
      error: "Limite de requisições excedido. Você pode fazer no máximo 20 consultas de IA a cada 15 minutos. Por favor, tente novamente mais tarde."
    });
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint for SyncEngine latency check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Google Maps Distance Matrix Proxy to bypass client CORS
  app.get("/api/maps/distance", async (req, res) => {
    try {
      const { origins, destinations, key } = req.query;
      if (!origins || !destinations) {
        return res.status(400).json({ error: "origins and destinations are required" });
      }

      const apiKey = (key as string) || process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_PLATFORM_KEY || "";
      if (!apiKey) {
        return res.status(400).json({ error: "Google Maps API Key not configured." });
      }

      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origins as string)}&destinations=${encodeURIComponent(destinations as string)}&key=${apiKey}&language=pt-BR&units=metric`;
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Distance Matrix Proxy Error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch distance" });
    }
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
  app.post("/api/ai/chat", authMiddleware, aiRateLimiter, async (req, res) => {
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

  // Dedicated DDSulf Operational Client/Server Gemini API proxy
  app.post("/api/ai/ddsulf-chat", authMiddleware, aiRateLimiter, async (req, res) => {
    try {
      const { message, systemContext, history } = req.body;
      const ai = getAi();

      const contentsList: any[] = [];
      if (history && Array.isArray(history) && history.length > 0) {
        for (const h of history) {
          contentsList.push({
            role: h.role === 'model' || h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content || h.text || "" }]
          });
        }
      } else if (message) {
        contentsList.push({
          role: "user",
          parts: [{ text: message }]
        });
      } else {
        return res.status(400).json({ error: "message or history is required" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contentsList,
        config: {
          systemInstruction: systemContext,
          temperature: 0.3,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("DDSulf Dedicated AI Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI response" });
    }
  });

  // AI Notification Intelligence (Summarization, Priority Assessment, Actionable Suggestions)
  app.post("/api/ai/analyze-notification", authMiddleware, aiRateLimiter, async (req, res) => {
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
  app.post("/api/ai/generate-procedure", authMiddleware, aiRateLimiter, async (req, res) => {
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
  app.post("/api/executive-ai/query", authMiddleware, aiRateLimiter, async (req, res) => {
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
