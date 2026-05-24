/**
 * Custom React Hook: useCustomerRecommendations
 * Feeds localized pest actions schedules and seasonal chemical treatment recommendations.
 */

import { useState, useEffect } from 'react';
import { useCustomerPortal } from './useCustomerPortal';

export interface SeasonalRecommendation {
  id: string;
  title: string;
  pestTarget: string;
  urgency: 'high' | 'medium' | 'low';
  chemicalFormulaSuggested: string;
  rationale: string;
}

export function useCustomerRecommendations() {
  const { activeProfile } = useCustomerPortal();
  const [recommendations, setRecommendations] = useState<SeasonalRecommendation[]>([]);

  useEffect(() => {
    if (!activeProfile) return;

    // Generate smart environmental suggestions depending on customer segment
    const list: SeasonalRecommendation[] = [];

    if (activeProfile.segment === 'industrial') {
      list.push({
        id: 'rec_01',
        title: 'Manejo Preventivo de Silos e Armazéns',
        pestTarget: 'Roedores de Grãos & Traças de Cereais',
        urgency: 'high',
        chemicalFormulaSuggested: 'Deltametrina SC25 + Polvilhamento Seco',
        rationale: 'Estação fria eleva a migração de pequenos roedores para silos termotratados.'
      });
    } else if (activeProfile.segment === 'residential') {
      list.push({
        id: 'rec_02',
        title: 'Controle de Insetos Rasteiros de Dreno',
        pestTarget: 'Barata Americana (Periplaneta)',
        urgency: 'medium',
        chemicalFormulaSuggested: 'Gel Isca Neonicotinóide + Pulverização Líquida Fendona',
        rationale: 'Retorno cíclico por encanamentos de condomínio requer reforço trimestral de barreiras.'
      });
    } else {
      list.push({
        id: 'rec_03',
        title: 'Combate e Imunização Preventiva',
        pestTarget: 'Cupim de Solo (Coptotermes)',
        urgency: 'high',
        chemicalFormulaSuggested: 'Fipronil Injetável de Alta Saturação',
        rationale: 'Detectada alta proliferação regional próxima a canais fluviais suburbanos.'
      });
    }

    setRecommendations(list);
  }, [activeProfile]);

  return {
    recommendations,
    activeClientSegment: activeProfile?.segment || 'residential'
  };
}

export default useCustomerRecommendations;
