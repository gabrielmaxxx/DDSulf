import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini Initialization
  const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // AI Chat Endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, context } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [{ text: `
              Você é a IA Operacional do DDSulf, um sistema de controle de pragas.
              Sua missão é atuar como um consultor analítico inteligente.
              
              CONTEXTO DO SISTEMA (DADOS REAIS):
              ${JSON.stringify(context, null, 2)}
              
              INSTRUÇÕES:
              1. Responda de forma objetiva e profissional.
              2. Use os dados acima para fundamentar suas respostas. Não invente números.
              3. Quando perguntado sobre lucro, margem ou produtividade, faça os cálculos se necessário.
              4. Se não houver dados suficientes no contexto para responder, seja honesto.
              5. Formate a resposta usando Markdown. Use tabelas ou listas para dados comparativos.
              
              PERGUNTA DO USUÁRIO:
              ${message}
            ` }]
          }
        ],
        config: {
          temperature: 0.2, // Low temperature for more analytical/factual responses
          topP: 0.8,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI response" });
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
