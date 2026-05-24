/**
 * DDSulf Predictive Forecasting & Demand Estimation Service
 * Extrapolates chemical application volume, pest seasonality curves, and financial outcomes.
 */

import { HistoricalForecast } from '../types';

class ForecastingService {
  private baseRevenueForecast: HistoricalForecast[] = [];
  private pestSazonalidadeIndex = {
    cupins: [20, 35, 75, 40, 25, 20, 15, 22, 60, 95, 80, 45], // peak in hot months (Oct, Nov, Dec, Mar)
    baratas: [50, 60, 90, 80, 50, 40, 30, 45, 75, 95, 85, 70],
    roedores: [80, 75, 60, 50, 40, 45, 65, 80, 85, 70, 75, 82], // peaks in cold/humid harvest storage months
  };

  constructor() {
    this.seedRevenueForecast();
  }

  private seedRevenueForecast() {
    this.baseRevenueForecast = [
      { period: 'Jan', actualValue: 125000, forecastedValue: 120000, confidenceIntervalLower: 110000, confidenceIntervalUpper: 130000 },
      { period: 'Fev', actualValue: 132000, forecastedValue: 128000, confidenceIntervalLower: 118000, confidenceIntervalUpper: 138000 },
      { period: 'Mar', actualValue: 145000, forecastedValue: 135000, confidenceIntervalLower: 125000, confidenceIntervalUpper: 145000 },
      { period: 'Abr', actualValue: 110000, forecastedValue: 115000, confidenceIntervalLower: 105000, confidenceIntervalUpper: 125000 },
      { period: 'Mai', actualValue: 98000, forecastedValue: 95000, confidenceIntervalLower: 85000, confidenceIntervalUpper: 105000 },
      { period: 'Jun', actualValue: 85000, forecastedValue: 88000, confidenceIntervalLower: 78000, confidenceIntervalUpper: 98000 },
      { period: 'Jul', actualValue: 0, forecastedValue: 82000, confidenceIntervalLower: 72000, confidenceIntervalUpper: 92000 },
      { period: 'Ago', actualValue: 0, forecastedValue: 94000, confidenceIntervalLower: 84000, confidenceIntervalUpper: 104000 },
      { period: 'Set', actualValue: 0, forecastedValue: 115000, confidenceIntervalLower: 105000, confidenceIntervalUpper: 125000 },
      { period: 'Out', actualValue: 0, forecastedValue: 148000, confidenceIntervalLower: 135000, confidenceIntervalUpper: 161000 },
      { period: 'Nov', actualValue: 0, forecastedValue: 165000, confidenceIntervalLower: 150000, confidenceIntervalUpper: 180000 },
      { period: 'Dez', actualValue: 0, forecastedValue: 180000, confidenceIntervalLower: 165000, confidenceIntervalUpper: 195000 }
    ];
  }

  public getRevenueForecast(): HistoricalForecast[] {
    return [...this.baseRevenueForecast];
  }

  /**
   * Predicts seasonality factor for chemical demand based on average regional temperatures
   */
  public getPestActivitySazonalidade() {
    return {
      months: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      cupins: this.pestSazonalidadeIndex.cupins,
      baratas: this.pestSazonalidadeIndex.baratas,
      roedores: this.pestSazonalidadeIndex.roedores
    };
  }

  /**
   * Generates dynamic seasonal chemical volume estimation multiplier based on average temperature offsets
   */
  public generatePredictiveInboundVolume(humidityPct: number, temperatureC: number): { recommendedStockKg: number; efficiencyDiscountPercent: number } {
    const baselineStock = 1200; // Kilograms needed standard
    const factorHumidity = humidityPct / 100;
    const factorTemp = (temperatureC - 15) / 25; // standard offset of 15-40 C
    
    const combinedFactor = 1.0 + (factorHumidity * 0.45) + (factorTemp * 0.55);
    const estStock = baselineStock * combinedFactor;

    return {
      recommendedStockKg: parseFloat(estStock.toFixed(1)),
      efficiencyDiscountPercent: parseFloat((Math.min(100, combinedFactor * 12)).toFixed(1))
    };
  }
}

export const forecastingService = new ForecastingService();
export default forecastingService;
