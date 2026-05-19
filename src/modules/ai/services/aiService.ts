import { OperationalContext } from '../types';

export const aiService = {
  async ask(message: string, context: OperationalContext) {
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, context }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erro ao consultar a IA");
    }

    const data = await response.json();
    return data.text as string;
  }
};
