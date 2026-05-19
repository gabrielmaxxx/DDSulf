import { useState, useMemo, useEffect } from 'react';
import { 
  PestType, 
  EnvironmentType, 
  InfestationLevel, 
  OperationalComplexity, 
  Recurrence, 
  UrgencyLevel,
} from '@/types/database';
import { financialService } from '@/modules/financial/services/financialService';

export function useCalculatorLogic() {
  const [pestType, setPestType] = useState<PestType>('Baratas');
  const [environmentType, setEnvironmentType] = useState<EnvironmentType>('Residência');
  const [areaSize, setAreaSize] = useState<number>(50);
  const [infestationLevel, setInfestationLevel] = useState<InfestationLevel>('Médio');
  
  const [displacement, setDisplacement] = useState<number>(10);
  const [urgency, setUrgency] = useState<UrgencyLevel>('Normal');
  const [recurrence, setRecurrence] = useState<Recurrence>('Único');
  const [technicians, setTechnicians] = useState<number>(1);
  const [complexity, setComplexity] = useState<OperationalComplexity>('Normal');

  const [financialSettings, setFinancialSettings] = useState({
    costPerHour: 45,
    costPerKm: 2.5,
    minimumMargin: 30,
    baseOperationalCost: 80
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await financialService.getSettings();
        setFinancialSettings({
          costPerHour: settings.costPerHour,
          costPerKm: settings.costPerKm,
          minimumMargin: settings.minimumMargin,
          baseOperationalCost: settings.baseOperationalCost
        });
      } catch (err) {
        console.error('Failed to load financial settings for calculator', err);
      }
    }
    loadSettings();
  }, []);

  const pricing = useMemo(() => {
    // 1. Base Multipliers
    const pestMultipliers: Record<PestType, number> = {
      'Baratas': 1.0,
      'Ratos': 1.2,
      'Cupins': 2.5,
      'Formigas': 0.9,
      'Escorpiões': 1.5,
      'Pulgas': 1.3,
      'Mosquitos': 1.1,
      'Percevejos': 1.8,
      'Outros': 1.0
    };

    const envMultipliers: Record<EnvironmentType, number> = {
      'Residência': 1.0,
      'Comércio': 1.2,
      'Indústria': 1.8,
      'Restaurante': 1.5,
      'Condomínio': 1.4,
      'Hospital': 2.0,
      'Área Externa': 0.8
    };

    const infestationMultipliers: Record<InfestationLevel, number> = {
      'Baixo': 0.8,
      'Médio': 1.0,
      'Alto': 1.5,
      'Crítico': 2.5
    };

    const urgencyMultipliers: Record<UrgencyLevel, number> = {
      'Normal': 1.0,
      'Prioritário': 1.3,
      'Emergência': 1.8
    };

    // 2. Base Calculation
    const baseValuePerM2 = 2.5; 
    
    let rawValue = areaSize * baseValuePerM2;
    rawValue *= pestMultipliers[pestType];
    rawValue *= envMultipliers[environmentType];
    rawValue *= infestationMultipliers[infestationLevel];

    // 3. Operational Costs from Real Financial Settings
    const { costPerKm, costPerHour, baseOperationalCost } = financialSettings;
    
    // Estimated time (hours)
    let estimatedHours = (areaSize / 50) * pestMultipliers[pestType];
    if (complexity === 'Complexo') estimatedHours *= 1.5;
    if (complexity === 'Simples') estimatedHours *= 0.8;
    estimatedHours = Math.max(1, estimatedHours);

    const operationalCost = baseOperationalCost + (displacement * costPerKm) + (technicians * estimatedHours * costPerHour);
    
    // 4. Final Price
    let finalPrice = (rawValue + operationalCost) * urgencyMultipliers[urgency];
    
    // Recurrence Discount
    if (recurrence === 'Mensal') finalPrice *= 0.85; 
    if (recurrence === 'Trimestral') finalPrice *= 0.9;
    if (recurrence === 'Semestral') finalPrice *= 0.95;

    const margin = finalPrice > 0 ? ((finalPrice - operationalCost) / finalPrice) * 100 : 0;

    return {
      suggestedPrice: finalPrice,
      estimatedCost: operationalCost,
      estimatedMargin: margin,
      estimatedTime: estimatedHours,
      suggestedTeam: technicians
    };
  }, [pestType, environmentType, areaSize, infestationLevel, displacement, urgency, recurrence, technicians, complexity, financialSettings]);

  return {
    state: {
      pestType, setPestType,
      environmentType, setEnvironmentType,
      areaSize, setAreaSize,
      infestationLevel, setInfestationLevel,
      displacement, setDisplacement,
      urgency, setUrgency,
      recurrence, setRecurrence,
      technicians, setTechnicians,
      complexity, setComplexity
    },
    pricing,
    minMargin: financialSettings.minimumMargin
  };
}

