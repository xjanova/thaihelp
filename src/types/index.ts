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

// === Local Producers (ผู้ผลิตท้องถิ่น) ===

// หมวดหมู่ร้านค้า — รองรับขยายในอนาคต
export type ShopCategory = 'fuel' | 'food' | 'product' | 'service';

export interface ShopCategoryInfo {
  key: ShopCategory;
  label: string;
  labelEn: string;
  color: string;
  emoji: string;
}

export const SHOP_CATEGORIES: ShopCategoryInfo[] = [
  { key: 'fuel', label: 'น้ำมันเชื้อเพลิง', labelEn: 'Fuel', color: '#f97316', emoji: '⛽' },
  { key: 'food', label: 'อาหาร', labelEn: 'Food', color: '#22c55e', emoji: '🍜' },
  { key: 'product', label: 'ผลิตภัณฑ์', labelEn: 'Product', color: '#8b5cf6', emoji: '📦' },
  { key: 'service', label: 'บริการ', labelEn: 'Service', color: '#3b82f6', emoji: '🔧' },
];

// ชนิดน้ำมันเชื้อเพลิงแบบทำเอง
export type OilType =
  | 'biodiesel'
  | 'used_cooking_oil'
  | 'palm_oil_fuel'
  | 'ethanol'
  | 'diesel_blend'
  | 'gasohol_blend'
  | 'bio_gas'
  | 'other';

export interface OilTypeInfo {
  key: OilType;
  label: string;
  labelEn: string;
  color: string;
  emoji: string;
}

export const OIL_TYPES: OilTypeInfo[] = [
  { key: 'biodiesel', label: 'ไบโอดีเซล', labelEn: 'Biodiesel', color: '#16a34a', emoji: '🌿' },
  { key: 'used_cooking_oil', label: 'น้ำมันพืชใช้แล้ว', labelEn: 'Used Cooking Oil', color: '#b45309', emoji: '🫗' },
  { key: 'palm_oil_fuel', label: 'น้ำมันปาล์มเชื้อเพลิง', labelEn: 'Palm Oil Fuel', color: '#854d0e', emoji: '🌴' },
  { key: 'ethanol', label: 'เอทานอล', labelEn: 'Ethanol', color: '#0d9488', emoji: '🧪' },
  { key: 'diesel_blend', label: 'ดีเซลผสม', labelEn: 'Diesel Blend', color: '#3b82f6', emoji: '⛽' },
  { key: 'gasohol_blend', label: 'แก๊สโซฮอล์ผสม', labelEn: 'Gasohol Blend', color: '#ef4444', emoji: '🔴' },
  { key: 'bio_gas', label: 'ก๊าซชีวภาพ', labelEn: 'Bio Gas', color: '#8b5cf6', emoji: '💨' },
  { key: 'other', label: 'อื่นๆ', labelEn: 'Other', color: '#6b7280', emoji: '🛢️' },
];

export interface OilProducer {
  id: number;
  shopName: string;
  shopCategory: ShopCategory;
  oilType: OilType;
  oilTypeCustom?: string;
  price: number;
  priceUnit?: string;
  latitude: number;
  longitude: number;
  phone: string;
  logoUrl?: string;
  ownerName: string;
  ownerEmail?: string;
  description?: string;
  isActive: boolean;
  distance?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOilProducerInput {
  shopName: string;
  shopCategory?: ShopCategory;
  oilType: OilType;
  oilTypeCustom?: string;
  price: number;
  priceUnit?: string;
  latitude: number;
  longitude: number;
  phone: string;
  logoUrl?: string;
  ownerName: string;
  ownerEmail?: string;
  description?: string;
}

// === API Response ===
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
