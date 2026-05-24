/**
 * DDSulf Release and Semantic Updates Orchestration Service
 */

import { ReleaseLog } from '../types';

class ReleaseService {
  private releases: ReleaseLog[] = [];
  private promptTemplates: Record<string, { version: string; updatedBy: string; prompt: string }> = {};

  constructor() {
    this.seedDefaultReleases();
    this.seedDefaultPrompts();
  }

  private seedDefaultReleases() {
    this.releases = [
      {
        version: 'v2.4.1',
        releaseDate: new Date(Date.now() - 3600000 * 18).toISOString(),
        notes: [
          'Corrige loop infinito no usePermissions cache do Workspace',
          'Adiciona timeline forense dinâmica nos logs de auditoria SecOps',
          'Melhoria do tempo de renderização no dashboard analytics-first de 300ms para 90ms'
        ],
        scope: 'patch',
        author: 'thiago.devops@ddsulf.com.br',
        approvedBy: 'gabriel.max@ddsulf.com.br',
        pwaUpdateInvalided: true,
        deploymentId: 'dep_304',
        rollbackTriggers: ['latencia_api_excede_200ms', 'taxa_erros_500_excede_2pct']
      },
      {
        version: 'v2.4.0',
        releaseDate: new Date(Date.now() - 3600000 * 96).toISOString(),
        notes: [
          'Novo módulo de Gestão de Multi-Tenancy para franquias do Sul',
          'Implementação das chaves offline de fallback no indexDB para o Controle de Pragas',
          'Integração nativa com IA de dosagem ecológica inteligente'
        ],
        scope: 'minor',
        author: 'gabriel.max@ddsulf.com.br',
        approvedBy: 'board@ddsulf.com.br',
        pwaUpdateInvalided: true,
        deploymentId: 'dep_303',
        rollbackTriggers: ['excecao_unhandled_fatal', 'perda_integridade_tenant']
      }
    ];
  }

  private seedDefaultPrompts() {
    this.promptTemplates = {
      'pest_dosagem_v1': {
        version: 'v1.4.2',
        updatedBy: 'ai_specialist_ddsulf',
        prompt: 'Atue como Engenheiro Químico Sanitário Senior. Dados os metros quadrados {{ m2 }} e tipo de vetor {{ vector }}, recomende a diluição de emulsão com foco em segurança ambiental, custos de deslocamento e eficiência de dosagem no sul do Brasil.'
      }
    };
  }

  public getReleases(): ReleaseLog[] {
    return this.releases;
  }

  public registerRelease(release: ReleaseLog) {
    this.releases.unshift(release);
  }

  public getPromptTemplate(key: string) {
    return this.promptTemplates[key];
  }

  public savePromptTemplate(key: string, version: string, val: string, author: string) {
    this.promptTemplates[key] = {
      version,
      updatedBy: author,
      prompt: val
    };
  }
}

export const releaseService = new ReleaseService();
export default releaseService;
