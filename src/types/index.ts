// === User ===
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: Date;
}

// === Incidents ===
export type IncidentCategory =
  | 'accident'
  | 'flood'
  | 'roadblock'
  | 'checkpoint'
  | 'construction'
  | 'other';

export interface Incident {
  id: number;
  userId: string;
  category: IncidentCategory;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  upvotes: number;
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date;
}

export interface CreateIncidentInput {
  category: IncidentCategory;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
}

// === Fuel Types ===
export type FuelType =
  | 'gasohol95'
  | 'gasohol91'
  | 'e20'
  | 'e85'
  | 'diesel'
  | 'diesel_b7'
  | 'premium_diesel'
  | 'ngv'
  | 'lpg';

export interface FuelTypeInfo {
  key: FuelType;
  label: string;
  labelEn: string;
  color: string;
}

export const FUEL_TYPES: FuelTypeInfo[] = [
  { key: 'gasohol95', label: 'แก๊สโซฮอล์ 95', labelEn: 'Gasohol 95', color: '#EF4444' },
  { key: 'gasohol91', label: 'แก๊สโซฮอล์ 91', labelEn: 'Gasohol 91', color: '#F97316' },
  { key: 'e20', label: 'แก๊สโซฮอล์ E20', labelEn: 'E20', color: '#22C55E' },
  { key: 'e85', label: 'แก๊สโซฮอล์ E85', labelEn: 'E85', color: '#10B981' },
  { key: 'diesel', label: 'ดีเซล', labelEn: 'Diesel', color: '#3B82F6' },
  { key: 'diesel_b7', label: 'ดีเซล B7', labelEn: 'Diesel B7', color: '#6366F1' },
  { key: 'premium_diesel', label: 'ดีเซลพรีเมียม', labelEn: 'Premium Diesel', color: '#8B5CF6' },
  { key: 'ngv', label: 'NGV', labelEn: 'NGV', color: '#14B8A6' },
  { key: 'lpg', label: 'LPG', labelEn: 'LPG', color: '#F59E0B' },
];

export type FuelStatus = 'available' | 'low' | 'empty' | 'unknown';

export interface FuelReport {
  fuelType: FuelType;
  status: FuelStatus;
  price?: number; // บาท/ลิตร
}

// === Gas Stations ===
export type StationStatus = 'open' | 'closed' | 'no_fuel';

export interface GasStation {
  place_id: string;
  name: string;
  vicinity: string;
  latitude: number;
  longitude: number;
  rating?: number;
  user_ratings_total?: number;
  opening_hours?: { open_now: boolean };
  distance?: number; // km
  brand?: string;
  // Community reports
  fuelReports?: FuelReport[];
  totalReports?: number;
  lastReportAt?: string;
}

export interface StationReport {
  id?: number;
  placeId: string;
  stationName: string;
  reporterName: string;
  reporterEmail?: string;
  fuelReports: FuelReport[];
  note?: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

// === Map ===
export interface MapPosition {
  lat: number;
  lng: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// === AI Chat ===
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// === API Response ===
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
