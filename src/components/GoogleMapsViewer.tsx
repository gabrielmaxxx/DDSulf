import React, { useEffect, useState, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { GOOGLE_MAPS_API_KEY } from '@/config/maps';
import { MapPin, Navigation, Info, AlertTriangle } from 'lucide-react';

const hasValidKey = Boolean(GOOGLE_MAPS_API_KEY) && GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY' && GOOGLE_MAPS_API_KEY.trim() !== '';

// Static coordinate dictionary for known default addresses to provide instant, bulletproof offline/cached fallback
const ADDRESS_COORDINATES_CACHE: Record<string, google.maps.LatLngLiteral> = {
  'Av. Paulista, 100 - São Paulo - SP': { lat: -23.5615, lng: -46.6559 },
  'Rua das Flores, 450 - Curitiba - PR': { lat: -25.4290, lng: -49.2719 },
  'Al. das Palmeiras, 192 - Cidade Sede - RJ': { lat: -22.5186, lng: -44.1102 },
  'Rua da Saúde, 80 - Cidade Sede - RJ': { lat: -22.5098, lng: -44.0950 },
  'Rua das Laranjeiras, 15 - Cidade Sede - RJ': { lat: -22.5255, lng: -44.1234 },
  'Rodovia BR-393, Km 5 - Cidade B - RJ': { lat: -22.5411, lng: -44.1802 },
  'Rua 33, 120 - Vila Santa Cecília, Cidade Sede - RJ': { lat: -22.5204, lng: -44.1039 }
};

interface GoogleMapsViewerProps {
  address?: string;
  title?: string;
  showRouteFromHq?: boolean;
  hqAddress?: string;
  height?: string;
}

// Child component to handle geocoding within the APIProvider context
function GeocodedMapContent({
  address,
  title,
  showRouteFromHq,
  hqAddress,
  height
}: GoogleMapsViewerProps) {
  const map = useMap();
  const geocodingLib = useMapsLibrary('geocoding');
  const [clientCoords, setClientCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [hqCoords, setHqCoords] = useState<google.maps.LatLngLiteral | null>(null);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);

  // 1. Resolve coordinates for Client Address
  useEffect(() => {
    if (!address) return;

    // Check if we have it cached instantly
    const cached = ADDRESS_COORDINATES_CACHE[address];
    if (cached) {
      setClientCoords(cached);
      setGeocodingError(null);
      return;
    }

    if (!geocodingLib || !map) return;

    const geocoder = new geocodingLib.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results?.[0]?.geometry?.location) {
        const loc = results[0].geometry.location;
        const coords = { lat: loc.lat(), lng: loc.lng() };
        setClientCoords(coords);
        setGeocodingError(null);
        map.panTo(coords);
      } else {
        console.warn(`Geocoding failed for client address: ${status}. Using fallback coordinates.`);
        // Fallback to central Cidade Sede
        setClientCoords({ lat: -22.5204, lng: -44.1039 });
        setGeocodingError('Endereço não localizado no mapa pelo Google. Exibindo Cidade Sede (Centro).');
      }
    });
  }, [geocodingLib, map, address]);

  // 2. Resolve coordinates for Headquarters Address
  useEffect(() => {
    if (!showRouteFromHq || !hqAddress) return;

    const cached = ADDRESS_COORDINATES_CACHE[hqAddress];
    if (cached) {
      setHqCoords(cached);
      return;
    }

    if (!geocodingLib) return;

    const geocoder = new geocodingLib.Geocoder();
    geocoder.geocode({ address: hqAddress }, (results, status) => {
      if (status === 'OK' && results?.[0]?.geometry?.location) {
        const loc = results[0].geometry.location;
        setHqCoords({ lat: loc.lat(), lng: loc.lng() });
      } else {
        // Fallback hq to central Vila Santa Cecília
        setHqCoords({ lat: -22.5204, lng: -44.1039 });
      }
    });
  }, [geocodingLib, showRouteFromHq, hqAddress]);

  // Center map when client coordinates are loaded
  useEffect(() => {
    if (clientCoords && map) {
      map.setCenter(clientCoords);
      map.setZoom(14);
    }
  }, [clientCoords, map]);

  return (
    <div className="relative w-full h-full">
      {geocodingError && (
        <div className="absolute top-2 left-2 right-2 z-10 bg-amber-50 border border-amber-200 text-amber-950 p-2 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
          <AlertTriangle className="size-3.5 text-amber-600 shrink-0" />
          <span>{geocodingError}</span>
        </div>
      )}

      <Map
        defaultCenter={clientCoords || { lat: -22.5204, lng: -44.1039 }}
        defaultZoom={14}
        mapId="PESTFLOW_OPERATIONAL_MAP"
        gestureHandling="cooperative"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        style={{ width: '100%', height: '100%' }}
      >
        {/* HQ Marker */}
        {showRouteFromHq && hqCoords && (
          <AdvancedMarker position={hqCoords} title="Sede PestFlow">
            <Pin background="#1B3A2D" glyphColor="#fff" borderColor="#0f261c" scale={1.1}>
              <span className="text-[9px] font-black text-white px-0.5">SEDE</span>
            </Pin>
          </AdvancedMarker>
        )}

        {/* Client Marker */}
        {clientCoords && (
          <AdvancedMarker position={clientCoords} title={title || address}>
            <Pin background="#1D9E75" glyphColor="#fff" borderColor="#157959" />
          </AdvancedMarker>
        )}

        {/* Dynamic Route display using standard computeRoutes SDK pattern */}
        {showRouteFromHq && hqCoords && clientCoords && (
          <RouteDisplay origin={hqCoords} destination={clientCoords} />
        )}
      </Map>
    </div>
  );
}

