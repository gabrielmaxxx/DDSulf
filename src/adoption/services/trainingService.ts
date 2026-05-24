/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { TrainingModule } from '../types';

const STORAGE_KEY = 'ddsulf_adoption_training';

export class TrainingService {
  private modules: TrainingModule[] = [];

  constructor() {
    this.initializeDefaultModules();
  }

  private initializeDefaultModules() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.modules = JSON.parse(saved);
      } else {
        this.modules = [
          {
            id: 'module_01_intro_pwa',
            title: 'Ambientação Operacional e Aplicação Offline PWA',
            category: 'pwa_offline',
            isCompleted: true,
            scorePercent: 100
          },
          {
            id: 'module_02_calculator',
            title: 'Uso Prático da Calculadora e Dosagem Química',
            category: 'pesticides',
            isCompleted: false
          },
          {
            id: 'module_03_pops',
            title: 'Preenchimento e Auditoria de Laudos Regulares',
            category: 'safety',
            isCompleted: false
          },
          {
            id: 'module_04_board_level',
            title: 'Painel Executivo e Tomada de Decisão de Board',
            category: 'finance',
            isCompleted: false
          }
        ];
        this.persist();
      }
    } catch {
      // offline friendly fallback
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.modules));
    } catch (e) {
      console.warn('Training modules write failed:', e);
    }
  }

  public getModules(): TrainingModule[] {
    return this.modules;
  }

  public completeModule(id: string, score: number) {
    const item = this.modules.find(m => m.id === id);
    if (item) {
      item.isCompleted = true;
      item.scorePercent = score;
      this.persist();
    }
  }
}

export const trainingService = new TrainingService();
export default trainingService;
