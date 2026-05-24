import { useState, useEffect } from 'react';
import { MarginIntelligenceConfig } from '../types';
import { DEFAULT_MARGIN_CONFIG } from '../margin/marginEngine';
import { marginService } from '../services/marginService';

export function useMarginIntelligence() {
  const [marginConfig, setMarginConfig] = useState<MarginIntelligenceConfig>(DEFAULT_MARGIN_CONFIG);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await marginService.loadMarginConfiguration();
        if (data) {
          setMarginConfig(data);
        }
      } catch (err) {
        console.error('Falha ao obter configurações de margem:', err);
        setError('Carregamento offline: Usando pesos e pisos locais.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const saveConfiguration = async (updated: MarginIntelligenceConfig) => {
    try {
      setMarginConfig(updated);
      await marginService.saveMarginConfiguration(updated);
    } catch (err) {
      console.error('Erro ao gravar configurações de margem:', err);
    }
  };

  return {
    marginConfig,
    loading,
    error,
    saveConfiguration
  };
}
