/**
 * PestFlow Operational AI Memory Structure
 * Manages, truncates, and retrieves historical dialogues securely.
 */

import { AIChatMessage, AISessionMemory } from '../types';
import { tenantStorage } from '@/utils/storage';

export class AIMemoryService {
  private static STORAGE_KEY_PREFIX = 'ai_mem_';
  private static MAX_HISTORY_NODES = 20; // Bound history arrays to avoid token overflow problems

  /**
   * Retrieves chat lists associated with current browser session
   */
  public static getSessionHistory(sessionId: string): AIChatMessage[] {
    const key = `${this.STORAGE_KEY_PREFIX}${sessionId}`;
    const stored = tenantStorage.getItem(key);
    if (!stored) return [];

    try {
      const memory: AISessionMemory = JSON.parse(stored);
      return memory.messages || [];
    } catch (err) {
      console.error('[AI Memory] Failed to parse session history:', err);
      return [];
    }
  }

  /**
   * Appends an active conversational node, truncating older nodes to preserve storage/token density.
   */
  public static saveMessage(sessionId: string, message: Omit<AIChatMessage, 'id' | 'timestamp'>): AIChatMessage[] {
    const key = `${this.STORAGE_KEY_PREFIX}${sessionId}`;
    const history = this.getSessionHistory(sessionId);

    const newMessage: AIChatMessage = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      role: message.role,
      text: message.text,
      timestamp: Date.now()
    };

    // Concatenate and shift if bounds exceeded
    let updated = [...history, newMessage];
    if (updated.length > this.MAX_HISTORY_NODES) {
      updated = updated.slice(updated.length - this.MAX_HISTORY_NODES);
    }

    const payload: AISessionMemory = {
      sessionId,
      messages: updated,
      lastContextSync: Date.now()
    };

    tenantStorage.setItem(key, JSON.stringify(payload));
    return updated;
  }

  /**
   * Fully wipes active chat memory logs
   */
  public static clearSession(sessionId: string): void {
    const key = `${this.STORAGE_KEY_PREFIX}${sessionId}`;
    tenantStorage.removeItem(key);
  }
}

export default AIMemoryService;
