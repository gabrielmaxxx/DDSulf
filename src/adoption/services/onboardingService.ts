/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { OnboardingStep, OnboardingStepStatus } from '../types';

const STORAGE_KEY = 'ddsulf_adoption_onboarding';

export class OnboardingService {
  private steps: OnboardingStep[] = [];

  constructor() {
    this.initializeDefaultSteps();
  }

  private initializeDefaultSteps() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.steps = JSON.parse(saved);
      } else {
        this.steps = [
          {
            id: 'step_01_profile_tenant',
            title: 'Configuração da Filial Multi-Tenant',
            description: 'Defina os limites corporativos secundários, quotas de licenças Starter/Professional e moeda base.',
            status: OnboardingStepStatus.COMPLETED,
            moduleCovered: 'Organização',
            estimatedMinutes: 5
          },
          {
            id: 'step_02_pesticides_calculator',
            title: 'Calibração Estequiométrica do Estoque',
            description: 'Insira os praguicidas ativos e calibrações de m3/ha na calculadora inteligente.',
            status: OnboardingStepStatus.IN_PROGRESS,
            moduleCovered: 'Calculadora Química',
            estimatedMinutes: 15
          },
          {
            id: 'step_03_create_custom_pop',
            title: 'Primeiro Laudo Técnico POPs',
            description: 'Simule o preenchimento de um laudo final da Anvisa integrando assinaturas manuais.',
            status: OnboardingStepStatus.NOT_STARTED,
            moduleCovered: 'POPs Regulatórios',
            estimatedMinutes: 10
          },
          {
            id: 'step_04_offline_cache_check',
            title: 'Validação de Sincronismo Offline',
            description: 'Teste a desconexão programada e verifique a integridade do cache persistente offline.',
            status: OnboardingStepStatus.NOT_STARTED,
            moduleCovered: 'Sistemas PWA',
            estimatedMinutes: 8
          }
        ];
        this.persist();
      }
    } catch {
      // offline mode fallback
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.steps));
    } catch (e) {
      console.warn('Onboarding state persistence failed:', e);
    }
  }

  public getSteps(): OnboardingStep[] {
    return this.steps;
  }

  public completeStep(id: string) {
    const item = this.steps.find(s => s.id === id);
    if (item) {
      item.status = OnboardingStepStatus.COMPLETED;
      this.persist();
    }
  }

  public startStep(id: string) {
    const item = this.steps.find(s => s.id === id);
    if (item && item.status === OnboardingStepStatus.NOT_STARTED) {
      item.status = OnboardingStepStatus.IN_PROGRESS;
      this.persist();
    }
  }

  public resetOnboarding() {
    this.steps.forEach(s => s.status = OnboardingStepStatus.NOT_STARTED);
    if (this.steps[0]) this.steps[0].status = OnboardingStepStatus.IN_PROGRESS;
    this.persist();
  }
}

export const onboardingService = new OnboardingService();
export default onboardingService;
