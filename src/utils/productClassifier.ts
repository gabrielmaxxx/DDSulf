/**
 * DDSulf Smart Product Classifier & Recognition Engine
 * Handles equivalences, classification, and metadata filling according to DDSulf specifications.
 */

import { auth } from '@/firebase/config';

export interface DDSulfOfficialProduct {
  name: string;
  productGroup: 'Inseticidas' | 'Raticidas' | 'Formicidas' | 'Gel Baraticida' | 'Iscas' | 'Equipamentos' | 'EPIs' | 'Consumíveis';
  chemicalGroup: string;
  activeIngredient: string;
  supplier: string;
  unit: 'ml' | 'g' | 'kg' | 'L' | 'unidade';
  categoryCode: 'inseticida' | 'raticida' | 'formicida' | 'gel_baraticida' | 'iscas' | 'equipamentos' | 'epi' | 'consumiveis' | 'outros';
}

export const DDSULF_OFFICIAL_PRODUCTS: DDSulfOfficialProduct[] = [
  {
    name: 'DEVETION CE',
    productGroup: 'Inseticidas',
    chemicalGroup: 'Organofosforado',
    activeIngredient: 'Diclorvós',
    supplier: 'Devel',
    unit: 'ml',
    categoryCode: 'inseticida'
  },
  {
    name: 'DDVP 1000 CE',
    productGroup: 'Inseticidas',
    chemicalGroup: 'Organofosforado',
    activeIngredient: 'Diclorvós',
    supplier: 'Kelldrin',
    unit: 'ml',
    categoryCode: 'inseticida'
  },
  {
    name: 'DDVP 1000 CE DOSADOR',
    productGroup: 'Inseticidas',
    chemicalGroup: 'Organofosforado',
    activeIngredient: 'Diclorvós',
    supplier: 'Kelldrin',
    unit: 'ml',
    categoryCode: 'inseticida'
  },
  {
    name: 'BIFENTOL 200 SC',
    productGroup: 'Inseticidas',
    chemicalGroup: 'Piretróide',
    activeIngredient: 'Bifentrina',
    supplier: 'Rogama',
    unit: 'ml',
    categoryCode: 'inseticida'
  },
  {
    name: 'FENDONA 6 SC',
    productGroup: 'Inseticidas',
    chemicalGroup: 'Piretróide',
    activeIngredient: 'Alfacipermetrina',
    supplier: 'BASF',
    unit: 'ml',
    categoryCode: 'inseticida'
  },
  {
    name: 'TENOPA',
    productGroup: 'Inseticidas',
    chemicalGroup: 'Piretróide',
    activeIngredient: 'Alfacipermetrina',
    supplier: 'BASF',
    unit: 'ml',
    categoryCode: 'inseticida'
  },
  {
    name: 'TERMIDOR 25 CE',
    productGroup: 'Inseticidas',
    chemicalGroup: 'Fenilpirazole',
    activeIngredient: 'Fipronil',
    supplier: 'BASF',
    unit: 'ml',
    categoryCode: 'inseticida'
  },
  {
    name: 'BLATUM GEL',
    productGroup: 'Gel Baraticida',
    chemicalGroup: 'Fenilpirazole',
    activeIngredient: 'Fipronil',
    supplier: 'Bayer',
    unit: 'g',
    categoryCode: 'gel_baraticida'
  },
  {
    name: 'OPTIGARD LT',
    productGroup: 'Formicidas',
    chemicalGroup: 'Neonicotinóide',
    activeIngredient: 'Tiametoxam',
    supplier: 'Syngenta',
    unit: 'ml',
    categoryCode: 'formicida'
  },
  {
    name: 'OPTIGARD LT WG',
    productGroup: 'Formicidas',
    chemicalGroup: 'Neonicotinóide',
    activeIngredient: 'Tiametoxam',
    supplier: 'Syngenta',
    unit: 'g',
    categoryCode: 'formicida'
  },
  {
    name: 'MAX FORCE PRIME',
    productGroup: 'Gel Baraticida',
    chemicalGroup: 'Neonicotinóide',
    activeIngredient: 'Imidacloprido',
    supplier: 'Bayer',
    unit: 'g',
    categoryCode: 'gel_baraticida'
  },
  {
    name: 'MAX FORCE QUANTUM',
    productGroup: 'Formicidas',
    chemicalGroup: 'Neonicotinóide',
    activeIngredient: 'Imidacloprido',
    supplier: 'Bayer',
    unit: 'g',
    categoryCode: 'formicida'
  },
  {
    name: 'RATOL GRANULADO GS',
    productGroup: 'Raticidas',
    chemicalGroup: 'Cumarínico',
    activeIngredient: 'Brodifacoum',
    supplier: 'Rogama',
    unit: 'g',
    categoryCode: 'raticida'
  },
  {
    name: 'RATOL BLOCO PARAFINADO',
    productGroup: 'Raticidas',
    chemicalGroup: 'Cumarínico',
    activeIngredient: 'Brodifacoum',
    supplier: 'Rogama',
    unit: 'g',
    categoryCode: 'raticida'
  },
  {
    name: 'BEQUIRAT',
    productGroup: 'Raticidas',
    chemicalGroup: 'Cumarínico',
    activeIngredient: 'Brodifacoum',
    supplier: 'Bequisa',
    unit: 'g',
    categoryCode: 'raticida'
  },
  {
    name: 'RATOL PÓ DE CONTATO',
    productGroup: 'Raticidas',
    chemicalGroup: 'Cumarínico',
    activeIngredient: 'Cumatetralil',
    supplier: 'Rogama',
    unit: 'g',
    categoryCode: 'raticida'
  },
  {
    name: 'RATOL 750 PO',
    productGroup: 'Raticidas',
    chemicalGroup: 'Cumarínico',
    activeIngredient: 'Cumatetralil',
    supplier: 'Rogama',
    unit: 'g',
    categoryCode: 'raticida'
  },
  {
    name: 'FULMIPRAG F3',
    productGroup: 'Inseticidas',
    chemicalGroup: 'Piretróide',
    activeIngredient: 'Deltametrina',
    supplier: 'Rogama',
    unit: 'ml',
    categoryCode: 'inseticida'
  },
  {
    name: 'CYPEREX 2 PS',
    productGroup: 'Inseticidas',
    chemicalGroup: 'Piretróide',
    activeIngredient: 'Deltametrina',
    supplier: 'Rogama',
    unit: 'g',
    categoryCode: 'inseticida'
  },
  {
    name: 'VECTRON 10 SC',
    productGroup: 'Inseticidas',
    chemicalGroup: 'Piretróide éter',
    activeIngredient: 'Etofenproxi',
    supplier: 'Rogama',
    unit: 'ml',
    categoryCode: 'inseticida'
  },
  {
    name: 'LANKRON 2,5 ME',
    productGroup: 'Inseticidas',
    chemicalGroup: 'Piretróide',
    activeIngredient: 'Lambda-Cialotrina',
    supplier: 'Rogama',
    unit: 'ml',
    categoryCode: 'inseticida'
  },
  {
    name: 'DDVP / DICLORVÓS',
    productGroup: 'Inseticidas',
    chemicalGroup: 'Organofosforado',
    activeIngredient: 'Diclorvós',
    supplier: 'DDSulf Consolidado',
    unit: 'ml',
    categoryCode: 'inseticida'
  }
];

