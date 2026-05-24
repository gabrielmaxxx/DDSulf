/**
 * DDSulf Realtime Contextual Intelligence Engine
 * Captures, compiles, and filters the business runtime environment based on active role permissions.
 */

import { SystemCoreContext } from '../types';

export class AIContextEngine {
  private static STORAGE_KEY = 'ddsulf_ai_live_context';

  /**
   * Assembles a permission-aware core context
   * Ensures technical role types cannot view unit compound pricing data or critical core costs.
   */
  public static compileContext(
    role: string,
    userName: string,
    rawSettings?: any,
    rawMetrics?: any,
    activeQuote?: any
  ): SystemCoreContext {
    const isTechnical = role === 'tecnico' || role === 'visualizador';
    const isCommercial = role === 'comercial';

    const context: SystemCoreContext = {
      activeRole: role,
      userName: userName,
    };

    // 1. Financial base settings (Guarded)
    if (!isTechnical && rawSettings) {
      context.financialSettings = {
        costPerHour: rawSettings.costPerHour || 0,
        costPerKm: rawSettings.costPerKm || 0,
        minimumMargin: rawSettings.minimumMargin || 0,
        baseOperationalCost: rawSettings.baseOperationalCost || 0,
      };
    }

    // 2. High-level dashboard metrics is visible, but some values are masked for field technician profiles
    if (rawMetrics) {
      context.metrics = {
        totalRevenue: isTechnical ? 0 : (rawMetrics.totalRevenue || 0),
        totalCosts: isTechnical ? 0 : (rawMetrics.totalCosts || 0),
        averageMargin: isTechnical ? 0 : (rawMetrics.averageMargin || 0),
        serviceVolume: rawMetrics.serviceVolume || 0,
        syncLatencyMs: rawMetrics.syncLatencyMs || 0,
        stalledDraftsCount: rawMetrics.stalledDraftsCount || 0,
      };
    }

    // 3. Calculator or Quote detail (Guarded context)
    if (activeQuote) {
      context.targetQuote = {
        pestType: activeQuote.pestType || 'N/A',
        environmentType: activeQuote.environmentType || 'N/A',
        areaSize: activeQuote.areaSize || 0,
        // Mask specific numbers to technical users
        suggestedPrice: isTechnical ? 0 : (activeQuote.suggestedPrice || 0),
        estimatedCost: isTechnical ? 0 : (activeQuote.estimatedCost || 0),
        estimatedMargin: isTechnical ? 0 : (activeQuote.estimatedMargin || 0),
      };
    }

    // Cache compiled context in local storage for instant offline analytics parsing
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(context));
    }

    return context;
  }

  /**
   * Safe getter with fallback to cached memory state
   */
  public static getCachedContext(): SystemCoreContext {
    if (typeof localStorage === 'undefined') {
      return { activeRole: 'visualizador', userName: 'Anônimo' };
    }
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : { activeRole: 'visualizador', userName: 'Anônimo' };
  }
}

export default AIContextEngine;
