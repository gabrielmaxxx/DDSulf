import { useState, useMemo, useEffect } from 'react';
import { PestType, EnvironmentType, InfestationLevel, OperationalComplexity, Recurrence, UrgencyLevel } from '@/types/database';
import { ProductCostItem } from '../../types';
import { calculatePricingStructure, FullPricingCalculationOutput } from '../engine/pricingEngine';
import { DEFAULT_RULE_SETTINGS } from '../rules/pricingRules';
import { calculateRecommendedMargins } from '../margin/marginEngine';
import { auditFinancialViability } from '../validations/financialValidator';
import { persistLocalOfflineDraft, recoverLocalOfflineDraft } from '../utils/pricingCache';
import { pricingEngineService } from '../services/pricingEngineService';

export function usePricingEngine(sessionId: string = 'default') {
  const [clientName, setClientName] = useState('');
  const [pestType, setPestType] = useState<PestType>('Baratas');
  const [environmentType, setEnvironmentType] = useState<EnvironmentType>('Residência');
  const [areaSize, setAreaSize] = useState<number>(100);
  const [infestationLevel, setInfestationLevel] = useState<InfestationLevel>('Médio');
  const [complexity, setComplexity] = useState<OperationalComplexity>('Normal');
  const [displacement, setDisplacement] = useState<number>(20);
  const [technicians, setTechnicians] = useState<number>(1);
  const [urgency, setUrgency] = useState<UrgencyLevel>('Normal');
  const [recurrence, setRecurrence] = useState<Recurrence>('Único');
  
  const [chemicalDatabase, setChemicalDatabase] = useState<ProductCostItem[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductCostItem[]>([]);
  const [customMargin, setCustomMargin] = useState<number | undefined>(undefined);

  // Load chemical list on mount
  useEffect(() => {
    // Standard mock list which can be synced with remote stocks or pricingService
    const chemicals: ProductCostItem[] = [
      { id: '1', name: 'K-Othrine WG 250 (Geral)', dosagePerM2: 0.05, unitCost: 1.25, unitLabel: 'g', amountUsed: 0, totalCost: 0 },
      { id: '2', name: 'Temprid SC (Percevejo/Pulga)', dosagePerM2: 0.08, unitCost: 2.15, unitLabel: 'ml', amountUsed: 0, totalCost: 0 },
      { id: '3', name: 'Gator Gel Baraticida', dosagePerM2: 0.02, unitCost: 3.80, unitLabel: 'g', amountUsed: 0, totalCost: 0 },
      { id: '4', name: 'Optigard Formiga Gel', dosagePerM2: 0.03, unitCost: 3.40, unitLabel: 'g', amountUsed: 0, totalCost: 0 },
      { id: '5', name: 'Fendona 60 SC (Escorpiões)', dosagePerM2: 0.06, unitCost: 1.95, unitLabel: 'ml', amountUsed: 0, totalCost: 0 },
      { id: '6', name: 'Rodilon Bloco (Raticida)', dosagePerM2: 0.10, unitCost: 0.85, unitLabel: 'g', amountUsed: 0, totalCost: 0 }
    ];
    setChemicalDatabase(chemicals);
  }, []);

  // Attempt local session draft recovery
  useEffect(() => {
    const draft = recoverLocalOfflineDraft(sessionId);
    if (draft) {
      setClientName(draft.clientName);
      setPestType(draft.inputs.pestType);
      setEnvironmentType(draft.inputs.environmentType);
      setAreaSize(draft.inputs.areaSize);
      setInfestationLevel(draft.inputs.infestationLevel);
      setComplexity(draft.inputs.complexity);
      setDisplacement(draft.inputs.displacement);
      setTechnicians(draft.inputs.technicians);
      setUrgency(draft.inputs.urgency);
      setRecurrence(draft.inputs.recurrence);
      setSelectedProducts(draft.inputs.selectedProducts || []);
      if (draft.inputs.customMargin !== undefined) {
        setCustomMargin(draft.inputs.customMargin);
      }
    }
  }, [sessionId]);

  // Aggregate current active inputs
  const currentInputs = useMemo(() => ({
    areaSize,
    pestType,
    environmentType,
    infestationLevel,
    complexity,
    displacement,
    technicians,
    urgency,
    recurrence,
    customMargin,
    selectedProducts
  }), [
    areaSize, pestType, environmentType, infestationLevel,
    complexity, displacement, technicians, urgency, recurrence, customMargin, selectedProducts
  ]);

  // Full Operational and Selling core evaluations
  const calculationOutput: FullPricingCalculationOutput = useMemo(() => {
    return calculatePricingStructure(currentInputs, DEFAULT_RULE_SETTINGS);
  }, [currentInputs]);

  // Dynamic Margin range benchmarks
  const marginSpecs = useMemo(() => {
    return calculateRecommendedMargins(environmentType, complexity, infestationLevel);
  }, [environmentType, complexity, infestationLevel]);

  // If customMargin is not touched yet, synchronize it with the targeting guidelines
  useEffect(() => {
    if (customMargin === undefined) {
      setCustomMargin(marginSpecs.targetMarginPercent);
    }
  }, [marginSpecs.targetMarginPercent, customMargin]);

  // Input sanitization and rule errors list
  const errors = useMemo(() => {
    const list: string[] = [];
    if (areaSize <= 0) list.push('A área de cobertura deve ser maior que zero.');
    if (displacement < 0) list.push('A distância logística não pode ser negativa.');
    if (technicians <= 0) list.push('Deve haver pelo menos 1 técnico encarregado no local.');
    return list;
  }, [areaSize, displacement, technicians]);

  // Quality check alerts checklist
  const alerts = useMemo(() => {
    return auditFinancialViability(
      {
        areaSize,
        pestType,
        environmentType,
        complexity,
        displacementKm: displacement,
        techniciansCount: technicians
      },
      calculationOutput.costing,
      calculationOutput.pricing,
      marginSpecs
    );
  }, [areaSize, pestType, environmentType, complexity, displacement, technicians, calculationOutput, marginSpecs]);

  // Trigger auto-backups whenever fields are updated
  useEffect(() => {
    if (clientName) {
      persistLocalOfflineDraft({
        id: sessionId,
        clientName,
        inputs: {
          clientName,
          ...currentInputs
        },
        updatedAt: new Date().toISOString(),
        cacheStatus: 'local'
      });
    }
  }, [clientName, currentInputs, sessionId]);

  const toggleProduct = (product: ProductCostItem) => {
    setSelectedProducts(prev => {
      const existsIdx = prev.findIndex(p => p.id === product.id);
      if (existsIdx >= 0) {
        return prev.filter(p => p.id !== product.id);
      } else {
        const productDosage = product.dosagePerM2;
        return [...prev, {
          ...product,
          amountUsed: Number((areaSize * productDosage).toFixed(2)),
          totalCost: Number((areaSize * productDosage * product.unitCost).toFixed(2))
        }];
      }
    });
  };

  const updateProductDosage = (productId: string, dosage: number) => {
    setSelectedProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          dosagePerM2: dosage,
          amountUsed: Number((areaSize * dosage).toFixed(2)),
          totalCost: Number((areaSize * dosage * p.unitCost).toFixed(2))
        };
      }
      return p;
    }));
  };

  const resetForm = () => {
    setClientName('');
    setPestType('Baratas');
    setEnvironmentType('Residência');
    setAreaSize(100);
    setInfestationLevel('Médio');
    setComplexity('Normal');
    setDisplacement(20);
    setTechnicians(1);
    setUrgency('Normal');
    setRecurrence('Único');
    setSelectedProducts([]);
    setCustomMargin(marginSpecs.targetMarginPercent);
    try {
      localStorage.removeItem(`ddsulf_pricing_draft_${sessionId}`);
    } catch {}
  };

  return {
    clientName,
    setClientName,
    pestType,
    setPestType,
    environmentType,
    setEnvironmentType,
    areaSize,
    setAreaSize,
    infestationLevel,
    setInfestationLevel,
    complexity,
    setComplexity,
    displacement,
    setDisplacement,
    technicians,
    setTechnicians,
    urgency,
    setUrgency,
    recurrence,
    setRecurrence,
    chemicalDatabase,
    selectedProducts,
    toggleProduct,
    updateProductDosage,
    customMargin,
    setCustomMargin,
    calculationOutput,
    marginSpecs,
    errors,
    alerts,
    resetForm
  };
}
export type UsePricingEngineReturn = ReturnType<typeof usePricingEngine>;