export interface SmartMatchResult {
  isOfficialMatch: boolean;
  officialProduct?: DDSulfOfficialProduct;
  familyMatchedName?: string; // e.g. "Família Optigard", "Família Ratol", "Família DDVP"
  suggestedAction: 'exact_alias' | 'family_merge' | 'new_item';
  similarity: number;
  classification: {
    productGroup: string;
    chemicalGroup: string;
    activeIngredient: string;
    supplier: string;
    unit: string;
    categoryCode: string;
  };
}

/**
 * Normalizes string for proper comparisons
 */
export function normalizeString(str: string): string {
  return str
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[.\-/]/g, ' ') // replace dots, slashes with spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates deterministic percentage similarity based on Levenshtein Distance
 */
export function getSimilarityScore(str1: string, str2: string): number {
  const s1 = normalizeString(str1);
  const s2 = normalizeString(str2);
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;
  
  const track = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
  for (let i = 0; i <= s1.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= s2.length; j += 1) track[j][0] = j;
  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  const maxLen = Math.max(s1.length, s2.length);
  return (maxLen - track[s2.length][s1.length]) / maxLen;
}

/**
 * Maps variations into canonical names according to user specs
 */
export function getCanonicalProduct(nameInput: string): { canonicalName: string; similarity: number } | null {
  const normInput = normalizeString(nameInput);
  
  const synonymMappings: Record<string, string[]> = {
    'DDVP / DICLORVÓS': [
      'DDVP 1000 CE', 
      'DDVP 1000 CE DOSADOR', 
      'DDVP DOSADOR', 
      'DEVETION CE', 
      'DICLORVOS', 
      'DDVP 1000CE',
      'DDVP'
    ],
    'OPTIGARD LT': [
      'OPTIGARD LT', 
      'OPTIGARD LT WG', 
      'OPTIGARD WG',
      'OPTIGARD'
    ],
    'FENDONA 6 SC': [
      'FENDONA 6 SC', 
      'FENDONA6 SC', 
      'FENDONA'
    ],
    'BIFENTOL 200 SC': [
      'BIFENTOL 200 SC', 
      'BIFENTOL 200SC', 
      'BIFENTOL'
    ],
    'RATOL BLOCO PARAFINADO': [
      'RATOL BLOCO', 
      'RATOL BLOCO 20G', 
      'RATOL BLOCO PARAFINADO'
    ],
    'RATOL PÓ DE CONTATO': [
      'RATOL PO', 
      'RATOL PO DE CONTATO', 
      'RATOL PÓ', 
      'RATOL PÓ DE CONTATO', 
      'RATOL 750 PO', 
      'RATOL 750 PÓ'
    ],
    'FORMITEK GEL': [
      'FORMITEK', 
      'FORMITEK GEL', 
      'FORMITEK 10G'
    ],
    'MAX FORCE PRIME': [
      'MAXFORCE PRIME', 
      'MAX FORCE PRIME', 
      'MAXFORCE'
    ],
    'MAX FORCE QUANTUM': [
      'MAXFORCE QUANTUM', 
      'MAX FORCE QUANTUM'
    ]
  };

  // 1. Check exact match in synonyms list (full word match)
  for (const [canonical, aliases] of Object.entries(synonymMappings)) {
    for (const alias of aliases) {
      if (normalizeString(alias) === normInput) {
        return { canonicalName: canonical, similarity: 1.0 };
      }
    }
  }

  // 2. Check substring match in synonyms list
  for (const [canonical, aliases] of Object.entries(synonymMappings)) {
    for (const alias of aliases) {
      const normAlias = normalizeString(alias);
      if (normInput.includes(normAlias) || normAlias.includes(normInput)) {
        return { canonicalName: canonical, similarity: 0.90 };
      }
    }
  }

  // 3. Fallback to Levenshtein similarity calculation
  let bestMatch: { canonicalName: string; similarity: number } | null = null;
  
  // Check against official products
  for (const official of DDSULF_OFFICIAL_PRODUCTS) {
    const score = getSimilarityScore(nameInput, official.name);
    if (score > 0.80 && (!bestMatch || score > bestMatch.similarity)) {
      bestMatch = { canonicalName: official.name, similarity: score };
    }
  }

  // Check against all known synonyms to find the best mapping
  for (const [canonical, aliases] of Object.entries(synonymMappings)) {
    for (const alias of aliases) {
      const score = getSimilarityScore(nameInput, alias);
      if (score > 0.80 && (!bestMatch || score > bestMatch.similarity)) {
        bestMatch = { canonicalName: canonical, similarity: score };
      }
    }
  }

  return bestMatch;
}

