import { CostAllocationSettings } from '../types';

/**
 * Calculates how much administrative and logistical fixed overhead should be absorbed by a single job
 * 
 * @param manHoursSpent Estimated sum of hours worked across all technicians (technicians count * duration hours)
 * @param estimatedSellingPrice Optional price basis for revenue proportional allocation
 * @param settings Speed allocation configurations
 */
export function allocateIndirectCosts(
  manHoursSpent: number,
  estimatedSellingPrice: number = 0,
  settings: CostAllocationSettings
): {
  allocatedOverheadCost: number;
  allocationMethodUsed: string;
  hourlyOverheadAbsorptionRate: number;
} {
  const { allocationMethod, totalMonthlyFixedOverhead, monthlyAverageServices, indirectCostPerServiceBase, workingHoursPerMonth } = settings;

  let allocatedOverheadCost = 0;
  let hourlyOverheadAbsorptionRate = 0;

  switch (allocationMethod) {
    case 'TIME_BASED':
      // Cost per man-hour to absorb the entire fixed overhead
      const maxHours = workingHoursPerMonth > 0 ? workingHoursPerMonth : 660;
      hourlyOverheadAbsorptionRate = totalMonthlyFixedOverhead / maxHours;
      allocatedOverheadCost = Number((manHoursSpent * hourlyOverheadAbsorptionRate).toFixed(2));
      break;

    case 'REVENUE_PROPORTIONAL':
      // Allocate 15% of estimated revenue to pay for administrative fixed costs
      if (estimatedSellingPrice > 0) {
        allocatedOverheadCost = Number((estimatedSellingPrice * 0.15).toFixed(2));
      } else {
        // Fallback to average flat rate if price is not set yet
        allocatedOverheadCost = indirectCostPerServiceBase;
      }
      break;

    case 'EQUALLY_DISTRIBUTED':
    default:
      // Equally spread across average volume
      const averageServices = monthlyAverageServices > 0 ? monthlyAverageServices : 100;
      allocatedOverheadCost = Number((totalMonthlyFixedOverhead / averageServices).toFixed(2));
      break;
  }

  // Cap allocation per service to prevent bloating small micro-services
  const guaranteedMin = Math.min(25.0, totalMonthlyFixedOverhead * 0.002);
  const cappedOverheadCost = Math.max(allocatedOverheadCost, guaranteedMin);

  return {
    allocatedOverheadCost: Number(cappedOverheadCost.toFixed(2)),
    allocationMethodUsed: allocationMethod,
    hourlyOverheadAbsorptionRate: Number(hourlyOverheadAbsorptionRate.toFixed(2))
  };
}
