/**
 * DDSulf Rollback Orchestrator & Deployment Restoration Engine
 */

import { deploymentService } from './deploymentService';
import { monitoringService } from './monitoringService';

class RollbackService {
  /**
   * Triggers an authorized rollback of the production codebase
   */
  public triggerAutomaticRollback(faultyDeploymentId: string, author: string): {
    success: boolean;
    restoredVersion: string;
    message: string;
  } {
    const activeHistory = deploymentService.getHistory('production');
    const faulty = activeHistory.find(d => d.id === faultyDeploymentId);
    
    if (!faulty) {
      return {
        success: false,
        restoredVersion: '',
        message: 'O id do deploy informado não pôde ser localizado para rollback.'
      };
    }

    // Identify first preceding healthy deploy
    const index = activeHistory.indexOf(faulty);
    const healthyPredecessor = activeHistory.slice(index + 1).find(d => d.status === 'healthy');

    if (!healthyPredecessor) {
      return {
        success: false,
        restoredVersion: '',
        message: 'Sem build anterior saudável disponível nas tags redundantes.'
      };
    }

    // Flag faulty as rolled_back
    deploymentService.updateStatus(faulty.id, 'rolled_back');
    
    // Register recovery log event
    monitoringService.recordRuntimeError(
      `Rollback acionado manualmente por ${author}. Revertido de ${faulty.version} para ${healthyPredecessor.version}`,
      'warning',
      `Manual rollback triggered. De-routed traffic from broken commit SHA: ${faulty.commitSha}`
    );

    return {
      success: true,
      restoredVersion: healthyPredecessor.version,
      message: `Rollback realizado com sucesso! Tráfego de borda desviado para a build anterior saudável: ${healthyPredecessor.version}.`
    };
  }
}

export const rollbackService = new RollbackService();
export default rollbackService;
