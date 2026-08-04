import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { PromptOrchestrator } from "./src/ai/prompts";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { rateLimit } from "express-rate-limit";
import { validateEmpresaId, buildSyntheticEmail } from "./src/utils/authUtils";

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

export async function verifyAuthToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Cabeçalho de autorização inválido ou ausente. Use Bearer <token>." });
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    ensureFirebaseAdmin();
    const decodedToken = await getAuth().verifyIdToken(idToken);

    if (!decodedToken.empresaId || typeof decodedToken.empresaId !== 'string') {
      return res.status(401).json({ error: "Token não possui o claim empresaId." });
    }

    const tenantContext = {
      empresaId: decodedToken.empresaId,
      role: (decodedToken.role as string) || 'technician',
      uid: decodedToken.uid,
      isSuperAdmin: Boolean(decodedToken.isSuperAdmin)
    };

    (req as any).user = decodedToken;
    (req as any).tenantContext = tenantContext;
    next();
  } catch (error: any) {
    console.error("Erro na validação do Token Firebase:", error);
    return res.status(401).json({ error: `Falha na autenticação do Firebase: ${error.message}` });
  }
}

const authMiddleware = verifyAuthToken;

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

  // Creation of users via Firebase Admin SDK with custom claims (Master / SuperAdmin only)
  app.post("/api/admin/usuarios", verifyAuthToken, async (req, res) => {
    try {
      ensureFirebaseAdmin();
      const tenantCtx = (req as any).tenantContext;
      const isMaster = tenantCtx?.role === 'master';
      const isSuperAdmin = Boolean(tenantCtx?.isSuperAdmin);

      if (!isMaster && !isSuperAdmin) {
        return res.status(403).json({ 
          error: "Acesso negado: apenas usuários com perfil master ou superAdmin podem criar novos usuários." 
        });
      }

      const { empresaId, login, senhaTemporaria, role, name, cargo } = req.body || {};

      if (!login || !senhaTemporaria) {
        return res.status(400).json({ error: "Campos 'login' e 'senhaTemporaria' são obrigatórios." });
      }

      const targetEmpresaId = empresaId || tenantCtx?.empresaId;
      if (!validateEmpresaId(targetEmpresaId)) {
        return res.status(400).json({ error: "Formato de 'empresaId' inválido. Use letras, números, hífen e underscore." });
      }

      // Master user can only create users within their own empresa
      if (isMaster && !isSuperAdmin && targetEmpresaId !== tenantCtx?.empresaId) {
        return res.status(403).json({ error: "Acesso negado: usuários master só podem criar contas na própria empresa." });
      }

      const syntheticEmail = buildSyntheticEmail(login, targetEmpresaId);
      const assignedRole = role || 'technician';

      // Create user in Firebase Auth via Admin SDK
      const userRecord = await getAuth().createUser({
        email: syntheticEmail,
        password: senhaTemporaria,
        displayName: name || login
      });

      // Set custom claims { empresaId, role }
      await getAuth().setCustomUserClaims(userRecord.uid, {
        empresaId: targetEmpresaId,
        role: assignedRole
      });

      // Store profile document in Firestore at /empresas/{empresaId}/usuarios/{uid}
      const db = getFirestore();
      await db.doc(`empresas/${targetEmpresaId}/usuarios/${userRecord.uid}`).set({
        uid: userRecord.uid,
        login: login.trim().toLowerCase(),
        email: syntheticEmail,
        name: name || login,
        cargo: cargo || 'Colaborador',
        empresaId: targetEmpresaId,
        role: assignedRole,
        permissions: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      res.status(201).json({
        success: true,
        uid: userRecord.uid,
        email: syntheticEmail,
        empresaId: targetEmpresaId,
        role: assignedRole
      });
    } catch (error: any) {
      console.error("Erro ao criar usuário via Admin SDK:", error);
      res.status(500).json({ error: error.message || "Erro interno ao criar usuário." });
    }
  });

  // Google Maps Status check
  app.get("/api/maps/status", (req, res) => {
    const key = process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "";
    const configured = Boolean(key) && key.trim() !== "" && key !== "YOUR_API_KEY";
    res.json({ configured, hasKey: configured });
  });

  // Google Maps Geocoding Proxy
  app.get("/api/maps/geocode", async (req, res) => {
    try {
      const { address, key } = req.query;
      if (!address) {
        return res.status(400).json({ error: "address is required" });
      }

      const apiKey = (key as string) || process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "";
      if (!apiKey) {
        return res.status(400).json({ error: "Google Maps API Key not configured." });
      }

      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address as string)}&key=${apiKey}&language=pt-BR`;
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Geocoding Proxy Error:", error);
      res.status(500).json({ error: error.message || "Failed to geocode address" });
    }
  });

  // Google Maps Distance Matrix Proxy to bypass client CORS
  app.get("/api/maps/distance", async (req, res) => {
    try {
      const { origins, destinations, key } = req.query;
      if (!origins || !destinations) {
        return res.status(400).json({ error: "origins and destinations are required" });
      }

      const apiKey = (key as string) || process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.VITE_GOOGLE_MAPS_PLATFORM_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "";
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

  // Dedicated PestFlow Operational Client/Server Gemini API proxy
  app.post("/api/ai/pestflow-chat", authMiddleware, aiRateLimiter, async (req, res) => {
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
      }

      if (message) {
        // A mensagem atual do usuário precisa sempre ser anexada ao final da
        // conversa, mesmo quando já existe histórico. Sem isso, a partir da
        // 2ª pergunta o modelo só recebia o histórico antigo e nunca via a
        // pergunta nova, respondendo de forma genérica/desconexa.
        contentsList.push({
          role: "user",
          parts: [{ text: message }]
        });
      } else if (contentsList.length === 0) {
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
      console.error("PestFlow Dedicated AI Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI response" });
    }
  });

  // AI Notification Intelligence (Summarization, Priority Assessment, Actionable Suggestions)
  app.post("/api/ai/analyze-notification", authMiddleware, aiRateLimiter, async (req, res) => {
    try {
      const { title, message, category, severity } = req.body;
      const ai = getAi();
      
      const prompt = `Como um analista de operações seniores do PestFlow (plataforma de controle de pragas), analise esta notificação operacional e retorne um objeto JSON contendo exatamente as chaves:
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

      const prompt = `Como um engenheiro agrônomo sênior e supervisor regulatório da Anvisa para a PestFlow, formule um POP (Procedimento Operacional Padrão) completo e ultra-polido.
Retorne um objeto JSON contendo exatamente:
- "pestType": Tipo de praga alvo em formato curto (ex: "baratas", "formigas", "cupins", "ratos", "escorpioes", "outro")
- "activeIngredients": Princípios Ativos indicados (ex: "Fipronil 0.05%, Bifentrina 200SC")
- "dilutionRatio": Diluição Recomendada em calda (ex: "50ml de concentrado por 10L de água para 100m²")
- "applicationMethod": Método de Aplicação (ex: "Pulverização de Alta Pressão e Barreira Residual")
- "safetyEquipment": EPIs Obrigatórios resumidos (ex: "Máscara P2, Luvas de Nitrila, Óculos de Proteção, Botas de PVC")
- "reentryInterval": Tempo de Reentrada (ex: "24 horas para ambientes fechados, 6 horas para áreas ventiladas")
- "legalFramework": Base Legal / Regulamentação (ex: "RDC nº 52/2009 ANVISA / NR-31")
- "recommendedChemicalVolume": Recomendação de dosagem precisa em volume de calda por metro quadrado.
- "requiredEPIs": Objeto com booleanos: "hasMask", "hasGloves", "hasGoggles", "hasBoots", "hasApron" e string "extraArmorText".
- "steps": Um array de no mínimo 3 etapas contendo:
  - "sequence": Inteiro (1, 2, 3...)
  - "title": Nome curto da etapa (Ex: "Isolamento e Vistoria da Área")
  - "description": Frase detalhando como executar a etapa e riscos de intoxicação sanitária e compliance da Anvisa.
  - "isRequired": Booleano (true)
  - "requiresPhotoProof": Booleano (true ou false)
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
      const { prompt, history, context } = req.body;
      const tenantContext = (req as any).tenantContext;
      const empresaId = tenantContext?.empresaId || req.body.tenantId;

      if (!empresaId) {
        return res.status(400).json({ error: "empresaId é obrigatório para consultas executivas." });
      }

      const ai = getAi();

      // Extract real board variables directly from context without fake hardcoded fallbacks
      const mrrTotal = Number(context?.board?.mrrTotal ?? context?.mrrTotal ?? 0);
      const activeContractsRatio = Number(context?.board?.activeContractsRatio ?? context?.activeContractsRatio ?? 0);
      const operationalEfficiencyCoefficient = Number(context?.board?.operationalEfficiencyCoefficient ?? context?.operationalEfficiencyCoefficient ?? 0);
      const monthlySafetyIndexPercent = Number(context?.board?.monthlySafetyIndexPercent ?? context?.monthlySafetyIndexPercent ?? 0);

      const systemInstruction = `Você é o Principal Executive AI Architect e Strategic Operational Intelligence Engineer do PestFlow.
Você é encarregado de prover relatórios e direcionamentos estratégicos de nível de Conselho / Board (Board-Level Reporting) e decisões operacionais rigorosas.
Nunca aja como assistente genérico ou chatbot raso. Suas respostas devem ser precisas, com terminologia executiva qualificada em português.

DADOS DE CONTEXTO ESTRATÉGICO DO TENANT ATIVO (${empresaId}):
- Receita Recorrente Mensal (MRR): R$ ${mrrTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
- Taxa de Contratantes Ativos: ${activeContractsRatio.toFixed(1)}%
- Coeficiente de Eficiência de Campo: ${(operationalEfficiencyCoefficient * 100).toFixed(1)}%
- Índice de Conformidade e Segurança Física (Anvisa): ${monthlySafetyIndexPercent.toFixed(1)}%
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
