export const GOOGLE_MAPS_API_KEY =
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
  (typeof process !== 'undefined' ? (process.env?.GOOGLE_MAPS_PLATFORM_KEY || process.env?.VITE_GOOGLE_MAPS_PLATFORM_KEY || process.env?.VITE_GOOGLE_MAPS_API_KEY) : '') ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_API_KEY ||
  '';

export const hasValidMapsKey = (): boolean => {
  return Boolean(GOOGLE_MAPS_API_KEY) && GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY' && GOOGLE_MAPS_API_KEY.trim() !== '';
};

