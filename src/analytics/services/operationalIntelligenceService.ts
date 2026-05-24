/**
 * DDSulf Operational Intelligence & Technician Capacity Service
 * Manages technician work ratios, chemical consumption metrics, and service recurrence.
 */

export interface TechnicalStaffLoad {
  technicianName: string;
  regionalOffice: string;
  activeOrders: number;
  unresolvedAnomalyCount: number;
  totalHoursWorked: number;
  utilizationPercent: number; // e.g. 85%
}

class OperationalIntelligenceService {
  private staffLoads: TechnicalStaffLoad[] = [];

  constructor() {
    this.seedStaffLoads();
  }

  private seedStaffLoads() {
    this.staffLoads = [
      {
        technicianName: 'Cleber Sampaio',
        regionalOffice: 'Erechim HQ',
        activeOrders: 6,
        unresolvedAnomalyCount: 0,
        totalHoursWorked: 142,
        utilizationPercent: 88.5
      },
      {
        technicianName: 'Marcos de Souza',
        regionalOffice: 'Passo Fundo Branch',
        activeOrders: 9,
        unresolvedAnomalyCount: 1,
        totalHoursWorked: 160,
        utilizationPercent: 96.0
      },
      {
        technicianName: 'Rodrigo Medeiros',
        regionalOffice: 'Santa Maria Rural',
        activeOrders: 4,
        unresolvedAnomalyCount: 0,
        totalHoursWorked: 110,
        utilizationPercent: 72.4
      },
      {
        technicianName: 'Aline Schmidt',
        regionalOffice: 'Erechim HQ',
        activeOrders: 8,
        unresolvedAnomalyCount: 0,
        totalHoursWorked: 154,
        utilizationPercent: 91.2
      }
    ];
  }

  public getStaffLoad(): TechnicalStaffLoad[] {
    return [...this.staffLoads];
  }

  /**
   * Safe registers extra worked hours or capacity shifts for a technician
   */
  public logOperationalShift(technicianName: string, extraHours: number, extraOrders: number): boolean {
    const tech = this.staffLoads.find(t => t.technicianName === technicianName);
    if (!tech) return false;

    tech.totalHoursWorked += extraHours;
    tech.activeOrders += extraOrders;
    
    // adjust utilization percent
    const baselineMaxHours = 176; // hours in 22 working days
    tech.utilizationPercent = parseFloat(Math.min(100, (tech.totalHoursWorked / baselineMaxHours) * 100).toFixed(1));
    return true;
  }
}

export const operationalIntelligenceService = new OperationalIntelligenceService();
export default operationalIntelligenceService;
