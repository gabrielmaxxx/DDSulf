/**
 * Geo & Distance Utility for PestFlow
 * Provides city coordinate matrix, Haversine formula, address city resolver, and distance estimation.
 */

export const cityCoordinates: Record<string, [number, number]> = {
  'volta redonda': [-22.5231, -44.1041],
  'barra mansa': [-22.5442, -44.1800],
  'pinheiral': [-22.5122, -44.0003],
  'porto real': [-22.4189, -44.2881],
  'quatis': [-22.4056, -44.2586],
  'resende': [-22.4689, -44.4497],
  'itatiaia': [-22.4961, -44.5619],
  'penedo': [-22.4411, -44.5261],
  'barra do pirai': [-22.4703, -43.8258],
  'pirai': [-22.6289, -43.8972],
  'valenca': [-22.2458, -43.7019],
  'vassouras': [-22.4039, -43.6625],
  'rio das flores': [-22.1678, -43.5853],
  'paty do alferes': [-22.4289, -43.4281],
  'miguel pereira': [-22.4550, -43.4683],
  'engenheiro paulo de frontin': [-22.5514, -43.6806],
  'paulo de frontin': [-22.5514, -43.6806],
  'mendes': [-22.5258, -43.7319],
  'paracambi': [-22.6089, -43.7119],
  'angra dos reis': [-23.0067, -44.3181],
  'angra': [-23.0067, -44.3181],
  'paraty': [-23.2178, -44.7131],
  'mangaratiba': [-22.9597, -44.0408],
  'conceicao de jacarei': [-23.0333, -44.1667],
  'ilha grande': [-23.1450, -44.2320],
  'rio de janeiro': [-22.9068, -43.1729],
  'copacabana': [-22.9711, -43.1825],
  'ipanema': [-22.9836, -43.2044],
  'leblon': [-22.9847, -43.2236],
  'barra da tijuca': [-23.0003, -43.3658],
  'recreio': [-23.0275, -43.4661],
  'campo grande': [-22.9028, -43.5589],
  'bangu': [-22.8753, -43.4658],
  'tijuca': [-22.9256, -43.2358],
  'botafogo': [-22.9511, -43.1808],
  'flamengo': [-22.9328, -43.1764],
  'meier': [-22.9019, -43.2808],
  'madureira': [-22.8719, -43.3361],
  'duque de caxias': [-22.7856, -43.3117],
  'caxias': [-22.7856, -43.3117],
  'nova iguacu': [-22.7592, -43.4511],
  'belford roxo': [-22.7642, -43.3997],
  'sao joao de meriti': [-22.8028, -43.3722],
  'itaguai': [-22.8522, -43.7753],
  'seropedica': [-22.7458, -43.7072],
  'queimados': [-22.7158, -43.5558],
  'japeri': [-22.6439, -43.6533],
  'mesquita': [-22.7819, -43.4319],
  'niteroi': [-22.8833, -43.1036],
  'sao goncalo': [-22.8269, -43.0539],
  'itaborai': [-22.7444, -42.8594],
  'marica': [-22.9194, -42.8186],
  'guapimirim': [-22.5358, -42.9819],
  'mage': [-22.6528, -43.0411],
  'petropolis': [-22.5050, -43.1789],
  'teresopolis': [-22.4122, -42.9656],
  'nova friburgo': [-22.2819, -42.5308],
  'friburgo': [-22.2819, -42.5308],
  'cachoeiras de macacu': [-22.4631, -42.6528],
  'tres rios': [-22.1167, -43.2089],
  'paraiba do sul': [-22.1611, -43.2928],
  'sao jose do vale do rio preto': [-22.1511, -42.9239],
  'carmo': [-21.9328, -42.6089],
  'duas barras': [-22.0519, -42.3908],
  'sumidouro': [-22.0489, -42.6789],
  'cordeiro': [-22.0289, -42.3608],
  'cantagalo': [-21.9819, -42.3689],
  'saquarema': [-22.9200, -42.5100],
  'araruama': [-22.8728, -42.3428],
  'iguaba grande': [-22.8389, -42.1819],
  'sao pedro da aldeia': [-22.8397, -42.1022],
  'cabo frio': [-22.8794, -42.0186],
  'arraial do cabo': [-22.9661, -42.0278],
  'armacao dos buzios': [-22.7469, -41.8817],
  'buzios': [-22.7469, -41.8817],
  'casimiro de abreu': [-22.4800, -42.2000],
  'rio das ostras': [-22.5269, -41.9489],
  'macae': [-22.3708, -41.7869],
  'carapebus': [-22.1858, -41.6628],
  'quissama': [-22.1089, -41.4708],
  'campos dos goytacazes': [-21.7544, -41.3244],
  'campos': [-21.7544, -41.3244],
  'sao joao da barra': [-21.6400, -41.0511],
  'sao francisco de itabapoana': [-21.4700, -41.1189],
  'itaperuna': [-21.2058, -41.8889],
  'santo antonio de padua': [-21.5397, -42.1808],
  'bom jesus do itabapoana': [-21.1419, -41.6789],
  'miracema': [-21.4119, -42.1969],
  'porciuncula': [-20.9628, -42.0408],
  'natividade': [-21.0428, -41.9728],
  'italva': [-21.4289, -41.6919],
  'cambuci': [-21.5758, -41.9108],
  'cardoso moreira': [-21.4889, -41.6158],
};