// Sub-component to compute and render route polyline
function RouteDisplay({ origin, destination }: {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!routesLib || !map) return;
    
    // Clear previous polylines
    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];

    routesLib.Route.computeRoutes({
      origin,
      destination,
      travelMode: 'DRIVING',
      fields: ['path', 'viewport'],
    })
      .then(({ routes }) => {
        if (routes?.[0]) {
          const newPolylines = routes[0].createPolylines();
          newPolylines.forEach(p => {
            p.setOptions({
              strokeColor: '#1D9E75',
              strokeOpacity: 0.8,
              strokeWeight: 4,
            });
            p.setMap(map);
          });
          polylinesRef.current = newPolylines;

          if (routes[0].viewport) {
            map.fitBounds(routes[0].viewport);
          }
        }
      })
      .catch((err) => {
        console.error('Route compute failed, drawing simple direct line instead:', err);
        // Fallback: simple geodesic line connecting the coordinates directly so it never looks blank
        const flightPath = new google.maps.Polyline({
          path: [origin, destination],
          geodesic: true,
          strokeColor: '#ef4444',
          strokeOpacity: 0.6,
          strokeWeight: 3,
        });
        flightPath.setMap(map);
        polylinesRef.current = [flightPath];

        const bounds = new google.maps.LatLngBounds();
        bounds.extend(origin);
        bounds.extend(destination);
        map.fitBounds(bounds);
      });

    return () => {
      polylinesRef.current.forEach(p => p.setMap(null));
    };
  }, [routesLib, map, origin, destination]);

  return null;
}

export function GoogleMapsViewer({
  address,
  title,
  showRouteFromHq = false,
  hqAddress = 'Rua 33, 120 - Vila Santa Cecília, Cidade Sede - RJ',
  height = '300px'
}: GoogleMapsViewerProps) {
  
  if (!hasValidKey) {
    return (
      <div 
        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center"
        style={{ minHeight: height }}
      >
        <div className="max-w-md space-y-3.5">
          <div className="size-11 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200 shadow-sm">
            <AlertTriangle className="size-5.5" />
          </div>
          <h3 className="text-sm font-black font-sans text-zinc-900 tracking-tight">
            Chave do Google Maps Platform Necessária
          </h3>
          <p className="text-xs text-zinc-500 font-medium leading-relaxed font-sans">
            Para ativar mapas dinâmicos e rotas precisas para os técnicos de controle de pragas da PestFlow:
          </p>
          <div className="bg-white border border-zinc-150 p-3 rounded-xl text-left text-[11px] font-sans font-semibold text-zinc-600 space-y-1.5 leading-normal shadow-2xs">
            <p><strong>1.</strong> Obtenha uma chave: <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener noreferrer" className="text-[#1D9E75] hover:underline font-black">Registrar no Google Cloud</a></p>
            <p><strong>2.</strong> Abra o menu de <strong>Configurações</strong> (ícone de engrenagem ⚙️ no canto superior direito)</p>
            <p><strong>3.</strong> Clique em <strong>Secrets</strong></p>
            <p><strong>4.</strong> Adicione uma variável com o nome <code className="bg-zinc-100 text-zinc-900 px-1 py-0.5 rounded border border-zinc-200 font-mono text-[9.5px]">GOOGLE_MAPS_PLATFORM_KEY</code> e cole a chave de API gerada no Google Cloud</p>
          </div>
          <div className="text-[10px] text-zinc-400 font-bold flex items-center justify-center gap-1">
            <Info className="size-3" /> A plataforma irá recompilar o aplicativo automaticamente após salvar o segredo.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-zinc-200 shadow-xs relative bg-zinc-100" style={{ height }}>
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY} version="weekly">
        <GeocodedMapContent
          address={address}
          title={title}
          showRouteFromHq={showRouteFromHq}
          hqAddress={hqAddress}
          height={height}
        />
      </APIProvider>
    </div>
  );
}
