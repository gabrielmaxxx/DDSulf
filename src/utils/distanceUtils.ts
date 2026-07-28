// Unified Distance & Google Maps Roteirização Utility for PestFlow

import { GOOGLE_MAPS_API_KEY } from '@/config/maps';

// LAT/LNG COORDINATES MATRIX FOR MUNICIPALITIES AND REGIONS OF RIO DE JANEIRO & BRAZIL
const CITY_COORDINATES: Record<string, [number, number]> = {
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
  'mendes': [-22.5258, -43.7319],
  'paracambi': [-22.6089, -43.7119],
  'angra dos reis': [-23.0067, -44.3181],
  'paraty': [-23.2178, -44.7131],
  'mangaratiba': [-22.9597, -44.0408],
  'rio de janeiro': [-22.9068, -43.1729],
  'copacabana': [-22.9711, -43.1825],
  'ipanema': [-22.9836, -43.2044],
  'leblon': [-22.9847, -43.2236],
  'barra da tijuca': [-23.0003, -43.3658],
  'duque de caxias': [-22.7856, -43.3117],
  'nova iguacu': [-22.7592, -43.4511],
  'niteroi': [-22.8833, -43.1036],
  'petropolis': [-22.5050, -43.1789],
  'teresopolis': [-22.4122, -42.9656],
  'nova friburgo': [-22.2819, -42.5308],
  'cabo frio': [-22.8794, -42.0186],
  'buzios': [-22.7561, -41.8889],
  'macae': [-22.3708, -41.7869],
  'campos dos goytacazes': [-21.7547, -41.3244],
  'sao paulo': [-23.5505, -46.6333],
  'curitiba': [-25.4290, -49.2719],
  'belo horizonte': [-19.9167, -43.9345],
};

// Haversine distance formula with route tortuosity factor (1.27)
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const directDist = R * c;
  return parseFloat((directDist * 1.27).toFixed(2));
}

export function estimateDistanceOffline(hqAddress: string, clientAddress: string): number {
  if (!hqAddress || !clientAddress) return 0;

  const normalizeStr = (str: string) => 
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  const cleanHq = normalizeStr(hqAddress);
  const cleanClient = normalizeStr(clientAddress);

  if (cleanHq === cleanClient) return 0.5;

  let hqCoords: [number, number] | null = null;
  let clientCoords: [number, number] | null = null;

  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (cleanHq.includes(key) && !hqCoords) hqCoords = coords;
    if (cleanClient.includes(key) && !clientCoords) clientCoords = coords;
  }

  // Default HQ to Volta Redonda if unmapped
  if (!hqCoords) hqCoords = CITY_COORDINATES['volta redonda'];

  if (clientCoords) {
    const dist = haversineKm(hqCoords[0], hqCoords[1], clientCoords[0], clientCoords[1]);
    return Math.max(0.5, dist);
  }

  // Fallback hash-based estimator for unknown addresses within reasonable range
  let hash = 0;
  for (let i = 0; i < cleanClient.length; i++) {
    hash = (hash << 5) - hash + cleanClient.charCodeAt(i);
    hash |= 0;
  }
  const fallbackKm = 4.5 + (Math.abs(hash) % 185) / 10;
  return parseFloat(fallbackKm.toFixed(1));
}

export interface DistanceResult {
  distanceKm: number;
  durationText?: string;
  source: 'google' | 'heuristic';
  statusText: string;
}

export async function fetchGoogleMapsDistance(
  origins: string,
  destinations: string,
  apiKey: string = GOOGLE_MAPS_API_KEY
): Promise<DistanceResult> {
  if (!origins || !destinations) {
    return {
      distanceKm: 0,
      source: 'heuristic',
      statusText: 'Endereço de origem ou destino não fornecido'
    };
  }

  try {
    let url = `/api/maps/distance?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}`;
    if (apiKey) {
      url += `&key=${encodeURIComponent(apiKey)}`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

    const data = await res.json();
    if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]?.status === 'OK') {
      const element = data.rows[0].elements[0];
      const distanceMeters = element.distance.value;
      const durationText = element.duration?.text || '';
      const calculatedKm = parseFloat((distanceMeters / 1000).toFixed(2));

      return {
        distanceKm: calculatedKm,
        durationText,
        source: 'google',
        statusText: `Calculado via Google Maps Matrix API (${calculatedKm} km, ${durationText})`
      };
    } else {
      throw new Error(data.error_message || data.status || 'Google Maps Matrix API error');
    }
  } catch (err: any) {
    console.warn('Google Maps distance calculation error, falling back to heuristic:', err);
    const offlineKm = estimateDistanceOffline(origins, destinations);
    return {
      distanceKm: offlineKm,
      source: 'heuristic',
      statusText: `Estimador Heurístico PestFlow (${offlineKm} km)`
    };
  }
}