/**
 * Scans a product name and matches it semantic-wise to DDSulf rules
 */
export function scanProductSmartly(name: string, quantity: number = 0, costPerUnit: number = 0, manufacturerInput?: string): SmartMatchResult {
  const norm = normalizeString(name);
  
  // 1. Resolve canonical mapping first
  const canonicalResolution = getCanonicalProduct(name);
  if (canonicalResolution && canonicalResolution.similarity >= 0.80) {
    const canonicalName = canonicalResolution.canonicalName;
    const matchedOfficial = DDSULF_OFFICIAL_PRODUCTS.find(p => normalizeString(p.name) === normalizeString(canonicalName)) || DDSULF_OFFICIAL_PRODUCTS.find(p => p.name === 'DDVP / DICLORVÓS')!;
    
    // Determine whether to suggest unifications / merges or exact alias
    let suggestedAction: 'exact_alias' | 'family_merge' | 'new_item' = 'exact_alias';
    let familyMatchedName = undefined;

    if (canonicalName.includes('RATOL')) {
      suggestedAction = 'family_merge';
      familyMatchedName = 'Família Ratol';
    } else if (canonicalName.includes('DDVP') || canonicalName.includes('DEVETION')) {
      suggestedAction = 'family_merge';
      familyMatchedName = 'Família DDVP';
    } else if (canonicalName.includes('OPTIGARD')) {
      suggestedAction = 'exact_alias';
      familyMatchedName = 'Família Optigard';
    }

    return {
      isOfficialMatch: true,
      officialProduct: matchedOfficial,
      familyMatchedName,
      suggestedAction,
      similarity: canonicalResolution.similarity,
      classification: {
        productGroup: matchedOfficial.productGroup,
        chemicalGroup: matchedOfficial.chemicalGroup,
        activeIngredient: matchedOfficial.activeIngredient,
        supplier: matchedOfficial.supplier,
        unit: matchedOfficial.unit,
        categoryCode: matchedOfficial.categoryCode
      }
    };
  }

  // 2. Not directly an official product, let's auto-heuristics classify it based on rules:
  // INSETICIDAS: BIFENTOL, DDVP, DEVETION, FENDONA, TENOPA, TERMIDOR, FULMIPRAG, CYPEREX, VECTRON, LANKRON
  // FORMICIDAS: OPTIGARD, FORMITEK, MAX FORCE QUANTUM
  // GEL BARATICIDA: BLATUM, MAX FORCE PRIME
  // RATICIDAS: RATOL, BEQUIRAT
  
  let suggestedGroup: 'Inseticidas' | 'Raticidas' | 'Formicidas' | 'Gel Baraticida' | 'Iscas' | 'Equipamentos' | 'EPIs' | 'Consumíveis' = 'Consumíveis';
  let suggestedCategory: 'inseticida' | 'raticida' | 'formicida' | 'gel_baraticida' | 'iscas' | 'equipamentos' | 'epi' | 'consumiveis' | 'outros' = 'outros';
  let activeIngredient = 'NÃO ESPECIFICADO';
  let chemicalGroup = 'NÃO ESPECIFICADO';
  let unit: 'ml' | 'g' | 'kg' | 'L' | 'unidade' = 'unidade';

  // Unit recognition
  const lower = name.toLowerCase();
  if (lower.includes(' ml') || lower.includes('ml ') || lower.endsWith('ml')) {
    unit = 'ml';
  } else if (lower.includes(' kg') || lower.includes('kg ') || lower.endsWith('kg')) {
    unit = 'kg';
  } else if (lower.includes(' l ') || lower.includes('litro') || lower.endsWith('l') || lower.includes(' l')) {
    unit = 'L';
  } else if (lower.includes(' g ') || lower.includes('grama') || lower.endsWith('g') || lower.includes(' g')) {
    unit = 'g';
  }

  // Exact Match against user classification guidelines:
  // Inseticidas
  if (norm.includes('BIFENTOL') || norm.includes('DDVP') || norm.includes('DEVETION') || norm.includes('FENDONA') || norm.includes('TENOPA') || norm.includes('TERMIDOR') || norm.includes('FULMIPRAG') || norm.includes('CYPEREX') || norm.includes('VECTRON') || norm.includes('LANKRON')) {
    suggestedGroup = 'Inseticidas';
    suggestedCategory = 'inseticida';
    if (norm.includes('BIFENTOL')) { activeIngredient = 'Bifentrina'; chemicalGroup = 'Piretróide'; }
    else if (norm.includes('DDVP') || norm.includes('DEVETION')) { activeIngredient = 'Diclorvós'; chemicalGroup = 'Organofosforado'; }
    else if (norm.includes('FENDONA')) { activeIngredient = 'Alfacipermetrina'; chemicalGroup = 'Piretróide'; }
    else if (norm.includes('TENOPA')) { activeIngredient = 'Alfacipermetrina'; chemicalGroup = 'Piretróide'; }
    else if (norm.includes('TERMIDOR')) { activeIngredient = 'Fipronil'; chemicalGroup = 'Fenilpirazole'; }
    else if (norm.includes('FULMIPRAG')) { activeIngredient = 'Deltametrina'; chemicalGroup = 'Piretróide'; }
    else if (norm.includes('CYPEREX')) { activeIngredient = 'Deltametrina'; chemicalGroup = 'Piretróide'; }
    else if (norm.includes('LANKRON')) { activeIngredient = 'Lambda-Cialotrina'; chemicalGroup = 'Piretróide'; }
    else if (norm.includes('VECTRON')) { activeIngredient = 'Etofenproxi'; chemicalGroup = 'Piretróide éter'; }
  } 
  // Formicidas
  else if (norm.includes('OPTIGARD') || norm.includes('FORMITEK') || norm.includes('MAX FORCE QUANTUM') || norm.includes('MAXFORCE QUANTUM')) {
    suggestedGroup = 'Formicidas';
    suggestedCategory = 'formicida';
    if (norm.includes('OPTIGARD')) { activeIngredient = 'Tiametoxam'; chemicalGroup = 'Neonicotinóide'; }
    else if (norm.includes('FORMITEK')) { activeIngredient = 'Fipronil'; chemicalGroup = 'Fenilpirazole'; }
    else if (norm.includes('QUANTUM')) { activeIngredient = 'Imidacloprido'; chemicalGroup = 'Neonicotinóide'; }
  }
  // Gel Baraticida
  else if (norm.includes('BLATUM') || norm.includes('MAX FORCE PRIME') || norm.includes('MAXFORCE PRIME')) {
    suggestedGroup = 'Gel Baraticida';
    suggestedCategory = 'gel_baraticida';
    if (norm.includes('BLATUM')) { activeIngredient = 'Fipronil'; chemicalGroup = 'Fenilpirazole'; }
    else { activeIngredient = 'Imidacloprido'; chemicalGroup = 'Neonicotinóide'; }
  }
  // Raticidas
  else if (norm.includes('RATOL') || norm.includes('BEQUIRAT')) {
    suggestedGroup = 'Raticidas';
    suggestedCategory = 'raticida';
    if (norm.includes('RATOL PÓ DE CONTATO') || norm.includes('RATOL PÓ') || norm.includes('RATOL 750 PO') || norm.includes('750 PO')) {
      activeIngredient = 'Cumatetralil';
      chemicalGroup = 'Cumarínico';
    } else {
      activeIngredient = 'Brodifacoum';
      chemicalGroup = 'Cumarínico';
    }
  }
  // Generic heuristics matchings
  else if (lower.includes('inseticida') || lower.includes('barata') || lower.includes('inseto') || lower.includes('k-othrine') || lower.includes('calda')) {
    suggestedGroup = 'Inseticidas';
    suggestedCategory = 'inseticida';
  } else if (lower.includes('raticida') || lower.includes('iscos') || lower.includes('rato') || lower.includes('roedor') || lower.includes('bloco') || lower.includes('granu') || lower.includes('isca')) {
    suggestedGroup = 'Raticidas';
    suggestedCategory = 'raticida';
    activeIngredient = 'Brodifacoum';
    chemicalGroup = 'Cumarínico';
  } else if (lower.includes('formiga') || lower.includes('formicida')) {
    suggestedGroup = 'Formicidas';
    suggestedCategory = 'formicida';
  } else if (lower.includes('gel') || lower.includes('bisnaga')) {
    suggestedGroup = 'Gel Baraticida';
    suggestedCategory = 'gel_baraticida';
  } else if (lower.includes('porta isca') || lower.includes('porta-isca') || lower.includes('cocho')) {
    suggestedGroup = 'Iscas';
    suggestedCategory = 'iscas';
  } else if (lower.includes('pulverizador') || lower.includes('atomizador') || lower.includes('bomba') || lower.includes('termonebulizador')) {
    suggestedGroup = 'Equipamentos';
    suggestedCategory = 'equipamentos';
  } else if (lower.includes('luva') || lower.includes('mascara') || lower.includes('oculos') || lower.includes('capacet') || lower.includes('bota') || lower.includes('epi')) {
    suggestedGroup = 'EPIs';
    suggestedCategory = 'epi';
  } else if (lower.includes('pilha') || lower.includes('fita') || lower.includes('saco') || lower.includes('filtro')) {
    suggestedGroup = 'Consumíveis';
    suggestedCategory = 'consumiveis';
  }

  return {
    isOfficialMatch: false,
    suggestedAction: 'new_item',
    similarity: 0.0,
    classification: {
      productGroup: suggestedGroup,
      chemicalGroup,
      activeIngredient,
      supplier: manufacturerInput || 'Desconhecido',
      unit,
      categoryCode: suggestedCategory
    }
  };
}

