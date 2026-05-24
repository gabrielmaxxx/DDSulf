import { useState, useMemo, useEffect } from 'react';
import { PricingInputs, PricingBreakdown, ProductCostItem } from '../types';
import { processOperationalPricing, DEFAULT_ENGINE_SETTINGS, PricingEngineSettings } from '../calculations/pricingEngine';
import { evaluatePricingHealth, validatePricingInputs } from '../validation/pricingValidator';
import { pricingService } from '../services/pricingService';
import { PestType, EnvironmentType, InfestationLevel, OperationalComplexity, Recurrence, UrgencyLevel } from '@/types/database';

export function useRealtimePricing(initialSettings?: PricingEngineSettings) {
  const settings = initialSettings || DEFAULT_ENGINE_SETTINGS;

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
  const [customMargin, setCustomMargin] = useState<number>(settings.targetMarginDefault);

  // Load available chemicals from services on mount
  useEffect(() => {
    async function loadChemicals() {
      const items = await pricingService.getChemicalProducts();
      setChemicalDatabase(items);
    }
    loadChemicals();
  }, []);

  // Set default values from draft on start
  useEffect(() => {
    const draft = pricingService.getDraft();
    if (draft) {
      setClientName(draft.clientName || '');
      setPestType(draft.pestType);
      setEnvironmentType(draft.environmentType);
      setAreaSize(draft.areaSize);
      setInfestationLevel(draft.infestationLevel);
      setComplexity(draft.complexity);
      setDisplacement(draft.displacement);
      setTechnicians(draft.technicians);
      setUrgency(draft.urgency);
      setRecurrence(draft.recurrence);
      setSelectedProducts(draft.selectedProducts || []);
      if (draft.customMargin) {
        setCustomMargin(draft.customMargin);
      }
    }
  }, []);

  // Dynamic composition formula
  const inputs: PricingInputs = useMemo(() => ({
    clientName,
    pestType,
    environmentType,
    areaSize,
    infestationLevel,
    complexity,
    displacement,
    technicians,
    urgency,
    recurrence,
    selectedProducts,
    customMargin
  }), [
    clientName, pestType, environmentType, areaSize, infestationLevel,
    complexity, displacement, technicians, urgency, recurrence, selectedProducts, customMargin
  ]);

  // Pricing math calculation trigger
  const breakdown: PricingBreakdown = useMemo(() => {
    return processOperationalPricing(inputs, settings);
  }, [inputs, settings]);

  // Live validator notifications and safeguards
  const errors = useMemo(() => validatePricingInputs(inputs), [inputs]);
  const alerts = useMemo(() => evaluatePricingHealth(inputs, breakdown, settings.targetMarginDefault), [inputs, breakdown, settings.targetMarginDefault]);

  // Trigger local autosave upon field updates
  useEffect(() => {
    if (clientName) {
      pricingService.saveDraft(inputs);
    }
  }, [inputs, clientName]);

  const toggleProduct = (product: ProductCostItem) => {
    setSelectedProducts(prev => {
      const found = prev.find(p => p.id === product.id);
      if (found) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, { ...product, amountUsed: areaSize * product.dosagePerM2 }];
      }
    });
  };

  const updateProductDosage = (productId: string, dosage: number) => {
    setSelectedProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, dosagePerM2: dosage, amountUsed: areaSize * dosage };
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
    setCustomMargin(settings.targetMarginDefault);
    pricingService.clearDraft();
  };

  return {
    state: {
      clientName, setClientName,
      pestType, setPestType,
      environmentType, setEnvironmentType,
      areaSize, setAreaSize,
      infestationLevel, setInfestationLevel,
      complexity, setComplexity,
      displacement, setDisplacement,
      technicians, setTechnicians,
      urgency, setUrgency,
      recurrence, setRecurrence,
      chemicalDatabase, selectedProducts, toggleProduct, updateProductDosage,
      customMargin, setCustomMargin
    },
    inputs,
    breakdown,
    errors,
    alerts,
    resetForm
  };
}
