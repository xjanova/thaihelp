// Google Places API helper — server-side only

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export interface PlaceResult {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: { lat: number; lng: number };
  };
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: { open_now: boolean };
  business_status?: string;
  icon?: string;
  photos?: { photo_reference: string }[];
}

export async function searchNearbyStations(
  lat: number,
  lng: number,
  radius: number = 10000 // 10km default
): Promise<PlaceResult[]> {
  if (!API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
  url.searchParams.set('location', `${lat},${lng}`);
  url.searchParams.set('radius', radius.toString());
  url.searchParams.set('type', 'gas_station');
  url.searchParams.set('language', 'th');
  url.searchParams.set('key', API_KEY);

  const res = await fetch(url.toString(), { next: { revalidate: 300 } }); // cache 5 min
  const data = await res.json();

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    console.error('Places API error:', data.status, data.error_message);
    throw new Error(`Places API error: ${data.status}`);
  }

  return data.results || [];
}

export function detectBrand(name: string): string {
  const brands: Record<string, string[]> = {
    'PTT': ['ptt', 'ปตท', 'พีทีที'],
    'Shell': ['shell', 'เชลล์'],
    'Bangchak': ['bangchak', 'บางจาก'],
    'Esso': ['esso', 'เอสโซ่'],
    'Caltex': ['caltex', 'คาลเท็กซ์'],
    'Susco': ['susco', 'ซัสโก้'],
    'PT': ['pt ', 'พีที '],
    'Cosmo': ['cosmo', 'คอสโม'],
  };

  const lower = name.toLowerCase();
  for (const [brand, keywords] of Object.entries(brands)) {
    if (keywords.some((k) => lower.includes(k))) {
      return brand;
    }
  }
  return 'Other';
}

export function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
