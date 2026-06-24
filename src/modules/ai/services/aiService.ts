import { OperationalContext } from '../types';
import { auth } from '@/firebase/config';

export const aiService = {
  async ask(message: string, context: OperationalContext) {
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : undefined;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers,
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