const neighborhoodOffsets: Record<string, number> = {
  'aterrado': 2.8,
  'retiro': 3.5,
  'vila santa cecilia': 1.8,
  'centro': 1.0,
  'conforto': 2.1,
  'laranjal': 1.2,
  'sessenta': 2.2,
  'jardim amalia': 3.2,
  'casa de pedra': 4.0,
  'voldac': 3.5,
  'belmonte': 4.2,
  'santa cruz': 4.5,
  'santo agostinho': 3.8,
  'niteroi': 2.5,
  'aero clube': 2.8,
  'roma': 4.6,
};

const sortedCityKeys = Object.keys(cityCoordinates).sort((a, b) => b.length - a.length);

export function normalizeStr(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

/**
 * Resolves a city key from a full or partial address string.
 */
export function resolveCityFromAddress(address: string): string | null {
  if (!address) return null;
  const clean = normalizeStr(address);
  for (const cityKey of sortedCityKeys) {
    if (clean.includes(cityKey)) {
      return cityKey;
    }
  }
  return null;
}

/**
 * Calculates Haversine straight-line distance in kilometers between two lat/lng coordinates.
 */
export function haversineKm(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371; // Earth radius in km
  const dLat = (coord2[0] - coord1[0]) * (Math.PI / 180);
  const dLon = (coord2[1] - coord1[1]) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1[0] * (Math.PI / 180)) *
      Math.cos(coord2[0] * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Returns lat/lng coordinates for a given city key or resolves it from address.
 */
export function getCityCoordinates(cityKeyOrAddress: string): [number, number] | null {
  if (!cityKeyOrAddress) return null;
  const clean = normalizeStr(cityKeyOrAddress);
  if (cityCoordinates[clean]) {
    return cityCoordinates[clean];
  }
  const resolvedKey = resolveCityFromAddress(cityKeyOrAddress);
  return resolvedKey ? cityCoordinates[resolvedKey] : null;
}

/**
 * Automatic offline distance estimator between headquarters (sede) and client address using city coordinates and Haversine formula
 */
export function estimateDistanceOffline(hqAddress: string, clientAddress: string): number {
  if (!hqAddress || !clientAddress) return 0;

  const cleanHq = normalizeStr(hqAddress);
  const cleanClient = normalizeStr(clientAddress);

  if (cleanHq === cleanClient) return 0.5;

  const hqCityKey = resolveCityFromAddress(hqAddress);
  const clientCityKey = resolveCityFromAddress(clientAddress);

  const streetHash = clientAddress.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const streetFactor = (streetHash % 19) / 10;

  // Same city case
  if (hqCityKey && clientCityKey && hqCityKey === clientCityKey) {
    let nbOffset = 1.5;
    for (const [nbKey, offset] of Object.entries(neighborhoodOffsets)) {
      if (cleanClient.includes(nbKey)) {
        nbOffset = offset;
        break;
      }
    }
    const sameCityDist = parseFloat((nbOffset + streetFactor).toFixed(2));
    return Math.min(sameCityDist, 4.8);
  }

  const defaultHqCoords: [number, number] = [-22.5231, -44.1041]; // Default HQ Volta Redonda
  const hqCoords = hqCityKey ? cityCoordinates[hqCityKey] : defaultHqCoords;
  const clientCoords = clientCityKey ? cityCoordinates[clientCityKey] : null;

  if (!clientCoords) {
    for (const [nbKey, offset] of Object.entries(neighborhoodOffsets)) {
      if (cleanClient.includes(nbKey)) {
        const localDist = parseFloat((offset + streetFactor).toFixed(2));
        return Math.min(localDist, 4.8);
      }
    }
    return parseFloat((12.5 + streetFactor).toFixed(2));
  }

  const straightLineKm = haversineKm(hqCoords, clientCoords);
  const roadKm = straightLineKm < 20 
    ? straightLineKm * 1.35 + 2.2
    : straightLineKm * 1.10 + 1.2;

  let finalDist = parseFloat((roadKm + streetFactor).toFixed(2));
  if (finalDist <= 0) finalDist = 1.5;

  return finalDist;
}