/**
 * Executes a simulated or automated AI call via process.env standard to refine classification
 * and extract active ingredients if they are completely missing or unknown.
 */
export async function queryAIForProducts(productsToRefine: Array<{ name: string; supplier?: string }>): Promise<Array<{
  name: string;
  productGroup: string;
  chemicalGroup: string;
  activeIngredient: string;
  categoryCode: string;
}>> {
  try {
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : undefined;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/ai/ddsulf-chat', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: `Por favor, classifique os seguintes produtos recebidos para o estoque da DDSulf. Retorne um array JSON com dados estruturados.
Produtos recebidos: ${JSON.stringify(productsToRefine)}

Grupos de Produto permitidos: 'Inseticidas', 'Raticidas', 'Formicidas', 'Gel Baraticida', 'Iscas', 'Equipamentos', 'EPIs', 'Consumíveis'
categoryCode correspondentes: 'inseticida', 'raticida', 'formicida', 'gel_baraticida', 'iscas', 'equipamentos', 'epi', 'consumiveis', 'outros'

Regra: Identifique o Princípio Ativo (se houver, ex: Brodifacoum, Fipronil) e Grupo Químico (ex: Piretróide, Cumarínico). Se for Equipamento, EPI ou Consumível coloque "Não aplicável" nos campos químicos.

Formato esperado do JSON (retorne APENAS o array JSON, sem markdown):
[
  { "name": "Nome", "productGroup": "Grupo", "chemicalGroup": "Grupo Químico", "activeIngredient": "Princípio Ativo", "categoryCode": "code" }
]`,
        systemContext: 'Você é o assistente de inteligência e taxonomia de insumos biológicos e químicos da DDSulf. Sempre responda apenas com formato JSON de array puro sem marcação markdown.'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      let text = result.text || '';
      // clean output
      text = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("AI Classification refined offline/fallback:", err);
  }
  
  // Return heuristics matches
  return productsToRefine.map(p => {
    const scanning = scanProductSmartly(p.name, 0, 0, p.supplier);
    return {
      name: p.name,
      productGroup: scanning.classification.productGroup,
      chemicalGroup: scanning.classification.chemicalGroup,
      activeIngredient: scanning.classification.activeIngredient,
      categoryCode: scanning.classification.categoryCode
    };
  });
}

/**
 * Automatically classifies a financial movement based on its description & value.
 * Group names are: 'RECEITAS' | 'CUSTOS DIRETOS' | 'DESPESAS OPERACIONAIS' | 'DESPESAS ADMINISTRATIVAS' | 'DESPESAS FINANCEIRAS' | 'IMPOSTOS'
 * Subcategory names conform to groups as requested.
 */
export interface ClassifiedFinancialMovement {
  category: 'RECEITAS' | 'CUSTOS DIRETOS' | 'DESPESAS OPERACIONAIS' | 'DESPESAS ADMINISTRATIVAS' | 'DESPESAS FINANCEIRAS' | 'IMPOSTOS' | 'OUTROS';
  subcategory: string;
  isDespesa: boolean;
}

export function classifyFinancialMovement(description: string, value?: number): ClassifiedFinancialMovement {
  const norm = description.toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // 1. AI Rule-based exact & substring matchings
  if (norm.includes('BIFENTOL') || norm.includes('OPTIGARD')) {
    return { category: 'CUSTOS DIRETOS', subcategory: 'Produtos Químicos', isDespesa: true };
  }
  if (norm.includes('META ADS') || norm.includes('GOOGLE ADS') || norm.includes('FACEBOOK ADS') || norm.includes('MARKETING') || norm.includes('DIVULGACAO')) {
    return { category: 'DESPESAS OPERACIONAIS', subcategory: 'Marketing', isDespesa: true };
  }
  if (norm.includes('PARCELA BANCO') || norm.includes('EMPRESTIMO') || norm.includes('FINANCIAMENTO') || norm.includes('AMORTIZACAO') || norm.includes('AMORTIZACAO BANCO')) {
    return { category: 'DESPESAS FINANCEIRAS', subcategory: 'Empréstimos', isDespesa: true };
  }
  if (norm.includes('FOLHA DE PAGAMENTO') || norm.includes('SALARIO') || norm.includes('SALARIOS') || norm.includes('COMISSÃO') || norm.includes('COMISSAO') || norm.includes('FOLHA')) {
    return { category: 'DESPESAS OPERACIONAIS', subcategory: 'Salários', isDespesa: true };
  }
  if (norm.includes('FGTS')) {
    return { category: 'DESPESAS OPERACIONAIS', subcategory: 'Encargos', isDespesa: true };
  }
  if (norm.includes('INSS')) {
    return { category: 'DESPESAS OPERACIONAIS', subcategory: 'Encargos', isDespesa: true };
  }
  if (norm.includes('COMBUSTIVEL') || norm.includes('POSTO') || norm.includes('GASOLINA') || norm.includes('DIESEL') || norm.includes('ABASTECIMENTO')) {
    return { category: 'DESPESAS OPERACIONAIS', subcategory: 'Combustível', isDespesa: true };
  }
  if (norm.includes('PRO-LABORE') || norm.includes('PRO LABORE') || norm.includes('RETIRADA SOCIO')) {
    return { category: 'DESPESAS OPERACIONAIS', subcategory: 'Pró-labore', isDespesa: true };
  }

  // 2. Generic heuristics matchings
  // RECEITAS
  if (norm.includes('DEDETIZACAO') || norm.includes('CONTRATO DEDETIZACAO') || norm.includes('DEDETIZADORA')) {
    return { category: 'RECEITAS', subcategory: 'Dedetização', isDespesa: false };
  }
  if (norm.includes('DESRATIZACAO') || norm.includes('RATO') || norm.includes('ROEDOR')) {
    return { category: 'RECEITAS', subcategory: 'Desratização', isDespesa: false };
  }
  if (norm.includes('DESCUPINIZACAO') || norm.includes('CUPIM') || norm.includes('CUPINS')) {
    return { category: 'RECEITAS', subcategory: 'Descupinização', isDespesa: false };
  }
  if (norm.includes('SANITIZACAO') || norm.includes('AMONIA') || norm.includes('DESINFECCAO')) {
    return { category: 'RECEITAS', subcategory: 'Sanitização', isDespesa: false };
  }
  if (norm.includes('CONTRATO MENSAL') || norm.includes('MENSALIDADE') || norm.includes('RECORRENTE')) {
    return { category: 'RECEITAS', subcategory: 'Contratos Mensais', isDespesa: false };
  }
  if (norm.includes('CONTRATO ANUAL') || norm.includes('ANUIDADE') || norm.includes('CORPORATIVO')) {
    return { category: 'RECEITAS', subcategory: 'Contratos Anuais', isDespesa: false };
  }

  // CUSTOS DIRETOS
  if (norm.includes('PRODUTOS QUIMICOS') || norm.includes('QUIMICO') || norm.includes('INSUMO') || norm.includes('INSETO') || norm.includes('VENENO')) {
    return { category: 'CUSTOS DIRETOS', subcategory: 'Produtos Químicos', isDespesa: true };
  }
  if (norm.includes('RATICIDA') || norm.includes('ISCA') || norm.includes('CEBOLA') || norm.includes('PORTA ISCA')) {
    return { category: 'CUSTOS DIRETOS', subcategory: 'Iscas', isDespesa: true };
  }
  if (norm.includes('GEL BARATICIDA') || norm.includes('BLATUM GEL') || norm.includes('SERINGA GEL')) {
    return { category: 'CUSTOS DIRETOS', subcategory: 'Gel Baraticida', isDespesa: true };
  }
  if (norm.includes('EQUIPAMENTO') || norm.includes('PULVERIZADOR') || norm.includes('ATOMIZADOR') || norm.includes('MARCA') || norm.includes('BOMBA')) {
    return { category: 'CUSTOS DIRETOS', subcategory: 'Equipamentos', isDespesa: true };
  }
  if (norm.includes('EPI') || norm.includes('LUVA') || norm.includes('MASCARA') || norm.includes('SINALIZACAO') || norm.includes('OCULOS DE SEGURANCA')) {
    return { category: 'CUSTOS DIRETOS', subcategory: 'EPIs', isDespesa: true };
  }
  if (norm.includes('UNIFORME') || norm.includes('FALDA') || norm.includes('CAMISA') || norm.includes('CALCA')) {
    return { category: 'CUSTOS DIRETOS', subcategory: 'Uniformes', isDespesa: true };
  }

  // DESPESAS OPERACIONAIS
  if (norm.includes('PEDAGIO') || norm.includes('SEM PARAR') || norm.includes('VIA FACIL')) {
    return { category: 'DESPESAS OPERACIONAIS', subcategory: 'Pedágios', isDespesa: true };
  }
  if (norm.includes('MANUTENCAO DE VEICULOS') || norm.includes('REVISAO VEICULO') || norm.includes('PNEU') || norm.includes('REVISAO CARRO') || norm.includes('OFICINA MECHANICAL')) {
    return { category: 'DESPESAS OPERACIONAIS', subcategory: 'Manutenção de Veículos', isDespesa: true };
  }
  if (norm.includes('TELEFONIA') || norm.includes('VIVO TELEFONE') || norm.includes('CLARO TELEFONE') || norm.includes('TIM CHIP')) {
    return { category: 'DESPESAS OPERACIONAIS', subcategory: 'Telefonia', isDespesa: true };
  }
  if (norm.includes('INTERNET') || norm.includes('FIBRA OPTICA') || norm.includes('ROUTER') || norm.includes('MENSALIDADE INTERNET')) {
    return { category: 'DESPESAS OPERACIONAIS', subcategory: 'Internet', isDespesa: true };
  }

  // DESPESAS ADMINISTRATIVAS
  if (norm.includes('ALUGUEL') || norm.includes('LOCACAO SEDE') || norm.includes('IMOBILIARIA')) {
    return { category: 'DESPESAS ADMINISTRATIVAS', subcategory: 'Aluguel', isDespesa: true };
  }
  if (norm.includes('ENERGIA') || norm.includes('COPEL') || norm.includes('EQUATORIAL') || norm.includes('ENEL') || norm.includes('LUZ')) {
    return { category: 'DESPESAS ADMINISTRATIVAS', subcategory: 'Energia', isDespesa: true };
  }
  if (norm.includes('AGUA') || norm.includes('SABESP') || norm.includes('SANEPAR') || norm.includes('COPASA') || norm.includes('SANEAMENTO')) {
    return { category: 'DESPESAS ADMINISTRATIVAS', subcategory: 'Água', isDespesa: true };
  }
  if (norm.includes('MATERIAL DE ESCRITORIO') || norm.includes('PAPEL') || norm.includes('SULFITE') || norm.includes('CANETAS')) {
    return { category: 'DESPESAS ADMINISTRATIVAS', subcategory: 'Material de Escritório', isDespesa: true };
  }
  if (norm.includes('SISTEMA') || norm.includes('SOFTWARES') || norm.includes('LICENCA ERP') || norm.includes('SISTEMAS')) {
    return { category: 'DESPESAS ADMINISTRATIVAS', subcategory: 'Sistemas', isDespesa: true };
  }
  if (norm.includes('CONTABILIDADE') || norm.includes('HONORARIOS CONTADOR') || norm.includes('ESCRITORIO CONTABIL')) {
    return { category: 'DESPESAS ADMINISTRATIVAS', subcategory: 'Contabilidade', isDespesa: true };
  }

  // DESPESAS FINANCEIRAS
  if (norm.includes('JUROS') || norm.includes('MULTA ATRASO') || norm.includes('JUROS MORA')) {
    return { category: 'DESPESAS FINANCEIRAS', subcategory: 'Juros', isDespesa: true };
  }
  if (norm.includes('TARIFA BANCARIA') || norm.includes('TARIFA CNPJ') || norm.includes('MANUTENCAO CONTA') || norm.includes('TARIFAS BANCARIAS')) {
    return { category: 'DESPESAS FINANCEIRAS', subcategory: 'Tarifas Bancárias', isDespesa: true };
  }

  // IMPOSTOS
  if (norm.includes('SIMPLES NACIONAL') || norm.includes('DRE DAS') || norm.includes('DAS SIMPLES') || norm.includes('PAGAMENTO DAS')) {
    return { category: 'IMPOSTOS', subcategory: 'Simples Nacional', isDespesa: true };
  }
  if (norm.includes('TAXA MUNICIPAL') || norm.includes('ALVARA') || norm.includes('ISS') || norm.includes('ISSQN') || norm.includes('VIGILANCIA SANITARIA')) {
    return { category: 'IMPOSTOS', subcategory: 'Taxas Municipais', isDespesa: true };
  }
  if (norm.includes('TAXA ESTADUAL') || norm.includes('ICMS') || norm.includes('TAXAS ESTADUAIS')) {
    return { category: 'IMPOSTOS', subcategory: 'Taxas Estaduais', isDespesa: true };
  }

  // Fallback depending on input sign of value
  const isNeg = value !== undefined ? value < 0 : true;
  if (!isNeg) {
    return { category: 'RECEITAS', subcategory: 'Dedetização', isDespesa: false };
  }
  return { category: 'DESPESAS OPERACIONAIS', subcategory: 'Internet', isDespesa: true };
}
