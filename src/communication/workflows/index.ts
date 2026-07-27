/**
 * Automation and Workflow communication triggers
 */

import PestFlowNotificationService from '../services/notificationService';

export class CommunicationWorkflows {
  /**
   * Fires a financial breach alert when pro-forma invoices or costs fall behind schedule
   */
  public static triggerFinancialMarginCheck(proposalId: string, clientName: string, actualMargin: number) {
    if (actualMargin < 18) {
      PestFlowNotificationService.getInstance().createNotification({
        category: 'financial',
        templateKey: 'financial.margin_breached',
        variables: {
          proposalId,
          clientName,
          margin: actualMargin.toFixed(1)
        },
        routeUrl: '/financial'
      });
      return true;
    }
    return false;
  }

  /**
   * Fires stock/saneantes starvation notice
   */
  public static triggerStockCheck(itemName: string, currentVolume: number, minRequired: number) {
    if (currentVolume < minRequired) {
      PestFlowNotificationService.getInstance().createNotification({
        category: 'operations',
        templateKey: 'operations.inventory_starved',
        variables: {
          itemName,
          currentVolume: currentVolume.toString(),
          minRequired: minRequired.toString()
        },
        routeUrl: '/stock'
      });
      return true;
    }
    return false;
  }
}

export default CommunicationWorkflows;
